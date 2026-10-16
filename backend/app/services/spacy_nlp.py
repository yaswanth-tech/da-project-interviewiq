import logging
import re
from typing import List, Tuple, Set
import numpy as np

logger = logging.getLogger(__name__)

# Lazy-loaded NLP objects
_spacy_nlp = None
_sentence_transformer_model = None
_spacy_load_failed = False
_st_load_failed = False

def get_spacy_nlp():
    global _spacy_nlp, _spacy_load_failed
    if _spacy_nlp is None and not _spacy_load_failed:
        try:
            import spacy
            _spacy_nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model: en_core_web_sm")
        except Exception as e:
            logger.warning(f"Failed to load spaCy model en_core_web_sm: {e}. Using fallback lemmatizer.")
            _spacy_load_failed = True
    return _spacy_nlp

def get_sentence_transformer():
    global _sentence_transformer_model, _st_load_failed
    if _sentence_transformer_model is None and not _st_load_failed:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_transformer_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded SentenceTransformer model: all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Failed to load SentenceTransformer: {e}. Using TF-IDF fallback.")
            _st_load_failed = True
    return _sentence_transformer_model

def extract_lemmas_and_tokens(text: str) -> Tuple[Set[str], List[str]]:
    """
    Extracts lowercase lemmas and original tokens using spaCy if available,
    otherwise simple regex tokenization.
    """
    nlp = get_spacy_nlp()
    if nlp is not None:
        doc = nlp(text.lower())
        lemmas = {token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.lemma_.strip()}
        tokens = [token.text for token in doc if not token.is_punct]
        return lemmas, tokens
    else:
        # Fallback simple regex tokenizer
        words = re.findall(r'\b[a-zA-Z0-9]+\b', text.lower())
        stopwords = {"a", "an", "the", "in", "on", "of", "to", "is", "are", "was", "were", "and", "or", "it", "that", "this", "for", "with"}
        lemmas = {w for w in words if w not in stopwords}
        return lemmas, words

def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """
    Calculates cosine similarity between two texts using SentenceTransformers
    with fallback to TF-IDF cosine similarity.
    """
    if not text1.strip() or not text2.strip():
        return 0.0

    st_model = get_sentence_transformer()
    if st_model is not None:
        try:
            embeddings = st_model.encode([text1, text2], convert_to_numpy=True)
            norm1 = np.linalg.norm(embeddings[0])
            norm2 = np.linalg.norm(embeddings[1])
            if norm1 == 0 or norm2 == 0:
                return 0.0
            sim = float(np.dot(embeddings[0], embeddings[1]) / (norm1 * norm2))
            return max(0.0, min(1.0, sim))
        except Exception as e:
            logger.warning(f"Error in SentenceTransformer similarity: {e}. Falling back to TF-IDF.")

    # TF-IDF Fallback
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vectorizer = TfidfVectorizer().fit([text1, text2])
        tfidf = vectorizer.transform([text1, text2])
        sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
        return max(0.0, min(1.0, sim))
    except Exception as e:
        logger.warning(f"Error in TF-IDF similarity fallback: {e}")
        # Jaccard similarity fallback
        set1, _ = extract_lemmas_and_tokens(text1)
        set2, _ = extract_lemmas_and_tokens(text2)
        if not set1 or not set2:
            return 0.0
        return len(set1.intersection(set2)) / float(len(set1.union(set2)))

def extract_keywords_from_model_answer(model_answer: str) -> List[dict]:
    """
    Auto-generates target keywords with weights and basic synonyms from model answer text.
    """
    nlp = get_spacy_nlp()
    if nlp is not None:
        doc = nlp(model_answer)
        keywords = []
        seen = set()
        for token in doc:
            if token.pos_ in ("NOUN", "PROPN", "VERB", "ADJ") and not token.is_stop and len(token.lemma_) > 2:
                lemma = token.lemma_.lower()
                if lemma not in seen:
                    seen.add(lemma)
                    weight = 1.5 if token.pos_ in ("NOUN", "PROPN") else 1.0
                    keywords.append({
                        "keyword": lemma,
                        "weight": weight,
                        "synonyms": []
                    })
        return keywords[:10]  # top 10 key terms
    else:
        lemmas, _ = extract_lemmas_and_tokens(model_answer)
        keywords = []
        for l in list(lemmas)[:10]:
            keywords.append({"keyword": l, "weight": 1.0, "synonyms": []})
        return keywords
