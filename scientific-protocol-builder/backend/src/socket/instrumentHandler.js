const instrumentService = require('../services/instrumentService');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * Socket.IO handler for real-time instrument monitoring and control
 */
class InstrumentHandler {
  constructor(io) {
    this.io = io;
    this.setupNamespace();
    this.instrumentSubscriptions = new Map(); // instrumentId -> Set of socket IDs
  }

  setupNamespace() {
    // Create instruments namespace
    this.instrumentNamespace = this.io.of('/instruments');
    
    // Authentication middleware
    this.instrumentNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userInfo = {
          name: decoded.name,
          email: decoded.email
        };
        
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.instrumentNamespace.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Set up instrument service subscriptions
    this.setupInstrumentServiceSubscriptions();
  }

  handleConnection(socket) {
    logger.info(`User ${socket.userId} connected to instruments namespace`);

    // Subscribe to instrument updates
    socket.on('subscribe-instrument', async (data) => {
      try {
        const { instrumentId } = data;
        
        // Join instrument room
        await socket.join(`instrument-${instrumentId}`);
        
        // Add to subscriptions
        if (!this.instrumentSubscriptions.has(instrumentId)) {
          this.instrumentSubscriptions.set(instrumentId, new Set());
        }
        this.instrumentSubscriptions.get(instrumentId).add(socket.id);

        // Send current instrument status
        const instrumentDetails = await instrumentService.getInstrumentDetails(instrumentId);
        socket.emit('instrument-status', {
          instrumentId,
          status: instrumentDetails.realTimeStatus,
          connectionInfo: instrumentDetails.connectionInfo
        });

        logger.info(`User ${socket.userId} subscribed to instrument ${instrumentId}`);
      } catch (error) {
        logger.error('Error subscribing to instrument:', error);
        socket.emit('error', { message: 'Failed to subscribe to instrument' });
      }
    });

    // Unsubscribe from instrument updates
    socket.on('unsubscribe-instrument', async (data) => {
      try {
        const { instrumentId } = data;
        
        // Leave instrument room
        await socket.leave(`instrument-${instrumentId}`);
        
        // Remove from subscriptions
        const subscribers = this.instrumentSubscriptions.get(instrumentId);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            this.instrumentSubscriptions.delete(instrumentId);
          }
        }

        logger.info(`User ${socket.userId} unsubscribed from instrument ${instrumentId}`);
      } catch (error) {
        logger.error('Error unsubscribing from instrument:', error);
      }
    });

    // Connect to instrument
    socket.on('connect-instrument', async (data) => {
      try {
        const { instrumentId, connectionConfig } = data;
        
        const result = await instrumentService.connectInstrument(
          instrumentId,
          connectionConfig || {},
          this.io
        );

        socket.emit('instrument-connection-result', {
          instrumentId,
          success: result.success,
          message: result.message
        });

        // Notify all subscribers
        this.instrumentNamespace.to(`instrument-${instrumentId}`).emit('instrument-connected', {
          instrumentId,
          timestamp: new Date(),
          connectedBy: socket.userId
        });

        logger.info(`Instrument ${instrumentId} connected by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error connecting instrument:', error);
        socket.emit('instrument-connection-result', {
          instrumentId: data.instrumentId,
          success: false,
          message: error.message
        });
      }
    });

    // Disconnect from instrument
    socket.on('disconnect-instrument', async (data) => {
      try {
        const { instrumentId } = data;
        
        const result = await instrumentService.disconnectInstrument(instrumentId, this.io);

        socket.emit('instrument-disconnection-result', {
          instrumentId,
          success: result.success,
          message: result.message
        });

        // Notify all subscribers
        this.instrumentNamespace.to(`instrument-${instrumentId}`).emit('instrument-disconnected', {
          instrumentId,
          timestamp: new Date(),
          disconnectedBy: socket.userId
        });

        logger.info(`Instrument ${instrumentId} disconnected by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error disconnecting instrument:', error);
        socket.emit('instrument-disconnection-result', {
          instrumentId: data.instrumentId,
          success: false,
          message: error.message
        });
      }
    });

    // Send command to instrument
    socket.on('instrument-command', async (data) => {
      try {
        const { instrumentId, command, parameters } = data;
        
        // Execute command through instrument service
        const result = await this.executeInstrumentCommand(instrumentId, command, parameters);

        socket.emit('instrument-command-result', {
          instrumentId,
          command,
          success: result.success,
          data: result.data,
          message: result.message
        });

        // Notify other subscribers of command execution
        socket.to(`instrument-${instrumentId}`).emit('instrument-command-executed', {
          instrumentId,
          command,
          parameters,
          executedBy: socket.userId,
          timestamp: new Date()
        });

        logger.info(`Command ${command} executed on instrument ${instrumentId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error executing instrument command:', error);
        socket.emit('instrument-command-result', {
          instrumentId: data.instrumentId,
          command: data.command,
          success: false,
          message: error.message
        });
      }
    });

    // Request instrument status
    socket.on('get-instrument-status', async (data) => {
      try {
        const { instrumentId } = data;
        
        const status = instrumentService.getInstrumentRealTimeStatus(instrumentId);
        
        socket.emit('instrument-status', {
          instrumentId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Error getting instrument status:', error);
        socket.emit('error', { message: 'Failed to get instrument status' });
      }
    });

    // Reserve instrument
    socket.on('reserve-instrument', async (data) => {
      try {
        const { instrumentId, startTime, endTime, purpose } = data;
        
        const reservation = await instrumentService.reserveInstrument(
          instrumentId,
          socket.userId,
          startTime,
          endTime,
          purpose
        );

        socket.emit('instrument-reservation-result', {
          instrumentId,
          success: true,
          reservation
        });

        // Notify other subscribers
        socket.to(`instrument-${instrumentId}`).emit('instrument-reserved', {
          instrumentId,
          reservation,
          reservedBy: socket.userId,
          timestamp: new Date()
        });

        logger.info(`Instrument ${instrumentId} reserved by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error reserving instrument:', error);
        socket.emit('instrument-reservation-result', {
          instrumentId: data.instrumentId,
          success: false,
          message: error.message
        });
      }
    });

    // Get dashboard data
    socket.on('get-dashboard-data', async () => {
      try {
        const dashboardData = await instrumentService.getDashboardData(socket.userId);
        
        socket.emit('dashboard-data', {
          success: true,
          data: dashboardData
        });
      } catch (error) {
        logger.error('Error getting dashboard data:', error);
        socket.emit('dashboard-data', {
          success: false,
          message: error.message
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected from instruments namespace`);
      
      // Clean up subscriptions
      for (const [instrumentId, subscribers] of this.instrumentSubscriptions.entries()) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          this.instrumentSubscriptions.delete(instrumentId);
        }
      }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  setupInstrumentServiceSubscriptions() {
    // Set up callbacks for instrument service events
    const originalNotifySubscribers = instrumentService.notifySubscribers;
    
    instrumentService.notifySubscribers = (instrumentId, event, data) => {
      // Call original method
      originalNotifySubscribers.call(instrumentService, instrumentId, event, data);
      
      // Emit to WebSocket subscribers
      this.instrumentNamespace.to(`instrument-${instrumentId}`).emit(`instrument-${event}`, {
        instrumentId,
        event,
        data,
        timestamp: new Date()
      });
    };
  }

  async executeInstrumentCommand(instrumentId, command, parameters) {
    try {
      // This would integrate with the actual instrument API
      // For now, we'll simulate command execution
      
      logger.info(`Executing command ${command} on instrument ${instrumentId} with parameters:`, parameters);
      
      // Simulate different command types
      switch (command) {
        case 'start':
          return {
            success: true,
            data: { status: 'started', timestamp: new Date() },
            message: 'Instrument started successfully'
          };
        
        case 'stop':
          return {
            success: true,
            data: { status: 'stopped', timestamp: new Date() },
            message: 'Instrument stopped successfully'
          };
        
        case 'calibrate':
          return {
            success: true,
            data: { 
              calibrationId: `cal_${Date.now()}`,
              status: 'calibrating',
              estimatedDuration: 300 // 5 minutes
            },
            message: 'Calibration started'
          };
        
        case 'get_reading':
          return {
            success: true,
            data: {
              temperature: 25.5 + Math.random() * 5,
              pressure: 1013.25 + Math.random() * 10,
              humidity: 45 + Math.random() * 10,
              timestamp: new Date()
            },
            message: 'Reading obtained successfully'
          };
        
        case 'set_temperature':
          const targetTemp = parameters.temperature || 25;
          return {
            success: true,
            data: {
              targetTemperature: targetTemp,
              currentTemperature: 25.5,
              status: 'heating',
              estimatedTime: Math.abs(targetTemp - 25.5) * 60 // 1 minute per degree
            },
            message: `Temperature set to ${targetTemp}°C`
          };
        
        default:
          return {
            success: false,
            message: `Unknown command: ${command}`
          };
      }
    } catch (error) {
      logger.error('Error executing instrument command:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Broadcast message to all subscribers of an instrument
  broadcastToInstrument(instrumentId, event, data) {
    this.instrumentNamespace.to(`instrument-${instrumentId}`).emit(event, data);
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    for (const [socketId, socket] of this.instrumentNamespace.sockets) {
      if (socket.userId === userId) {
        socket.emit(event, data);
        break;
      }
    }
  }

  // Get connected users for an instrument
  getConnectedUsers(instrumentId) {
    const subscribers = this.instrumentSubscriptions.get(instrumentId);
    if (!subscribers) return [];

    const users = [];
    for (const socketId of subscribers) {
      const socket = this.instrumentNamespace.sockets.get(socketId);
      if (socket) {
        users.push({
          userId: socket.userId,
          userInfo: socket.userInfo,
          socketId: socket.id
        });
      }
    }
    
    return users;
  }

  // Force disconnect all users from an instrument
  disconnectAllFromInstrument(instrumentId, reason) {
    const subscribers = this.instrumentSubscriptions.get(instrumentId);
    if (!subscribers) return;

    for (const socketId of subscribers) {
      const socket = this.instrumentNamespace.sockets.get(socketId);
      if (socket) {
        socket.emit('force-disconnect-instrument', { instrumentId, reason });
        socket.leave(`instrument-${instrumentId}`);
      }
    }

    this.instrumentSubscriptions.delete(instrumentId);
  }

  // Send alert to all subscribers
  sendAlert(instrumentId, alertType, message, severity = 'warning') {
    this.instrumentNamespace.to(`instrument-${instrumentId}`).emit('instrument-alert', {
      instrumentId,
      alertType,
      message,
      severity,
      timestamp: new Date()
    });
  }
}

module.exports = InstrumentHandler;