# k8s-diagnose.ps1
Write-Host "🔍 Kubernetes Diagnostic Tool" -ForegroundColor Cyan

Write-Host "`n📦 Pod Status:" -ForegroundColor Yellow
kubectl get pods -n eduplatform -o wide

Write-Host "`n🔌 Service Status:" -ForegroundColor Yellow
kubectl get svc -n eduplatform

Write-Host "`n🌐 Ingress Status:" -ForegroundColor Yellow
kubectl get ingress -n eduplatform

Write-Host "`n📝 Backend Logs:" -ForegroundColor Yellow
kubectl logs -l app=backend-api -n eduplatform --tail=20

Write-Host "`n📝 Frontend Logs:" -ForegroundColor Yellow
kubectl logs -l app=frontend -n eduplatform --tail=10

Write-Host "`n🔍 Backend Pod Details:" -ForegroundColor Yellow
kubectl describe pod -l app=backend-api -n eduplatform | Select-String -Pattern "Status:|Ready:|Containers Ready:"

Write-Host "`n🌐 Testing Connectivity:" -ForegroundColor Yellow

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Cyan
kubectl port-forward -n eduplatform service/backend-api-service 8081:8000 &
$backendPid = $!

Start-Sleep 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "✅ Backend health check: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue

# Test frontend
Write-Host "Testing frontend..." -ForegroundColor Cyan
kubectl port-forward -n eduplatform service/frontend-service 8080:80 &
$frontendPid = $!

Start-Sleep 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/" -TimeoutSec 5
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Stop-Process -Id $frontendPid -Force -ErrorAction SilentlyContinue

Write-Host "`n🎯 Diagnostic Complete" -ForegroundColor Green