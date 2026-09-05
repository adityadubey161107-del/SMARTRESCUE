from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse
from app.schemas.ambulance import AmbulanceResponse
from app.schemas.hospital import HospitalResponse

class PatientInfoCreate(BaseModel):
    age_group: Optional[str] = "Adult"
    conscious: bool = True
    breathing_difficulty: bool = False
    major_injury: bool = False
    chest_pain: bool = False
    additional_notes: Optional[str] = None

class PatientInfoResponse(PatientInfoCreate):
    id: int
    emergency_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmergencyCreate(BaseModel):
    emergency_type: str
    description: Optional[str] = None
    patient_latitude: float
    patient_longitude: float
    patient_info: Optional[PatientInfoCreate] = None

class EmergencyStatusUpdate(BaseModel):
    status: str

class PriorityResult(BaseModel):
    score: int
    level: str
    breakdown: dict

class EmergencyResponse(BaseModel):
    id: int
    patient_id: int
    ambulance_id: Optional[int] = None
    hospital_id: Optional[int] = None
    emergency_type: str
    description: Optional[str] = None
    patient_latitude: float
    patient_longitude: float
    priority_score: int
    priority_level: str
    status: str
    requested_at: datetime
    accepted_at: Optional[datetime] = None
    picked_up_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    patient: Optional[UserResponse] = None
    ambulance: Optional[AmbulanceResponse] = None
    hospital: Optional[HospitalResponse] = None
    patient_info: Optional[PatientInfoResponse] = None

    model_config = ConfigDict(from_attributes=True)
