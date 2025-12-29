# app/routes/rules.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_rules():
    return [
        {
            "rule": "EU Quality Threshold",
            "min_score": 85,
            "severity": "High"
        }
    ]
