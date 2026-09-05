import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom SVG Leaflet icons
const createCustomIcon = (emoji, bgColor = '#2563eb') => {
  const svgHtml = `
    <div style="
      background-color: ${bgColor};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      ${emoji}
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const patientIcon = createCustomIcon('📍', '#ef4444');
const ambulanceIcon = createCustomIcon('🚑', '#2563eb');
const hospitalIcon = createCustomIcon('🏥', '#10b981');

// Helper to auto-fit bounds on map
const AutoFitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    const validMarkers = markers.filter(m => m && m.lat && m.lng);
    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, map]);
  return null;
};

export const MapView = ({ 
  patientLocation, 
  ambulanceLocation, 
  hospitalLocation, 
  height = "400px",
  zoom = 13,
  allAmbulances = [],
  allHospitals = []
}) => {
  // Default center if no coordinates provided (Bengaluru demo center)
  const defaultCenter = [12.9716, 77.5946];

  const centerLat = patientLocation?.lat || ambulanceLocation?.lat || hospitalLocation?.lat || defaultCenter[0];
  const centerLng = patientLocation?.lng || ambulanceLocation?.lng || hospitalLocation?.lng || defaultCenter[1];

  const activeMarkers = [
    patientLocation && { lat: patientLocation.lat, lng: patientLocation.lng },
    ambulanceLocation && { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng },
    hospitalLocation && { lat: hospitalLocation.lat, lng: hospitalLocation.lng }
  ].filter(Boolean);

  // Route lines
  const routePoints = [];
  if (ambulanceLocation) routePoints.push([ambulanceLocation.lat, ambulanceLocation.lng]);
  if (patientLocation) routePoints.push([patientLocation.lat, patientLocation.lng]);
  if (hospitalLocation) routePoints.push([hospitalLocation.lat, hospitalLocation.lng]);

  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {activeMarkers.length > 0 && <AutoFitBounds markers={activeMarkers} />}

        {/* Route Polyline */}
        {routePoints.length >= 2 && (
          <Polyline 
            positions={routePoints} 
            color="#2563eb" 
            weight={4} 
            opacity={0.8} 
            dashArray="8, 8" 
          />
        )}

        {/* Patient Marker */}
        {patientLocation && (
          <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">📍 Patient Location</p>
                <p className="text-slate-500 mt-1">{patientLocation.address || 'Emergency Request Site'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Assigned Ambulance Marker */}
        {ambulanceLocation && (
          <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={ambulanceIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">🚑 Ambulance {ambulanceLocation.name || ''}</p>
                <p className="text-slate-500 mt-1">Status: {ambulanceLocation.status || 'Active Dispatch'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Assigned Hospital Marker */}
        {hospitalLocation && (
          <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">🏥 {hospitalLocation.name || 'Hospital'}</p>
                <p className="text-slate-500 mt-1">{hospitalLocation.address || 'Emergency Department'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Additional Ambulances for Admin Fleet map */}
        {allAmbulances.map((amb) => (
          <Marker key={`amb-${amb.id}`} position={[amb.latitude, amb.longitude]} icon={ambulanceIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">🚑 {amb.vehicle_number}</p>
                <p className="text-slate-500">Type: {amb.type}</p>
                <p className="text-slate-500">Status: {amb.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Additional Hospitals for Admin map */}
        {allHospitals.map((hosp) => (
          <Marker key={`hosp-${hosp.id}`} position={[hosp.latitude, hosp.longitude]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">🏥 {hosp.name}</p>
                <p className="text-slate-500">{hosp.phone}</p>
                <p className="text-slate-500">Status: {hosp.emergency_available}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};
