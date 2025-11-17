# deploy-windows.ps1
Write-Host "🚀 Starting EduPlatform deployment on Windows..." -ForegroundColor Green

# Проверка Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Проверка WSL (опционально)
try {
    wsl --list | Out-Null
    Write-Host "✅ WSL is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WSL not detected, using native Docker" -ForegroundColor Yellow
}

# Запуск Docker Compose
Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Cyan
docker-compose up -d

# Ожидание запуска
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Проверка сервисов
Write-Host "🔍 Checking services..." -ForegroundColor Cyan

$services = @(
    @{Name="Frontend"; Port=3000},
    @{Name="Backend API"; Port=8000},
    @{Name="Backend Auth"; Port=8001}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) not responding on port $($service.Port)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "🌐 Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔐 Backend Auth: http://localhost:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To stop services, run: docker-compose down" -ForegroundColor Yellow