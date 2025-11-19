import time
import requests
import psycopg2
import redis

def check_web_service(service_name, host, port, health_endpoint="/health"):
    """Проверяет доступность веб-сервиса"""
    try:
        url = f"http://{host}:{port}{health_endpoint}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return True, "Service is healthy"
        else:
            return False, f"HTTP {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Connection refused"
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except Exception as e:
        return False, f"Error: {str(e)}"

def check_database():
    """Проверяет доступность базы данных"""
    try:
        conn = psycopg2.connect(
            host="db",
            database="education_platform", 
            user="user",
            password="password",
            connect_timeout=5
        )
        # Проверяем что можем выполнить простой запрос
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return True, "Database is accessible"
    except psycopg2.OperationalError as e:
        return False, f"Database connection failed: {str(e)}"
    except Exception as e:
        return False, f"Database error: {str(e)}"

def check_redis():
    """Проверяет доступность Redis"""
    try:
        r = redis.Redis(host="redis", port=6379, socket_connect_timeout=5)
        r.ping()
        return True, "Redis is responsive"
    except redis.ConnectionError:
        return False, "Redis connection failed"
    except Exception as e:
        return False, f"Redis error: {str(e)}"

def monitor_all_services():
    """Проверяет все сервисы и выводит отчет"""
    print("\n" + "="*50)
    print("HEALTH MONITOR REPORT")
    print("="*50)
    
    services_to_check = [
        ("Backend API", "backend-api", 8000),
        ("Backend Auth", "backend-auth", 8001),
    ]
    
    all_healthy = True
    
    # Проверяем веб-сервисы
    for service_name, host, port in services_to_check:
        is_healthy, message = check_web_service(service_name, host, port)
        print(f"{service_name:<15} {message}")
        if not is_healthy:
            all_healthy = False
    
    # Проверяем базу данных
    db_healthy, db_message = check_database()
    print(f"{'Database':<15} {db_message}")
    if not db_healthy:
        all_healthy = False
    
    # Проверяем Redis
    redis_healthy, redis_message = check_redis()
    print(f"{'Redis':<15} {redis_message}")
    if not redis_healthy:
        all_healthy = False
    
    print("="*50)
    if all_healthy:
        print("ALL SYSTEMS OPERATIONAL")
    else:
        print("SOME SERVICES HAVE ISSUES")
    print("="*50)

if __name__ == "__main__":
    print("Health Monitor Service Started")
    print("Monitoring services every 30 seconds...")
    
    # Для демонстрации проверяем чаще
    check_interval = 30  # секунды
    
    while True:
        monitor_all_services()
        print(f"Next check in {check_interval} seconds...\n")
        time.sleep(check_interval)