const database = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.passwordHash = data.password_hash;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.role = data.role;
        this.organization = data.organization;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
        this.lastLogin = data.last_login;
        this.isActive = data.is_active;
    }

    static async create(userData) {
        const { email, password, firstName, lastName, role = 'researcher', organization } = userData;
        
        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, role, organization)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await database.query(query, [
            email, passwordHash, firstName, lastName, role, organization
        ]);
        
        return new User(result.rows[0]);
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) return null;
        return new User(result.rows[0]);
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
        const result = await database.query(query, [email]);
        
        if (result.rows.length === 0) return null;
        return new User(result.rows[0]);
    }

    static async findAll(options = {}) {
        let query = 'SELECT * FROM users WHERE is_active = true';
        const params = [];
        
        if (options.role) {
            query += ' AND role = $1';
            params.push(options.role);
        }
        
        query += ' ORDER BY created_at DESC';
        
        if (options.limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(options.limit);
        }
        
        const result = await database.query(query, params);
        return result.rows.map(row => new User(row));
    }

    async update(updateData) {
        const allowedFields = ['first_name', 'last_name', 'organization'];
        const updates = [];
        const params = [];
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updates.push(`${key} = $${params.length + 1}`);
                params.push(updateData[key]);
            }
        });
        
        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        updates.push(`updated_at = NOW()`);
        params.push(this.id);
        
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${params.length}
            RETURNING *
        `;
        
        const result = await database.query(query, params);
        
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        
        Object.assign(this, result.rows[0]);
        return this;
    }

    async updateLastLogin() {
        const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
        await database.query(query, [this.id]);
        this.lastLogin = new Date();
    }

    async changePassword(newPassword) {
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        
        const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2';
        await database.query(query, [passwordHash, this.id]);
        this.passwordHash = passwordHash;
    }

    async validatePassword(password) {
        return await bcrypt.compare(password, this.passwordHash);
    }

    async deactivate() {
        const query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1';
        await database.query(query, [this.id]);
        this.isActive = false;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            organization: this.organization,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLogin: this.lastLogin,
            isActive: this.isActive
        };
    }
}

module.exports = User;