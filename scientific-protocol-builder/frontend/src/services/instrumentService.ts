import apiClient from './apiClient';
import io, { Socket } from 'socket.io-client';

export interface Instrument {
  _id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: {
    building?: string;
    room?: string;
    position?: string;
  };
  status: 'available' | 'in_use' | 'maintenance' | 'calibration' | 'offline' | 'reserved';
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  currentUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  capabilities: InstrumentCapability[];
  qualityControl: {
    requiresCalibration: boolean;
    calibrationInterval?: number;
    lastCalibration?: Date;
    nextCalibrationDue?: Date;
    calibrationStatus?: string;
  };
  maintenance: {
    schedule: {
      frequency?: number;
      lastMaintenance?: Date;
      nextMaintenance?: Date;
    };
  };
  realTimeStatus?: {
    isConnected: boolean;
    lastUpdate?: Date;
    latestData?: any;
  };
  connectionInfo?: {
    isConnected: boolean;
    lastPing?: Date;
    dataPoints?: any[];
  };
  utilization?: {
    utilizationRate: number;
    totalUsageHours: number;
    totalSessions: number;
    averageSessionDuration: number;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InstrumentCapability {
  name: string;
  description?: string;
  parameters: InstrumentParameter[];
  protocols: string[];
  outputs: InstrumentOutput[];
  limitations: string[];
}

export interface InstrumentParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  unit?: string;
  min?: number;
  max?: number;
  default?: any;
  options?: string[];
  required: boolean;
  description?: string;
}

export interface InstrumentOutput {
  name: string;
  type: string;
  unit?: string;
  description?: string;
}

export interface BlocklyBlock {
  type: string;
  message0: string;
  args0: any[];
  colour: string;
  tooltip: string;
  helpUrl?: string;
  data: any;
  previousStatement?: any;
  nextStatement?: any;
  output?: string;
}

export interface InstrumentSearchFilters {
  search?: string;
  category?: string;
  status?: string | string[];
  location?: {
    building?: string;
    room?: string;
  };
  calibrationStatus?: 'current' | 'due_soon' | 'overdue';
  availableOnly?: boolean;
  myInstruments?: boolean;
  tags?: string[];
}

export interface InstrumentSearchResult {
  instruments: Instrument[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

export interface CalibrationRecord {
  date: Date;
  method: string;
  results: {
    passed: boolean;
    accuracy?: number;
    precision?: number;
    notes?: string;
    certificate?: string;
  };
  nextCalibrationDue: Date;
  standards?: Array<{
    name: string;
    value: number;
    unit: string;
    certificate?: string;
  }>;
}

export interface ReservationData {
  startTime: Date;
  endTime: Date;
  purpose: string;
}

export interface DashboardData {
  overview: {
    total: number;
    available: number;
    myInstruments: number;
    activeUsage: number;
    utilizationRate: number;
  };
  alerts: {
    calibrationDue: number;
    maintenanceDue: number;
    connectedInstruments: number;
  };
  breakdown: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  recentActivity: any[];
  utilizationTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

class InstrumentService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.setupEventListenerMap();
  }

  private setupEventListenerMap() {
    const events = [
      'instrument-status', 'instrument-connected', 'instrument-disconnected',
      'instrument-command-result', 'instrument-command-executed',
      'instrument-reservation-result', 'instrument-reserved',
      'instrument-alert', 'dashboard-data', 'error'
    ];

    events.forEach(event => {
      this.eventListeners.set(event, new Set());
    });
  }

  /**
   * Connect to instruments WebSocket namespace
   */
  async connectWebSocket(token: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3081';
    
    this.socket = io(`${backendUrl}/instruments`, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not initialized'));

      this.socket.on('connect', () => {
        console.log('Connected to instruments service');
        this.isConnected = true;
        this.setupEventForwarding();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Instruments connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from instruments service');
        this.isConnected = false;
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  /**
   * Search instruments with advanced filters
   */
  async searchInstruments(
    filters: InstrumentSearchFilters = {},
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 20
  ): Promise<InstrumentSearchResult> {
    const params = new URLSearchParams({
      sortBy,
      sortOrder,
      page: page.toString(),
      limit: limit.toString()
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              params.append(`${key}.${subKey}`, subValue.toString());
            }
          });
        } else if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/instruments/search?${params}`);
    return response.data.data;
  }

  /**
   * Get detailed instrument information
   */
  async getInstrumentDetails(instrumentId: string): Promise<Instrument> {
    const response = await apiClient.get(`/instruments/${instrumentId}/details`);
    return response.data.data;
  }

  /**
   * Generate Blockly blocks for an instrument
   */
  async generateBlocklyBlocks(instrumentId: string): Promise<{
    instrumentId: string;
    instrumentName: string;
    category: string;
    blocks: BlocklyBlock[];
    blockDefinitions: any[];
    customBlocks: any[];
  }> {
    const response = await apiClient.get(`/instruments/${instrumentId}/blockly-blocks`);
    return response.data.data;
  }

  /**
   * Connect to instrument for real-time monitoring
   */
  async connectInstrument(instrumentId: string, connectionConfig: any = {}): Promise<void> {
    const response = await apiClient.post(`/instruments/${instrumentId}/connect`, {
      connectionConfig
    });
    return response.data.data;
  }

  /**
   * Disconnect from instrument
   */
  async disconnectInstrument(instrumentId: string): Promise<void> {
    const response = await apiClient.post(`/instruments/${instrumentId}/disconnect`);
    return response.data.data;
  }

  /**
   * Reserve instrument
   */
  async reserveInstrument(instrumentId: string, reservationData: ReservationData): Promise<any> {
    const response = await apiClient.post(`/instruments/${instrumentId}/reserve`, reservationData);
    return response.data.data;
  }

  /**
   * Record calibration
   */
  async recordCalibration(instrumentId: string, calibrationData: CalibrationRecord): Promise<any> {
    const response = await apiClient.post(`/instruments/${instrumentId}/calibration`, calibrationData);
    return response.data.data;
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/instruments/dashboard/overview');
    return response.data.data;
  }

  /**
   * Get instrument categories
   */
  async getCategories(): Promise<Array<{ value: string; label: string; icon: string }>> {
    const response = await apiClient.get('/instruments/categories');
    return response.data.data;
  }

  /**
   * Get instruments due for calibration
   */
  async getCalibrationDue(days: number = 30): Promise<Instrument[]> {
    const response = await apiClient.get(`/instruments/calibration/due?days=${days}`);
    return response.data.data;
  }

  /**
   * Get instruments due for maintenance
   */
  async getMaintenanceDue(days: number = 30): Promise<Instrument[]> {
    const response = await apiClient.get(`/instruments/maintenance/due?days=${days}`);
    return response.data.data;
  }

  /**
   * Get available instruments
   */
  async getAvailableInstruments(filters: any = {}): Promise<Instrument[]> {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/instruments/available?${params}`);
    return response.data.data;
  }

  /**
   * Create new instrument
   */
  async createInstrument(instrumentData: Partial<Instrument>): Promise<Instrument> {
    const response = await apiClient.post('/instruments', instrumentData);
    return response.data.data;
  }

  /**
   * Update instrument
   */
  async updateInstrument(instrumentId: string, updateData: Partial<Instrument>): Promise<Instrument> {
    const response = await apiClient.put(`/instruments/${instrumentId}`, updateData);
    return response.data.data;
  }

  /**
   * Delete instrument
   */
  async deleteInstrument(instrumentId: string): Promise<void> {
    await apiClient.delete(`/instruments/${instrumentId}`);
  }

  // WebSocket methods

  /**
   * Subscribe to instrument updates
   */
  subscribeToInstrument(instrumentId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to instruments service');
    }

    this.socket.emit('subscribe-instrument', { instrumentId });
  }

  /**
   * Unsubscribe from instrument updates
   */
  unsubscribeFromInstrument(instrumentId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('unsubscribe-instrument', { instrumentId });
  }

  /**
   * Send command to instrument
   */
  sendCommand(instrumentId: string, command: string, parameters: any = {}): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to instruments service');
    }

    this.socket.emit('instrument-command', { instrumentId, command, parameters });
  }

  /**
   * Get real-time instrument status
   */
  getInstrumentStatus(instrumentId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('get-instrument-status', { instrumentId });
  }

  /**
   * Reserve instrument via WebSocket
   */
  reserveInstrumentWS(instrumentId: string, startTime: Date, endTime: Date, purpose: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to instruments service');
    }

    this.socket.emit('reserve-instrument', { instrumentId, startTime, endTime, purpose });
  }

  /**
   * Request dashboard data via WebSocket
   */
  requestDashboardData(): void {
    if (!this.socket?.connected) return;

    this.socket.emit('get-dashboard-data');
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.eventListeners.get(event)?.clear();
    } else {
      this.eventListeners.forEach(listeners => listeners.clear());
    }
  }

  /**
   * Get connection status
   */
  isConnectedToInstruments(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    this.eventListeners.forEach((listeners, event) => {
      this.socket!.on(event, (data: any) => {
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in instrument event listener for ${event}:`, error);
          }
        });
      });
    });
  }
}

// Create singleton instance
export const instrumentService = new InstrumentService();

export default instrumentService;