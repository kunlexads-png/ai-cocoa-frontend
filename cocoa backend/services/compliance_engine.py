from typing import List, Dict
from app.services.risk_scoring import calculate_risk_score


def evaluate_compliance(batch: Dict, rules: List[Dict]) -> Dict:
    """
    Evaluates a batch against export rules and returns compliance result
    """

    violations = []

    for rule in rules:
        if not rule.get("active", True):
            continue

        rule_type = rule.get("rule_type")

        # Quality rule
        if rule_type == "QUALITY":
            min_score = rule.get("min_quality_score", 0)
            if batch["quality_score"] < min_score:
                violations.append({
                    "rule": rule["rule_name"],
                    "severity": rule["severity"],
                    "message": "Quality score below threshold"
                })

        # Country restriction
        if rule_type == "COUNTRY":
            restricted = rule.get("restricted_countries", [])
            if batch["destination"] in restricted:
                violations.append({
                    "rule": rule["rule_name"],
                    "severity": rule["severity"],
                    "message": "Destination country restricted"
                })

    risk_score = calculate_risk_score(violations)

    return {
        "batch_id": batch["batch_id"],
        "compliant": len(violations) == 0,
        "violations": violations,
        "risk_score": risk_score
    }
