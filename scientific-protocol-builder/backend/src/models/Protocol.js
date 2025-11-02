const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Protocol {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
        this.tags = data.tags || [];
        this.version = data.version;
        this.workspaceXml = data.workspace_xml;
        this.workspaceJson = data.workspace_json;
        this.analysisData = data.analysis_data;
        this.createdBy = data.created_by;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
        this.isPublic = data.is_public;
        this.isTemplate = data.is_template;
        this.parentProtocolId = data.parent_protocol_id;
    }

    static async create(protocolData, userId) {
        const {
            name,
            description,
            category,
            tags = [],
            version = '1.0',
            workspaceXml,
            workspaceJson,
            analysisData,
            isPublic = false,
            isTemplate = false,
            parentProtocolId
        } = protocolData;

        const query = `
            INSERT INTO protocols (
                name, description, category, tags, version, workspace_xml, 
                workspace_json, analysis_data, created_by, is_public, 
                is_template, parent_protocol_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const result = await database.query(query, [
            name, description, category, tags, version, workspaceXml,
            workspaceJson, analysisData, userId, isPublic, isTemplate, parentProtocolId
        ]);

        return new Protocol(result.rows[0]);
    }

    static async findById(id, userId = null) {
        let query = 'SELECT * FROM protocols WHERE id = $1';
        const params = [id];

        // If userId is provided, check access permissions
        if (userId) {
            query += ' AND (created_by = $2 OR is_public = true)';
            params.push(userId);
        } else {
            query += ' AND is_public = true';
        }

        const result = await database.query(query, params);
        
        if (result.rows.length === 0) return null;
        return new Protocol(result.rows[0]);
    }

    static async findAll(options = {}) {
        let query = 'SELECT * FROM protocols WHERE 1=1';
        const params = [];
        let paramCount = 0;

        // Filter by user (owner or public)
        if (options.userId) {
            paramCount++;
            query += ` AND (created_by = $${paramCount} OR is_public = true)`;
            params.push(options.userId);
        } else {
            query += ' AND is_public = true';
        }

        // Filter by category
        if (options.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(options.category);
        }

        // Filter by tags
        if (options.tags && options.tags.length > 0) {
            paramCount++;
            query += ` AND tags && $${paramCount}`;
            params.push(options.tags);
        }

        // Filter by template status
        if (options.isTemplate !== undefined) {
            paramCount++;
            query += ` AND is_template = $${paramCount}`;
            params.push(options.isTemplate);
        }

        // Search by name or description
        if (options.search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${options.search}%`);
        }

        // Order by
        const orderBy = options.orderBy || 'updated_at';
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
        return result.rows.map(row => new Protocol(row));
    }

    static async findByUser(userId, options = {}) {
        return this.findAll({ ...options, userId });
    }

    static async getCategories() {
        const query = 'SELECT DISTINCT category FROM protocols WHERE category IS NOT NULL ORDER BY category';
        const result = await database.query(query);
        return result.rows.map(row => row.category);
    }

    static async getTags() {
        const query = 'SELECT UNNEST(tags) AS tag FROM protocols WHERE tags IS NOT NULL GROUP BY tag ORDER BY tag';
        const result = await database.query(query);
        return result.rows.map(row => row.tag);
    }

    async update(updateData, userId) {
        // Check if user has permission to update
        if (this.createdBy !== userId) {
            throw new Error('Access denied: You can only update your own protocols');
        }

        const allowedFields = [
            'name', 'description', 'category', 'tags', 'version',
            'workspace_xml', 'workspace_json', 'analysis_data',
            'is_public', 'is_template'
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
            UPDATE protocols 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await database.query(query, params);

        if (result.rows.length === 0) {
            throw new Error('Protocol not found');
        }

        Object.assign(this, result.rows[0]);
        return this;
    }

    async delete(userId) {
        // Check if user has permission to delete
        if (this.createdBy !== userId) {
            throw new Error('Access denied: You can only delete your own protocols');
        }

        const query = 'DELETE FROM protocols WHERE id = $1 AND created_by = $2';
        const result = await database.query(query, [this.id, userId]);

        if (result.rowCount === 0) {
            throw new Error('Protocol not found or access denied');
        }

        return true;
    }

    async clone(userId, newName = null) {
        const clonedData = {
            name: newName || `${this.name} (Copy)`,
            description: this.description,
            category: this.category,
            tags: this.tags,
            version: '1.0',
            workspaceXml: this.workspaceXml,
            workspaceJson: this.workspaceJson,
            analysisData: this.analysisData,
            isPublic: false,
            isTemplate: false,
            parentProtocolId: this.id
        };

        return Protocol.create(clonedData, userId);
    }

    async getVersionHistory() {
        const query = `
            SELECT * FROM protocols 
            WHERE parent_protocol_id = $1 OR id = $1
            ORDER BY created_at DESC
        `;
        const result = await database.query(query, [this.id]);
        return result.rows.map(row => new Protocol(row));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            tags: this.tags,
            version: this.version,
            workspaceXml: this.workspaceXml,
            workspaceJson: this.workspaceJson,
            analysisData: this.analysisData,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isPublic: this.isPublic,
            isTemplate: this.isTemplate,
            parentProtocolId: this.parentProtocolId
        };
    }
}

module.exports = Protocol;