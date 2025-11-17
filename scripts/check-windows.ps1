# check-windows.ps1
Write-Host "🔍 Running health checks..." -ForegroundColor Cyan

function Test-Service {
    param($Name, $Url)
    
    $attempts = 0
    $maxAttempts = 10
    
    while ($attempts -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 3 -ErrorAction SilentlyContinue
            Write-Host "✅ $Name is healthy" -ForegroundColor Green
            return $true
        } catch {
            $attempts++
            Write-Host "⏳ Attempt $attempts/$maxAttempts failed for $Name, retrying..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
    }
    
    Write-Host "❌ $Name failed after $maxAttempts attempts" -ForegroundColor Red
    return $false
}

# Проверяем основные сервисы
Test-Service -Name "Frontend" -Url "http://localhost:3000"
Test-Service -Name "Backend API" -Url "http://localhost:8000/health"
Test-Service -Name "Backend Auth" -Url "http://localhost:8001/health"

# Проверяем контейнеры
Write-Host "`n🐳 Container status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"