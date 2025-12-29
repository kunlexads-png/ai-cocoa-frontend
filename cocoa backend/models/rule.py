from pydantic import BaseModel
from typing import Optional

class ExportRule(BaseModel):
    rule_id: str
    rule_name: str
    rule_type: str      # Country, Quality, Sanction
    condition: str      # e.g. "quality_score >= 85"
    severity: str       # Low, Medium, High
    active: bool = True
    description: Optional[str] = None
