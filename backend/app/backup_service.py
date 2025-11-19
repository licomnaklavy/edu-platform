import os
import time
import subprocess
from datetime import datetime

def create_backup():
    """Создает резервную копию базы данных"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"/backups/backup_{timestamp}.sql"
    
    # Команда для создания бэкапа PostgreSQL
    cmd = [
        "pg_dump",
        "-h", "db",
        "-U", "user", 
        "-d", "education_platform",
        "-f", backup_file
    ]
    
    try:
        # Запускаем команду с паролем в переменной окружения
        env = {**os.environ, 'PGPASSWORD': 'password'}
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Backup created successfully: {backup_file}")
            
            # Очистка старых бэкапов (оставляем последние 3)
            cleanup_old_backups()
        else:
            print(f"Backup failed: {result.stderr}")
            
    except Exception as e:
        print(f"Backup error: {e}")

def cleanup_old_backups():
    """Удаляет старые бэкапы, оставляя только 3 последних"""
    try:
        if os.path.exists("/backups"):
            backups = []
            for filename in os.listdir("/backups"):
                if filename.startswith("backup_") and filename.endswith(".sql"):
                    filepath = os.path.join("/backups", filename)
                    backups.append((filepath, os.path.getctime(filepath)))
            
            # Сортируем по дате создания (новые в конце)
            backups.sort(key=lambda x: x[1])
            
            # Удаляем все кроме 3 последних
            if len(backups) > 3:
                for i in range(len(backups) - 3):
                    old_backup = backups[i][0]
                    os.remove(old_backup)
                    print(f"Removed old backup: {os.path.basename(old_backup)}")
                    
    except Exception as e:
        print(f"Cleanup error: {e}")

if __name__ == "__main__":
    print("Backup service started")
    print("Will create backups every 2 minutes for demonstration")
    
    backup_interval = 120
    
    while True:
        create_backup()
        print(f"Next backup in {backup_interval // 60} minutes...")
        time.sleep(backup_interval)