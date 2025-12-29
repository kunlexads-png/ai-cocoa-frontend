def calculate_risk_score(violations):
    """
    Simple risk scoring logic
    """

    if not violations:
        return 0.05

    score = 0.0
    for v in violations:
        if v["severity"] == "Low":
            score += 0.1
        elif v["severity"] == "Medium":
            score += 0.25
        elif v["severity"] == "High":
            score += 0.5

    return min(score, 1.0)
