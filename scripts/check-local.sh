#!/bin/bash

echo "🔍 Checking local Docker Compose deployment..."

check_service() {
    local name=$1
    local port=$2
    local path=$3
    
    if curl -f -s "http://localhost:$port$path" > /dev/null; then
        echo "✅ $name is healthy (port $port)"
        return 0
    else
        echo "❌ $name check failed (port $port)"
        return 1
    fi
}

echo "⏳ Waiting for services to start..."
sleep 10

# Проверяем сервисы
check_service "Frontend" "3000" "/"
check_service "Backend API" "8000" "/health"
check_service "Backend Auth" "8001" "/health"

echo ""
echo "🌐 LOCAL ACCESS URLs:"
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:8000"
echo "  API Docs:     http://localhost:8000/docs"
echo "  Backend Auth: http://localhost:8001"

echo "✅ Local deployment check completed!"