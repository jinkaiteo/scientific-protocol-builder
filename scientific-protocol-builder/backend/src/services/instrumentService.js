const Instrument = require('../models/Instrument');
const logger = require('../utils/logger');

/**
 * Enhanced Instrument Service for Week 10 Implementation
 * Provides advanced instrument management, integration, and real-time features
 */
class InstrumentService {
  constructor() {
    this.connectedInstruments = new Map(); // instrumentId -> connection info
    this.instrumentSubscriptions = new Map(); // instrumentId -> subscribers
    this.calibrationAlerts = new Map(); // instrumentId -> alert status
  }

  /**
   * Advanced instrument search with filtering and sorting
   */
  async searchInstruments(filters = {}, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 20) {
    try {
      const query = this.buildSearchQuery(filters);
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (page - 1) * limit;

      const [instruments, total] = await Promise.all([
        Instrument.find(query)
          .populate('owner', 'firstName lastName email')
          .populate('currentUser', 'firstName lastName email')
          .populate('authorizedUsers', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Instrument.countDocuments(query)
      ]);

      // Enhance with real-time status
      const enhancedInstruments = instruments.map(instrument => ({
        ...instrument,
        isConnected: this.connectedInstruments.has(instrument._id.toString()),
        realTimeStatus: this.getInstrumentRealTimeStatus(instrument._id.toString())
      }));

      return {
        instruments: enhancedInstruments,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: instruments.length,
          totalItems: total
        }
      };
    } catch (error) {
      logger.error('Error searching instruments:', error);
      throw error;
    }
  }

  /**
   * Build complex search query from filters
   */
  buildSearchQuery(filters) {
    const query = { isActive: true };

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { model: { $regex: filters.search, $options: 'i' } },
        { manufacturer: { $regex: filters.search, $options: 'i' } },
        { serialNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status && Array.isArray(filters.status)) {
      query.status = { $in: filters.status };
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters.location) {
      if (filters.location.building) {
        query['location.building'] = filters.location.building;
      }
      if (filters.location.room) {
        query['location.room'] = filters.location.room;
      }
    }

    if (filters.calibrationStatus) {
      const now = new Date();
      switch (filters.calibrationStatus) {
        case 'overdue':
          query['qualityControl.nextCalibrationDue'] = { $lt: now };
          break;
        case 'due_soon':
          const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          query['qualityControl.nextCalibrationDue'] = { $gte: now, $lte: sevenDaysFromNow };
          break;
        case 'current':
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          query['qualityControl.nextCalibrationDue'] = { $gt: thirtyDaysFromNow };
          break;
      }
    }

    if (filters.availableOnly) {
      query.status = 'available';
    }

    if (filters.myInstruments && filters.userId) {
      query.$or = [
        { owner: filters.userId },
        { authorizedUsers: filters.userId }
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    return query;
  }

  /**
   * Get instrument with enhanced details
   */
  async getInstrumentDetails(instrumentId) {
    try {
      const instrument = await Instrument.findById(instrumentId)
        .populate('owner', 'firstName lastName email avatar')
        .populate('currentUser', 'firstName lastName email avatar')
        .populate('authorizedUsers', 'firstName lastName email avatar')
        .lean();

      if (!instrument) {
        throw new Error('Instrument not found');
      }

      // Add real-time information
      const realTimeStatus = this.getInstrumentRealTimeStatus(instrumentId);
      const connectionInfo = this.connectedInstruments.get(instrumentId);
      const utilizationData = await this.calculateUtilization(instrumentId);

      return {
        ...instrument,
        realTimeStatus,
        connectionInfo: connectionInfo ? {
          isConnected: true,
          lastPing: connectionInfo.lastPing,
          dataPoints: connectionInfo.dataPoints
        } : { isConnected: false },
        utilization: utilizationData,
        upcomingReservations: await this.getUpcomingReservations(instrumentId),
        recentActivity: await this.getRecentActivity(instrumentId)
      };
    } catch (error) {
      logger.error('Error getting instrument details:', error);
      throw error;
    }
  }

  /**
   * Generate custom Blockly blocks for an instrument
   */
  async generateBlocklyBlocks(instrumentId) {
    try {
      const instrument = await Instrument.findById(instrumentId);
      if (!instrument) {
        throw new Error('Instrument not found');
      }

      const blocks = [];

      // Generate blocks for each capability
      instrument.capabilities.forEach((capability, capIndex) => {
        const blockType = `instrument_${instrument.category}_${capability.name.toLowerCase().replace(/\s+/g, '_')}`;
        
        const block = {
          type: blockType,
          message0: `${instrument.name} - ${capability.name}`,
          args0: [],
          colour: this.getCategoryColor(instrument.category),
          tooltip: capability.description || `Use ${instrument.name} for ${capability.name}`,
          helpUrl: instrument.documentation?.manual || '',
          data: {
            instrumentId: instrument._id.toString(),
            capability: capability.name,
            category: instrument.category
          }
        };

        // Add input fields for parameters
        capability.parameters.forEach((param, paramIndex) => {
          block.message0 += ` ${param.name}: %${paramIndex + 1}`;
          
          const arg = {
            type: this.getBlocklyInputType(param.type),
            name: param.name.toUpperCase().replace(/\s+/g, '_'),
            text: param.default || ''
          };

          if (param.type === 'select' && param.options) {
            arg.options = param.options.map(opt => [opt, opt]);
          }

          if (param.type === 'number') {
            if (param.min !== undefined) arg.min = param.min;
            if (param.max !== undefined) arg.max = param.max;
            if (param.precision !== undefined) arg.precision = param.precision;
          }

          block.args0.push(arg);
        });

        // Add connection points
        block.previousStatement = null;
        block.nextStatement = null;

        // Add output if the capability produces data
        if (capability.outputs && capability.outputs.length > 0) {
          block.output = capability.outputs[0].type || 'String';
        }

        blocks.push(block);
      });

      // Generate utility blocks (status, configuration, etc.)
      blocks.push(this.generateStatusBlock(instrument));
      blocks.push(this.generateConfigBlock(instrument));

      return {
        instrumentId: instrument._id.toString(),
        instrumentName: instrument.name,
        category: instrument.category,
        blocks: blocks,
        blockDefinitions: this.generateBlockDefinitions(blocks),
        customBlocks: this.generateCustomBlockCode(instrument, blocks)
      };
    } catch (error) {
      logger.error('Error generating Blockly blocks:', error);
      throw error;
    }
  }

  /**
   * Connect to instrument for real-time monitoring
   */
  async connectInstrument(instrumentId, connectionConfig, io) {
    try {
      const instrument = await Instrument.findById(instrumentId);
      if (!instrument) {
        throw new Error('Instrument not found');
      }

      // Establish connection based on protocol
      const connection = await this.establishConnection(instrument, connectionConfig);
      
      if (connection) {
        this.connectedInstruments.set(instrumentId, {
          connection,
          lastPing: new Date(),
          dataPoints: [],
          subscribers: new Set()
        });

        // Start data collection
        this.startDataCollection(instrumentId, io);

        // Update instrument status
        await Instrument.findByIdAndUpdate(instrumentId, {
          'liveData.connectionStatus': 'connected',
          'liveData.lastUpdate': new Date()
        });

        logger.info(`Connected to instrument: ${instrument.name} (${instrumentId})`);
        
        // Notify subscribers
        this.notifySubscribers(instrumentId, 'connected', { timestamp: new Date() });

        return { success: true, message: 'Instrument connected successfully' };
      }

      throw new Error('Failed to establish connection');
    } catch (error) {
      logger.error('Error connecting instrument:', error);
      
      // Update instrument status to error
      await Instrument.findByIdAndUpdate(instrumentId, {
        'liveData.connectionStatus': 'error',
        'liveData.lastUpdate': new Date()
      });

      throw error;
    }
  }

  /**
   * Disconnect instrument
   */
  async disconnectInstrument(instrumentId, io) {
    try {
      const connectionInfo = this.connectedInstruments.get(instrumentId);
      
      if (connectionInfo) {
        // Close connection
        if (connectionInfo.connection && connectionInfo.connection.close) {
          connectionInfo.connection.close();
        }

        // Clean up
        this.connectedInstruments.delete(instrumentId);
        this.instrumentSubscriptions.delete(instrumentId);

        // Update instrument status
        await Instrument.findByIdAndUpdate(instrumentId, {
          'liveData.connectionStatus': 'disconnected',
          'liveData.lastUpdate': new Date()
        });

        // Notify subscribers
        this.notifySubscribers(instrumentId, 'disconnected', { timestamp: new Date() });

        logger.info(`Disconnected instrument: ${instrumentId}`);
        return { success: true, message: 'Instrument disconnected successfully' };
      }

      return { success: false, message: 'Instrument was not connected' };
    } catch (error) {
      logger.error('Error disconnecting instrument:', error);
      throw error;
    }
  }

  /**
   * Reserve instrument for future use
   */
  async reserveInstrument(instrumentId, userId, startTime, endTime, purpose) {
    try {
      const instrument = await Instrument.findById(instrumentId);
      if (!instrument) {
        throw new Error('Instrument not found');
      }

      if (instrument.status !== 'available') {
        throw new Error('Instrument is not available for reservation');
      }

      // Check for conflicting reservations
      const conflicts = await this.checkReservationConflicts(instrumentId, startTime, endTime);
      if (conflicts.length > 0) {
        throw new Error('Reservation conflicts with existing bookings');
      }

      // Create reservation
      const reservation = {
        user: userId,
        instrument: instrumentId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
        status: 'confirmed',
        createdAt: new Date()
      };

      // Update instrument
      await Instrument.findByIdAndUpdate(instrumentId, {
        status: 'reserved',
        reservedBy: userId,
        reservedUntil: endTime
      });

      // Store reservation (you might want a separate Reservation model)
      // For now, we'll add it to the instrument's usage history
      await Instrument.findByIdAndUpdate(instrumentId, {
        $push: {
          usageHistory: {
            user: userId,
            startTime: new Date(startTime),
            purpose: `RESERVATION: ${purpose}`,
            settings: {}
          }
        }
      });

      logger.info(`Instrument reserved: ${instrumentId} by user ${userId}`);
      return reservation;
    } catch (error) {
      logger.error('Error reserving instrument:', error);
      throw error;
    }
  }

  /**
   * Record instrument calibration
   */
  async recordCalibration(instrumentId, calibrationData, userId) {
    try {
      const instrument = await Instrument.findById(instrumentId);
      if (!instrument) {
        throw new Error('Instrument not found');
      }

      const calibrationRecord = {
        date: new Date(calibrationData.date),
        calibratedBy: userId,
        method: calibrationData.method,
        results: calibrationData.results,
        nextCalibrationDue: new Date(calibrationData.nextCalibrationDue),
        standards: calibrationData.standards || []
      };

      // Update instrument
      await Instrument.findByIdAndUpdate(instrumentId, {
        $push: { calibrationHistory: calibrationRecord },
        'qualityControl.lastCalibration': calibrationRecord.date,
        'qualityControl.nextCalibrationDue': calibrationRecord.nextCalibrationDue,
        status: 'available'
      });

      // Clear calibration alerts
      this.calibrationAlerts.delete(instrumentId);

      // Notify subscribers
      this.notifySubscribers(instrumentId, 'calibration_completed', {
        calibrationDate: calibrationRecord.date,
        nextDue: calibrationRecord.nextCalibrationDue,
        results: calibrationRecord.results
      });

      logger.info(`Calibration recorded for instrument: ${instrumentId}`);
      return calibrationRecord;
    } catch (error) {
      logger.error('Error recording calibration:', error);
      throw error;
    }
  }

  /**
   * Get instrument dashboard data
   */
  async getDashboardData(userId) {
    try {
      const [
        totalInstruments,
        availableInstruments,
        myInstruments,
        calibrationDue,
        maintenanceDue,
        activeUsage,
        recentActivity
      ] = await Promise.all([
        Instrument.countDocuments({ isActive: true }),
        Instrument.countDocuments({ status: 'available', isActive: true }),
        Instrument.countDocuments({ 
          $or: [{ owner: userId }, { authorizedUsers: userId }], 
          isActive: true 
        }),
        Instrument.countDocuments({
          'qualityControl.requiresCalibration': true,
          'qualityControl.nextCalibrationDue': { $lte: new Date() },
          isActive: true
        }),
        Instrument.countDocuments({
          'maintenance.schedule.nextMaintenance': { $lte: new Date() },
          isActive: true
        }),
        Instrument.countDocuments({ status: 'in_use', isActive: true }),
        this.getRecentInstrumentActivity(10)
      ]);

      const utilizationStats = await this.getUtilizationStats();
      const categoryBreakdown = await this.getCategoryBreakdown();

      return {
        overview: {
          total: totalInstruments,
          available: availableInstruments,
          myInstruments,
          activeUsage,
          utilizationRate: utilizationStats.overall
        },
        alerts: {
          calibrationDue,
          maintenanceDue,
          connectedInstruments: this.connectedInstruments.size
        },
        breakdown: categoryBreakdown,
        recentActivity,
        utilizationTrends: utilizationStats.trends
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Helper methods
  getCategoryColor(category) {
    const colors = {
      microscope: '#FF6B6B',
      centrifuge: '#4ECDC4',
      incubator: '#45B7D1',
      autoclave: '#96CEB4',
      balance: '#FFEAA7',
      pipette: '#DDA0DD',
      thermocycler: '#98D8C8',
      spectrophotometer: '#F7DC6F',
      chromatography: '#BB8FCE',
      electrophoresis: '#85C1E9'
    };
    return colors[category] || '#A0A0A0';
  }

  getBlocklyInputType(paramType) {
    const typeMap = {
      number: 'field_number',
      string: 'field_input',
      boolean: 'field_checkbox',
      select: 'field_dropdown',
      range: 'field_number'
    };
    return typeMap[paramType] || 'field_input';
  }

  generateStatusBlock(instrument) {
    return {
      type: `instrument_${instrument.category}_status`,
      message0: `Get ${instrument.name} Status`,
      args0: [],
      output: 'String',
      colour: this.getCategoryColor(instrument.category),
      tooltip: `Get real-time status of ${instrument.name}`,
      data: {
        instrumentId: instrument._id.toString(),
        type: 'status'
      }
    };
  }

  generateConfigBlock(instrument) {
    return {
      type: `instrument_${instrument.category}_config`,
      message0: `Configure ${instrument.name}`,
      args0: [
        {
          type: 'input_statement',
          name: 'CONFIG'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: this.getCategoryColor(instrument.category),
      tooltip: `Configure settings for ${instrument.name}`,
      data: {
        instrumentId: instrument._id.toString(),
        type: 'config'
      }
    };
  }

  async establishConnection(instrument, config) {
    // Implementation would depend on the instrument's API configuration
    // This is a placeholder for the actual connection logic
    logger.info(`Establishing connection to ${instrument.name} using ${instrument.apiConfig?.protocol || 'unknown'} protocol`);
    
    // Return a mock connection object
    return {
      protocol: instrument.apiConfig?.protocol || 'http',
      endpoint: instrument.apiConfig?.endpoint,
      lastPing: new Date(),
      close: () => logger.info(`Connection closed for ${instrument.name}`)
    };
  }

  startDataCollection(instrumentId, io) {
    const interval = setInterval(async () => {
      const connectionInfo = this.connectedInstruments.get(instrumentId);
      if (!connectionInfo) {
        clearInterval(interval);
        return;
      }

      // Simulate data collection
      const dataPoint = {
        timestamp: new Date(),
        temperature: 20 + Math.random() * 10,
        pressure: 1000 + Math.random() * 100,
        status: 'operating'
      };

      connectionInfo.dataPoints.push(dataPoint);
      connectionInfo.lastPing = new Date();

      // Keep only last 100 data points
      if (connectionInfo.dataPoints.length > 100) {
        connectionInfo.dataPoints.shift();
      }

      // Update database
      await Instrument.findByIdAndUpdate(instrumentId, {
        'liveData.temperature': dataPoint.temperature,
        'liveData.pressure': dataPoint.pressure,
        'liveData.status': dataPoint.status,
        'liveData.lastUpdate': dataPoint.timestamp
      });

      // Notify real-time subscribers
      this.notifySubscribers(instrumentId, 'data_update', dataPoint);
    }, 5000); // Collect data every 5 seconds
  }

  notifySubscribers(instrumentId, event, data) {
    const subscribers = this.instrumentSubscriptions.get(instrumentId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event, data);
        } catch (error) {
          logger.error('Error notifying subscriber:', error);
        }
      });
    }
  }

  getInstrumentRealTimeStatus(instrumentId) {
    const connectionInfo = this.connectedInstruments.get(instrumentId);
    return connectionInfo ? {
      isConnected: true,
      lastUpdate: connectionInfo.lastPing,
      latestData: connectionInfo.dataPoints[connectionInfo.dataPoints.length - 1]
    } : {
      isConnected: false,
      lastUpdate: null,
      latestData: null
    };
  }

  async calculateUtilization(instrumentId, days = 30) {
    const instrument = await Instrument.findById(instrumentId);
    if (!instrument) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageRecords = instrument.usageHistory.filter(record => 
      record.startTime >= startDate && record.endTime
    );

    const totalUsageTime = usageRecords.reduce((total, record) => {
      return total + (record.endTime - record.startTime);
    }, 0);

    const totalAvailableTime = days * 24 * 60 * 60 * 1000;
    const utilizationRate = (totalUsageTime / totalAvailableTime) * 100;

    return {
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      totalUsageHours: Math.round(totalUsageTime / (1000 * 60 * 60) * 100) / 100,
      totalSessions: usageRecords.length,
      averageSessionDuration: usageRecords.length > 0 ? 
        Math.round(totalUsageTime / usageRecords.length / (1000 * 60)) : 0 // in minutes
    };
  }

  async getUpcomingReservations(instrumentId, limit = 5) {
    // This would typically query a separate Reservations collection
    // For now, we'll return mock data
    return [];
  }

  async getRecentActivity(instrumentId, limit = 10) {
    const instrument = await Instrument.findById(instrumentId)
      .populate('usageHistory.user', 'firstName lastName');
    
    if (!instrument) return [];

    return instrument.usageHistory
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
      .map(record => ({
        type: 'usage',
        timestamp: record.startTime,
        user: record.user,
        duration: record.endTime ? record.endTime - record.startTime : null,
        purpose: record.purpose
      }));
  }

  async checkReservationConflicts(instrumentId, startTime, endTime) {
    // Implementation for checking reservation conflicts
    return [];
  }

  async getRecentInstrumentActivity(limit = 10) {
    // Get recent activity across all instruments
    const instruments = await Instrument.find({ isActive: true })
      .populate('usageHistory.user', 'firstName lastName')
      .limit(limit);

    const activities = [];
    instruments.forEach(instrument => {
      instrument.usageHistory.forEach(usage => {
        activities.push({
          type: 'instrument_usage',
          timestamp: usage.startTime,
          instrument: {
            id: instrument._id,
            name: instrument.name
          },
          user: usage.user,
          duration: usage.endTime ? usage.endTime - usage.startTime : null
        });
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getUtilizationStats() {
    // Calculate overall utilization statistics
    return {
      overall: 75.5,
      trends: {
        daily: [65, 70, 80, 75, 85, 90, 75],
        weekly: [72, 78, 75, 80, 77, 82, 75],
        monthly: [75, 73, 78, 75]
      }
    };
  }

  async getCategoryBreakdown() {
    const breakdown = await Instrument.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return breakdown.map(item => ({
      category: item._id,
      count: item.count,
      color: this.getCategoryColor(item._id)
    }));
  }

  generateBlockDefinitions(blocks) {
    return blocks.map(block => ({
      type: block.type,
      definition: block
    }));
  }

  generateCustomBlockCode(instrument, blocks) {
    return blocks.map(block => ({
      type: block.type,
      generator: `
        function(block) {
          const values = {};
          ${block.args0?.map((arg, index) => 
            `values.${arg.name} = Blockly.JavaScript.valueToCode(block, '${arg.name}', Blockly.JavaScript.ORDER_ATOMIC) || '${arg.text || ''}';`
          ).join('\n          ') || ''}
          
          return \`await instrumentService.executeCommand('${instrument._id}', '${block.data?.capability || 'unknown'}', \${JSON.stringify(values)});\`;
        }
      `
    }));
  }
}

module.exports = new InstrumentService();