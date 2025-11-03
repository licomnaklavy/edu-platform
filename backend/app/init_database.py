import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Создает базу данных если она не существует"""
    try:
        # Подключаемся к стандартной базе postgres для создания нашей БД
        conn = psycopg2.connect(
            host="db",
            port="5432", 
            user="user",
            password="password",
            database="postgres"  # Подключаемся к стандартной БД
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Проверяем существует ли база данных
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'education_platform'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Creating database 'education_platform'...")
            cursor.execute('CREATE DATABASE education_platform')
            print("Database created successfully!")
        else:
            print("Database 'education_platform' already exists")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

def wait_for_db():
    """Ждем пока БД станет доступной"""
    print("Waiting for database to be ready...")
    
    for i in range(30):  # 30 попыток с интервалом 2 секунды
        try:
            # Пробуем подключиться к стандартной БД
            conn = psycopg2.connect(
                host="db",
                port="5432",
                user="user", 
                password="password",
                database="postgres"
            )
            conn.close()
            print("Database is ready!")
            return True
        except Exception as e:
            print(f"Attempt {i+1}/30: Database not ready yet - {e}")
            time.sleep(2)
    
    raise Exception("Database not available after 60 seconds")

if __name__ == "__main__":
    if wait_for_db():
        create_database()