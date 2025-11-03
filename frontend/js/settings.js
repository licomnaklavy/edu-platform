import { userAPI, authAPI } from './api.js';

// Функции для работы с настройками

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings script loaded');
    loadUserProfile();
    setupSettingsEventListeners();
});

async function loadUserProfile() {
    try {
        const currentUser = await authAPI.getCurrentUser();
        
        // Заполняем поля формы данными пользователя
        const fullnameInput = document.getElementById('user-fullname');
        const emailInput = document.getElementById('user-email');
        const userNameElement = document.getElementById('user-name');
        
        if (fullnameInput) {
            fullnameInput.value = currentUser.name || '';
        }
        
        if (emailInput) {
            emailInput.value = currentUser.email || '';
        }
        
        if (userNameElement) {
            userNameElement.textContent = currentUser.name || 'Пользователь';
        }
        
        console.log('User profile loaded:', currentUser);
    } catch (error) {
        console.error('Failed to load user profile:', error);
        showSettingsNotification('Ошибка загрузки профиля', 'error');
    }
}

function setupSettingsEventListeners() {
    // Обработчик сохранения профиля
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // Обработчик смены пароля
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
}

async function saveProfile() {
    const fullnameInput = document.getElementById('user-fullname');
    const emailInput = document.getElementById('user-email');
    
    if (!fullnameInput.value.trim()) {
        showSettingsNotification('Введите ФИО', 'error');
        return;
    }
    
    if (!emailInput.value.trim()) {
        showSettingsNotification('Email не может быть пустым', 'error');
        return;
    }
    
    try {
        const userData = {
            email: emailInput.value.trim(),
            name: fullnameInput.value.trim(),
            password: '' // Пароль не меняем
        };
        
        const updatedUser = await userAPI.updateProfile(userData);
        
        // Обновляем данные в localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Обновляем имя в header
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = updatedUser.name;
        }
        
        showSettingsNotification('Профиль успешно сохранен', 'success');
    } catch (error) {
        console.error('Failed to update profile:', error);
        showSettingsNotification('Ошибка сохранения профиля', 'error');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Валидация
    if (!currentPassword || !newPassword || !confirmPassword) {
        showSettingsNotification('Заполните все поля', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showSettingsNotification('Новые пароли не совпадают', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showSettingsNotification('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userData = {
            email: currentUser.email,
            name: currentUser.name,
            password: newPassword
        };
        
        await userAPI.updateProfile(userData);
        
        // Очищаем поля
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        showSettingsNotification('Пароль успешно изменен', 'success');
    } catch (error) {
        console.error('Failed to change password:', error);
        showSettingsNotification('Ошибка изменения пароля', 'error');
    }
}

function showSettingsNotification(message, type) {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Глобальные функции для отладки
window.testSettings = function() {
    console.log('Settings test function');
    return {
        form: document.getElementById('user-fullname') ? 'Form found' : 'Form not found',
        user: localStorage.getItem('currentUser')
    };
};

console.log('Settings module loaded successfully');