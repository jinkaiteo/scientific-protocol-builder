const database = require('../config/database');

class Instrument {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.manufacturer = data.manufacturer;
        this.model = data.model;
        this.serialNumber = data.serial_number;
        this.location = data.location;
        this.specifications = data.specifications;
        this.calibrationData = data.calibration_data;
        this.createdBy = data.created_by;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
        this.isActive = data.is_active;
    }

    static async create(instrumentData, userId) {
        const {
            name,
            type,
            manufacturer,
            model,
            serialNumber,
            location,
            specifications = {},
            calibrationData = {}
        } = instrumentData;

        const query = `
            INSERT INTO instruments (
                name, type, manufacturer, model, serial_number, 
                location, specifications, calibration_data, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const result = await database.query(query, [
            name, type, manufacturer, model, serialNumber,
            location, specifications, calibrationData, userId
        ]);

        return new Instrument(result.rows[0]);
    }

    static async findById(id) {
        const query = 'SELECT * FROM instruments WHERE id = $1 AND is_active = true';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) return null;
        return new Instrument(result.rows[0]);
    }

    static async findAll(options = {}) {
        let query = 'SELECT * FROM instruments WHERE is_active = true';
        const params = [];
        let paramCount = 0;

        // Filter by type
        if (options.type) {
            paramCount++;
            query += ` AND type = $${paramCount}`;
            params.push(options.type);
        }

        // Filter by manufacturer
        if (options.manufacturer) {
            paramCount++;
            query += ` AND manufacturer ILIKE $${paramCount}`;
            params.push(`%${options.manufacturer}%`);
        }

        // Filter by location
        if (options.location) {
            paramCount++;
            query += ` AND location ILIKE $${paramCount}`;
            params.push(`%${options.location}%`);
        }

        // Search by name, model, or serial number
        if (options.search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR model ILIKE $${paramCount} OR serial_number ILIKE $${paramCount})`;
            params.push(`%${options.search}%`);
        }

        // Filter by created user
        if (options.createdBy) {
            paramCount++;
            query += ` AND created_by = $${paramCount}`;
            params.push(options.createdBy);
        }

        // Order by
        const orderBy = options.orderBy || 'created_at';
        const orderDirection = options.orderDirection || 'DESC';
        query += ` ORDER BY ${orderBy} ${orderDirection}`;

        // Pagination
        if (options.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(options.limit);
        }

        if (options.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(options.offset);
        }

        const result = await database.query(query, params);
        return result.rows.map(row => new Instrument(row));
    }

    static async getTypes() {
        const query = 'SELECT DISTINCT type FROM instruments WHERE type IS NOT NULL AND is_active = true ORDER BY type';
        const result = await database.query(query);
        return result.rows.map(row => row.type);
    }

    static async getManufacturers() {
        const query = 'SELECT DISTINCT manufacturer FROM instruments WHERE manufacturer IS NOT NULL AND is_active = true ORDER BY manufacturer';
        const result = await database.query(query);
        return result.rows.map(row => row.manufacturer);
    }

    static async getLocations() {
        const query = 'SELECT DISTINCT location FROM instruments WHERE location IS NOT NULL AND is_active = true ORDER BY location';
        const result = await database.query(query);
        return result.rows.map(row => row.location);
    }

    async update(updateData, userId) {
        // Check if user has permission to update (owner or admin)
        if (this.createdBy !== userId) {
            throw new Error('Access denied: You can only update instruments you created');
        }

        const allowedFields = [
            'name', 'type', 'manufacturer', 'model', 'serial_number',
            'location', 'specifications', 'calibration_data'
        ];

        const updates = [];
        const params = [];
        let paramCount = 0;

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                paramCount++;
                updates.push(`${key} = $${paramCount}`);
                params.push(updateData[key]);
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push('updated_at = NOW()');
        paramCount++;
        params.push(this.id);

        const query = `
            UPDATE instruments 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount} AND is_active = true
            RETURNING *
        `;

        const result = await database.query(query, params);

        if (result.rows.length === 0) {
            throw new Error('Instrument not found');
        }

        Object.assign(this, result.rows[0]);
        return this;
    }

    async updateCalibration(calibrationData, userId) {
        // Check if user has permission to update calibration
        if (this.createdBy !== userId) {
            throw new Error('Access denied: You can only update calibration for instruments you created');
        }

        const query = `
            UPDATE instruments 
            SET calibration_data = $1, updated_at = NOW()
            WHERE id = $2 AND is_active = true
            RETURNING *
        `;

        const result = await database.query(query, [calibrationData, this.id]);

        if (result.rows.length === 0) {
            throw new Error('Instrument not found');
        }

        Object.assign(this, result.rows[0]);
        return this;
    }

    async deactivate(userId) {
        // Check if user has permission to deactivate
        if (this.createdBy !== userId) {
            throw new Error('Access denied: You can only deactivate instruments you created');
        }

        const query = `
            UPDATE instruments 
            SET is_active = false, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const result = await database.query(query, [this.id]);

        if (result.rows.length === 0) {
            throw new Error('Instrument not found');
        }

        this.isActive = false;
        return this;
    }

    async getUsageHistory() {
        // This would require a protocol_instruments junction table
        // For now, return empty array as placeholder
        return [];
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            manufacturer: this.manufacturer,
            model: this.model,
            serialNumber: this.serialNumber,
            location: this.location,
            specifications: this.specifications,
            calibrationData: this.calibrationData,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isActive: this.isActive
        };
    }
}

module.exports = Instrument;