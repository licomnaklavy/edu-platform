-- Initialize database schema
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    name VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    hours INTEGER NOT NULL,
    level VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS user_courses (
    user_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    PRIMARY KEY (user_id, course_id)
);