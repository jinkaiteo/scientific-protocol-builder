const collaborationService = require('../services/collaborationService');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * Socket.IO handler for real-time collaboration
 */
class CollaborationHandler {
  constructor(io) {
    this.io = io;
    this.setupNamespace();
    this.startCleanupInterval();
  }

  setupNamespace() {
    // Create collaboration namespace
    this.collaborationNamespace = this.io.of('/collaboration');
    
    // Authentication middleware for collaboration namespace
    this.collaborationNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userInfo = {
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.avatar
        };
        
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.collaborationNamespace.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    logger.info(`User ${socket.userId} connected to collaboration namespace`);

    // Join protocol collaboration
    socket.on('join-protocol', async (data) => {
      try {
        const { protocolId } = data;
        
        // Join socket room for this protocol
        await socket.join(`protocol-${protocolId}`);
        
        // Add user to collaboration session
        const sessionInfo = collaborationService.joinSession(
          protocolId,
          socket.userId,
          socket.userInfo,
          socket
        );

        // Notify user of successful join
        socket.emit('session-joined', sessionInfo);

        // Notify other users in the protocol
        socket.to(`protocol-${protocolId}`).emit('user-joined', {
          userId: socket.userId,
          userInfo: socket.userInfo,
          connectedUsers: sessionInfo.connectedUsers
        });

        logger.info(`User ${socket.userId} joined protocol ${protocolId}`);
      } catch (error) {
        logger.error('Error joining protocol:', error);
        socket.emit('error', { message: 'Failed to join protocol collaboration' });
      }
    });

    // Leave protocol collaboration
    socket.on('leave-protocol', async (data) => {
      try {
        const { protocolId } = data;
        
        // Leave socket room
        await socket.leave(`protocol-${protocolId}`);
        
        // Remove user from collaboration session
        const remainingUsers = collaborationService.leaveSession(
          protocolId,
          socket.userId,
          socket.id
        );

        // Notify other users
        socket.to(`protocol-${protocolId}`).emit('user-left', {
          userId: socket.userId,
          connectedUsers: remainingUsers
        });

        logger.info(`User ${socket.userId} left protocol ${protocolId}`);
      } catch (error) {
        logger.error('Error leaving protocol:', error);
      }
    });

    // Handle operations (operational transformation)
    socket.on('operation', async (data) => {
      try {
        const { protocolId, operation } = data;
        
        // Apply operation with operational transformation
        const appliedOperation = collaborationService.applyOperation(
          protocolId,
          operation,
          socket.userId
        );

        if (appliedOperation) {
          // Broadcast operation to other users in the protocol
          socket.to(`protocol-${protocolId}`).emit('operation-applied', {
            operation: appliedOperation,
            appliedBy: socket.userId
          });

          // Confirm operation to sender
          socket.emit('operation-confirmed', {
            operationId: operation.id,
            appliedOperation
          });
        }

        logger.debug(`Operation applied in protocol ${protocolId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error applying operation:', error);
        socket.emit('operation-failed', {
          operationId: data.operation?.id,
          error: error.message
        });
      }
    });

    // Handle element locking
    socket.on('lock-element', async (data) => {
      try {
        const { protocolId, elementId } = data;
        
        const lockResult = collaborationService.lockElement(
          protocolId,
          elementId,
          socket.userId
        );

        if (lockResult.success) {
          // Notify all users about the lock
          this.collaborationNamespace.to(`protocol-${protocolId}`).emit('element-locked', {
            elementId,
            userId: socket.userId,
            userInfo: socket.userInfo
          });
          
          socket.emit('lock-acquired', { elementId });
        } else {
          socket.emit('lock-failed', { 
            elementId, 
            lockedBy: lockResult.lockedBy 
          });
        }
      } catch (error) {
        logger.error('Error locking element:', error);
        socket.emit('error', { message: 'Failed to lock element' });
      }
    });

    // Handle element unlocking
    socket.on('unlock-element', async (data) => {
      try {
        const { protocolId, elementId } = data;
        
        collaborationService.unlockElement(protocolId, elementId, socket.userId);
        
        // Notify all users about the unlock
        this.collaborationNamespace.to(`protocol-${protocolId}`).emit('element-unlocked', {
          elementId,
          userId: socket.userId
        });

        socket.emit('lock-released', { elementId });
      } catch (error) {
        logger.error('Error unlocking element:', error);
      }
    });

    // Handle cursor/selection updates
    socket.on('update-presence', async (data) => {
      try {
        const { protocolId, presence } = data;
        
        const updatedPresence = collaborationService.updateUserPresence(
          protocolId,
          socket.userId,
          presence
        );

        // Broadcast presence update to other users
        socket.to(`protocol-${protocolId}`).emit('presence-updated', {
          userId: socket.userId,
          presence,
          allUsers: updatedPresence
        });
      } catch (error) {
        logger.error('Error updating presence:', error);
      }
    });

    // Get session information
    socket.on('get-session-info', async (data) => {
      try {
        const { protocolId } = data;
        
        const sessionInfo = collaborationService.getSessionInfo(protocolId);
        
        socket.emit('session-info', sessionInfo);
      } catch (error) {
        logger.error('Error getting session info:', error);
        socket.emit('error', { message: 'Failed to get session information' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected from collaboration`);
      
      // Clean up user from all active sessions
      for (const room of socket.rooms) {
        if (room.startsWith('protocol-')) {
          const protocolId = room.replace('protocol-', '');
          const remainingUsers = collaborationService.leaveSession(
            protocolId,
            socket.userId,
            socket.id
          );

          // Notify other users
          socket.to(room).emit('user-left', {
            userId: socket.userId,
            connectedUsers: remainingUsers
          });
        }
      }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  // Start cleanup interval for inactive sessions
  startCleanupInterval() {
    setInterval(() => {
      collaborationService.cleanupInactiveSessions(30); // 30 minutes
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Broadcast message to all users in a protocol
  broadcastToProtocol(protocolId, event, data) {
    this.collaborationNamespace.to(`protocol-${protocolId}`).emit(event, data);
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    // Find socket by userId
    for (const [socketId, socket] of this.collaborationNamespace.sockets) {
      if (socket.userId === userId) {
        socket.emit(event, data);
        break;
      }
    }
  }

  // Get connected users for a protocol
  getConnectedUsers(protocolId) {
    const sessionInfo = collaborationService.getSessionInfo(protocolId);
    return sessionInfo ? sessionInfo.connectedUsers : [];
  }

  // Force disconnect user from protocol
  disconnectUserFromProtocol(protocolId, userId) {
    for (const [socketId, socket] of this.collaborationNamespace.sockets) {
      if (socket.userId === userId && socket.rooms.has(`protocol-${protocolId}`)) {
        socket.leave(`protocol-${protocolId}`);
        socket.emit('force-disconnect', { protocolId, reason: 'Administrative action' });
        break;
      }
    }
  }
}

module.exports = CollaborationHandler;