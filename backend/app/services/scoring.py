import re
from typing import List, Dict, Any, Optional
from app.services.spacy_nlp import (
    extract_lemmas_and_tokens,
    calculate_semantic_similarity
)

FILLER_WORDS = {"um", "uh", "like", "basically", "you know", "actually", "literally", "honestly", "right"}

STAR_KEYWORDS = {
    "situation": ["when", "during", "project", "time", "company", "client", "problem", "context", "background", "where", "at my previous"],
    "task": ["need to", "tasked", "goal", "objective", "required", "responsible", "duty", "challenge", "assign", "target"],
    "action": ["did", "created", "implemented", "built", "solved", "wrote", "organized", "led", "developed", "analyzed", "designed", "took action"],
    "result": ["resulted", "outcome", "achieved", "increased", "reduced", "improved", "saved", "learned", "delivered", "success", "percent", "%"]
}

def detect_star_components(text: str) -> Dict[str, Any]:
    """
    Evaluates STAR method coverage in HR / Behavioral answers.
    Returns score (0.0 to 1.0) and components found.
    """
    text_lower = text.lower()
    found = {}
    for comp, kw_list in STAR_KEYWORDS.items():
        found[comp] = any(kw in text_lower for kw in kw_list)
    
    score = sum(1.0 for v in found.values() if v) / 4.0
    return {
        "star_score": score,
        "components_found": found
    }

def analyze_delivery_metrics(answer_text: str, time_taken_seconds: int = 0) -> Dict[str, Any]:
    """
    Analyzes spoken or typed delivery pace (WPM), filler word usage, and pause estimate.
    """
    words = re.findall(r'\b[a-zA-Z0-9\']+\b', answer_text.lower())
    total_words = len(words)
    
    # Calculate WPM
    if time_taken_seconds > 5:
        wpm = (total_words / time_taken_seconds) * 60.0
    else:
        # Standard estimated pace if time_taken not tracked
        wpm = 130.0 if total_words > 20 else 90.0

    # Count fillers
    fillers_found = [w for w in words if w in FILLER_WORDS]
    filler_count = len(fillers_found)
    
    # Pause estimate heuristic based on word density vs time
    if time_taken_seconds > 0 and (total_words / max(time_taken_seconds, 1)) < 0.8:
        pause_estimate = "Long pauses detected"
    elif filler_count > 4:
        pause_estimate = "Frequent hesitation"
    else:
        pause_estimate = "Fluent pace"

    # Delivery Score (0.0 to 1.0)
    # Ideal WPM is 110-160; penalty for excessive fillers
    wpm_score = 1.0
    if wpm < 80:
        wpm_score = 0.6
    elif wpm > 180:
        wpm_score = 0.7
        
    filler_penalty = min(0.4, filler_count * 0.08)
    delivery_score = max(0.2, wpm_score - filler_penalty)

    return {
        "delivery_score": delivery_score,
        "wpm": round(wpm, 1),
        "filler_count": filler_count,
        "filler_words_found": list(set(fillers_found)),
        "pause_estimate": pause_estimate
    }

def evaluate_answer(
    answer_text: str,
    model_answer: str,
    keywords_def: List[Dict[str, Any]],
    question_type: str = "technical",
    time_taken_seconds: int = 0
) -> Dict[str, Any]:
    """
    Pure evaluation engine computing transparent 0-10 score.
    Returns breakdown, matched/missed keywords, strengths, suggestions, and model comparison.
    """
    if not answer_text or not answer_text.strip():
        return {
            "total_score": 0.0,
            "keyword_score": 0.0,
            "semantic_score": 0.0,
            "completeness_score": 0.0,
            "delivery_score": 0.0,
            "star_score": 0.0 if question_type == "hr" else None,
            "matched_keywords": [],
            "missed_keywords": [k.get("keyword") for k in keywords_def],
            "strengths": ["None - Answer was skipped or left blank."],
            "suggestions": ["Ensure you attempt every question with at least key concepts and structure."],
            "model_comparison": f"Model Answer snippet: {model_answer[:150]}...",
            "delivery_metrics": analyze_delivery_metrics("", 0)
        }

    answer_lemmas, _ = extract_lemmas_and_tokens(answer_text)
    
    # 1. Keyword Score
    matched_kws = []
    missed_kws = []
    total_weight = 0.0
    earned_weight = 0.0

    for item in keywords_def:
        kw = item.get("keyword", "").lower()
        weight = item.get("weight", 1.0)
        synonyms = [s.lower() for s in item.get("synonyms", [])]
        target_set = {kw}.union(synonyms)
        
        total_weight += weight
        if any(term in answer_lemmas or any(term in answer_text.lower() for term in target_set) for term in target_set):
            earned_weight += weight
            matched_kws.append(kw)
        else:
            missed_kws.append(kw)

    keyword_score = (earned_weight / total_weight) if total_weight > 0 else 0.8

    # 2. Semantic Score
    semantic_score = calculate_semantic_similarity(answer_text, model_answer)

    # 3. Completeness Score
    # Ratio of answer word length vs model answer word length (ideal: 70% to 150%)
    ans_words = len(answer_text.split())
    model_words = max(len(model_answer.split()), 1)
    len_ratio = ans_words / float(model_words)
    
    if len_ratio >= 0.7 and len_ratio <= 1.8:
        completeness_score = 1.0
    elif len_ratio < 0.7:
        completeness_score = max(0.2, len_ratio / 0.7)
    else:
        completeness_score = 0.85  # slightly verbose but complete

    # 4. Delivery Metrics
    delivery_data = analyze_delivery_metrics(answer_text, time_taken_seconds)
    delivery_score = delivery_data["delivery_score"]

    # 5. STAR Score (for HR questions)
    star_score = None
    if question_type == "hr":
        star_res = detect_star_components(answer_text)
        star_score = star_res["star_score"]
        # HR Weighted total (0.25 kw, 0.25 sem, 0.20 star, 0.15 comp, 0.15 deliv)
        weighted_total = (
            0.25 * keyword_score +
            0.25 * semantic_score +
            0.20 * star_score +
            0.15 * completeness_score +
            0.15 * delivery_score
        )
    else:
        # Technical Weighted total (0.40 kw, 0.35 sem, 0.15 comp, 0.10 deliv)
        weighted_total = (
            0.40 * keyword_score +
            0.35 * semantic_score +
            0.15 * completeness_score +
            0.10 * delivery_score
        )

    total_score = round(weighted_total * 10.0, 1)

    # Strengths & Suggestions generation
    strengths = []
    suggestions = []

    if keyword_score > 0.7:
        strengths.append(f"Strong concept coverage! You hit key terms: {', '.join(matched_kws[:4])}.")
    else:
        suggestions.append(f"Include essential terms such as: {', '.join(missed_kws[:4])}.")

    if semantic_score > 0.75:
        strengths.append("High semantic alignment with the expected model answer.")
    elif semantic_score < 0.5:
        suggestions.append("Align your explanation closer to standard technical definitions.")

    if completeness_score > 0.8:
        strengths.append("Well-structured answer with good depth.")
    else:
        suggestions.append("Elaborate further with specific examples to improve completeness.")

    if question_type == "hr" and star_score is not None:
        if star_score >= 0.75:
            strengths.append("Great STAR method structure (Situation, Task, Action, Result).")
        else:
            suggestions.append("Structure your behavioral answer clearly into Situation, Task, Action, and Result.")

    if delivery_data["filler_count"] > 3:
        suggestions.append(f"Reduce filler words like '{', '.join(delivery_data['filler_words_found'][:3])}'.")

    if not strengths:
        strengths.append("Attempted the response clearly within the time limit.")

    return {
        "total_score": total_score,
        "keyword_score": round(keyword_score * 10.0, 1),
        "semantic_score": round(semantic_score * 10.0, 1),
        "completeness_score": round(completeness_score * 10.0, 1),
        "delivery_score": round(delivery_score * 10.0, 1),
        "star_score": round(star_score * 10.0, 1) if star_score is not None else None,
        "matched_keywords": matched_kws,
        "missed_keywords": missed_kws,
        "strengths": strengths,
        "suggestions": suggestions,
        "model_comparison": model_answer,
        "delivery_metrics": delivery_data
    }
