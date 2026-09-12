from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


class ConditionLikelihood(BaseModel):
    condition_name: str
    # Evidence strength label: "High", "Moderate", "Low", or None (for normal operation)
    # These are NOT calibrated failure probabilities.
    confidence: Optional[str] = None
    evidence: List[str] = []


class AssetSummary(BaseModel):
    id: str
    name: str
    type: str
    location: str
    status: str          # Monitor, Watch, Schedule Inspection, Inspect Now
    decision_status: str  # same as status
    failure_risk: float   # Heuristic risk score 0-100 (not a calibrated probability)
    fault_type: str
    ranked_conditions: List[ConditionLikelihood] = []
    recommended_action: str = "Continue routine monitoring."
    energy_at_risk: float   # kWh, based on current gap × daylight-aware horizon
    revenue_at_risk: float  # Illustrative ₹ at assumed tariff
    priority_score: float
    priority_rank: int
    expected_power: Optional[float] = None
    deviation_pct: Optional[float] = None
    actual_power: Optional[float] = None


class AssetDetail(AssetSummary):
    model_status: str
    capacity_kw: float
    reasons: List[str]
    fault_confidence: Optional[str] = None  # Evidence strength label, not a probability


class AlertResponse(BaseModel):
    id: int
    asset_id: str
    severity: str
    message: str
    recommended_action: str
    created_at: datetime


class InjectFaultRequest(BaseModel):
    asset_id: str
    fault_type: str
    fault_magnitude: float
