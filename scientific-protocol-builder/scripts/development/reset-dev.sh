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
