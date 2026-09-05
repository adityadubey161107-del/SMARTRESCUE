from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class HospitalBase(BaseModel):
    name: str
    address: str
    phone: str
    latitude: float
    longitude: float
    emergency_available: str = "AVAILABLE"

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdateAvailability(BaseModel):
    emergency_available: str

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
