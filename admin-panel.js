// === Illusive Community Admin Panel ===
class AdminPanel {
    constructor(mainApp) {
        this.app = mainApp;
        this.adminUsers = {};
        this.isAdmin = false;
        this.currentAdmin = null;
        this.adminConfig = null;
        
        this.init = this.init.bind(this);
        this.adminLogin = this.adminLogin.bind(this);
        this.showAdminPanel = this.showAdminPanel.bind(this);
        this.loadAdminStats = this.loadAdminStats.bind(this);
        this.loadUsersList = this.loadUsersList.bind(this);
        this.loadTeamsList = this.loadTeamsList.bind(this);
        this.loadAdminsList = this.loadAdminsList.bind(this);
        this.loadBannedUsers = this.loadBannedUsers.bind(this);
        this.adminSearchUsers = this.adminSearchUsers.bind(this);
        this.adminSearchTeams = this.adminSearchTeams.bind(this);
        this.banUser = this.banUser.bind(this);
        this.unbanUser = this.unbanUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.deleteTeam = this.deleteTeam.bind(this);
        this.promoteToAdmin = this.promoteToAdmin.bind(this);
        this.demoteAdmin = this.demoteAdmin.bind(this);
        this.editUserProfile = this.editUserProfile.bind(this);
        this.editTeam = this.editTeam.bind(this);
        this.systemBroadcast = this.systemBroadcast.bind(this);
        this.switchAdminTab = this.switchAdminTab.bind(this);
    }

setupAdminEventListeners() {
        // Админ авторизация
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;
                this.adminLogin(email, password);
            });
        }
    const promoteAdminBtn = document.getElementById('promoteAdminBtn');
    if (promoteAdminBtn) {
        promoteAdminBtn.addEventListener('click', () => {
            this.promoteToAdmin();
        });
    }

    const systemBroadcastBtn = document.getElementById('systemBroadcastBtn');
    if (systemBroadcastBtn) {
        systemBroadcastBtn.addEventListener('click', () => {
            this.systemBroadcast();
        });
    }
        // Админ табы
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchAdminTab(tabName);
            });
        });

        // Поиск пользователей
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adminSearchUsers();
                }
            });
        }

        // Поиск команд
        const teamSearch = document.getElementById('teamSearch');
        if (teamSearch) {
            teamSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adminSearchTeams();
                }
            });
        }

        console.log('✅ Admin event listeners setup');
    }
    
setupDynamicEventListeners() {
    // Удаляем старые обработчики чтобы избежать дублирования
    document.removeEventListener('click', this.dynamicClickHandler);
    document.removeEventListener('change', this.dynamicChangeHandler);
    
    // Создаем привязанные обработчики
    this.dynamicClickHandler = this.handleDynamicClick.bind(this);
    this.dynamicChangeHandler = this.handleDynamicChange.bind(this);
    
    // Добавляем новые обработчики
    document.addEventListener('click', this.dynamicClickHandler);
    document.addEventListener('change', this.dynamicChangeHandler);
    
    console.log('✅ Dynamic event listeners setup');
}

// Обработчик кликов для динамических элементов
handleDynamicClick(e) {
    const target = e.target;
    const adminItem = target.closest('.admin-item');
    
    if (!adminItem) return;
    
    // Обработка кнопок редактирования пользователей
    if (target.classList.contains('btn-edit') || target.closest('.btn-edit')) {
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        if (userId) {
            e.preventDefault();
            e.stopPropagation();
            this.editUserProfile(userId);
        }
    }
    
    // Обработка кнопок бана пользователей
    if (target.classList.contains('btn-ban') || target.closest('.btn-ban')) {
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        if (userId) {
            e.preventDefault();
            e.stopPropagation();
            this.banUser(userId);
        }
    }
    
    // Обработка кнопок удаления пользователей
    if (target.classList.contains('btn-delete') || target.closest('.btn-delete')) {
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        if (userId) {
            e.preventDefault();
            e.stopPropagation();
            this.deleteUser(userId);
        }
    }
    
    // Обработка кнопок разбана
    if (target.classList.contains('btn-unban') || target.closest('.btn-unban')) {
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        if (userId) {
            e.preventDefault();
            e.stopPropagation();
            this.unbanUser(userId);
        }
    }
    
    // Обработка кнопок редактирования команд
    if (target.classList.contains('btn-edit-team') || target.closest('.btn-edit-team')) {
        const teamId = target.getAttribute('data-team-id') || target.closest('[data-team-id]')?.getAttribute('data-team-id');
        if (teamId) {
            e.preventDefault();
            e.stopPropagation();
            this.editTeam(teamId);
        }
    }
    
    // Обработка кнопок удаления команд
    if (target.classList.contains('btn-delete-team') || target.closest('.btn-delete-team')) {
        const teamId = target.getAttribute('data-team-id') || target.closest('[data-team-id]')?.getAttribute('data-team-id');
        if (teamId) {
            e.preventDefault();
            e.stopPropagation();
            this.deleteTeam(teamId);
        }
    }
    
    // Обработка кнопок снятия админов
    if (target.classList.contains('btn-demote') || target.closest('.btn-demote')) {
        const adminKey = target.getAttribute('data-admin-key') || target.closest('[data-admin-key]')?.getAttribute('data-admin-key');
        if (adminKey) {
            e.preventDefault();
            e.stopPropagation();
            this.demoteAdmin(adminKey);
        }
    }
    
    // Обработка кнопок изменения позиции игрока в модальном окне
    if (target.classList.contains('admin-position-btn') || target.closest('.admin-position-btn')) {
        const teamId = target.getAttribute('data-team-id') || target.closest('[data-team-id]')?.getAttribute('data-team-id');
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        
        if (teamId && userId) {
            e.preventDefault();
            e.stopPropagation();
            this.changePlayerPositionFromButton(teamId, userId);
        }
    }
    
    // Обработка кнопок изменения роли (капитан/участник)
    if (target.classList.contains('admin-role-btn') || target.closest('.admin-role-btn')) {
        const teamId = target.getAttribute('data-team-id') || target.closest('[data-team-id]')?.getAttribute('data-team-id');
        const userId = target.getAttribute('data-user-id') || target.closest('[data-user-id]')?.getAttribute('data-user-id');
        const newRole = target.getAttribute('data-new-role');
        
        if (teamId && userId && newRole) {
            e.preventDefault();
            e.stopPropagation();
            this.changePlayerRole(teamId, userId, newRole);
        }
    }
    
    // Обработка кнопок сохранения изменений команды
    if (target.classList.contains('admin-save-team-btn') || target.closest('.admin-save-team-btn')) {
        const teamId = target.getAttribute('data-team-id') || target.closest('[data-team-id]')?.getAttribute('data-team-id');
        if (teamId) {
            e.preventDefault();
            e.stopPropagation();
            this.saveTeamChanges(teamId);
        }
    }

// В метод handleDynamicClick добавьте:
if (target.classList.contains('holiday-toggle-btn') || target.closest('.holiday-toggle-btn')) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎄 Holiday toggle button clicked');
    this.toggleHolidayTheme();
}
}

// Обработчик изменений для динамических элементов
handleDynamicChange(e) {
    const target = e.target;
    
    // Обработка изменения позиции через селект в модальном окне
    if (target.classList.contains('admin-position-select') && target.closest('.modal')) {
        const userId = target.getAttribute('data-user-id');
        const teamId = this.getTeamIdFromModal(target);
        
        if (teamId && userId) {
            const newPosition = target.value;
            
            // Автоматически сохраняем при изменении (опционально)
            // Можно раскомментировать если нужно автоматическое сохранение
            // this.changePlayerPosition(teamId, userId, newPosition);
            
            console.log(`🔄 Position changed for user ${userId} in team ${teamId}: ${newPosition}`);
        }
    }
    
    // Обработка поисковых полей
    if (target.id === 'userSearch' || target.id === 'teamSearch') {
        // Автопоиск при вводе (с задержкой)
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (target.id === 'userSearch') {
                this.adminSearchUsers();
            } else if (target.id === 'teamSearch') {
                this.adminSearchTeams();
            }
        }, 500);
    }
}

// Вспомогательный метод для получения teamId из модального окна
getTeamIdFromModal(element) {
    const modal = element.closest('.modal');
    if (!modal) return null;
    
    // Ищем teamId в различных местах модального окна
    const saveButton = modal.querySelector('.admin-save-team-btn');
    if (saveButton) {
        return saveButton.getAttribute('data-team-id');
    }
    
    const roleButtons = modal.querySelectorAll('.admin-role-btn');
    if (roleButtons.length > 0) {
        return roleButtons[0].getAttribute('data-team-id');
    }
    
    const positionButtons = modal.querySelectorAll('.admin-position-btn');
    if (positionButtons.length > 0) {
        return positionButtons[0].getAttribute('data-team-id');
    }
    
    // Пытаемся извлечь из onclick атрибутов
    const buttons = modal.querySelectorAll('[onclick*="saveTeamChanges"]');
    for (const button of buttons) {
        const match = button.getAttribute('onclick')?.match(/saveTeamChanges\('([^']+)'\)/);
        if (match) return match[1];
    }
    
    return null;
}

// Метод для изменения позиции через кнопку
async changePlayerPositionFromButton(teamId, userId) {
    const selectElement = document.querySelector(`.admin-position-select[data-user-id="${userId}"]`);
    if (!selectElement) {
        console.error('❌ Select element not found for user:', userId);
        return;
    }
    
    const newPosition = selectElement.value;
    await this.changePlayerPosition(teamId, userId, newPosition);
}

// Обновим метод loadTeamMembersForAdminEdit для использования новых классов
async loadTeamMembersForAdminEdit(teamId, team) {
    const membersList = document.getElementById('adminTeamMembersList');
    
    let membersHTML = '';
    
    for (const [userId, memberData] of Object.entries(team.members || {})) {
        // Получаем информацию об игроке
        const userSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`)
        );
        
        const user = userSnapshot.exists() ? userSnapshot.val() : { nickname: 'Неизвестно' };
        const isCaptain = memberData.role === 'captain';
        
        membersHTML += `
            <div class="team-member-edit" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: var(--radius-medium);">
                <div class="member-edit-info">
                    <h4>${user.nickname || user.username || 'Неизвестно'} ${isCaptain ? '👑' : ''}</h4>
                    <p>ID: ${userId} | MMR: ${memberData.mmr || 0} | Роль: ${isCaptain ? 'Капитан' : 'Участник'}</p>
                    <p>Текущая позиция: ${memberData.position ? this.app.getPositionName(memberData.position) : 'Не указана'}</p>
                </div>
                <div class="member-edit-actions">
                    <div class="form-group">
                        <label>Новая позиция:</label>
                        <select class="form-input admin-position-select" data-user-id="${userId}" style="margin-bottom: 10px;">
                            <option value="">Не указана</option>
                            <option value="carry" ${memberData.position === 'carry' ? 'selected' : ''}>Керри</option>
                            <option value="mid" ${memberData.position === 'mid' ? 'selected' : ''}>Мидер</option>
                            <option value="offlane" ${memberData.position === 'offlane' ? 'selected' : ''}>Оффлейнер</option>
                            <option value="support4" ${memberData.position === 'support4' ? 'selected' : ''}>Саппорт 4</option>
                            <option value="support5" ${memberData.position === 'support5' ? 'selected' : ''}>Саппорт 5</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="add-btn admin-position-btn" 
                                data-team-id="${teamId}" 
                                data-user-id="${userId}">
                            💾 Сохранить позицию
                        </button>
                        ${!isCaptain ? `
                            <button class="save-btn admin-role-btn" 
                                    data-team-id="${teamId}" 
                                    data-user-id="${userId}"
                                    data-new-role="captain">
                                👑 Сделать капитаном
                            </button>
                        ` : `
                            <button class="cancel-btn admin-role-btn" 
                                    data-team-id="${teamId}" 
                                    data-user-id="${userId}"
                                    data-new-role="member">
                                👤 Сделать участником
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    if (membersHTML === '') {
        membersHTML = '<div class="no-data">Нет участников в команде</div>';
    }
    
    membersList.innerHTML = membersHTML;
}

// Обновим HTML для кнопки сохранения команды
async editTeam(teamId) {
    if (!this.checkPermissions('edit_teams')) return;
    
    const teamSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`));
    if (!teamSnapshot.exists()) {
        alert('❌ Команда не найдена');
        return;
    }
    
    const team = teamSnapshot.val();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>⚙️ Редактирование команды: ${team.name}</h2>
                <button class="close-modal" onclick="closeAdminModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="adminTeamName">Название команды:</label>
                    <input type="text" id="adminTeamName" class="form-input" value="${team.name}">
                </div>
                
                <div class="form-group">
                    <label for="adminTeamSlogan">Слоган:</label>
                    <input type="text" id="adminTeamSlogan" class="form-input" value="${team.slogan || ''}">
                </div>
                
                <h3 style="color: var(--accent-primary); margin: 25px 0 15px 0;">👥 Управление позициями игроков</h3>
                <div id="adminTeamMembersList">
                    <!-- Список игроков с выбором позиций -->
                </div>
                
                <div class="form-actions" style="margin-top: 25px;">
                    <button class="save-btn" onclick="saveTeamChanges('${teamId}')">💾 Сохранить изменения команды</button>
                    <button class="cancel-btn" onclick="closeAdminModal()">❌ Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    await this.loadTeamMembersForAdminEdit(teamId, team);
}

// УДАЛИТЬ(ОБНОВЛЕНИЕ НОВЫЙ ГОД до фуекции инит):
async toggleGlobalHolidayTheme() {
    if (!this.checkPermissions('system')) return;
    
    try {
        // Получаем текущее состояние
        const themeRef = firebase.database().ref('systemSettings/holidayThemeEnabled');
        const snapshot = await themeRef.get();
        const currentState = snapshot.exists() ? snapshot.val() : false;
        const newState = !currentState;
        
        // Сохраняем в Firebase
        await themeRef.set(newState);
        
        alert(newState ? 
            '🎄 Новогодняя тема ВКЛЮЧЕНА для всех пользователей!' : 
            '❄️ Новогодняя тема ВЫКЛЮЧЕНА для всех пользователей!'
        );
        
    } catch (error) {
        console.error('❌ Error toggling global theme:', error);
        alert('❌ Ошибка переключения глобальной темы');
    }
}

// Добавьте этот метод в класс AdminPanel
async toggleHolidayTheme() {
    if (!this.checkPermissions('system')) return;
    
    try {
        console.log('🎄 Toggling global holiday theme...');
        
        // Получаем текущее состояние из Firebase
        const themeRef = firebase.database().ref('systemSettings/holidayThemeEnabled');
        const snapshot = await themeRef.get();
        const currentState = snapshot.exists() ? snapshot.val() : false;
        const newState = !currentState;
        
        // Сохраняем новое состояние в Firebase
        await themeRef.set(newState);
        
        // Обновляем статус в UI
        this.updateHolidayThemeStatus(newState);
        
        alert(newState ? 
            '🎄 Новогодняя тема ВКЛЮЧЕНА для всех пользователей!' : 
            '❄️ Новогодняя тема ВЫКЛЮЧЕНА для всех пользователей!'
        );
        
        console.log('🎄 Theme toggled successfully:', newState);
        
    } catch (error) {
        console.error('❌ Error toggling global theme:', error);
        alert('❌ Ошибка переключения глобальной темы: ' + error.message);
    }
}

// Добавьте вспомогательный метод для обновления статуса
updateHolidayThemeStatus(isEnabled) {
    const statusElement = document.getElementById('holidayThemeStatus');
    const button = document.querySelector('.holiday-toggle-btn');
    
    if (statusElement) {
        statusElement.textContent = isEnabled ? '✅ ВКЛЮЧЕНО ДЛЯ ВСЕХ' : '❌ ВЫКЛЮЧЕНО';
        statusElement.style.color = isEnabled ? 'var(--accent-success)' : 'var(--accent-danger)';
    }
    
    if (button) {
        button.textContent = isEnabled ? '🎄 Выключить для всех' : '🎄 Включить для всех';
    }
}

// В метод switchAdminTab добавьте кнопку в системную вкладку:
loadSystemControls() {
    const systemTab = document.getElementById('systemTab');
    if (!systemTab) {
        console.error('❌ systemTab not found');
        return;
    }
    
    console.log('🔄 Loading system controls...');
    
    // Удаляем старые контролы если есть
    const oldControls = systemTab.querySelector('.holiday-controls');
    if (oldControls) oldControls.remove();
    
    // Получаем текущий статус темы
    const isEnabled = window.holidayTheme ? window.holidayTheme.isEnabled : false;
    
    const holidayControls = `
        <div class="holiday-controls" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: var(--radius-medium);">
            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🎄 Глобальное управление темой</h3>
            <div class="admin-item">
                <div class="admin-item-info">
                    <h4 style="color: gold;">Новогоднее чудо</h4>
                    <p>Праздничное оформление для всех пользователей сайта</p>
                    <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 5px;">
                        <strong>Статус:</strong> 
                        <span id="holidayThemeStatus" style="color: ${isEnabled ? 'var(--accent-success)' : 'var(--accent-danger)'};">
                            ${isEnabled ? '✅ ВКЛЮЧЕНО ДЛЯ ВСЕХ' : '❌ ВЫКЛЮЧЕНО'}
                        </span>
                    </p>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-action-btn holiday-toggle-btn" 
                            data-action="toggle-global-holiday-theme"
                            style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; border: none; padding: 10px 15px;">
                        🎄 ${isEnabled ? 'Выключить для всех' : 'Включить для всех'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    systemTab.insertAdjacentHTML('afterbegin', holidayControls);
    console.log('✅ Holiday controls added to system tab');
}

async init() {
    try {
        // Загружаем конфигурацию админа
        if (typeof ADMIN_CONFIG !== 'undefined') {
            this.adminConfig = ADMIN_CONFIG;
            console.log('✅ Admin config loaded');
        } else {
            console.error('❌ Admin config not found');
            // Создаем временный конфиг для разработки
            this.adminConfig = {
                adminEmail: "dev@illusive.local",
                adminPassword: "DevPassword123!",
                superAdmins: ["dev@illusive.local"],
                systemSettings: {
                    notificationCleanupDays: 30,
                    maxNotificationsPerUser: 50,
                    autoBanThreshold: 3,
                    testMode: true,
                    debugLogs: true
                },
                defaultAdminPermissions: [
                    "moderate", "edit_users", "edit_teams", "view_stats", "broadcast"
                ]
            };
            console.warn('⚠️ Using fallback admin config for development');
        }
        
        // Загружаем список админов из Firebase
        await this.loadAdminUsers();
        this.setupAdminEventListeners();
        this.setupDynamicEventListeners();
        
        // Делаем админ-панель доступной глобально
        window.adminPanel = this;
        
        console.log('✅ Admin panel initialized and available globally');
    } catch (error) {
        console.error('❌ Admin panel init error:', error);
    }
}

async loadAdminUsers() {
    try {
        console.log('🔄 Loading admin users...');
        
        // Сначала пробуем загрузить из Firebase
        const snapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, 'adminUsers')
        );
        
        if (snapshot.exists()) {
            this.adminUsers = snapshot.val();
            console.log('✅ Admin users loaded from Firebase:', Object.keys(this.adminUsers).length);
        } else {
            console.log('📝 No admin users found, creating initial admin...');
            await this.createSuperAdmin();
        }
        
    } catch (error) {
        console.error('❌ Error loading admin users:', error);
        
        // Создаем локального админа при ошибке
        await this.createSuperAdmin();
    }
}

async createSuperAdmin() {
    try {
        const adminData = {
            email: this.adminConfig.adminEmail,
            isSuperAdmin: true,
            permissions: ['all'],
            createdAt: Date.now(),
            createdBy: 'system'
        };
        
        const adminKey = this.adminConfig.adminEmail.replace(/[.#$[\]]/g, '_');
        
        // Пытаемся сохранить в Firebase
        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `adminUsers/${adminKey}`), 
            adminData
        );
        
        // Сохраняем локально
        this.adminUsers[adminKey] = adminData;
        
        console.log('✅ Super admin created');
        
    } catch (error) {
        console.error('❌ Error creating super admin in Firebase:', error);
        
        // Все равно создаем локально
        const adminKey = this.adminConfig.adminEmail.replace(/[.#$[\]]/g, '_');
        this.adminUsers[adminKey] = {
            email: this.adminConfig.adminEmail,
            isSuperAdmin: true,
            permissions: ['all'],
            createdAt: Date.now(),
            createdBy: 'system'
        };
        console.log('✅ Super admin created locally');
    }
}

createFallbackAdminStructure() {
    console.warn('⚠️ Using fallback admin structure');
    this.adminUsers = {
        'fallback_admin': {
            email: this.adminConfig.adminEmail,
            isSuperAdmin: true,
            permissions: ['all'],
            createdAt: Date.now(),
            createdBy: 'system'
        }
    };
}

createFallbackAdminStructure() {
    console.warn('⚠️ Using fallback admin structure');
    this.adminUsers = {
        'fallback_admin': {
            email: this.adminConfig.adminEmail,
            isSuperAdmin: true,
            permissions: ['all'],
            createdAt: Date.now(),
            createdBy: 'system'
        }
    };
}

    async createSuperAdmin() {
        if (!this.adminConfig) return;
        
        try {
            const adminData = {
                email: this.adminConfig.adminEmail,
                isSuperAdmin: true,
                permissions: ['all'],
                createdAt: Date.now(),
                createdBy: 'system'
            };
            
            const adminKey = this.adminConfig.adminEmail.replace(/[.#$[\]]/g, '_');
            await this.app.firebase.set(this.app.firebase.ref(this.app.firebase.database, `adminUsers/${adminKey}`), adminData);
            this.adminUsers[adminKey] = adminData;
            
            console.log('✅ Super admin created');
        } catch (error) {
            console.error('❌ Error creating super admin:', error);
        }
    }

    async adminLogin(email, password) {
        if (!this.adminConfig) {
            alert('❌ Админ система не настроена');
            return;
        }

        // Проверяем суперадмина
        if (email === this.adminConfig.adminEmail && password === this.adminConfig.adminPassword) {
            this.isAdmin = true;
            this.currentAdmin = {
                email: email,
                isSuperAdmin: true,
                permissions: ['all']
            };
            this.showAdminPanel();
            alert('✅ Вход в админ-панель успешен!');
            return;
        }

        // Проверяем админов из базы
        const adminKey = email.replace(/[.#$[\]]/g, '_');
        const adminUser = this.adminUsers[adminKey];
        
        if (adminUser && adminUser.password === password) {
            this.isAdmin = true;
            this.currentAdmin = { ...adminUser, email: email };
            this.showAdminPanel();
            alert('✅ Вход в админ-панель успешен!');
            return;
        }

        alert('❌ Неверные админ данные');
    }

    showAdminPanel() {
        document.getElementById('adminAuth').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        this.loadAdminStats();
        this.loadUsersList();
        this.loadAdminsList();
        this.loadBannedUsers();
    }

    hideAdminPanel() {
        this.isAdmin = false;
        this.currentAdmin = null;
        document.getElementById('adminAuth').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
    }

    switchAdminTab(tabName) {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');

        // Загружаем данные для вкладки
        switch(tabName) {
            case 'users':
                this.loadUsersList();
                break;
            case 'teams':
                this.loadTeamsList();
                break;
            case 'moderation':
                this.loadBannedUsers();
                break;
            case 'system':
                this.loadAdminsList();
                this.loadSystemControls(); // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ
                break;
        }
    }

    async loadAdminStats() {
        try {
            const usersSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'users'));
            const teamsSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'teams'));
            
            document.getElementById('totalUsers').textContent = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
            document.getElementById('totalTeams').textContent = teamsSnapshot.exists() ? Object.keys(teamsSnapshot.val()).length : 0;
            
            let activeNotifications = 0;
            if (usersSnapshot.exists()) {
                const users = usersSnapshot.val();
                for (const userId in users) {
                    const notifSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, `notifications/${userId}`));
                    if (notifSnapshot.exists()) {
                        const notifications = notifSnapshot.val();
                        activeNotifications += Object.values(notifications).filter(notif => !notif.read).length;
                    }
                }
            }
            document.getElementById('activeNotifications').textContent = activeNotifications;
        } catch (error) {
            console.error('❌ Error loading admin stats:', error);
        }
    }

    async loadUsersList(searchTerm = '') {
        try {
            const snapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'users'));
            const usersList = document.getElementById('usersList');
            
            if (!snapshot.exists()) {
                usersList.innerHTML = '<div class="no-data">Нет пользователей</div>';
                return;
            }
            
            let usersHTML = '';
            const users = snapshot.val();
            let userCount = 0;
            
            for (const [userId, user] of Object.entries(users)) {
                // Фильтрация по поисковому запросу
                if (searchTerm && 
                    !user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !user.username?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !user.telegram?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    continue;
                }
                
                userCount++;
                const isOnline = user.lastOnline && (Date.now() - user.lastOnline < 300000);
                const isBanned = user.isBanned || false;
                
                usersHTML += `
                    <div class="admin-item">
                        <div class="admin-item-info">
                            <h4>${user.nickname || user.username || 'Без имени'}</h4>
                            <p>Email: ${user.username || 'Не указан'} | ID: ${userId}</p>
                            <p>MMR: ${user.mmr || 0} | Позиция: ${this.app.getPositionName(user.position)}</p>
                            <p>Telegram: ${user.telegram || 'Не указан'} | Статус: 
                                <span class="status-dot ${isOnline ? 'status-online' : 'status-offline'}"></span>
                                ${isOnline ? 'Онлайн' : 'Оффлайн'}
                                ${isBanned ? ' | 🚫 Забанен' : ''}
                            </p>
                        </div>
                        <div class="admin-item-actions">
                            <button class="admin-action-btn btn-edit" data-user-id="${userId}">✏️</button>
                            ${!isBanned ? 
                                `<button class="admin-action-btn btn-ban" data-user-id="${userId}">🚫</button>` :
                                `<button class="admin-action-btn btn-unban" data-user-id="${userId}">✅</button>`
                            }
                           <button class="admin-action-btn btn-delete" data-user-id="${userId}">🗑️</button>
                        </div>
                    </div>
                `;
            }
            
            if (userCount === 0) {
                usersHTML = '<div class="no-data">Пользователи не найдены</div>';
            }
            
            usersList.innerHTML = usersHTML;
        } catch (error) {
            console.error('❌ Error loading users list:', error);
            document.getElementById('usersList').innerHTML = '<div class="no-data">Ошибка загрузки</div>';
        }
    }

    async loadTeamsList(searchTerm = '') {
        try {
            const snapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'teams'));
            const teamsList = document.getElementById('teamsList');
            
            if (!snapshot.exists()) {
                teamsList.innerHTML = '<div class="no-data">Нет команд</div>';
                return;
            }
            
            let teamsHTML = '';
            const teams = snapshot.val();
            let teamCount = 0;
            
            for (const [teamId, team] of Object.entries(teams)) {
                if (searchTerm && 
                    !team.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !team.slogan?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    continue;
                }
                
                teamCount++;
                const memberCount = Object.keys(team.members || {}).length;
                
                teamsHTML += `
                    <div class="admin-item">
                        <div class="admin-item-info">
                            <h4>${team.name}</h4>
                            <p>Слоган: ${team.slogan || 'Без слогана'} | ID: ${teamId}</p>
                            <p>Участников: ${memberCount}/5 | MMR: ${team.averageMMR || 0}</p>
                            <p>Капитан: ${team.captain} | Создана: ${new Date(team.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div class="admin-item-actions">
                            <button class="admin-action-btn btn-edit-team" data-team-id="${teamId}">✏️</button>
                            <button class="admin-action-btn btn-delete-team" data-team-id="${teamId}">🗑️</button>
                        </div>
                    </div>
                `;
            }
            
            if (teamCount === 0) {
                teamsHTML = '<div class="no-data">Команды не найдены</div>';
            }
            
            teamsList.innerHTML = teamsHTML;
        } catch (error) {
            console.error('❌ Error loading teams list:', error);
            document.getElementById('teamsList').innerHTML = '<div class="no-data">Ошибка загрузки</div>';
        }
    }

    async loadAdminsList() {
        try {
            const adminsList = document.getElementById('adminsList');
            let adminsHTML = '';
            let adminCount = 0;
            
            for (const [adminKey, admin] of Object.entries(this.adminUsers)) {
                adminCount++;
                adminsHTML += `
                    <div class="admin-item">
                        <div class="admin-item-info">
                            <h4>${admin.email}</h4>
                            <p>Тип: ${admin.isSuperAdmin ? '👑 Суперадмин' : '👤 Админ'}</p>
                            <p>Создан: ${new Date(admin.createdAt).toLocaleDateString()}</p>
                            <p>Права: ${admin.permissions?.join(', ') || 'all'}</p>
                        </div>
                        <div class="admin-item-actions">
                            ${!admin.isSuperAdmin ? 
                                `<button class="admin-action-btn btn-demote" data-admin-key="${adminKey}">👤 Снять</button>` :
                                '<span class="admin-action-btn" style="background: var(--text-secondary); cursor: default;">👑 Системный</span>'
                            }
                        </div>
                    </div>
                `;
            }
            
            if (adminCount === 0) {
                adminsHTML = '<div class="no-data">Нет администраторов</div>';
            }
            
            adminsList.innerHTML = adminsHTML;
        } catch (error) {
            console.error('❌ Error loading admins list:', error);
        }
    }

    async loadBannedUsers() {
        try {
            const snapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'users'));
            const bannedList = document.getElementById('bannedUsersList');
            
            if (!snapshot.exists()) {
                bannedList.innerHTML = '<div class="no-data">Нет пользователей</div>';
                return;
            }
            
            let bannedHTML = '';
            const users = snapshot.val();
            let bannedCount = 0;
            
            for (const [userId, user] of Object.entries(users)) {
                if (user.isBanned) {
                    bannedCount++;
                    bannedHTML += `
                        <div class="admin-item">
                            <div class="admin-item-info">
                                <h4>${user.nickname || user.username || 'Без имени'}</h4>
                                <p>ID: ${userId} | Email: ${user.username || 'Не указан'}</p>
                                <p>Причина бана: ${user.banReason || 'Не указана'}</p>
                                <p>Забанен: ${user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : 'Неизвестно'}</p>
                            </div>
                            <div class="admin-item-actions">
                                <button class="admin-action-btn btn-unban" data-user-id="${userId}">✅ Разбанить</button>
                            </div>
                        </div>
                    `;
                }
            }
            
            if (bannedCount === 0) {
                bannedHTML = '<div class="no-data">Нет забаненных пользователей</div>';
            }
            
            bannedList.innerHTML = bannedHTML;
        } catch (error) {
            console.error('❌ Error loading banned users:', error);
        }
    }

    // === АДМИН МЕТОДЫ ===

    adminSearchUsers() {
        const searchTerm = document.getElementById('userSearch').value.trim();
        this.loadUsersList(searchTerm);
    }

    adminSearchTeams() {
        const searchTerm = document.getElementById('teamSearch').value.trim();
        this.loadTeamsList(searchTerm);
    }

async banUser(userId) {
    if (!this.checkPermissions('moderate')) return;
    
    const reason = prompt('Введите причину бана:');
    if (!reason) return;
    
    try {
        // 1. Получаем информацию о пользователе перед баном
        const userSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`)
        );
        
        if (!userSnapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = userSnapshot.val();
        const userTeamId = user.teamId;
        
        // 2. Баним пользователя
        await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
            isBanned: true,
            banReason: reason,
            bannedAt: Date.now(),
            bannedBy: this.currentAdmin.email,
            // Сохраняем оригинальные данные для возможного восстановления
            originalMMR: user.mmr || 0,
            originalPosition: user.position || '',
            bannedFromTeam: userTeamId || null
        });
        
        // 3. Удаляем из команды (если есть)
        if (userTeamId) {
            await this.removeUserFromTeam(userId, userTeamId);
        }
        
        // 4. Удаляем из лидербордов (обнуляем MMR)
        await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
            mmr: 0,
            position: ''
        });
        
        // 5. Удаляем все активные заявки пользователя
        await this.removeUserApplications(userId);
        
        // 6. Отправляем уведомление пользователю
        await this.sendBanNotification(userId, reason);
        
        alert('✅ Пользователь забанен и удален из всех систем');
        this.loadUsersList();
        this.loadBannedUsers();
        
    } catch (error) {
        console.error('❌ Error banning user:', error);
        alert('❌ Ошибка бана пользователя');
    }
}

async removeUserFromTeam(userId, teamId) {
    try {
        console.log(`🔄 Removing user ${userId} from team ${teamId}`);
        
        // Получаем информацию о команде
        const teamSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`)
        );
        
        if (!teamSnapshot.exists()) {
            console.log('❌ Team not found');
            return;
        }
        
        const team = teamSnapshot.val();
        
        // Удаляем пользователя из состава команды
        const updatedMembers = { ...team.members };
        delete updatedMembers[userId];
        
        // Пересчитываем средний MMR
        const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
        
        // Обновляем команду
        await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`), {
            members: updatedMembers,
            averageMMR: newAverageMMR,
            updatedAt: Date.now()
        });
        
        // Отправляем уведомление капитану
        await this.sendTeamNotification(teamId, userId, 'banned');
        
        console.log(`✅ User removed from team ${teamId}`);
        
    } catch (error) {
        console.error(`❌ Error removing user from team:`, error);
    }
}

async removeUserApplications(userId) {
    try {
        console.log(`🔄 Removing applications for user ${userId}`);
        
        // Получаем все команды
        const teamsSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, 'teams')
        );
        
        if (!teamsSnapshot.exists()) return;
        
        const teams = teamsSnapshot.val();
        
        // Для каждой команды проверяем заявки
        for (const [teamId, team] of Object.entries(teams)) {
            const applicationsSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, `teamApplications/${teamId}`)
            );
            
            if (applicationsSnapshot.exists()) {
                const applications = applicationsSnapshot.val();
                let hasChanges = false;
                
                // Удаляем заявки забаненного пользователя
                for (const [appId, application] of Object.entries(applications)) {
                    if (application.userId === userId && !application.responded) {
                        await this.app.firebase.remove(
                            this.app.firebase.ref(this.app.firebase.database, `teamApplications/${teamId}/${appId}`)
                        );
                        hasChanges = true;
                    }
                }
                
                if (hasChanges) {
                    console.log(`✅ Removed applications from team ${teamId}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error removing user applications:', error);
    }
}

async sendBanNotification(userId, reason) {
    try {
        const notificationId = `system_ban_${Date.now()}`;
        const notificationData = {
            type: 'system_ban',
            message: `Вы были забанены. Причина: ${reason}. Вы удалены из всех команд и лидербордов.`,
            timestamp: Date.now(),
            read: false,
            from: 'Система модерации'
        };
        
        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${userId}/${notificationId}`),
            notificationData
        );
        
        console.log(`✅ Ban notification sent to user ${userId}`);
        
    } catch (error) {
        console.error('❌ Error sending ban notification:', error);
    }
}

async sendTeamNotification(teamId, bannedUserId, action) {
    try {
        const teamSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`)
        );
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        const bannedUserSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${bannedUserId}`)
        );
        
        if (!bannedUserSnapshot.exists()) return;
        
        const bannedUser = bannedUserSnapshot.val();
        
        const notificationId = `team_ban_${Date.now()}`;
        const notificationData = {
            type: 'team_member_banned',
            message: `Игрок ${bannedUser.nickname || bannedUser.username} был забанен и автоматически удален из вашей команды.`,
            timestamp: Date.now(),
            read: false,
            from: 'Система модерации'
        };
        
        // Отправляем уведомление капитану
        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${team.captain}/${notificationId}`),
            notificationData
        );
        
    } catch (error) {
        console.error('❌ Error sending team notification:', error);
    }
}

// Вспомогательный метод для расчета MMR (если его нет в admin-panel.js)
async calculateTeamAverageMMR(members) {
    let totalMMR = 0;
    let memberCount = 0;
    
    for (const [memberId, memberData] of Object.entries(members)) {
        if (memberData.mmr) {
            totalMMR += parseInt(memberData.mmr);
            memberCount++;
        }
    }
    
    return memberCount > 0 ? Math.round(totalMMR / memberCount) : 0;
}

async unbanUser(userId) {
    if (!this.checkPermissions('moderate')) return;
    
    try {
        // Получаем данные пользователя перед разбаном
        const userSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`)
        );
        
        if (!userSnapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = userSnapshot.val();
        
        // Восстанавливаем пользователя
        await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
            isBanned: false,
            banReason: null,
            bannedAt: null,
            bannedBy: null,
            // Восстанавливаем MMR и позицию если были сохранены
            mmr: user.originalMMR || user.mmr || 0,
            position: user.originalPosition || user.position || '',
            // Очищаем временные поля
            originalMMR: null,
            originalPosition: null,
            bannedFromTeam: null
        });
        
        // Отправляем уведомление о разбане
        await this.sendUnbanNotification(userId);
        
        alert('✅ Пользователь разбанен! MMR и позиция восстановлены.');
        this.loadUsersList();
        this.loadBannedUsers();
        
    } catch (error) {
        console.error('❌ Error unbanning user:', error);
        alert('❌ Ошибка разбана пользователя');
    }
}

async sendUnbanNotification(userId) {
    try {
        const notificationId = `system_unban_${Date.now()}`;
        const notificationData = {
            type: 'system_unban',
            message: 'Вы были разбанены. Ваш MMR и позиция восстановлены. Можете снова участвовать в рейтингах и командах.',
            timestamp: Date.now(),
            read: false,
            from: 'Система модерации'
        };
        
        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${userId}/${notificationId}`),
            notificationData
        );
        
    } catch (error) {
        console.error('❌ Error sending unban notification:', error);
    }
}

    async deleteUser(userId) {
        if (!this.checkPermissions('delete_users')) return;
        
        if (!confirm('❌ Вы уверены, что хотите удалить этого пользователя? Это действие необратимо!')) {
            return;
        }
        
        try {
            // Удаляем пользователя из всех команд
            const teamsSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'teams'));
            if (teamsSnapshot.exists()) {
                const teams = teamsSnapshot.val();
                for (const [teamId, team] of Object.entries(teams)) {
                    if (team.members && team.members[userId]) {
                        const updatedMembers = { ...team.members };
                        delete updatedMembers[userId];
                        
                        await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`), {
                            members: updatedMembers
                        });
                    }
                }
            }
            
            // Удаляем пользователя
            await this.app.firebase.remove(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`));
            
            alert('✅ Пользователь удален');
            this.loadUsersList();
            this.loadAdminStats();
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            alert('❌ Ошибка удаления пользователя');
        }
    }

    async deleteTeam(teamId) {
        if (!this.checkPermissions('delete_teams')) return;
        
        if (!confirm('❌ Вы уверены, что хотите удалить эту команду? Это действие необратимо!')) {
            return;
        }
        
        try {
            // Убираем teamId у всех участников
            const teamSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`));
            if (teamSnapshot.exists()) {
                const team = teamSnapshot.val();
                for (const memberId of Object.keys(team.members || {})) {
                    await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${memberId}`), {
                        teamId: null
                    });
                }
            }
            
            // Удаляем команду и заявки
            await this.app.firebase.remove(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`));
            await this.app.firebase.remove(this.app.firebase.ref(this.app.firebase.database, `teamApplications/${teamId}`));
            
            alert('✅ Команда удалена');
            this.loadTeamsList();
            this.loadAdminStats();
        } catch (error) {
            console.error('❌ Error deleting team:', error);
            alert('❌ Ошибка удаления команды');
        }
    }

    async promoteToAdmin() {
        if (!this.checkPermissions('manage_admins')) return;
        
        const email = prompt('Введите email нового админа:');
        if (!email) return;
        
        const password = prompt('Введите пароль для нового админа:');
        if (!password) return;
        
        try {
            const adminKey = email.replace(/[.#$[\]]/g, '_');
            const adminData = {
                email: email,
                password: password,
                isSuperAdmin: false,
                permissions: ['moderate', 'edit_users', 'edit_teams'],
                createdAt: Date.now(),
                createdBy: this.currentAdmin.email
            };
            
            await this.app.firebase.set(this.app.firebase.ref(this.app.firebase.database, `adminUsers/${adminKey}`), adminData);
            this.adminUsers[adminKey] = adminData;
            
            alert('✅ Новый админ назначен');
            this.loadAdminsList();
        } catch (error) {
            console.error('❌ Error promoting to admin:', error);
            alert('❌ Ошибка назначения админа');
        }
    }

    async demoteAdmin(adminKey) {
        if (!this.checkPermissions('manage_admins')) return;
        
        if (!confirm('Вы уверены, что хотите снять этого админа?')) {
            return;
        }
        
        try {
            await this.app.firebase.remove(this.app.firebase.ref(this.app.firebase.database, `adminUsers/${adminKey}`));
            delete this.adminUsers[adminKey];
            
            alert('✅ Админ снят');
            this.loadAdminsList();
        } catch (error) {
            console.error('❌ Error demoting admin:', error);
            alert('❌ Ошибка снятия админа');
        }
    }

    // Добавим в класс AdminPanel
async changePlayerPosition(teamId, userId, newPosition) {
    if (!this.checkPermissions('edit_teams')) return;
    
    try {
        // Получаем информацию о команде
        const teamSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`)
        );
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        // Проверяем, что пользователь есть в команде
        if (!team.members || !team.members[userId]) {
            alert('❌ Игрок не найден в команде');
            return;
        }
        
        // Получаем информацию об игроке
        const userSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`)
        );
        
        if (!userSnapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = userSnapshot.val();
        const oldPosition = team.members[userId].position;
        
        // Проверяем, не занята ли уже эта позиция в команде
        if (newPosition && newPosition !== '') {
            const isPositionTaken = Object.values(team.members).some(member => 
                member.position === newPosition && member.position !== ''
            );
            
            if (isPositionTaken) {
                alert(`❌ Позиция "${this.app.getPositionName(newPosition)}" уже занята в команде`);
                return;
            }
        }
        
        // Обновляем позицию игрока в команде
        await this.app.firebase.update(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}/members/${userId}`),
            { position: newPosition }
        );
        
        // Обновляем позицию в профиле пользователя
        await this.app.firebase.update(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`),
            { position: newPosition }
        );
        
        // Отправляем уведомление игроку
        await this.sendPositionChangeNotification(userId, teamId, newPosition, oldPosition);
        
        // Создаем новость о смене позиции
        await this.createPositionChangeNews(userId, teamId, newPosition, oldPosition);
        
        const oldPosName = oldPosition ? this.app.getPositionName(oldPosition) : 'не указана';
        const newPosName = newPosition ? this.app.getPositionName(newPosition) : 'не указана';
        
        alert(`✅ Позиция игрока изменена: ${oldPosName} → ${newPosName}`);
        this.loadTeamsList();
        
    } catch (error) {
        console.error('❌ Error changing player position:', error);
        alert('❌ Ошибка изменения позиции игрока');
    }
}

// Метод для отправки уведомления о смене позиции
async sendPositionChangeNotification(userId, teamId, newPosition, oldPosition) {
    try {
        const teamSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`)
        );
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        
        const oldPosName = oldPosition ? this.app.getPositionName(oldPosition) : 'не указана';
        const newPosName = newPosition ? this.app.getPositionName(newPosition) : 'не указана';
        
        const notificationId = `position_change_${Date.now()}`;
        const notificationData = {
            type: 'position_changed',
            message: `В команде "${team.name}" ваша позиция изменена: ${oldPosName} → ${newPosName}`,
            teamId: teamId,
            teamName: team.name,
            oldPosition: oldPosition,
            newPosition: newPosition,
            timestamp: Date.now(),
            read: false,
            from: 'Система администрирования'
        };
        
        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${userId}/${notificationId}`),
            notificationData
        );
        
    } catch (error) {
        console.error('❌ Error sending position change notification:', error);
    }
}

// Метод для создания новости о смене позиции
async createPositionChangeNews(userId, teamId, newPosition, oldPosition) {
    try {
        const [user, team] = await Promise.all([
            this.app.getUserProfile(userId),
            this.app.getTeamInfo(teamId)
        ]);
        
        if (user && team) {
            const oldPosName = oldPosition ? this.app.getPositionName(oldPosition) : 'не указана';
            const newPosName = newPosition ? this.app.getPositionName(newPosition) : 'не указана';
            
            await this.app.createNews('team-change', {
                playerName: user.nickname || user.username,
                playerId: userId,
                teamName: team.name,
                teamId: teamId,
                message: `В команде "${team.name}" игрок ${user.nickname} сменил позицию: ${oldPosName} → ${newPosName}`
            });
        }
    } catch (error) {
        console.error('❌ Error creating position change news:', error);
    }
}

    async editUserProfile(userId) {
        if (!this.checkPermissions('edit_users')) return;
        
        // Здесь можно реализовать модальное окно для редактирования профиля
        const newNickname = prompt('Новый никнейм:', '');
        if (newNickname === null) return;
        
        const newMMR = prompt('Новый MMR:', '0');
        if (newMMR === null) return;
        
        try {
            await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
                nickname: newNickname,
                mmr: parseInt(newMMR) || 0,
                updatedAt: Date.now()
            });
            
            alert('✅ Профиль обновлен');
            this.loadUsersList();
        } catch (error) {
            console.error('❌ Error editing user:', error);
            alert('❌ Ошибка редактирования профиля');
        }
    }



// Метод для загрузки списка игроков с выбором позиций
async loadTeamMembersForAdminEdit(teamId, team) {
    const membersList = document.getElementById('adminTeamMembersList');
    
    let membersHTML = '';
    
    for (const [userId, memberData] of Object.entries(team.members || {})) {
        // Получаем информацию об игроке
        const userSnapshot = await this.app.firebase.get(
            this.app.firebase.ref(this.app.firebase.database, `users/${userId}`)
        );
        
        const user = userSnapshot.exists() ? userSnapshot.val() : { nickname: 'Неизвестно' };
        const isCaptain = memberData.role === 'captain';
        
        membersHTML += `
            <div class="team-member-edit" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: var(--radius-medium);">
                <div class="member-edit-info">
                    <h4>${user.nickname || user.username || 'Неизвестно'} ${isCaptain ? '👑' : ''}</h4>
                    <p>ID: ${userId} | MMR: ${memberData.mmr || 0} | Роль: ${isCaptain ? 'Капитан' : 'Участник'}</p>
                    <p>Текущая позиция: ${memberData.position ? this.app.getPositionName(memberData.position) : 'Не указана'}</p>
                </div>
                <div class="member-edit-actions">
                    <div class="form-group">
                        <label>Новая позиция:</label>
                        <select class="form-input admin-position-select" data-user-id="${userId}" style="margin-bottom: 10px;">
                            <option value="">Не указана</option>
                            <option value="carry" ${memberData.position === 'carry' ? 'selected' : ''}>Керри</option>
                            <option value="mid" ${memberData.position === 'mid' ? 'selected' : ''}>Мидер</option>
                            <option value="offlane" ${memberData.position === 'offlane' ? 'selected' : ''}>Оффлейнер</option>
                            <option value="support4" ${memberData.position === 'support4' ? 'selected' : ''}>Саппорт 4</option>
                            <option value="support5" ${memberData.position === 'support5' ? 'selected' : ''}>Саппорт 5</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="add-btn admin-position-btn" 
                                onclick="changePlayerPosition('${teamId}', '${userId}')">
                            💾 Сохранить позицию
                        </button>
                        ${!isCaptain ? `
                            <button class="save-btn admin-role-btn" 
                                    onclick="changePlayerRole('${teamId}', '${userId}', 'captain')">
                                👑 Сделать капитаном
                            </button>
                        ` : `
                            <button class="cancel-btn admin-role-btn" 
                                    onclick="changePlayerRole('${teamId}', '${userId}', 'member')">
                                👤 Сделать участником
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    if (membersHTML === '') {
        membersHTML = '<div class="no-data">Нет участников в команде</div>';
    }
    
    membersList.innerHTML = membersHTML;
}

// Метод для быстрого изменения позиции через селект
async changePlayerPositionFromSelect(teamId, userId) {
    const selectElement = document.querySelector(`.admin-position-select[data-user-id="${userId}"]`);
    if (!selectElement) return;
    
    const newPosition = selectElement.value;
    await this.changePlayerPosition(teamId, userId, newPosition);
}

// Обновленный метод для сохранения изменений команды
async saveTeamChanges(teamId) {
    try {
        const newName = document.getElementById('adminTeamName').value.trim();
        const newSlogan = document.getElementById('adminTeamSlogan').value.trim();
        
        if (!newName) {
            alert('❌ Введите название команды');
            return;
        }
        
        const updateData = {
            name: newName,
            slogan: newSlogan,
            updatedAt: Date.now()
        };
        
        await this.app.firebase.update(
            this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`),
            updateData
        );
        
        // Закрываем модальное окно
        document.querySelector('.modal').remove();
        
        alert('✅ Изменения команды сохранены!');
        this.loadTeamsList();
        
    } catch (error) {
        console.error('❌ Error saving team changes:', error);
        alert('❌ Ошибка сохранения изменений');
    }
}

    async systemBroadcast() {
        if (!this.checkPermissions('broadcast')) return;
        
        const message = prompt('Введите системное сообщение для всех пользователей:');
        if (!message) return;
        
        try {
            const usersSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, 'users'));
            if (usersSnapshot.exists()) {
                const users = usersSnapshot.val();
                
                for (const userId of Object.keys(users)) {
                    const notificationId = `system_${Date.now()}_${userId}`;
                    const notificationData = {
                        type: 'system_broadcast',
                        message: message,
                        timestamp: Date.now(),
                        read: false,
                        from: 'Система'
                    };
                    
                    await this.app.firebase.set(this.app.firebase.ref(this.app.firebase.database, `notifications/${userId}/${notificationId}`), notificationData);
                }
            }
            
            alert('✅ Системное сообщение отправлено всем пользователям');
        } catch (error) {
            console.error('❌ Error sending broadcast:', error);
            alert('❌ Ошибка отправки сообщения');
        }
    }

    checkPermissions(permission) {
        if (!this.currentAdmin) return false;
        
        if (this.currentAdmin.isSuperAdmin || this.currentAdmin.permissions?.includes('all')) {
            return true;
        }
        
        if (this.currentAdmin.permissions?.includes(permission)) {
            return true;
        }
        
        alert('❌ Недостаточно прав для этого действия');
        return false;
    }
}

// Глобальная переменная для доступа к админ-панели
let adminPanel = null;

// Инициализация админ-панели при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Будет инициализирована после загрузки основного приложения
    console.log('📄 Admin panel DOM ready');
});

// В конец файла admin-panel.js добавить:
// Глобальные методы для HTML
window.changePlayerPosition = (teamId, userId) => {
    if (adminPanel) {
        const selectElement = document.querySelector(`.admin-position-select[data-user-id="${userId}"]`);
        if (selectElement) {
            adminPanel.changePlayerPosition(teamId, userId, selectElement.value);
        }
    }
};

window.changePlayerRole = (teamId, userId, newRole) => {
    if (adminPanel) {
        adminPanel.changePlayerRole(teamId, userId, newRole);
    }
};

window.saveTeamChanges = (teamId) => {
    if (adminPanel) {
        adminPanel.saveTeamChanges(teamId);
    }
};

// === ГЛОБАЛЬНЫЕ МЕТОДЫ ДЛЯ HTML ===
// Добавить в самый конец файла admin-panel.js

// Глобальная функция для изменения позиции игрока
window.changePlayerPosition = function(teamId, userId) {
    if (window.adminPanel && window.adminPanel.changePlayerPositionFromButton) {
        window.adminPanel.changePlayerPositionFromButton(teamId, userId);
    } else {
        console.error('❌ Admin panel not initialized');
        alert('❌ Система администрирования не инициализирована');
    }
};

// Глобальная функция для изменения роли игрока
window.changePlayerRole = function(teamId, userId, newRole) {
    if (window.adminPanel && window.adminPanel.changePlayerRole) {
        window.adminPanel.changePlayerRole(teamId, userId, newRole);
    } else {
        console.error('❌ Admin panel not initialized');
        alert('❌ Система администрирования не инициализирована');
    }
};

// Глобальная функция для сохранения изменений команды
window.saveTeamChanges = function(teamId) {
    if (window.adminPanel && window.adminPanel.saveTeamChanges) {
        window.adminPanel.saveTeamChanges(teamId);
    } else {
        console.error('❌ Admin panel not initialized');
        alert('❌ Система администрирования не инициализирована');
    }
};

// Глобальная функция для закрытия модальных окон
window.closeAdminModal = function() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
};

// Глобальная функция для переключения темы
window.toggleHolidayTheme = function() {
    console.log('🎄 Global toggle function called');
    if (window.adminPanel && typeof window.adminPanel.toggleHolidayTheme === 'function') {
        window.adminPanel.toggleHolidayTheme();
    } else if (window.holidayTheme) {
        // Альтернативный способ если adminPanel недоступен
        if (window.holidayTheme.isEnabled) {
            window.holidayTheme.disable();
        } else {
            window.holidayTheme.enable();
        }
    } else {
        console.error('❌ Cannot toggle holiday theme: adminPanel or holidayTheme not available');
        alert('❌ Невозможно переключить тему. Обновите страницу.');
    }
};