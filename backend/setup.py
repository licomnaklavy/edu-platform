from setuptools import setup, find_packages

setup(
    name="education-platform",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "sqlalchemy==2.0.23",
        "psycopg2-binary==2.9.9",
        "python-jose==3.3.0",
        "passlib==1.7.4",
        "argon2-cffi==23.1.0",
    ],
    entry_points={
        "console_scripts": [
            "edu-backend=app.main:app",
        ],
    },
    author="Второв Андрей, Кузьменко Всеволод, Лащенков Евгений",
    description="Education Platform Backend",
)