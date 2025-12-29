
type SensorType = 'fermentation' | 'drying' | 'roasting';

interface SensorUpdate {
  type: SensorType;
  timestamp: string;
  value: number;
  batchId: string;
}

type Listener = (data: SensorUpdate) => void;

/**
 * Simulates a WebSocket / SSE connection for real-time sensor data.
 * In a real app, this would use socket.io-client.
 */
class StreamService {
  private listeners: Map<SensorType, Set<Listener>> = new Map();
  private intervalId: number | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.listeners.set('fermentation', new Set());
    this.listeners.set('drying', new Set());
    this.listeners.set('roasting', new Set());
  }

  /**
   * Connect to the live stream (Simulation).
   */
  connect() {
    if (this.isConnected) return;
    this.isConnected = true;
    console.log('[StreamService] Connected to wss://sensor-stream.ofi.internal');

    // Simulate incoming data stream
    this.intervalId = window.setInterval(() => {
      this.emitMockData();
    }, 2000); // 2-second heartbeat
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.log('[StreamService] Disconnected');
  }

  subscribe(type: SensorType, callback: Listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
    return () => this.listeners.get(type)?.delete(callback);
  }

  private emitMockData() {
    // 1. Fermentation Update
    this.notify('fermentation', {
      type: 'fermentation',
      timestamp: new Date().toLocaleTimeString(),
      value: 45 + Math.random() * 2, // 45-47°C
      batchId: 'FERM-B01'
    });

    // 2. Drying Update
    this.notify('drying', {
      type: 'drying',
      timestamp: new Date().toLocaleTimeString(),
      value: 12 + Math.random() * 1.5, // 12-13.5%
      batchId: 'DRY-1001'
    });

    // 3. Roasting Update
    this.notify('roasting', {
      type: 'roasting',
      timestamp: new Date().toLocaleTimeString(),
      value: 138 + Math.random() * 5, // 138-143°C
      batchId: 'RST-BATCH-8901'
    });
  }

  private notify(type: SensorType, data: SensorUpdate) {
    this.listeners.get(type)?.forEach(cb => cb(data));
  }
}

export const streamService = new StreamService();
