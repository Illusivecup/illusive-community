// === Illusive Community Admin Configuration ===
// ШАБЛОН КОНФИГУРАЦИИ - заполните своими данными
// Затем переименуйте файл в admin-config.js

window.ADMIN_CONFIG = {
  // Email главного администратора
  adminEmail: "your-admin-email@example.com",
  
  // Пароль главного администратора (минимум 8 символов)
  adminPassword: "your-secure-password-123",
  
  // Список суперадминов (email адреса)
  superAdmins: [
    "your-admin-email@example.com"
  ],
  
  // Настройки системы
  systemSettings: {
    // Автоматическая очистка старых уведомлений (дней)
    notificationCleanupDays: 30,
    
    // Максимальное количество уведомлений на пользователя
    maxNotificationsPerUser: 50,
    
    // Автоматический бан при нарушении (количество нарушений)
    autoBanThreshold: 3
  },
  
  // Права по умолчанию для новых админов
  defaultAdminPermissions: [
    "moderate",        // Модерация пользователей
    "edit_users",      // Редактирование профилей
    "edit_teams",      // Редактирование команд
    "view_stats",      // Просмотр статистики
    "broadcast"        // Рассылка уведомлений
  ]
};

// ВАЖНО: 
// 1. После заполнения переименуйте файл в admin-config.js
// 2. Никогда не коммитьте реальные пароли в репозиторий!
// 3. Для продакшена используйте GitHub Secrets