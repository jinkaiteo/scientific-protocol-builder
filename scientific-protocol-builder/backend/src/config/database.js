const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5433,
    database: process.env.POSTGRES_DB || 'protocol_builder_dev',
    user: process.env.POSTGRES_USER || 'protocol_dev_user',
    password: process.env.POSTGRES_PASSWORD || 'dev_password_change_in_production',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait when connecting
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Database utility functions
const database = {
    // Test database connection
    async testConnection() {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            logger.info('Database connection test successful');
            return result.rows[0];
        } catch (error) {
            logger.error('Database connection test failed:', error);
            throw error;
        }
    },

    // Execute a query
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug(`Query executed in ${duration}ms: ${text}`);
            return result;
        } catch (error) {
            logger.error('Database query error:', error);
            logger.error('Query:', text);
            logger.error('Params:', params);
            throw error;
        }
    },

    // Get a client from the pool for transactions
    async getClient() {
        return await pool.connect();
    },

    // Close all connections
    async close() {
        await pool.end();
        logger.info('Database connection pool closed');
    }
};

// Initialize database tables
const initializeTables = async () => {
    try {
        // Create users table
        await database.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(50) DEFAULT 'researcher',
                organization VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);

        // Create protocols table
        await database.query(`
            CREATE TABLE IF NOT EXISTS protocols (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                tags TEXT[],
                version VARCHAR(20) DEFAULT '1.0',
                workspace_xml TEXT NOT NULL,
                workspace_json JSONB,
                analysis_data JSONB,
                created_by UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                is_public BOOLEAN DEFAULT FALSE,
                is_template BOOLEAN DEFAULT FALSE,
                parent_protocol_id UUID REFERENCES protocols(id)
            )
        `);

        // Create instruments table
        await database.query(`
            CREATE TABLE IF NOT EXISTS instruments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100) NOT NULL,
                manufacturer VARCHAR(255),
                model VARCHAR(255),
                serial_number VARCHAR(255),
                location VARCHAR(255),
                specifications JSONB,
                calibration_data JSONB,
                created_by UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                is_active BOOLEAN DEFAULT TRUE
            )
        `);

        // Create indexes for better performance
        await database.query(`
            CREATE INDEX IF NOT EXISTS idx_protocols_created_by ON protocols(created_by);
            CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);
            CREATE INDEX IF NOT EXISTS idx_protocols_tags ON protocols USING GIN(tags);
            CREATE INDEX IF NOT EXISTS idx_instruments_type ON instruments(type);
            CREATE INDEX IF NOT EXISTS idx_instruments_created_by ON instruments(created_by);
        `);

        logger.info('Database tables initialized successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
};

// Initialize tables when the module is loaded
initializeTables().catch(error => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
});

module.exports = database;