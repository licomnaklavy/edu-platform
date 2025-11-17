# k3d cluster create eduplatform --port "3000:3000@loadbalancer" --port "8000:8000@loadbalancer"

# k8s-deploy.ps1
Write-Host "🚀 Starting REAL Kubernetes deployment..." -ForegroundColor Green

# Check kubectl
try {
    kubectl version --client | Out-Null
    Write-Host "✅ kubectl is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl not found" -ForegroundColor Red
    exit 1
}

# Build local images
Write-Host "🐳 Building local Docker images..." -ForegroundColor Cyan
docker build -t eduplatform-backend:local ./backend
docker build -t eduplatform-frontend:local ./frontend

# Load images into k3d
Write-Host "📥 Loading images into k3d cluster..." -ForegroundColor Cyan
k3d image import eduplatform-backend:local -c eduplatform
k3d image import eduplatform-frontend:local -c eduplatform 

# Deploy to Kubernetes
Write-Host "📦 Deploying to Kubernetes..." -ForegroundColor Cyan
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend-api.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/network-policy.yaml

# Wait for services
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgresql -n eduplatform --timeout=300s
kubectl wait --for=condition=available deployment/backend-api -n eduplatform --timeout=180s
kubectl wait --for=condition=available deployment/frontend -n eduplatform --timeout=180s

Write-Host "✅ Kubernetes deployment completed!" -ForegroundColor Green

# Show status
Write-Host "`n📊 Deployment Status:" -ForegroundColor Cyan
kubectl get pods,svc,ingress -n eduplatform

Write-Host "`n🌐 Access URLs:" -ForegroundColor Green
Write-Host "   Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan