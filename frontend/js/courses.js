import { coursesAPI } from './api.js';

// Функции для работы с курсами

let currentCourses = [];

// Инициализация страницы курсов
document.addEventListener('DOMContentLoaded', function() {
    const isMyCoursesPage = window.location.pathname.includes('my-courses.html');
    const isAllCoursesPage = window.location.pathname.includes('all-courses.html');
    
    if (isMyCoursesPage || isAllCoursesPage) {
        initCoursesPage();
    }
});

function initCoursesPage() {
    // Загрузка курсов
    loadCourses();
    
    // Настройка обработчиков событий
    setupCoursesEventListeners();
}

function setupCoursesEventListeners() {
    // Обработчик поиска
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }
    
    // Обработчики фильтров
    const levelFilter = document.getElementById('level-filter');
    
    if (levelFilter) {
        levelFilter.addEventListener('change', filterCourses);
    }
}

async function loadCourses() {
    const isMyCoursesPage = window.location.pathname.includes('my-courses.html');
    
    try {
        showLoadingState();
        
        let courses;
        if (isMyCoursesPage) {
            // Загрузка курсов пользователя
            courses = await coursesAPI.getMyCourses();
        } else {
            // Загрузка всех курсов со статусом записи
            courses = await coursesAPI.getAllCourses();
        }
        
        currentCourses = courses;
        renderCourses(courses, isMyCoursesPage);
        
    } catch (error) {
        console.error('Failed to load courses:', error);
        showNotification('Ошибка загрузки курсов', 'error');
        showErrorState();
    }
}

function showLoadingState() {
    const coursesListId = getCoursesListId();
    const coursesList = document.getElementById(coursesListId);
    const noCoursesMessage = document.getElementById('no-courses-message');
    
    if (coursesList) {
        coursesList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Загрузка курсов...</p>
            </div>
        `;
    }
    
    if (noCoursesMessage) {
        noCoursesMessage.style.display = 'none';
    }
}

function showErrorState() {
    const coursesListId = getCoursesListId();
    const coursesList = document.getElementById(coursesListId);
    const noCoursesMessage = document.getElementById('no-courses-message');
    
    if (coursesList) {
        coursesList.innerHTML = `
            <div class="error-state">
                <h3>Произошла ошибка</h3>
                <p>Не удалось загрузить курсы. Пожалуйста, попробуйте позже.</p>
                <button class="btn btn-primary" onclick="loadCourses()">Попробовать снова</button>
            </div>
        `;
    }
    
    if (noCoursesMessage) {
        noCoursesMessage.style.display = 'none';
    }
}

function getCoursesListId() {
    const isMyCoursesPage = window.location.pathname.includes('my-courses.html');
    return isMyCoursesPage ? 'my-courses-list' : 'all-courses-list';
}

function renderCourses(courses, isMyCoursesPage) {
    const coursesListId = getCoursesListId();
    const coursesList = document.getElementById(coursesListId);
    const noCoursesMessage = document.getElementById('no-courses-message');
    
    if (!coursesList) return;
    
    coursesList.innerHTML = '';
    
    if (courses.length === 0) {
        if (noCoursesMessage) {
            noCoursesMessage.style.display = 'block';
        }
        return;
    }
    
    if (noCoursesMessage) {
        noCoursesMessage.style.display = 'none';
    }
    
    courses.forEach(course => {
        const courseElement = createCourseElement(course, isMyCoursesPage);
        coursesList.appendChild(courseElement);
    });
}

function createCourseElement(course, isMyCoursesPage) {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    courseCard.setAttribute('data-course-id', course.id);
    courseCard.setAttribute('data-course-level', course.level);
    
    const levelName = getLevelName(course.level);
    const levelClass = getLevelClass(course.level);
    
    courseCard.innerHTML = `
        <div class="course-header">
            <h3 class="course-title">${escapeHtml(course.name)}</h3>
            <div class="course-badges">
                <span class="course-level ${levelClass}">${levelName}</span>
            </div>
        </div>
        <div class="course-content">
            <p class="course-description">${escapeHtml(course.description || 'Описание отсутствует')}</p>
            <div class="course-meta">
                <span class="course-hours">
                    <i class="time-icon">⏱</i>
                    ${course.hours} часов
                </span>
                <span class="course-id">ID: ${course.id}</span>
            </div>
            <div class="course-actions">
                ${isMyCoursesPage ? 
                    `<button class="btn btn-leave" onclick="leaveCourse(${course.id})" data-course-id="${course.id}">
                        Покинуть курс
                    </button>` : 
                    `<button class="btn btn-start ${course.is_enrolled ? 'btn-disabled' : ''}" 
                            onclick="startCourse(${course.id})" 
                            ${course.is_enrolled ? 'disabled' : ''}
                            data-course-id="${course.id}">
                        ${course.is_enrolled ? '✅ Курс добавлен' : '🎯 Начать курс'}
                    </button>`
                }
            </div>
        </div>
    `;
    
    return courseCard;
}

function getLevelName(level) {
    const levels = {
        beginner: 'Начальный',
        intermediate: 'Средний',
        advanced: 'Продвинутый'
    };
    return levels[level] || level;
}

function getLevelClass(level) {
    const levelClasses = {
        beginner: 'beginner',
        intermediate: 'intermediate',
        advanced: 'advanced'
    };
    return levelClasses[level] || 'beginner';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function startCourse(courseId) {
    const button = document.querySelector(`button[data-course-id="${courseId}"]`);
    
    if (!button) return;
    
    // Блокируем кнопку на время запроса
    button.disabled = true;
    button.innerHTML = '⏳ Добавляем...';
    
    try {
        await coursesAPI.enrollInCourse(courseId);
        
        // Обновляем отображение
        await loadCourses();
        
        // Показываем уведомление
        showNotification('Курс успешно добавлен в ваше обучение!', 'success');
        
    } catch (error) {
        console.error('Failed to enroll in course:', error);
        
        // Восстанавливаем кнопку
        button.disabled = false;
        button.innerHTML = '🎯 Начать курс';
        
        showNotification('Ошибка при добавлении курса', 'error');
    }
}

async function leaveCourse(courseId) {
    const course = currentCourses.find(c => c.id === courseId);
    const courseName = course ? course.name : 'этот курс';
    
    if (!confirm(`Вы уверены, что хотите покинуть курс "${courseName}"?`)) {
        return;
    }
    
    const button = document.querySelector(`button[data-course-id="${courseId}"]`);
    
    if (button) {
        button.disabled = true;
        button.innerHTML = '⏳ Выходим...';
    }
    
    try {
        await coursesAPI.leaveCourse(courseId);
        
        // Обновляем отображение
        await loadCourses();
        
        // Показываем уведомление
        showNotification(`Вы покинули курс "${courseName}"`);
        
    } catch (error) {
        console.error('Failed to leave course:', error);
        
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Покинуть курс';
        }
        
        showNotification('Ошибка при выходе из курса', 'error');
    }
}

function filterCourses() {
    const searchTerm = document.getElementById('course-search')?.value.toLowerCase() || '';
    const levelFilter = document.getElementById('level-filter')?.value || '';
    
    const coursesListId = getCoursesListId();
    const coursesList = document.getElementById(coursesListId);
    const noCoursesMessage = document.getElementById('no-courses-message');
    
    if (!coursesList) return;
    
    const courseCards = coursesList.querySelectorAll('.course-card');
    let visibleCount = 0;
    
    courseCards.forEach(card => {
        const title = card.querySelector('.course-title').textContent.toLowerCase();
        const description = card.querySelector('.course-description').textContent.toLowerCase();
        const level = card.getAttribute('data-course-level');
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesLevel = !levelFilter || level === levelFilter;
        
        if (matchesSearch && matchesLevel) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Показываем/скрываем сообщение "нет курсов"
    if (noCoursesMessage) {
        if (visibleCount === 0 && currentCourses.length > 0) {
            noCoursesMessage.style.display = 'block';
            noCoursesMessage.innerHTML = `
                <div class="empty-state">
                    <h3>Курсы не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                    <button class="btn btn-secondary" onclick="clearFilters()">Сбросить фильтры</button>
                </div>
            `;
        } else if (visibleCount === 0 && currentCourses.length === 0) {
            noCoursesMessage.style.display = 'block';
        } else {
            noCoursesMessage.style.display = 'none';
        }
    }
}

function clearFilters() {
    const searchInput = document.getElementById('course-search');
    const levelFilter = document.getElementById('level-filter');
    
    if (searchInput) searchInput.value = '';
    if (levelFilter) levelFilter.value = '';
    
    filterCourses();
}

function showNotification(message, type = 'success') {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--accent-color)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: var(--shadow-hover);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 4 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Глобальные функции для использования в HTML
window.startCourse = startCourse;
window.leaveCourse = leaveCourse;
window.filterCourses = filterCourses;
window.clearFilters = clearFilters;
window.loadCourses = loadCourses;

// Добавляем стили для состояний загрузки и ошибок
const styles = `
    <style>
        .loading-state {
            text-align: center;
            padding: 3rem;
            color: #666;
        }
        
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        .error-state {
            text-align: center;
            padding: 3rem;
            color: var(--accent-color);
        }
        
        .error-state h3 {
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
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
        
        .course-id {
            font-size: 0.8rem;
            color: #999;
            font-family: monospace;
        }
        
        .time-icon {
            margin-right: 0.3rem;
        }
        
        .course-badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    </style>
`;

// Добавляем стили в документ
document.head.insertAdjacentHTML('beforeend', styles);