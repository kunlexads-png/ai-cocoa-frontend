# app/routes/batches.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_batches():
    return [
        {
            "batch_id": "BATCH-001",
            "origin": "Ondo State",
            "quality_score": 92,
            "export_status": "Approved",
            "destination": "Netherlands"
        }
    ]
