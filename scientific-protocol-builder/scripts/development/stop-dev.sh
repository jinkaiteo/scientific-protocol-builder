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
