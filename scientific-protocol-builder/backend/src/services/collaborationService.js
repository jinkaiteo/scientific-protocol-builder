const { v4: uuidv4 } = require('uuid');

/**
 * Collaboration Service for Real-time Protocol Editing
 * Handles operational transformation, conflict resolution, and user presence
 */
class CollaborationService {
  constructor() {
    this.activeSessions = new Map(); // protocolId -> session data
    this.operations = new Map(); // protocolId -> operations queue
    this.userPresence = new Map(); // protocolId -> array of connected users
  }

  /**
   * Create or join a collaboration session
   */
  joinSession(protocolId, userId, userInfo, socket) {
    if (!this.activeSessions.has(protocolId)) {
      this.activeSessions.set(protocolId, {
        id: protocolId,
        createdAt: new Date(),
        lastActivity: new Date(),
        version: 0,
        operations: [],
        locks: new Map(), // elementId -> userId
      });
      this.operations.set(protocolId, []);
      this.userPresence.set(protocolId, []);
    }

    const session = this.activeSessions.get(protocolId);
    const presence = this.userPresence.get(protocolId);

    // Add user to presence
    const userPresenceData = {
      userId,
      socketId: socket.id,
      ...userInfo,
      joinedAt: new Date(),
      cursor: null,
      selection: null,
    };

    // Remove existing presence for this user
    const existingIndex = presence.findIndex(p => p.userId === userId);
    if (existingIndex !== -1) {
      presence.splice(existingIndex, 1);
    }

    presence.push(userPresenceData);

    return {
      sessionId: session.id,
      version: session.version,
      connectedUsers: presence.map(p => ({
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        joinedAt: p.joinedAt
      }))
    };
  }

  /**
   * Remove user from collaboration session
   */
  leaveSession(protocolId, userId, socketId) {
    if (!this.userPresence.has(protocolId)) return;

    const presence = this.userPresence.get(protocolId);
    const userIndex = presence.findIndex(p => p.userId === userId || p.socketId === socketId);
    
    if (userIndex !== -1) {
      presence.splice(userIndex, 1);
    }

    // Release any locks held by this user
    if (this.activeSessions.has(protocolId)) {
      const session = this.activeSessions.get(protocolId);
      for (const [elementId, lockUserId] of session.locks.entries()) {
        if (lockUserId === userId) {
          session.locks.delete(elementId);
        }
      }
    }

    // Clean up empty sessions
    if (presence.length === 0) {
      this.activeSessions.delete(protocolId);
      this.operations.delete(protocolId);
      this.userPresence.delete(protocolId);
    }

    return presence.map(p => ({
      userId: p.userId,
      name: p.name,
      avatar: p.avatar,
      joinedAt: p.joinedAt
    }));
  }

  /**
   * Apply operational transformation for concurrent editing
   */
  applyOperation(protocolId, operation, userId) {
    if (!this.activeSessions.has(protocolId)) {
      throw new Error('Session not found');
    }

    const session = this.activeSessions.get(protocolId);
    
    // Validate operation version
    if (operation.baseVersion !== session.version) {
      // Need to transform operation against newer operations
      const transformedOp = this.transformOperation(
        operation, 
        session.operations.slice(operation.baseVersion)
      );
      operation = transformedOp;
    }

    // Apply operation
    const appliedOperation = {
      id: uuidv4(),
      ...operation,
      userId,
      appliedAt: new Date(),
      version: session.version + 1
    };

    session.operations.push(appliedOperation);
    session.version++;
    session.lastActivity = new Date();

    return appliedOperation;
  }

  /**
   * Transform operation against a series of concurrent operations
   */
  transformOperation(operation, concurrentOps) {
    let transformed = { ...operation };

    for (const concurrentOp of concurrentOps) {
      transformed = this.transformAgainstOperation(transformed, concurrentOp);
    }

    return transformed;
  }

  /**
   * Transform one operation against another (Operational Transformation)
   */
  transformAgainstOperation(op1, op2) {
    // Handle different operation types
    if (op1.type === 'insert' && op2.type === 'insert') {
      return this.transformInsertInsert(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      return this.transformDeleteDelete(op1, op2);
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      return this.transformInsertDelete(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      return this.transformDeleteInsert(op1, op2);
    } else if (op1.type === 'move' || op2.type === 'move') {
      return this.transformMoveOperation(op1, op2);
    } else if (op1.type === 'update' || op2.type === 'update') {
      return this.transformUpdateOperation(op1, op2);
    }

    return op1;
  }

  /**
   * Transform insert against insert
   */
  transformInsertInsert(op1, op2) {
    if (op1.elementId !== op2.elementId) return op1;

    if (op1.position >= op2.position) {
      return {
        ...op1,
        position: op1.position + (op2.data?.length || 1)
      };
    }
    return op1;
  }

  /**
   * Transform delete against delete
   */
  transformDeleteDelete(op1, op2) {
    if (op1.elementId !== op2.elementId) return op1;

    if (op1.position >= op2.position + op2.length) {
      return {
        ...op1,
        position: op1.position - op2.length
      };
    } else if (op1.position + op1.length <= op2.position) {
      return op1;
    } else {
      // Overlapping deletes - need to adjust
      const newPosition = Math.min(op1.position, op2.position);
      const newLength = Math.max(
        op1.position + op1.length,
        op2.position + op2.length
      ) - newPosition - op2.length;

      return {
        ...op1,
        position: newPosition,
        length: Math.max(0, newLength)
      };
    }
  }

  /**
   * Transform insert against delete
   */
  transformInsertDelete(op1, op2) {
    if (op1.elementId !== op2.elementId) return op1;

    if (op1.position >= op2.position + op2.length) {
      return {
        ...op1,
        position: op1.position - op2.length
      };
    } else if (op1.position >= op2.position) {
      return {
        ...op1,
        position: op2.position
      };
    }
    return op1;
  }

  /**
   * Transform delete against insert
   */
  transformDeleteInsert(op1, op2) {
    if (op1.elementId !== op2.elementId) return op1;

    if (op1.position >= op2.position) {
      return {
        ...op1,
        position: op1.position + (op2.data?.length || 1)
      };
    }
    return op1;
  }

  /**
   * Transform move operations
   */
  transformMoveOperation(op1, op2) {
    if (op1.type !== 'move' && op2.type !== 'move') return op1;

    // Handle block movement transformations
    if (op1.type === 'move' && op2.type === 'move') {
      if (op1.elementId === op2.elementId) {
        // Same element moved by different users - last one wins
        return null; // Cancel this operation
      }
    }

    return op1;
  }

  /**
   * Transform update operations
   */
  transformUpdateOperation(op1, op2) {
    if (op1.type === 'update' && op2.type === 'update') {
      if (op1.elementId === op2.elementId && op1.property === op2.property) {
        // Same property updated - merge or use last value
        return {
          ...op1,
          data: { ...op2.data, ...op1.data }
        };
      }
    }

    return op1;
  }

  /**
   * Lock an element for exclusive editing
   */
  lockElement(protocolId, elementId, userId) {
    if (!this.activeSessions.has(protocolId)) {
      throw new Error('Session not found');
    }

    const session = this.activeSessions.get(protocolId);
    const currentLock = session.locks.get(elementId);

    if (currentLock && currentLock !== userId) {
      return { success: false, lockedBy: currentLock };
    }

    session.locks.set(elementId, userId);
    return { success: true };
  }

  /**
   * Release element lock
   */
  unlockElement(protocolId, elementId, userId) {
    if (!this.activeSessions.has(protocolId)) return;

    const session = this.activeSessions.get(protocolId);
    const currentLock = session.locks.get(elementId);

    if (currentLock === userId) {
      session.locks.delete(elementId);
    }
  }

  /**
   * Update user cursor/selection
   */
  updateUserPresence(protocolId, userId, presence) {
    if (!this.userPresence.has(protocolId)) return;

    const users = this.userPresence.get(protocolId);
    const user = users.find(u => u.userId === userId);

    if (user) {
      user.cursor = presence.cursor;
      user.selection = presence.selection;
      user.lastActivity = new Date();
    }

    return users.map(u => ({
      userId: u.userId,
      name: u.name,
      avatar: u.avatar,
      cursor: u.cursor,
      selection: u.selection
    }));
  }

  /**
   * Get session information
   */
  getSessionInfo(protocolId) {
    const session = this.activeSessions.get(protocolId);
    const presence = this.userPresence.get(protocolId) || [];

    if (!session) return null;

    return {
      id: session.id,
      version: session.version,
      lastActivity: session.lastActivity,
      connectedUsers: presence.map(p => ({
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        joinedAt: p.joinedAt,
        cursor: p.cursor,
        selection: p.selection
      })),
      locks: Array.from(session.locks.entries()).map(([elementId, userId]) => ({
        elementId,
        userId
      }))
    };
  }

  /**
   * Clean up inactive sessions
   */
  cleanupInactiveSessions(maxInactiveMinutes = 30) {
    const cutoff = new Date(Date.now() - maxInactiveMinutes * 60 * 1000);
    
    for (const [protocolId, session] of this.activeSessions.entries()) {
      if (session.lastActivity < cutoff) {
        this.activeSessions.delete(protocolId);
        this.operations.delete(protocolId);
        this.userPresence.delete(protocolId);
      }
    }
  }
}

module.exports = new CollaborationService();