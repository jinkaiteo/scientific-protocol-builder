import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { collaborationService, UserInfo, Operation, SessionInfo } from '../../services/collaborationService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

interface CollaborationContextType {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  
  // Session info
  currentSession: SessionInfo | null;
  connectedUsers: UserInfo[];
  
  // Operations
  sendOperation: (operation: Omit<Operation, 'userId' | 'appliedAt' | 'version'>) => void;
  
  // Element locking
  lockElement: (elementId: string) => void;
  unlockElement: (elementId: string) => void;
  lockedElements: Map<string, UserInfo>;
  
  // Presence
  updatePresence: (presence: { cursor?: { x: number; y: number } | null; selection?: any }) => void;
  userPresence: Map<string, { cursor?: { x: number; y: number } | null; selection?: any }>;
  
  // Protocol collaboration
  joinProtocol: (protocolId: string) => Promise<void>;
  leaveProtocol: () => Promise<void>;
  currentProtocolId: string | null;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const { user, token } = useAuthStore();
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Session state
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);
  const [currentProtocolId, setCurrentProtocolId] = useState<string | null>(null);
  
  // Collaboration state
  const [lockedElements, setLockedElements] = useState<Map<string, UserInfo>>(new Map());
  const [userPresence, setUserPresence] = useState<Map<string, any>>(new Map());
  
  // Initialize collaboration service
  useEffect(() => {
    if (!user || !token) return;

    const connectToCollaboration = async () => {
      setIsConnecting(true);
      try {
        await collaborationService.connect(token);
        setIsConnected(true);
        toast.success('Connected to collaboration service');
      } catch (error) {
        console.error('Failed to connect to collaboration service:', error);
        toast.error('Failed to connect to collaboration service');
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToCollaboration();

    return () => {
      collaborationService.disconnect();
      setIsConnected(false);
      setCurrentSession(null);
      setConnectedUsers([]);
      setCurrentProtocolId(null);
      setLockedElements(new Map());
      setUserPresence(new Map());
    };
  }, [user, token]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Session events
    const handleSessionJoined = (data: SessionInfo) => {
      setCurrentSession(data);
      setConnectedUsers(data.connectedUsers);
      toast.success(`Joined protocol collaboration (${data.connectedUsers.length} users)`);
    };

    const handleUserJoined = (data: { userId: string; userInfo: UserInfo; connectedUsers: UserInfo[] }) => {
      setConnectedUsers(data.connectedUsers);
      if (data.userId !== user?.id) {
        toast.info(`${data.userInfo.name} joined the collaboration`);
      }
    };

    const handleUserLeft = (data: { userId: string; connectedUsers: UserInfo[] }) => {
      setConnectedUsers(data.connectedUsers);
      const leftUser = connectedUsers.find(u => u.userId === data.userId);
      if (leftUser && data.userId !== user?.id) {
        toast.info(`${leftUser.name} left the collaboration`);
      }
    };

    // Operation events
    const handleOperationApplied = (data: { operation: Operation; appliedBy: string }) => {
      // Handle incoming operations from other users
      console.log('Operation applied by another user:', data);
      // This would trigger UI updates in the protocol builder
    };

    const handleOperationConfirmed = (data: { operationId: string; appliedOperation: Operation }) => {
      console.log('Operation confirmed:', data);
      // Update local state to reflect confirmed operation
    };

    const handleOperationFailed = (data: { operationId: string; error: string }) => {
      console.error('Operation failed:', data);
      toast.error(`Operation failed: ${data.error}`);
    };

    // Locking events
    const handleElementLocked = (data: { elementId: string; userId: string; userInfo: UserInfo }) => {
      setLockedElements(prev => {
        const newMap = new Map(prev);
        newMap.set(data.elementId, data.userInfo);
        return newMap;
      });
      
      if (data.userId !== user?.id) {
        toast.info(`${data.userInfo.name} is editing element ${data.elementId}`);
      }
    };

    const handleElementUnlocked = (data: { elementId: string; userId: string }) => {
      setLockedElements(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.elementId);
        return newMap;
      });
    };

    const handleLockFailed = (data: { elementId: string; lockedBy: string }) => {
      const lockingUser = connectedUsers.find(u => u.userId === data.lockedBy);
      toast.warning(`Element is being edited by ${lockingUser?.name || 'another user'}`);
    };

    // Presence events
    const handlePresenceUpdated = (data: { userId: string; presence: any; allUsers: UserInfo[] }) => {
      setUserPresence(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data.presence);
        return newMap;
      });
    };

    // Error events
    const handleError = (data: { message: string }) => {
      console.error('Collaboration error:', data);
      toast.error(`Collaboration error: ${data.message}`);
    };

    const handleForceDisconnect = (data: { protocolId: string; reason: string }) => {
      toast.warning(`Disconnected from protocol: ${data.reason}`);
      setCurrentProtocolId(null);
      setCurrentSession(null);
      setConnectedUsers([]);
    };

    // Register event listeners
    collaborationService.on('session-joined', handleSessionJoined);
    collaborationService.on('user-joined', handleUserJoined);
    collaborationService.on('user-left', handleUserLeft);
    collaborationService.on('operation-applied', handleOperationApplied);
    collaborationService.on('operation-confirmed', handleOperationConfirmed);
    collaborationService.on('operation-failed', handleOperationFailed);
    collaborationService.on('element-locked', handleElementLocked);
    collaborationService.on('element-unlocked', handleElementUnlocked);
    collaborationService.on('lock-failed', handleLockFailed);
    collaborationService.on('presence-updated', handlePresenceUpdated);
    collaborationService.on('error', handleError);
    collaborationService.on('force-disconnect', handleForceDisconnect);

    return () => {
      // Clean up event listeners
      collaborationService.off('session-joined', handleSessionJoined);
      collaborationService.off('user-joined', handleUserJoined);
      collaborationService.off('user-left', handleUserLeft);
      collaborationService.off('operation-applied', handleOperationApplied);
      collaborationService.off('operation-confirmed', handleOperationConfirmed);
      collaborationService.off('operation-failed', handleOperationFailed);
      collaborationService.off('element-locked', handleElementLocked);
      collaborationService.off('element-unlocked', handleElementUnlocked);
      collaborationService.off('lock-failed', handleLockFailed);
      collaborationService.off('presence-updated', handlePresenceUpdated);
      collaborationService.off('error', handleError);
      collaborationService.off('force-disconnect', handleForceDisconnect);
    };
  }, [isConnected, user, connectedUsers]);

  // Protocol collaboration methods
  const joinProtocol = useCallback(async (protocolId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to collaboration service');
    }

    try {
      await collaborationService.joinProtocol(protocolId);
      setCurrentProtocolId(protocolId);
    } catch (error) {
      console.error('Failed to join protocol collaboration:', error);
      throw error;
    }
  }, [isConnected]);

  const leaveProtocol = useCallback(async () => {
    if (!currentProtocolId) return;

    try {
      await collaborationService.leaveProtocol(currentProtocolId);
      setCurrentProtocolId(null);
      setCurrentSession(null);
      setConnectedUsers([]);
      setLockedElements(new Map());
      setUserPresence(new Map());
    } catch (error) {
      console.error('Failed to leave protocol collaboration:', error);
      throw error;
    }
  }, [currentProtocolId]);

  // Operation methods
  const sendOperation = useCallback((operation: Omit<Operation, 'userId' | 'appliedAt' | 'version'>) => {
    if (!currentProtocolId) {
      throw new Error('No active protocol collaboration');
    }

    collaborationService.sendOperation(currentProtocolId, operation);
  }, [currentProtocolId]);

  // Element locking methods
  const lockElement = useCallback((elementId: string) => {
    if (!currentProtocolId) return;
    collaborationService.lockElement(currentProtocolId, elementId);
  }, [currentProtocolId]);

  const unlockElement = useCallback((elementId: string) => {
    if (!currentProtocolId) return;
    collaborationService.unlockElement(currentProtocolId, elementId);
  }, [currentProtocolId]);

  // Presence methods
  const updatePresence = useCallback((presence: { cursor?: { x: number; y: number } | null; selection?: any }) => {
    if (!currentProtocolId) return;
    collaborationService.updatePresence(currentProtocolId, presence);
  }, [currentProtocolId]);

  const contextValue: CollaborationContextType = {
    isConnected,
    isConnecting,
    currentSession,
    connectedUsers,
    sendOperation,
    lockElement,
    unlockElement,
    lockedElements,
    updatePresence,
    userPresence,
    joinProtocol,
    leaveProtocol,
    currentProtocolId,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Custom hook to use collaboration context
export const useCollaboration = (): CollaborationContextType => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};