import { authAPI } from './api.js';

// Функции для работы с авторизацией

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth script loaded');
    
    // Главная страница - всегда redirect
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        handleMainPageRedirect();
        return;
    }
    
    // Если это страница логина и пользователь уже авторизован - редирект
    if (window.location.pathname.includes('login.html')) {
        if (isLoggedIn()) {
            console.log('Already logged in, redirecting to my-courses');
            window.location.href = 'my-courses.html';
        } else {
            setupLoginForm();
        }
        return;
    }
    
    // Для всех других страниц проверяем авторизацию
    checkAuth();
});

function handleMainPageRedirect() {
    console.log('Main page - checking auth for redirect');
    if (isLoggedIn()) {
        console.log('Redirecting to my-courses');
        window.location.href = 'my-courses.html';
    } else {
        console.log('Redirecting to login');
        window.location.href = 'login.html';
    }
}

function isLoggedIn() {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasToken = !!localStorage.getItem('authToken');
    const hasUser = !!localStorage.getItem('currentUser');
    
    console.log('Auth check:', { loggedIn, hasToken, hasUser });
    
    return loggedIn && hasToken && hasUser;
}

async function checkAuth() {
    console.log('Checking authentication for protected page...');
    
    if (!isLoggedIn()) {
        console.log('Not logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Verifying token with API...');
        // Проверяем токен через API
        const user = await authAPI.getCurrentUser();
        console.log('User verified:', user);
        
        updateUserInfo(user);
        setupLogoutHandler();
        
    } catch (error) {
        console.error('Auth check failed:', error);
        // Если токен невалидный - разлогиниваем
        authAPI.logout();
        window.location.href = 'login.html';
    }
}

function updateUserInfo(user) {
    const userNameElement = document.getElementById('user-name');
    
    console.log('Updating user info:', user);
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'Пользователь';
        console.log('User name updated in header');
    }
    
    // Также обновляем в localStorage актуальные данные
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function setupLogoutHandler() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        console.log('Setting up logout handler');
        
        // Удаляем старые обработчики
        logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        const newLogoutBtn = document.querySelector('.logout-btn');
        
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout clicked');
            authAPI.logout();
            window.location.href = 'login.html';
        });
        
        // Убедимся что кнопка видима и доступна
        newLogoutBtn.style.display = 'block';
        newLogoutBtn.style.visibility = 'visible';
        newLogoutBtn.disabled = false;
        
        console.log('Logout handler setup complete');
    } else {
        console.error('Logout button not found!');
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Setting up login form');
        
        // Удаляем старые обработчики
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        const newLoginForm = document.getElementById('login-form');
        
        newLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            const submitBtn = newLoginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Вход...';
            }
            
            try {
                console.log('Attempting login with:', email);
                await authAPI.login(email, password);
                console.log('Login successful, redirecting...');
                window.location.href = 'my-courses.html';
            } catch (error) {
                console.error('Login failed:', error);
                alert('Неверный email или пароль');
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Войти';
                }
            }
        });
        
        console.log('Login form setup complete');
    } else {
        console.error('Login form not found!');
    }
}

// Глобальные функции для отладки
window.getAuthState = function() {
    return {
        isLoggedIn: isLoggedIn(),
        token: localStorage.getItem('authToken'),
        user: localStorage.getItem('currentUser'),
        currentPage: window.location.pathname
    };
};

window.clearAuth = function() {
    console.log('Manual logout triggered');
    authAPI.logout();
    window.location.href = 'login.html';
};

window.forceLogin = function() {
    console.log('Force redirect to login');
    window.location.href = 'login.html';
};

window.forceMyCourses = function() {
    console.log('Force redirect to my-courses');
    window.location.href = 'my-courses.html';
};

console.log('Auth module loaded successfully');