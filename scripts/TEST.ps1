# Останавливаем ВСЁ
kubectl delete -f k8s/ --ignore-not-found=true
kubectl delete namespace eduplatform --ignore-not-found=true
docker-compose down 2>$null
k3d cluster delete eduplatform 2>$null
docker rmi eduplatform-backend:local eduplatform-frontend:local --force 2>$null

k3d cluster create eduplatform --port "80:30080@loadbalancer" --port "8000:30800@loadbalancer" --agents 2

docker build -t eduplatform-backend:local ./backend
docker build -t eduplatform-frontend:local ./frontend

k3d image import eduplatform-backend:local eduplatform-frontend:local -c eduplatform

# Базовые ресурсы
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# База данных и Redis
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml

# Ждем готовности базы данных
kubectl wait --for=condition=ready pod -l app=postgresql -n eduplatform --timeout=120s

# Backend
kubectl apply -f k8s/backend-api.yaml

# Ждем готовности бэкенда
kubectl wait --for=condition=ready pod -l app=backend-api -n eduplatform --timeout=120s

# Frontend
kubectl apply -f k8s/frontend.yaml

# Диагностика
kubectl get pods,svc -n eduplatform
kubectl get events -n eduplatform --sort-by='.lastTimestamp'
kubectl logs -l app=backend-api -n eduplatform --tail=10
kubectl logs -l app=frontend -n eduplatform --tail=10