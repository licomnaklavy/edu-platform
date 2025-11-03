// Основная логика приложения

document.addEventListener('DOMContentLoaded', function() {
    console.log('Main script loaded');
    
    // Инициализация страницы курсов
    if (window.location.pathname.includes('my-courses.html') || 
        window.location.pathname.includes('all-courses.html')) {
        console.log('Courses page detected');
    }
    
    // Инициализация страницы настроек
    if (window.location.pathname.includes('settings.html')) {
        console.log('Settings page detected');
    }
    
    // Общие обработчики событий
    setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
    // Обработчики для навигации
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Navigation clicked:', this.href);
            // Навигация обрабатывается браузером по умолчанию
        });
    });
    
    // Глобальный обработчик ошибок
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });
    
    // Обработчик для всех кнопок
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn')) {
            console.log('Button clicked:', e.target.textContent, e.target.className);
        }
    });
}

// Глобальные утилиты
window.utils = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

console.log('Main module loaded successfully');