// API functions for backend communication

const API_BASE_URL = 'http://localhost:8000';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token to localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Remove auth token from localStorage
function removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Для эндпоинтов аутентификации обрабатываем 401 по-другому
        const isAuthEndpoint = endpoint.includes('/auth/');
        
        if (response.status === 401 && !isAuthEndpoint) {
            // Token expired or invalid for protected endpoints - logout
            removeAuthToken();
            window.location.href = 'login.html';
            throw new Error('Authentication required');
        }

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
                
                // Для ошибок аутентификации возвращаем более понятное сообщение
                if (response.status === 401 && isAuthEndpoint) {
                    errorMessage = 'Неверный email или пароль';
                }
            } catch (e) {
                // Если не удалось распарсить JSON, используем стандартное сообщение
            }
            
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Auth API
export const authAPI = {
    async login(email, password) {
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            
            setAuthToken(data.access_token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(email, password, name) {
        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });
            
            setAuthToken(data.access_token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getCurrentUser() {
        return await apiRequest('/users/me');
    },

    logout() {
        removeAuthToken();
    }
};

// Courses API
export const coursesAPI = {
    async getAllCourses() {
        return await apiRequest('/courses');
    },

    async getMyCourses() {
        return await apiRequest('/users/me/courses');
    },

    async enrollInCourse(courseId) {
        return await apiRequest(`/users/me/courses/${courseId}`, {
            method: 'POST',
        });
    },

    async leaveCourse(courseId) {
        return await apiRequest(`/users/me/courses/${courseId}`, {
            method: 'DELETE',
        });
    }
};

// User API
export const userAPI = {
    async updateProfile(userData) {
        return await apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }
};

console.log('API module loaded');