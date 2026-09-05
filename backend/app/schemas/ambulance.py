from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.hospital import HospitalResponse

class AmbulanceBase(BaseModel):
    vehicle_number: str
    type: str = "ALS"
    status: str = "AVAILABLE"
    latitude: float
    longitude: float
    driver_id: Optional[int] = None
    hospital_id: Optional[int] = None

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdateStatus(BaseModel):
    status: str

class AmbulanceUpdateLocation(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0

class AmbulanceResponse(AmbulanceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    driver: Optional[UserResponse] = None
    hospital: Optional[HospitalResponse] = None

    model_config = ConfigDict(from_attributes=True)
