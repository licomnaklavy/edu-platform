.PHONY: deploy status logs clean test port-forward check

# Основные команды
deploy:
	@echo "🚀 Deploying EduPlatform to Kubernetes..."
	@./scripts/deploy.sh

status:
	@echo "📊 Checking cluster status..."
	@kubectl get pods,svc,ingress -n eduplatform

logs-backend:
	@kubectl logs -l app=backend-api -n eduplatform --tail=50

logs-frontend:
	@kubectl logs -l app=frontend -n eduplatform --tail=50

clean:
	@echo "🧹 Cleaning up deployment..."
	@kubectl delete -f k8s/ --ignore-not-found=true
	@kubectl delete namespace eduplatform --ignore-not-found=true

# Проверка работы
check:
	@echo "🔍 Running health checks..."
	@./scripts/check-health.sh

# Локальный запуск (без Kubernetes)
local-up:
	@echo "🏠 Starting locally with Docker Compose..."
	@docker-compose up -d
	@./scripts/check-local.sh

local-down:
	@echo "🛑 Stopping local deployment..."
	@docker-compose down

# Тестирование
test:
	@echo "🧪 Running tests..."
	@cd backend && python -m pytest tests/ -v
	@echo "✅ All tests passed!"

# Port forwarding для доступа
port-forward:
	@echo "🔗 Setting up port forwarding..."
	@kubectl port-forward -n eduplatform service/frontend-service 3000:80 &
	@kubectl port-forward -n eduplatform service/backend-api-service 8000:8000 &
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8000"
	@echo "📚 API Docs: http://localhost:8000/docs"

help:
	@echo "Available commands:"
	@echo "  make deploy      - Deploy to Kubernetes"
	@echo "  make status      - Check deployment status"
	@echo "  make check       - Run health checks"
	@echo "  make local-up    - Run locally with Docker"
	@echo "  make port-forward- Access services locally"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Clean up deployment"