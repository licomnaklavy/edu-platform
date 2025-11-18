# k8s-deploy-fixed.ps1
Write-Host "🚀 Starting FIXED Kubernetes deployment..." -ForegroundColor Green

# Stop existing deployment
Write-Host "🛑 Stopping existing deployment..." -ForegroundColor Yellow
kubectl delete -f k8s/ --ignore-not-found=true
kubectl delete namespace eduplatform --ignore-not-found=true
Start-Sleep 5

# Rebuild images with CORS fix
Write-Host "🐳 Rebuilding Docker images with CORS fix..." -ForegroundColor Cyan
docker build -t eduplatform-backend:local ./backend
docker build -t eduplatform-frontend:local ./frontend

# Load images
Write-Host "📥 Loading images into k3d..." -ForegroundColor Cyan
k3d image import eduplatform-backend:local -c eduplatform
k3d image import eduplatform-frontend:local -c eduplatform

# Deploy
Write-Host "📦 Deploying to Kubernetes..." -ForegroundColor Cyan
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml

# Wait for database
Write-Host "⏳ Waiting for database..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgresql -n eduplatform --timeout=120s

# Deploy backend and frontend
kubectl apply -f k8s/backend-api.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# Wait longer for backend (it needs to initialize database)
Write-Host "⏳ Waiting for backend API (this may take 2-3 minutes)..." -ForegroundColor Yellow
$timeout = 180
$elapsed = 0
do {
    $status = kubectl get pods -l app=backend-api -n eduplatform -o jsonpath='{.items[0].status.phase}' 2>$null
    if ($status -eq "Running") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        break
    }
    Write-Host "⏳ Backend status: $status ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    Start-Sleep 10
    $elapsed += 10
} while ($elapsed -lt $timeout)

# Run diagnostics
Write-Host "`n🔍 Running diagnostics..." -ForegroundColor Cyan
.\scripts\k8s-diagnose.ps1

Write-Host "`n🎯 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White