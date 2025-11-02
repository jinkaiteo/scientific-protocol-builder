import io, { Socket } from 'socket.io-client';

interface UserInfo {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt?: Date;
  cursor?: { x: number; y: number } | null;
  selection?: { elementId: string; range?: any } | null;
}

interface Operation {
  id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  elementId: string;
  baseVersion: number;
  position?: number;
  length?: number;
  data?: any;
  property?: string;
  userId?: string;
  appliedAt?: Date;
  version?: number;
}

interface SessionInfo {
  sessionId: string;
  version: number;
  connectedUsers: UserInfo[];
  locks?: { elementId: string; userId: string }[];
}

interface CollaborationEvents {
  'session-joined': (data: SessionInfo) => void;
  'user-joined': (data: { userId: string; userInfo: UserInfo; connectedUsers: UserInfo[] }) => void;
  'user-left': (data: { userId: string; connectedUsers: UserInfo[] }) => void;
  'operation-applied': (data: { operation: Operation; appliedBy: string }) => void;
  'operation-confirmed': (data: { operationId: string; appliedOperation: Operation }) => void;
  'operation-failed': (data: { operationId: string; error: string }) => void;
  'element-locked': (data: { elementId: string; userId: string; userInfo: UserInfo }) => void;
  'element-unlocked': (data: { elementId: string; userId: string }) => void;
  'lock-acquired': (data: { elementId: string }) => void;
  'lock-failed': (data: { elementId: string; lockedBy: string }) => void;
  'lock-released': (data: { elementId: string }) => void;
  'presence-updated': (data: { userId: string; presence: any; allUsers: UserInfo[] }) => void;
  'session-info': (data: SessionInfo | null) => void;
  'force-disconnect': (data: { protocolId: string; reason: string }) => void;
  'error': (data: { message: string }) => void;
  'pong': () => void;
}

class CollaborationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentProtocolId: string | null = null;
  private eventListeners: Map<keyof CollaborationEvents, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListenerMap();
  }

  private setupEventListenerMap() {
    const events: (keyof CollaborationEvents)[] = [
      'session-joined', 'user-joined', 'user-left', 'operation-applied',
      'operation-confirmed', 'operation-failed', 'element-locked',
      'element-unlocked', 'lock-acquired', 'lock-failed', 'lock-released',
      'presence-updated', 'session-info', 'force-disconnect', 'error', 'pong'
    ];

    events.forEach(event => {
      this.eventListeners.set(event, new Set());
    });
  }

  /**
   * Connect to collaboration namespace
   */
  async connect(token: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3081';
    
    this.socket = io(`${backendUrl}/collaboration`, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    });

    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not initialized'));

      this.socket.on('connect', () => {
        console.log('Connected to collaboration service');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Collaboration connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from collaboration service:', reason);
        this.isConnected = false;
        this.stopPingInterval();
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.handleReconnection();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected to collaboration service after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Rejoin current protocol if any
        if (this.currentProtocolId) {
          this.joinProtocol(this.currentProtocolId);
        }
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect to collaboration service');
        this.isConnected = false;
      });

      // Setup event forwarding
      this.setupEventForwarding();
    });
  }

  /**
   * Disconnect from collaboration service
   */
  disconnect(): void {
    if (this.currentProtocolId) {
      this.leaveProtocol(this.currentProtocolId);
    }
    
    this.stopPingInterval();
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    this.currentProtocolId = null;
  }

  /**
   * Join protocol collaboration
   */
  async joinProtocol(protocolId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to collaboration service');
    }

    this.currentProtocolId = protocolId;
    this.socket.emit('join-protocol', { protocolId });
  }

  /**
   * Leave protocol collaboration
   */
  async leaveProtocol(protocolId: string): Promise<void> {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-protocol', { protocolId });
    
    if (this.currentProtocolId === protocolId) {
      this.currentProtocolId = null;
    }
  }

  /**
   * Send operation for operational transformation
   */
  sendOperation(protocolId: string, operation: Omit<Operation, 'userId' | 'appliedAt' | 'version'>): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to collaboration service');
    }

    this.socket.emit('operation', { protocolId, operation });
  }

  /**
   * Lock an element for exclusive editing
   */
  lockElement(protocolId: string, elementId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to collaboration service');
    }

    this.socket.emit('lock-element', { protocolId, elementId });
  }

  /**
   * Unlock an element
   */
  unlockElement(protocolId: string, elementId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('unlock-element', { protocolId, elementId });
  }

  /**
   * Update user presence (cursor, selection)
   */
  updatePresence(protocolId: string, presence: { cursor?: { x: number; y: number } | null; selection?: any }): void {
    if (!this.socket?.connected) return;

    this.socket.emit('update-presence', { protocolId, presence });
  }

  /**
   * Get session information
   */
  getSessionInfo(protocolId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('get-session-info', { protocolId });
  }

  /**
   * Add event listener
   */
  on<K extends keyof CollaborationEvents>(event: K, listener: CollaborationEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   */
  off<K extends keyof CollaborationEvents>(event: K, listener: CollaborationEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners<K extends keyof CollaborationEvents>(event?: K): void {
    if (event) {
      this.eventListeners.get(event)?.clear();
    } else {
      this.eventListeners.forEach(listeners => listeners.clear());
    }
  }

  /**
   * Get connection status
   */
  isConnectedToCollaboration(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get current protocol ID
   */
  getCurrentProtocolId(): string | null {
    return this.currentProtocolId;
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    this.eventListeners.forEach((listeners, event) => {
      this.socket!.on(event, (data: any) => {
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in collaboration event listener for ${event}:`, error);
          }
        });
      });
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Create singleton instance
export const collaborationService = new CollaborationService();

// Export types for use in components
export type {
  UserInfo,
  Operation,
  SessionInfo,
  CollaborationEvents
};