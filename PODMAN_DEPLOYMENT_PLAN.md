# Scientific Protocol Builder - Podman Deployment Plan

## 🐳 **Container Strategy Recommendation: Multi-Container Setup**

### **Recommended Architecture: Separate Containers on Pod Network**

```yaml
┌─────────────────────────────────────────────────────────────┐
│                    Podman Pod: protocol-builder             │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │    Backend      │      Database           │
│   Container     │    Container    │      Container          │
│                 │                 │                         │
│   nginx:alpine  │   node:18-alpine│   postgres:15-alpine    │
│   React build   │   Express API   │   Protocol data         │
│   Port: 80      │   Port: 3001    │   Port: 5432            │
│                 │                 │   Volume: db-data       │
└─────────────────┴─────────────────┴─────────────────────────┘
│                                                             │
│  Shared Pod Network: All containers can communicate        │
│  External Access: Only port 80 exposed                     │
└─────────────────────────────────────────────────────────────┘
```

### **Why Multi-Container vs Single Container?**

| Aspect | Single Container | Multi-Container (Recommended) |
|--------|------------------|-------------------------------|
| **Maintainability** | ❌ Complex updates | ✅ Independent updates |
| **Scalability** | ❌ Scale everything | ✅ Scale components separately |
| **Development** | ❌ Rebuild entire app | ✅ Hot-reload individual services |
| **Security** | ❌ Shared attack surface | ✅ Process isolation |
| **Backup** | ❌ Backup entire container | ✅ Backup only database |
| **Resource Usage** | ❌ Fixed allocation | ✅ Flexible resource allocation |
| **Debugging** | ❌ Hard to isolate issues | ✅ Easy component debugging |

## 🏗️ **Detailed Implementation Plan**

### **Phase 1: Application Migration (Weeks 1-2)**

#### **1.1 Frontend Migration to React**
```
protocol-builder-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ProtocolBuilder/
│   │   │   ├── BlocklyWorkspace.tsx
│   │   │   ├── Toolbox.tsx
│   │   │   └── WorkspaceControls.tsx
│   │   ├── ProtocolManager/
│   │   │   ├── ProtocolList.tsx
│   │   │   ├── ProtocolCard.tsx
│   │   │   └── SaveDialog.tsx
│   │   ├── InstrumentManager/
│   │   │   ├── InstrumentList.tsx
│   │   │   └── InstrumentForm.tsx
│   │   └── Common/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── Layout.tsx
│   ├── hooks/
│   │   ├── useProtocol.ts
│   │   ├── useWorkspace.ts
│   │   └── useAuth.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── protocolService.ts
│   │   └── instrumentService.ts
│   ├── types/
│   │   ├── protocol.ts
│   │   ├── instrument.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── blocklyConfig.ts
│   │   └── xmlParser.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── Dockerfile
```

#### **1.2 Backend API Development**
```
protocol-builder-backend/
├── src/
│   ├── controllers/
│   │   ├── protocolController.js
│   │   ├── instrumentController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Protocol.js
│   │   ├── Instrument.js
│   │   └── User.js
│   ├── routes/
│   │   ├── protocols.js
│   │   ├── instruments.js
│   │   └── auth.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── protocolService.js
│   │   ├── xmlProcessor.js
│   │   └── analysisEngine.js
│   ├── database/
│   │   ├── connection.js
│   │   ├── migrations/
│   │   └── seeds/
│   ├── config/
│   │   └── database.js
│   └── app.js
├── package.json
└── Dockerfile
```

### **Phase 2: Containerization (Week 3)**

#### **2.1 Frontend Container (Nginx + React)**
```dockerfile
# protocol-builder-frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **2.2 Backend Container (Node.js + Express)**
```dockerfile
# protocol-builder-backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001

CMD ["node", "src/app.js"]
```

#### **2.3 Database Container (PostgreSQL)**
```dockerfile
# database/Dockerfile
FROM postgres:15-alpine

# Copy initialization scripts
COPY init-scripts/ /docker-entrypoint-initdb.d/

# Set environment variables
ENV POSTGRES_DB=protocol_builder
ENV POSTGRES_USER=protocol_user
ENV POSTGRES_PASSWORD=secure_password

EXPOSE 5432
```

### **Phase 3: Podman Pod Configuration (Week 4)**

#### **3.1 Pod Creation Script**
```bash
#!/bin/bash
# deploy-pod.sh

# Create pod with shared network
podman pod create \
  --name protocol-builder \
  --publish 80:80 \
  --publish 443:443

# Create persistent volumes
podman volume create protocol-db-data
podman volume create protocol-uploads

# Database container
podman run -d \
  --pod protocol-builder \
  --name protocol-db \
  --volume protocol-db-data:/var/lib/postgresql/data \
  --env-file database.env \
  localhost/protocol-builder-db:latest

# Backend container
podman run -d \
  --pod protocol-builder \
  --name protocol-backend \
  --volume protocol-uploads:/app/uploads \
  --env-file backend.env \
  --depends-on protocol-db \
  localhost/protocol-builder-backend:latest

# Frontend container
podman run -d \
  --pod protocol-builder \
  --name protocol-frontend \
  --env-file frontend.env \
  --depends-on protocol-backend \
  localhost/protocol-builder-frontend:latest

echo "Protocol Builder deployed successfully!"
echo "Access at: http://localhost"
```

#### **3.2 Environment Configuration**
```bash
# database.env
POSTGRES_DB=protocol_builder
POSTGRES_USER=protocol_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# backend.env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://protocol_user:your_secure_password_here@localhost:5432/protocol_builder
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost

# frontend.env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_VERSION=1.0.0
```

#### **3.3 Docker Compose Alternative (Podman-Compose)**
```yaml
# podman-compose.yml
version: '3.8'

services:
  frontend:
    build: ./protocol-builder-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://backend:3001

  backend:
    build: ./protocol-builder-backend
    ports:
      - "3001:3001"
    depends_on:
      - database
    environment:
      - DATABASE_URL=postgresql://protocol_user:password@database:5432/protocol_builder
      - JWT_SECRET=your_secret_here
    volumes:
      - uploads:/app/uploads

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=protocol_builder
      - POSTGRES_USER=protocol_user
      - POSTGRES_PASSWORD=password
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db_data:
  uploads:
```

### **Phase 4: Production Deployment Setup**

#### **4.1 System Requirements**
```yaml
Minimum Hardware:
  - CPU: 2 cores
  - RAM: 4GB
  - Storage: 20GB
  - Network: 100 Mbps

Recommended Hardware:
  - CPU: 4 cores
  - RAM: 8GB
  - Storage: 50GB SSD
  - Network: 1 Gbps

Operating System:
  - RHEL 8/9, CentOS Stream, Fedora 36+
  - Ubuntu 20.04/22.04 LTS
  - Rocky Linux 8/9
```

#### **4.2 Podman Installation & Setup**
```bash
#!/bin/bash
# install-podman.sh

# For RHEL/CentOS/Fedora
dnf install -y podman podman-compose

# For Ubuntu
apt update
apt install -y podman

# Enable user namespaces
echo 'user.max_user_namespaces=28633' >> /etc/sysctl.conf
sysctl -p

# Configure rootless podman
podman system migrate
podman info

# Enable podman socket for API access
systemctl --user enable --now podman.socket
```

#### **4.3 SSL/TLS Configuration**
```nginx
# nginx-ssl.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/protocol-builder.crt;
    ssl_certificate_key /etc/ssl/private/protocol-builder.key;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Phase 5: Operational Tools & Monitoring**

#### **5.1 Health Checks & Monitoring**
```bash
#!/bin/bash
# health-check.sh

# Check pod status
podman pod ps

# Check container health
podman ps --pod

# Check logs
podman logs protocol-frontend
podman logs protocol-backend
podman logs protocol-db

# Database connectivity test
podman exec protocol-db psql -U protocol_user -d protocol_builder -c "SELECT version();"

# Backend API test
curl -f http://localhost:3001/api/health || exit 1

# Frontend accessibility test
curl -f http://localhost/ || exit 1

echo "All services healthy!"
```

#### **5.2 Backup Strategy**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/protocol-builder"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
podman exec protocol-db pg_dump -U protocol_user protocol_builder > \
  $BACKUP_DIR/db_backup_$DATE.sql

# Volume backup
podman run --rm \
  --volume protocol-db-data:/source:ro \
  --volume $BACKUP_DIR:/backup \
  alpine tar czf /backup/volumes_$DATE.tar.gz /source

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### **5.3 Update & Maintenance**
```bash
#!/bin/bash
# update.sh

echo "Stopping services..."
podman pod stop protocol-builder

echo "Backing up current state..."
./backup.sh

echo "Pulling latest images..."
podman pull localhost/protocol-builder-frontend:latest
podman pull localhost/protocol-builder-backend:latest
podman pull postgres:15-alpine

echo "Starting updated services..."
podman pod start protocol-builder

echo "Running health checks..."
sleep 30
./health-check.sh

echo "Update completed successfully!"
```

## 🚀 **Deployment Commands**

### **Development Environment**
```bash
# Clone and setup
git clone <repo-url> protocol-builder
cd protocol-builder

# Build containers
podman build -t protocol-builder-frontend ./frontend
podman build -t protocol-builder-backend ./backend
podman build -t protocol-builder-db ./database

# Deploy pod
./scripts/deploy-pod.sh

# Access application
firefox http://localhost
```

### **Production Environment**
```bash
# Setup SSL certificates
certbot --nginx -d your-domain.com

# Deploy with SSL
./scripts/deploy-production.sh

# Setup monitoring
./scripts/setup-monitoring.sh

# Configure backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 📊 **Resource Requirements & Scaling**

### **Container Resource Limits**
```yaml
Frontend Container:
  Memory: 512MB
  CPU: 0.5 cores
  Storage: 100MB

Backend Container:
  Memory: 1GB
  CPU: 1 core
  Storage: 500MB

Database Container:
  Memory: 2GB
  CPU: 1 core
  Storage: 10GB+ (grows with data)
```

### **Scaling Strategy**
```bash
# Scale backend for more users
podman run -d \
  --pod protocol-builder \
  --name protocol-backend-2 \
  localhost/protocol-builder-backend:latest

# Load balancer configuration needed for multiple backends
```

## 🔒 **Security Considerations**

### **Network Security**
- Pod internal network (containers communicate via localhost)
- Only port 80/443 exposed externally
- Database not accessible from outside pod

### **Container Security**
- Non-root user in containers
- Read-only filesystem where possible
- Secrets via environment files (not embedded)
- Regular security updates

### **Data Security**
- PostgreSQL with encrypted connections
- JWT tokens for API authentication
- HTTPS/TLS for all external communication
- Regular automated backups

## 💡 **Benefits of This Architecture**

1. **🔧 Easy Development**: Each service can be developed independently
2. **📈 Scalable**: Scale frontend, backend, or database separately
3. **🛡️ Secure**: Process isolation and network security
4. **🔄 Maintainable**: Update components without full system restart
5. **💾 Backup Friendly**: Selective backups of data vs code
6. **🐛 Debuggable**: Isolated logs and monitoring per service
7. **🏥 Resilient**: One container failure doesn't affect others

This multi-container Podman setup gives you production-grade deployment while maintaining the simplicity needed for research lab environments! 🧪

Would you like me to start implementing any specific phase of this plan?