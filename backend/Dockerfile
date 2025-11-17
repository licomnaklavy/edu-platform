FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей для psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    postgresql-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости сначала для кэширования
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY ./app ./app
COPY ./tests ./tests

# Создаем не-root пользователя для безопасности
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]