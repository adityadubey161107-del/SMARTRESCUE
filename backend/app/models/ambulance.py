from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, default="ALS") # ALS (Advanced Life Support), BLS (Basic Life Support)
    status = Column(String, default="AVAILABLE") # AVAILABLE, BUSY, OFFLINE
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    driver = relationship("User", back_populates="driver_ambulances", foreign_keys=[driver_id])
    hospital = relationship("Hospital", back_populates="ambulances", foreign_keys=[hospital_id])
    emergencies = relationship("EmergencyRequest", back_populates="ambulance")
    locations = relationship("AmbulanceLocation", back_populates="ambulance", cascade="all, delete-orphan")
