# Образовательная платформа

## Описание
Платформа для онлайн-обучения с авторизацией, каталогом курсов и личным кабинетом.

## Технологии
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Redis, JWT
- Frontend: HTML5, CSS3, JavaScript (ES6)
- DevOps: Docker, Kubernetes, Nginx

## Запуск через Docker Compose
```bash
docker-compose up -d
```
Открыть http://localhost:3000

## Запуск в Kubernetes
```bash
kubectl apply -f k8s/
```

## Установка пакета Python
```bash
cd backend
pip install -e .
```

## Тесты
```bash
cd backend
pytest
```