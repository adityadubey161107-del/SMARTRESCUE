import json
import logging
from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.ambulance import Ambulance
from app.models.patient import AmbulanceLocation

router = APIRouter(prefix="/ws", tags=["Real-time Tracking WebSockets"])

logger = logging.getLogger("uvicorn.error")

class ConnectionManager:
    def __init__(self):
        # Maps channel key (e.g., "ambulance_10", "emergency_5") to a set of connected WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            # Broadcast to all websockets listening on channel
            disconnected = []
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, channel)

manager = ConnectionManager()

@router.websocket("/ambulance/{ambulance_id}")
async def websocket_ambulance_tracking(websocket: WebSocket, ambulance_id: int):
    channel = f"ambulance_{ambulance_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            # Receive json data from client (e.g. driver transmitting location)
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Expected payload: {"latitude": float, "longitude": float, "speed": float, "status": str}
            lat = payload.get("latitude")
            lon = payload.get("longitude")
            speed = payload.get("speed", 0.0)
            amb_status = payload.get("status")

            # Update DB inside a session
            db: Session = SessionLocal()
            try:
                amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
                if amb:
                    if lat is not None and lon is not None:
                        amb.latitude = float(lat)
                        amb.longitude = float(lon)
                        
                        # Save location trace
                        loc_record = AmbulanceLocation(
                            ambulance_id=ambulance_id,
                            latitude=float(lat),
                            longitude=float(lon),
                            speed=float(speed)
                        )
                        db.add(loc_record)
                    
                    if amb_status:
                        amb.status = amb_status
                        
                    db.commit()
            except Exception as ex:
                logger.error(f"Error updating ambulance DB via WS: {ex}")
            finally:
                db.close()

            # Broadcast updated coordinates to all subscribed clients
            broadcast_payload = {
                "type": "LOCATION_UPDATE",
                "ambulance_id": ambulance_id,
                "latitude": lat,
                "longitude": lon,
                "speed": speed,
                "status": amb_status
            }
            await manager.broadcast(channel, broadcast_payload)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, channel)

@router.websocket("/emergency/{emergency_id}")
async def websocket_emergency_tracking(websocket: WebSocket, emergency_id: int):
    channel = f"emergency_{emergency_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            await manager.broadcast(channel, payload)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception:
        manager.disconnect(websocket, channel)
