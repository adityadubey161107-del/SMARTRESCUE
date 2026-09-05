from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    
    emergency_type = Column(String, nullable=False) # e.g. Chest Pain, Accident, Breathing Difficulty
    description = Column(String, nullable=True)
    patient_latitude = Column(Float, nullable=False)
    patient_longitude = Column(Float, nullable=False)
    
    priority_score = Column(Integer, default=0)
    priority_level = Column(String, default="NORMAL") # NORMAL, URGENT, CRITICAL
    status = Column(String, default="PENDING") # PENDING, ASSIGNED, EN_ROUTE_PATIENT, PATIENT_PICKED_UP, EN_ROUTE_HOSPITAL, COMPLETED, CANCELLED
    
    requested_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    picked_up_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("User", back_populates="patient_emergencies", foreign_keys=[patient_id])
    ambulance = relationship("Ambulance", back_populates="emergencies", foreign_keys=[ambulance_id])
    hospital = relationship("Hospital", back_populates="emergencies", foreign_keys=[hospital_id])
    patient_info = relationship("PatientInformation", back_populates="emergency", uselist=False, cascade="all, delete-orphan")
