# test-db-connection.ps1
Write-Host "🔍 Testing database connection..." -ForegroundColor Cyan

# Test from inside the cluster
Write-Host "1. Testing PostgreSQL connection from inside cluster..." -ForegroundColor Yellow
kubectl run test-db -n eduplatform --image=postgres:15 -it --rm --restart=Never --command -- psql -h postgresql-service -U user -d education_platform -c "SELECT 'Database is working!' as status;"

Write-Host "`n2. Testing service discovery..." -ForegroundColor Yellow
kubectl run test-network -n eduplatform --image=alpine -it --rm --restart=Never --command -- nslookup postgresql-service

Write-Host "`n3. Checking service endpoints..." -ForegroundColor Yellow
kubectl get endpoints -n eduplatform