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
