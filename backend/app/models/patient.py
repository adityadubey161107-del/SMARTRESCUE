from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class PatientInformation(Base):
    __tablename__ = "patient_information"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=False, unique=True)
    age_group = Column(String, nullable=True) # Adult, Child, Senior, Infant
    conscious = Column(Boolean, default=True)
    breathing_difficulty = Column(Boolean, default=False)
    major_injury = Column(Boolean, default=False)
    chest_pain = Column(Boolean, default=False)
    additional_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    emergency = relationship("EmergencyRequest", back_populates="patient_info")

class AmbulanceLocation(Base):
    __tablename__ = "ambulance_locations"

    id = Column(Integer, primary_key=True, index=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ambulance = relationship("Ambulance", back_populates="locations")
