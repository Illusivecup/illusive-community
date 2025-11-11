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
        // Делегирование событий для динамически созданных элементов
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Обработка кнопок редактирования пользователей
            if (target.classList.contains('btn-edit') && target.closest('.admin-item')) {
                const userId = target.getAttribute('data-user-id');
                if (userId) this.editUserProfile(userId);
            }
            
            // Обработка кнопок бана пользователей
            if (target.classList.contains('btn-ban') && target.closest('.admin-item')) {
                const userId = target.getAttribute('data-user-id');
                if (userId) this.banUser(userId);
            }
            
            // Обработка кнопок удаления пользователей
            if (target.classList.contains('btn-delete') && target.closest('.admin-item')) {
                const userId = target.getAttribute('data-user-id');
                if (userId) this.deleteUser(userId);
            }
            
            // Обработка кнопок разбана
            if (target.classList.contains('btn-unban') && target.closest('.admin-item')) {
                const userId = target.getAttribute('data-user-id');
                if (userId) this.unbanUser(userId);
            }
            
            // Обработка кнопок редактирования команд
            if (target.classList.contains('btn-edit-team') && target.closest('.admin-item')) {
                const teamId = target.getAttribute('data-team-id');
                if (teamId) this.editTeam(teamId);
            }
            
            // Обработка кнопок удаления команд
            if (target.classList.contains('btn-delete-team') && target.closest('.admin-item')) {
                const teamId = target.getAttribute('data-team-id');
                if (teamId) this.deleteTeam(teamId);
            }
            
            // Обработка кнопок снятия админов
            if (target.classList.contains('btn-demote') && target.closest('.admin-item')) {
                const adminKey = target.getAttribute('data-admin-key');
                if (adminKey) this.demoteAdmin(adminKey);
            }
        });
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
                adminEmail: "admin@illusive.local",
                adminPassword: "IllusiveAdmin2024!",
                superAdmins: ["admin@illusive.local"],
                systemSettings: {
                    notificationCleanupDays: 30,
                    maxNotificationsPerUser: 50,
                    autoBanThreshold: 3
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
        
        console.log('✅ Admin panel initialized');
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
            await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
                isBanned: true,
                banReason: reason,
                bannedAt: Date.now(),
                bannedBy: this.currentAdmin.email
            });
            
            alert('✅ Пользователь забанен');
            this.loadUsersList();
            this.loadBannedUsers();
        } catch (error) {
            console.error('❌ Error banning user:', error);
            alert('❌ Ошибка бана пользователя');
        }
    }

    async unbanUser(userId) {
        if (!this.checkPermissions('moderate')) return;
        
        try {
            await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `users/${userId}`), {
                isBanned: false,
                banReason: null,
                bannedAt: null,
                bannedBy: null
            });
            
            alert('✅ Пользователь разбанен');
            this.loadUsersList();
            this.loadBannedUsers();
        } catch (error) {
            console.error('❌ Error unbanning user:', error);
            alert('❌ Ошибка разбана пользователя');
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

    async editTeam(teamId) {
        if (!this.checkPermissions('edit_teams')) return;
        
        const teamSnapshot = await this.app.firebase.get(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        const newName = prompt('Новое название команды:', team.name);
        if (newName === null) return;
        
        const newSlogan = prompt('Новый слоган:', team.slogan || '');
        
        try {
            await this.app.firebase.update(this.app.firebase.ref(this.app.firebase.database, `teams/${teamId}`), {
                name: newName,
                slogan: newSlogan,
                updatedAt: Date.now()
            });
            
            alert('✅ Команда обновлена');
            this.loadTeamsList();
        } catch (error) {
            console.error('❌ Error editing team:', error);
            alert('❌ Ошибка редактирования команды');
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