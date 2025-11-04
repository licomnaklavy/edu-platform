import { authAPI } from './api.js';

// Функции для работы с авторизацией

// Проверка авторизации при загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth script loaded - current page:', window.location.pathname);
    
    // Главная страница - проверяем авторизацию но не редиректим автоматически
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        console.log('Main page - showing auth options');
        return;
    }
    
    // Если это страница логина
    if (window.location.pathname.includes('login.html')) {
        console.log('Login page detected');
        if (isLoggedIn()) {
            console.log('Already logged in, redirecting to my-courses');
            window.location.href = 'my-courses.html';
        } else {
            console.log('Setting up login form');
            setupLoginForm();
        }
        return;
    }
    
    // Если это страница регистрации
    if (window.location.pathname.includes('register.html')) {
        console.log('Register page detected');
        if (isLoggedIn()) {
            console.log('Already logged in, redirecting to my-courses');
            window.location.href = 'my-courses.html';
        } else {
            console.log('Setting up registration form');
            setupRegisterForm();
        }
        return;
    }
    
    // Для всех других страниц проверяем авторизацию
    console.log('Protected page detected, checking auth...');
    checkAuth();
});

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
        
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout clicked');
            authAPI.logout();
            window.location.href = 'login.html';
        });
        
        console.log('Logout handler setup complete');
    } else {
        console.error('Logout button not found!');
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        console.log('Setting up login form');
        
        // Полностью пересоздаем обработчик
        loginForm.onsubmit = null;
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Валидация полей
            if (!email || !password) {
                showAlert('Пожалуйста, заполните все поля', 'error');
                return false;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Вход...';
            }
            
            try {
                await authAPI.login(email, password);
                showAlert('Вход выполнен успешно!', 'success');
                
                // Задержка перед редиректом чтобы показать сообщение
                setTimeout(() => {
                    window.location.href = 'my-courses.html';
                }, 1000);
                
            } catch (error) {
                // Показываем пользователю сообщение об ошибке
                showAlert(error.message || 'Неверный email или пароль', 'error');
                
                // Очищаем поле пароля
                document.getElementById('password').value = '';
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
            
            return false;
        });
    } else {
        console.error('Login form not found!');
    }
}

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        console.log('Setting up registration form');
        
        // Полностью пересоздаем обработчик
        registerForm.onsubmit = null;
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Registration form submitted');
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Валидация
            if (!fullname || !email || !password || !confirmPassword) {
                showAlert('Пожалуйста, заполните все поля', 'error');
                return false;
            }
            
            if (password.length < 6) {
                showAlert('Пароль должен содержать минимум 6 символов', 'error');
                return false;
            }
            
            if (password !== confirmPassword) {
                showAlert('Пароли не совпадают', 'error');
                return false;
            }
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Регистрация...';
            }
            
            try {
                console.log('Attempting registration with:', email);
                await authAPI.register(email, password, fullname);
                console.log('Registration successful, redirecting...');
                showAlert('Регистрация прошла успешно!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'my-courses.html';
                }, 1000);
                
            } catch (error) {
                console.error('Registration failed:', error);
                showAlert('Ошибка регистрации. Возможно, email уже используется', 'error');
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
            
            return false;
        });
        
        console.log('Registration form setup complete');
    } else {
        console.error('Registration form not found!');
    }
}

// Универсальная функция для показа уведомлений
function showAlert(message, type = 'info') {
    // Удаляем существующие уведомления
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    });
    
    // Создаем новое уведомление
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;
    
    // Настройки стилей в зависимости от типа
    const styles = {
        success: {
            background: 'var(--success-color)',
            color: 'white'
        },
        error: {
            background: 'var(--accent-color)',
            color: 'white'
        },
        info: {
            background: 'var(--primary-color)',
            color: 'white'
        }
    };
    
    const style = styles[type] || styles.info;
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${style.background};
        color: ${style.color};
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: var(--shadow-hover);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
        font-weight: 500;
    `;
    
    document.body.appendChild(alert);
    
    // Удаляем уведомление через 4 секунды
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }, 4000);
}

// Добавляем стили для анимаций если их еще нет
if (!document.querySelector('#alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
        @keyframes slideIn {
            from { 
                transform: translateX(100%); 
                opacity: 0; 
            }
            to { 
                transform: translateX(0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideOut {
            from { 
                transform: translateX(0); 
                opacity: 1; 
            }
            to { 
                transform: translateX(100%); 
                opacity: 0; 
            }
        }
        
        .custom-alert {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    `;
    document.head.appendChild(style);
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

// Добавляем глобальную функцию для тестирования алертов
window.testAlert = function(type) {
    const messages = {
        success: 'Тестовое успешное сообщение!',
        error: 'Тестовое сообщение об ошибке!',
        info: 'Тестовое информационное сообщение!'
    };
    showAlert(messages[type] || messages.info, type);
};

console.log('Auth module loaded successfully');