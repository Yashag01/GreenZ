from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from .session import Base
from datetime import datetime, timezone

class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String) # 'solar' or 'wind'
    location = Column(String)
    capacity_kw = Column(Float)
    criticality = Column(Float, default=0.5)

class AssetHealth(Base):
    __tablename__ = "asset_health"
    asset_id = Column(String, ForeignKey("assets.id"), primary_key=True)
    status = Column(String, default="Normal")
    deviation_pct = Column(Float, default=0.0)
    failure_risk = Column(Float, default=0.0)
    fault_type = Column(String, default="None")
    energy_at_risk = Column(Float, default=0.0)
    revenue_at_risk = Column(Float, default=0.0)
    priority_score = Column(Float, default=0.0)
    priority_rank = Column(Integer, default=999)
    model_status = Column(String, default="untrained")
    
    # Detailed AIZAR-style business features (stored as JSON strings)
    flag_reasons = Column(String, default="[]") 
    action_immediate = Column(String, default="[]")
    action_inspect = Column(String, default="[]")
    action_long_term = Column(String, default="[]")
    
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String, index=True)
    severity = Column(String) # Warning, Critical
    message = Column(String)
    recommended_action = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    acknowledged = Column(Boolean, default=False)
