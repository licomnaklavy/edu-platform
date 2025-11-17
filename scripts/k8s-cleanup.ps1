# k8s-cleanup.ps1
Write-Host "🧹 Cleaning up Kubernetes deployment..." -ForegroundColor Yellow

kubectl delete -f k8s/ --ignore-not-found=true
kubectl delete namespace eduplatform --ignore-not-found=true

Write-Host "✅ Cleanup completed!" -ForegroundColor Green