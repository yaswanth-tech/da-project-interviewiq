from app.services.scoring import evaluate_answer, detect_star_components, analyze_delivery_metrics

def test_evaluate_answer_technical_high_score():
    answer = "A shallow copy creates a new object with references to original child objects. A deep copy recursively duplicates child objects."
    model = "A shallow copy constructs a new object and populates it with references to child objects. A deep copy recursively constructs a new object and inserts copies."
    kws = [
        {"keyword": "shallow copy", "weight": 1.5, "synonyms": ["references"]},
        {"keyword": "deep copy", "weight": 1.5, "synonyms": ["recursively"]}
    ]
    
    result = evaluate_answer(
        answer_text=answer,
        model_answer=model,
        keywords_def=kws,
        question_type="technical",
        time_taken_seconds=60
    )

    assert result["total_score"] >= 7.0
    assert "shallow copy" in result["matched_keywords"]
    assert "deep copy" in result["matched_keywords"]

def test_evaluate_answer_blank_or_skipped():
    result = evaluate_answer(
        answer_text="",
        model_answer="Model answer text...",
        keywords_def=[{"keyword": "test", "weight": 1.0}],
        question_type="technical"
    )

    assert result["total_score"] == 0.0
    assert len(result["missed_keywords"]) > 0

def test_star_method_detection():
    star_text = "SITUATION: During a critical company project. TASK: My required task was to deliver. ACTION: I implemented and solved the problem. RESULT: It resulted in achieving success."
    res = detect_star_components(star_text)
    assert res["star_score"] == 1.0
    assert res["components_found"]["situation"] is True
    assert res["components_found"]["task"] is True
    assert res["components_found"]["action"] is True
    assert res["components_found"]["result"] is True

def test_delivery_metrics_analysis():
    text = "Um basically like I think you know we should do this."
    metrics = analyze_delivery_metrics(text, time_taken_seconds=10)
    assert metrics["filler_count"] >= 3
    assert metrics["delivery_score"] < 1.0
