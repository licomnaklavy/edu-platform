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
    console.log('Auth data cleared from localStorage');
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

    console.log(`API Request: ${endpoint}`, { hasToken: !!token });

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid
            console.log('API returned 401, logging out');
            removeAuthToken();
            window.location.href = 'login.html';
            throw new Error('Authentication required');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
            console.error('API error:', errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    async login(email, password) {
        console.log('API: Attempting login for:', email);
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        console.log('API: Login successful', data);
        
        setAuthToken(data.access_token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');

        return data;
    },

    async register(email, password, name) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });

        setAuthToken(data.access_token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');

        return data;
    },

    async getCurrentUser() {
        return await apiRequest('/users/me');
    },

    logout() {
        console.log('API: Logging out');
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