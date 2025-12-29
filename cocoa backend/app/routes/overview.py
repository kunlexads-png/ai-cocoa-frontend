# app/routes/overview.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_overview():
    return {
        "total_batches": 120,
        "approved": 90,
        "pending": 20,
        "rejected": 10,
        "risk_score": 0.18
    }
