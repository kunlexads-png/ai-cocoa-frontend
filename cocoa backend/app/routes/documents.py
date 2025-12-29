# app/routes/documents.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/{batch_id}")
def get_documents(batch_id: str):
    return {
        "batch_id": batch_id,
        "documents": [
            {"type": "Phytosanitary", "status": "Valid"},
            {"type": "Export Permit", "status": "Missing"}
        ]
    }
