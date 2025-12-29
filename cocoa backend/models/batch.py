from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Batch(BaseModel):
    batch_id: str
    origin_country: str
    origin_region: str
    processing_stage: str
    quality_score: float
    export_status: str
    destination_country: str
    export_readiness_score: Optional[float] = None
    created_at: datetime = datetime.utcnow()
