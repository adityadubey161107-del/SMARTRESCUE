from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_available = Column(String, default="AVAILABLE") # AVAILABLE, BUSY, UNAVAILABLE
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ambulances = relationship("Ambulance", back_populates="hospital")
    emergencies = relationship("EmergencyRequest", back_populates="hospital")
