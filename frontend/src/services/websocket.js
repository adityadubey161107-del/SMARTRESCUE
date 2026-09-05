export class AmbulanceTrackingSocket {
  constructor(ambulanceId, onMessageCallback, onErrorCallback) {
    this.ambulanceId = ambulanceId;
    this.onMessageCallback = onMessageCallback;
    this.onErrorCallback = onErrorCallback;
    this.socket = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `${window.location.hostname}:8000` 
      : window.location.host;
      
    const wsUrl = `${protocol}//${host}/api/ws/ambulance/${this.ambulanceId}`;

    try {
      this.isConnecting = true;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        console.log(`WebSocket connected for Ambulance #${this.ambulanceId}`);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      };

      this.socket.onclose = () => {
        console.log(`WebSocket closed for Ambulance #${this.ambulanceId}`);
      };
    } catch (err) {
      console.error("WebSocket connection setup failed:", err);
    }
  }

  sendLocation(latitude, longitude, speed = 0.0, status = "BUSY") {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = {
        latitude,
        longitude,
        speed,
        status,
        timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
