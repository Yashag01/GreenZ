from pydantic import BaseModel
from typing import Optional

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    capacity_kw: Optional[float] = None
    criticality: Optional[float] = None
