#!/bin/bash

# Scientific Protocol Builder - Phase 1 Setup Script
# This script sets up the development environment avoiding port conflicts

set -e

echo "🧪 Setting up Scientific Protocol Builder - Phase 1"
echo "=================================================="

# Check if podman is installed
if ! command -v podman &> /dev/null; then
    echo "❌ Podman is not installed. Please install podman first."
    exit 1
fi

# Create main project directory
PROJECT_NAME="scientific-protocol-builder"
if [ -d "$PROJECT_NAME" ]; then
    echo "📁 Project directory already exists. Removing..."
    rm -rf "$PROJECT_NAME"
fi

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "✅ Created project directory: $PROJECT_NAME"

# Create directory structure
echo "📂 Creating project structure..."
mkdir -p {frontend,backend,database,scripts,docs,config}

# Frontend structure
mkdir -p frontend/{src/{components,hooks,services,stores,types,utils,assets},public,tests}
mkdir -p frontend/src/components/{common,protocol,management,instruments,collaboration,auth}

# Backend structure  
mkdir -p backend/{src/{controllers,services,models,middleware,routes,utils,config,types,tests},migrations,seeds}

# Database structure
mkdir -p database/{init-scripts,backups}

# Scripts and config
mkdir -p scripts/{deployment,development,maintenance}
mkdir -p config/{development,production,testing}

echo "✅ Project structure created"

# Set custom ports to avoid conflicts
export FRONTEND_PORT=3080
export BACKEND_PORT=3081
export DATABASE_PORT=5433
export REDIS_PORT=6380

# Create environment configuration
cat > .env.development << EOF
# Development Environment Configuration
NODE_ENV=development

# Port Configuration (avoiding conflicts)
FRONTEND_PORT=3080
BACKEND_PORT=3081
DATABASE_PORT=5433
REDIS_PORT=6380

# Database Configuration
POSTGRES_DB=protocol_builder_dev
POSTGRES_USER=protocol_dev_user
POSTGRES_PASSWORD=dev_password_change_in_production
DATABASE_URL=postgresql://protocol_dev_user:dev_password_change_in_production@localhost:5433/protocol_builder_dev

# Backend Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=24h
BCRYPT_ROUNDS=12

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3081
REACT_APP_VERSION=1.0.0-dev
REACT_APP_ENVIRONMENT=development

# Redis Configuration
REDIS_URL=redis://localhost:6380

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=./uploads

# Email Configuration (for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASS=test

# Security Configuration
CORS_ORIGIN=http://localhost:3080
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined
EOF

echo "✅ Environment configuration created"

# Create podman-compose configuration
cat > podman-compose.yml << EOF
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: protocol-builder-db
    environment:
      POSTGRES_DB: protocol_builder_dev
      POSTGRES_USER: protocol_dev_user
      POSTGRES_PASSWORD: dev_password_change_in_production
    ports:
      - "5433:5432"  # Custom port to avoid conflicts
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./database/init-scripts:/docker-entrypoint-initdb.d
    networks:
      - protocol-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U protocol_dev_user -d protocol_builder_dev"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: protocol-builder-redis
    ports:
      - "6380:6379"  # Custom port to avoid conflicts
    volumes:
      - redis_data:/data
    networks:
      - protocol-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: protocol-builder-backend
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://protocol_dev_user:dev_password_change_in_production@database:5432/protocol_builder_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_jwt_secret_key_change_in_production
      - PORT=3001
    ports:
      - "3081:3001"  # Custom port to avoid conflicts
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads:/app/uploads
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - protocol-network
    command: npm run dev

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: protocol-builder-frontend
    environment:
      - REACT_APP_API_URL=http://localhost:3081
      - REACT_APP_VERSION=1.0.0-dev
      - PORT=3000
    ports:
      - "3080:3000"  # Custom port to avoid conflicts
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - protocol-network
    command: npm start

volumes:
  db_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local

networks:
  protocol-network:
    driver: bridge
EOF

echo "✅ Podman Compose configuration created"

# Create development scripts
cat > scripts/development/start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Scientific Protocol Builder Development Environment"
echo "============================================================="

# Source environment variables
if [ -f .env.development ]; then
    export $(cat .env.development | grep -v '#' | xargs)
fi

# Check if podman-compose is available
if command -v podman-compose &> /dev/null; then
    echo "📦 Using podman-compose..."
    podman-compose up --build
elif command -v docker-compose &> /dev/null; then
    echo "📦 Using docker-compose..."
    docker-compose up --build
else
    echo "❌ Neither podman-compose nor docker-compose found"
    echo "Please install podman-compose or docker-compose"
    exit 1
fi
EOF

cat > scripts/development/stop-dev.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Scientific Protocol Builder Development Environment"

if command -v podman-compose &> /dev/null; then
    podman-compose down
elif command -v docker-compose &> /dev/null; then
    docker-compose down
else
    echo "❌ Neither podman-compose nor docker-compose found"
    exit 1
fi
EOF

cat > scripts/development/reset-dev.sh << 'EOF'
#!/bin/bash

echo "🔄 Resetting Scientific Protocol Builder Development Environment"
echo "This will remove all data and rebuild containers"
read -p "Are you sure? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    if command -v podman-compose &> /dev/null; then
        podman-compose down -v
        podman volume prune -f
        podman-compose up --build
    elif command -v docker-compose &> /dev/null; then
        docker-compose down -v
        docker volume prune -f
        docker-compose up --build
    fi
else
    echo "Reset cancelled"
fi
EOF

chmod +x scripts/development/*.sh

echo "✅ Development scripts created"

echo ""
echo "🎉 Phase 1 Setup Complete!"
echo "=========================="
echo ""
echo "📋 Next Steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Run ./scripts/development/start-dev.sh to start development environment"
echo ""
echo "🌐 Development URLs (avoiding port conflicts):"
echo "   Frontend:  http://localhost:3080"
echo "   Backend:   http://localhost:3081"
echo "   Database:  localhost:5433"
echo "   Redis:     localhost:6380"
echo ""
echo "📁 Project structure created in: ./$PROJECT_NAME"
echo ""
echo "⚡ Ready to start Phase 1 development!"
EOF

chmod +x project-setup.sh

echo "✅ Project setup script created"