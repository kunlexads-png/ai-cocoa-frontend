from pydantic import BaseModel
from typing import Optional
from datetime import date

class Document(BaseModel):
    document_id: str
    batch_id: str
    document_type: str  # Phytosanitary, Export Permit, Quality Report
    status: str         # Valid, Expired, Missing
    issued_date: Optional[date] = None
    expiry_date: Optional[date] = None
