// === Illusive Community App ===
class IllusiveApp {
    constructor() {
        // Сначала инициализируем все свойства
        this.currentUser = null;
        this.userProfile = null;
        this.isInitialized = false;
        this.adminPanel = null;
        this.matchmakingSystem = null;
        this.firebase = null;
        
        // Инициализируем Firebase методы
        this.initializeFirebaseMethods();
        
        // Теперь безопасно привязываем методы
        this.bindAllMethods();
    }

    bindAllMethods() {
        // Привязываем контекст для всех методов
        const methods = [
            'init', 'setupEventListeners', 'setupAuthStateListener', 'showSection', 
            'hideAllSections', 'loginUser', 'registerUser', 'logoutUser', 'saveProfile',
            'uploadAvatar', 'loadLeaderboards', 'setupNavigation', 'setupTeamEventListeners',
            'initAdminPanel', 'initMatchmakingSystem', 'waitForFirebase', 'createAnimatedBackground',
            'updateConnectionStatus', 'loadUserProfile', 'updateLastOnline', 'createUserProfile',
            'showAuthMessage', 'showUnauthenticatedUI', 'showAuthenticatedUI', 'updateProfileUI',
            'fileToBase64', 'updateAvatarUI', 'loadFriendsList', 'searchFriends', 'sendFriendRequest',
            'loadTeamsList', 'createTeamCard', 'applyToTeam', 'createTeam', 'loadTeamInfo',
            'updateTeamUI', 'renderTeamVisitingCard', 'loadCaptainInfo', 'renderTeamPlayers',
            'loadNotifications', 'updateNotificationsUI', 'createNotificationElement',
            'acceptFriendRequest', 'addFriend', 'rejectFriendRequest', 'acceptTeamInvite',
            'rejectTeamInvite', 'acceptTeamApplication', 'rejectTeamApplication',
            'markNotificationAsRead', 'limitNotifications', 'loadLeaderboards',
            'updateLeaderboardsStats', 'renderLeaderboardsList', 'checkAndHideAdminButton',
            'checkAdminRights', 'getPositionName', 'getNotificationType', 'formatTime',
            'calculateTeamAverageMMR', 'viewUserProfile', 'showTeamCardModal',
            'renderTeamCardModal', 'createTeamVisitingCardHTML', 'applyToTeamFromCard',
            'showUserProfileModal', 'showCreateTeamModal', 'closeCreateTeamModal',
            'showJoinTeamModal', 'closeJoinTeamModal', 'closeEditTeamModal', 'closeAllModals',
            'switchTeamTab', 'showInvitePlayersModal', 'closeInvitePlayersModal',
            'loadFriendsForInvite', 'sendTeamInvite', 'leaveTeam', 'showDeleteTeamModal',
            'deleteTeam', 'closeDeleteTeamModal', 'showEditTeamModal', 'loadTeamMembersForEdit',
            'updateTeamGeneralSettings', 'updateTeamMember', 'recalculateTeamAverageMMR',
            'removeTeamMember', 'transferCaptaincy', 'loadNews', 'filterNews', 'renderNewsList',
            'getNewsTypeIcon', 'getNewsTypeText', 'formatNewsMessage', 'getNewsActions',
            'getNewsTimeAgo', 'updateNewsStats', 'createNews', 'createTeamCreatedNews',
            'createPlayerJoinedNews', 'createPlayerLeftNews', 'createCaptainChangeNews',
            'createTeamDeletedNews', 'getUserProfile', 'getTeamInfo', 'testNewsCreation',
            'editTeamSlogan'
        ];

        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });

        console.log('✅ All methods bound successfully');
    }

    initializeFirebaseMethods() {
        // Проверяем, что Firebase загружен и инициализирован
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            console.error('❌ Firebase not initialized');
            this.createFirebaseStub();
            return;
        }

        // Правильная инициализация для Firebase 9.x compat
        this.firebase = {
            // Auth methods
            auth: firebase.auth(),
            createUserWithEmailAndPassword: (email, password) => 
                firebase.auth().createUserWithEmailAndPassword(email, password),
            signInWithEmailAndPassword: (email, password) => 
                firebase.auth().signInWithEmailAndPassword(email, password),
            signOut: () => firebase.auth().signOut(),
            onAuthStateChanged: (callback) => 
                firebase.auth().onAuthStateChanged(callback),
            
            // Database methods
            database: firebase.database,
            ref: (db, path) => firebase.database().ref(path),
            set: (ref, data) => ref.set(data),
            get: (ref) => ref.get(),
            update: (ref, data) => ref.update(data),
            push: (ref, data) => ref.push(data),
            onValue: (ref, callback) => ref.on('value', callback),
            off: (ref, eventType = 'value', callback) => ref.off(eventType, callback),
            remove: (ref) => ref.remove(),
            
            // Storage methods
            storage: firebase.storage(),
            storageRef: (path) => firebase.storage().ref(path),
            uploadBytes: (ref, file) => ref.put(file),
            getDownloadURL: (ref) => ref.getDownloadURL()
        };

        console.log('✅ Firebase methods initialized');
    }

    createFirebaseStub() {
        console.warn('⚠️ Creating Firebase stub - some features may not work');
        this.firebase = {
            auth: {
                currentUser: null,
                createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
                signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
                signOut: () => Promise.reject(new Error('Firebase not initialized')),
                onAuthStateChanged: () => {}
            },
            database: {},
            ref: () => ({ 
                set: () => Promise.reject(new Error('Firebase not initialized')),
                get: () => Promise.reject(new Error('Firebase not initialized')),
                update: () => Promise.reject(new Error('Firebase not initialized')),
                push: () => Promise.reject(new Error('Firebase not initialized')),
                remove: () => Promise.reject(new Error('Firebase not initialized')),
                on: () => {},
                off: () => {}
            }),
            set: () => Promise.reject(new Error('Firebase not initialized')),
            get: () => Promise.reject(new Error('Firebase not initialized')),
            update: () => Promise.reject(new Error('Firebase not initialized')),
            push: () => Promise.reject(new Error('Firebase not initialized')),
            onValue: () => {},
            off: () => {},
            remove: () => Promise.reject(new Error('Firebase not initialized')),
            storage: {},
            storageRef: () => ({ 
                put: () => Promise.reject(new Error('Firebase not initialized')),
                getDownloadURL: () => Promise.reject(new Error('Firebase not initialized'))
            }),
            uploadBytes: () => Promise.reject(new Error('Firebase not initialized')),
            getDownloadURL: () => Promise.reject(new Error('Firebase not initialized'))
        };
    }

initAdminPanel() {
    try {
        // Проверяем, что файл админ-панели загружен
        if (typeof AdminPanel === 'undefined') {
            console.warn('⚠️ AdminPanel not found - skipping admin initialization');
            return;
        }
        
        // Проверяем, что админ конфиг загружен
        if (typeof ADMIN_CONFIG === 'undefined') {
            console.warn('⚠️ ADMIN_CONFIG not found - admin panel will not work');
            return;
        }
        
        console.log('🔐 Admin config detected:', ADMIN_CONFIG.adminEmail);
        
        // Создаем экземпляр админ-панели
        this.adminPanel = new AdminPanel(this);
        
        // Инициализируем админ-панель
        this.adminPanel.init().then(() => {
            console.log('✅ Admin panel initialized successfully');
            // Делаем доступной глобально через основной app
            window.adminPanel = this.adminPanel;
        }).catch(error => {
            console.error('❌ Admin panel initialization failed:', error);
        });
        
    } catch (error) {
        console.error('❌ Error initializing admin panel:', error);
    }
}

    // ДОБАВЬТЕ ЭТОТ МЕТОД
    async init() {
        console.log('🚀 Initializing Illusive App...');
        
        try {
            // Ждем инициализации Firebase
            await this.waitForFirebase();
            
            // Создаем анимированный фон
            this.createAnimatedBackground();
            
            // Настраиваем слушатели событий
            this.setupEventListeners();
            
            // Настраиваем слушатель состояния аутентификации
            this.setupAuthStateListener();
            
            // Настраиваем навигацию
            this.setupNavigation();
            
            // Настраиваем обработчики для команд
            this.setupTeamEventListeners();
            
            // Инициализируем админ-панель если доступна
            this.initAdminPanel();
            
            // Инициализируем систему матчмейкинга если доступна
            this.initMatchmakingSystem();
            
            // Показываем начальный UI
            if (this.currentUser) {
                this.showAuthenticatedUI();
            } else {
                this.showUnauthenticatedUI();
            }
            
            console.log('✅ Illusive App initialized successfully');
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showErrorMessage('Ошибка инициализации приложения');
        }
    }

    // ДОБАВЬТЕ ЭТОТ ВСПОМОГАТЕЛЬНЫЙ МЕТОД
    showErrorMessage(message) {
        // Создаем или находим элемент для отображения ошибок
        let errorElement = document.getElementById('globalError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'globalError';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff4444;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

async waitForFirebase() {
    return new Promise((resolve, reject) => {
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                console.log('✅ Firebase loaded and initialized');
                resolve();
            } else {
                console.log('⏳ Waiting for Firebase initialization...');
                setTimeout(checkFirebase, 100);
            }
        };
        
        // Таймаут 10 секунд
        setTimeout(() => {
            reject(new Error('Firebase initialization timeout'));
        }, 10000);
        
        checkFirebase();
    });
}

    // ... остальные методы остаются без изменений


    setupNavigation() {
        const teamsListBtn = document.getElementById('teamsListBtn');
        if (teamsListBtn) {
            teamsListBtn.addEventListener('click', () => this.showSection('teams'));
            console.log('✅ Обработчик для teamsListBtn установлен');
        }
    }

showSection(sectionName) {
    console.log(`🔄 Переход в раздел: ${sectionName}`);
    
    // Проверяем авторизацию для защищенных разделов
    const protectedSections = ['friends', 'teams', 'team', 'notification', 'admin']; // 👈 ДОБАВЬТЕ 'admin'
    if (protectedSections.includes(sectionName) && !this.currentUser) {
        alert('❌ Для доступа к этому разделу необходимо авторизоваться');
        this.showSection('profile');
        return;
    }
    
    // 👇 ДОБАВЛЯЕМ ПРОВЕРКУ ДЛЯ АДМИН-ПАНЕЛИ
    if (sectionName === 'admin' && !this.currentUser) {
        alert('❌ Для доступа к админ-панели необходимо авторизоваться');
        this.showSection('profile');
        return;
    }
    
    this.hideAllSections();
    const targetSection = document.getElementById(`${sectionName}Content`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Загружаем данные для конкретного раздела
        switch(sectionName) {
            case 'friends':
                this.loadFriendsList();
                break;
            case 'teams':
                this.loadTeamsList();
                break;
            case 'team':
                this.loadTeamInfo();
                break;
            case 'notification':
                this.loadNotifications();
                break;
            case 'leaderboards':
                this.loadLeaderboards();
                break;
            // 👇 ДОБАВЛЯЕМ ОБРАБОТКУ АДМИН-ПАНЕЛИ
            case 'admin':
                console.log('🔐 Admin section activated');
                break;
        }
    }
}

    hideAllSections() {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
    }

    setupAuthStateListener() {
    if (!this.firebase || !this.firebase.auth) {
        console.error('❌ Firebase auth not available');
        return;
    }

    // Правильный синтаксис для Firebase 9.x
    this.firebase.onAuthStateChanged((user) => {
        if (user) {
            console.log('👤 Пользователь авторизован:', user.email);
            this.currentUser = user;
            this.loadUserProfile(user.uid)
                .then(() => {
                    this.showAuthenticatedUI();
                    this.checkAndHideAdminButton();
                })
                .catch(error => {
                    console.error('❌ Ошибка загрузки профиля:', error);
                    this.showAuthenticatedUI();
                    this.checkAndHideAdminButton();
                });
        } else {
            console.log('👤 Пользователь не авторизован');
            this.currentUser = null;
            this.userProfile = null;
            this.showUnauthenticatedUI();
        }
    });
}

async loadUserProfile(userId) {
    try {
        // Правильный синтаксис для Firebase 9.x
        const userRef = this.firebase.ref(this.firebase.database, `users/${userId}`);
        const snapshot = await this.firebase.get(userRef);
        
        if (snapshot.exists()) {
            this.userProfile = snapshot.val();
            
            if (!this.userProfile.friends || !Array.isArray(this.userProfile.friends)) {
                this.userProfile.friends = [];
            }
            
            console.log('📁 Профиль загружен');
            this.updateProfileUI();
            await this.updateLastOnline();
        } else {
            console.log('📁 Профиль не найден, создаем новый');
            await this.createUserProfile(userId, this.currentUser.email, '', '');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
        throw error;
    }
}

async updateLastOnline() {
    if (!this.currentUser) return;
    
    try {
        const userRef = this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`);
        await this.firebase.update(userRef, {
            lastOnline: Date.now()
        });
    } catch (error) {
        console.error('❌ Ошибка обновления времени онлайна:', error);
    }
}

    // === ФУНКЦИИ АВТОРИЗАЦИИ ===
async registerUser(email, password, confirmPassword, nickname, telegram) {
    const messageElement = document.getElementById('registerMessage');
    
    if (!email || !password || !confirmPassword || !nickname) {
        this.showAuthMessage('❌ Заполните все обязательные поля', 'error', messageElement);
        return;
    }
    
    if (password !== confirmPassword) {
        this.showAuthMessage('❌ Пароли не совпадают', 'error', messageElement);
        return;
    }
    
    if (password.length < 6) {
        this.showAuthMessage('❌ Пароль должен содержать минимум 6 символов', 'error', messageElement);
        return;
    }
    
    try {
        this.showAuthMessage('⏳ Регистрация...', 'info', messageElement);
        
        // Правильный вызов для Firebase 9.x
        const userCredential = await this.firebase.createUserWithEmailAndPassword(email, password);
        
        await this.createUserProfile(userCredential.user.uid, email, nickname, telegram);
        this.showAuthMessage('✅ Регистрация успешна!', 'success', messageElement);
        
        // Очищаем поля
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerNickname').value = '';
        document.getElementById('registerTelegram').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        let errorMessage = '❌ Ошибка регистрации';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = '❌ Этот email уже используется';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Неверный формат email';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = '❌ Слишком слабый пароль';
        }
        
        this.showAuthMessage(errorMessage, 'error', messageElement);
    }
}

async loginUser(email, password) {
    const messageElement = document.getElementById('loginMessage');
    
    if (!email || !password) {
        this.showAuthMessage('❌ Заполните все поля', 'error', messageElement);
        return;
    }
    
    try {
        this.showAuthMessage('⏳ Вход...', 'info', messageElement);
        
        // Правильный вызов для Firebase 9.x
        await this.firebase.signInWithEmailAndPassword(email, password);
        this.showAuthMessage('✅ Вход успешен!', 'success', messageElement);
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        let errorMessage = '❌ Ошибка входа';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ Пользователь не найден';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = '❌ Неверный пароль';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Неверный формат email';
        }
        
        this.showAuthMessage(errorMessage, 'error', messageElement);
    }
}

async logoutUser() {
    try {
        await this.firebase.signOut();
        console.log('✅ Пользователь вышел');
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
}

async createUserProfile(userId, email, nickname, telegram) {
    const profileData = {
        username: email.split('@')[0],
        nickname: nickname,
        telegram: telegram || '',
        mmr: 0,
        position: '',
        userId: userId,
        avatarUrl: '',
        friends: [],
        friendRequests: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOnline: Date.now()
    };
    
    try {
        const userRef = this.firebase.ref(this.firebase.database, `users/${userId}`);
        await this.firebase.set(userRef, profileData);
        this.userProfile = profileData;
        this.updateProfileUI();
    } catch (error) {
        console.error('❌ Ошибка создания профиля:', error);
        throw error;
    }
}

async loginUser(email, password) {
    const messageElement = document.getElementById('loginMessage');
    
    if (!email || !password) {
        this.showAuthMessage('❌ Заполните все поля', 'error', messageElement);
        return;
    }
    
    try {
        this.showAuthMessage('⏳ Вход...', 'info', messageElement);
        
        // Используем this.firebase вместо window.firebase
        await this.firebase.signInWithEmailAndPassword(email, password);
        this.showAuthMessage('✅ Вход успешен!', 'success', messageElement);
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        let errorMessage = '❌ Ошибка входа';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ Пользователь не найден';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = '❌ Неверный пароль';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Неверный формат email';
        }
        
        this.showAuthMessage(errorMessage, 'error', messageElement);
    }
}

async logoutUser() {
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.signOut();
        console.log('✅ Пользователь вышел');
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
}

    showAuthMessage(message, type, element) {
        element.textContent = message;
        element.className = `auth-message ${type}`;
        element.style.display = 'block';
    }

    // === УПРАВЛЕНИЕ UI ===
    showUnauthenticatedUI() {
        this.hideAllSections();
        document.getElementById('authContent').classList.remove('hidden');
        document.getElementById('navigationGrid').classList.add('hidden');
    }

showAuthenticatedUI() {
    this.hideAllSections();
    document.getElementById('profileContent').classList.remove('hidden');
    document.getElementById('navigationGrid').classList.remove('hidden');
    this.checkAndHideAdminButton();
}

    updateProfileUI() {
        if (!this.userProfile) return;
        
        document.getElementById('profileUsername').textContent = this.userProfile.nickname || this.userProfile.username || 'Гость';
        document.getElementById('profileUserId').textContent = `ID: ${this.userProfile.userId || '---'}`;
        document.getElementById('profileNickname').value = this.userProfile.nickname || '';
        document.getElementById('profileMMR').value = this.userProfile.mmr || '';
        document.getElementById('profilePosition').value = this.userProfile.position || '';
        document.getElementById('profileTelegram').value = this.userProfile.telegram || '';
        
        this.updateAvatarUI();
    }

    // === СИСТЕМА АВАТАРОК ===
async uploadAvatar(file) {
    if (!this.currentUser) {
        alert('❌ Пользователь не авторизован');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Файл слишком большой. Максимальный размер: 2MB');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('❌ Пожалуйста, выберите изображение');
        return;
    }
    
    try {
        alert('⏳ Загружаем аватарку...');
        const base64String = await this.fileToBase64(file);
        
        const userRef = this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`);
        await this.firebase.update(userRef, {
            avatarUrl: base64String,
            updatedAt: Date.now()
        });
        
        this.userProfile.avatarUrl = base64String;
        this.updateAvatarUI();
        
        alert('✅ Аватар успешно обновлен!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки аватара:', error);
        alert('❌ Ошибка загрузки аватара: ' + error.message);
    }
}

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    updateAvatarUI() {
        const avatarImage = document.getElementById('avatarImage');
        const defaultAvatar = document.getElementById('defaultAvatar');
        
        if (this.userProfile && this.userProfile.avatarUrl) {
            avatarImage.src = this.userProfile.avatarUrl;
            avatarImage.style.display = 'block';
            defaultAvatar.style.display = 'none';
            
            avatarImage.onerror = function() {
                avatarImage.style.display = 'none';
                defaultAvatar.style.display = 'block';
            };
        } else {
            avatarImage.style.display = 'none';
            defaultAvatar.style.display = 'block';
        }
    }

    // === УПРАВЛЕНИЕ ПРОФИЛЕМ ===
async saveProfile() {
    if (!this.currentUser || !this.userProfile) return;
    
    const nickname = document.getElementById('profileNickname').value.trim();
    const mmr = parseInt(document.getElementById('profileMMR').value) || 0;
    const position = document.getElementById('profilePosition').value;
    const telegram = document.getElementById('profileTelegram').value.trim();
    
    const updateData = {
        nickname,
        mmr,
        position,
        telegram,
        updatedAt: Date.now()
    };
    
    try {
        const userRef = this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`);
        await this.firebase.update(userRef, updateData);
        this.userProfile = { ...this.userProfile, ...updateData };
        this.updateProfileUI();
        alert('✅ Профиль сохранен!');
    } catch (error) {
        console.error('❌ Ошибка сохранения профиля:', error);
        alert('❌ Ошибка сохранения профиля');
    }
}

    // === СИСТЕМА ДРУЗЕЙ ===
async loadFriendsList() {
    if (!this.currentUser || !this.userProfile) {
        document.getElementById('friendsList').innerHTML = '<div class="no-data">Для просмотра друзей необходимо авторизоваться</div>';
        return;
    }
    
    if (!this.userProfile.friends || this.userProfile.friends.length === 0) {
        document.getElementById('friendsList').innerHTML = '<div class="no-data">У вас пока нет друзей</div>';
        return;
    }
    
    const friendsList = document.getElementById('friendsList');
    let friendsHTML = '';
    
    try {
        const friendPromises = this.userProfile.friends.map(async (friendId) => {
            try {
                // Используем this.firebase вместо window.firebase
                const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${friendId}`));
                if (snapshot.exists()) {
                    const friend = snapshot.val();
                    const isOnline = friend.lastOnline && (Date.now() - friend.lastOnline < 300000);
                    
                    return `
                        <div class="friend-card">
                            <div class="friend-info">
                                <div class="member-avatar">
                                    ${friend.avatarUrl ? 
                                        `<img src="${friend.avatarUrl}" alt="Аватар" style="width: 100%; height: 100%; border-radius: 50%;">` : 
                                        '👤'
                                    }
                                </div>
                                <div>
                                    <h4>${friend.nickname || friend.username || 'Неизвестный пользователь'}</h4>
                                    <p>${friend.position ? this.getPositionName(friend.position) : 'Позиция не указана'} | MMR: ${friend.mmr || 0}</p>
                                    <p>Telegram: ${friend.telegram || 'Не указан'}</p>
                                </div>
                            </div>
                            <div class="friend-status">
                                <span class="status-dot ${isOnline ? 'status-online' : 'status-offline'}"></span>
                                <span>${isOnline ? 'Онлайн' : 'Оффлайн'}</span>
                            </div>
                        </div>
                    `;
                }
                return '';
            } catch (error) {
                console.error(`❌ Ошибка загрузки информации о друге ${friendId}:`, error);
                return '';
            }
        });
        
        const friendElements = await Promise.all(friendPromises);
        friendsHTML = friendElements.filter(html => html !== '').join('');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки списка друзей:', error);
        friendsHTML = '<div class="no-data">Ошибка загрузки списка друзей</div>';
    }
    
    friendsList.innerHTML = friendsHTML || '<div class="no-data">У вас пока нет друзей</div>';
}

async searchFriends() {
    if (!this.currentUser) {
        alert('❌ Для поиска друзей необходимо авторизоваться');
        return;
    }
    
    const searchTerm = document.getElementById('friendSearch').value.trim();
    const searchType = document.getElementById('friendSearchType').value;
    
    if (!searchTerm) {
        alert('❌ Введите данные для поиска');
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, 'users'));
        const resultsContainer = document.getElementById('friendSearchResults');
        let resultsHTML = '';
        let found = false;
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            
            Object.entries(users).forEach(([userId, user]) => {
                if (userId === this.currentUser.uid) return;
                
                let match = false;
                
                switch(searchType) {
                    case 'nickname':
                        match = user.nickname && user.nickname.toLowerCase().includes(searchTerm.toLowerCase());
                        break;
                    case 'telegram':
                        match = user.telegram && user.telegram.toLowerCase().includes(searchTerm.toLowerCase());
                        break;
                    case 'userId':
                        match = userId === searchTerm || user.userId === searchTerm;
                        break;
                }
                
                if (match) {
                    found = true;
                    const isAlreadyFriend = this.userProfile.friends && this.userProfile.friends.includes(userId);
                    const isOnline = user.lastOnline && (Date.now() - user.lastOnline < 300000);
                    
                    resultsHTML += `
                        <div class="search-result-item">
                            <div class="friend-info">
                                <div class="member-avatar">
                                    ${user.avatarUrl ? 
                                        `<img src="${user.avatarUrl}" alt="Аватар" style="width: 100%; height: 100%; border-radius: 50%;">` : 
                                        '👤'
                                    }
                                </div>
                                <div>
                                    <h4>${user.nickname || user.username}</h4>
                                    <p>Telegram: ${user.telegram || 'Не указан'} | MMR: ${user.mmr || 0}</p>
                                    <div class="friend-status">
                                        <span class="status-dot ${isOnline ? 'status-online' : 'status-offline'}"></span>
                                        <span>${isOnline ? 'Онлайн' : 'Оффлайн'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                ${isAlreadyFriend ? 
                                    '<span class="add-btn" style="background: var(--accent-success);">✓ Друг</span>' :
                                    `<button class="add-btn" onclick="app.sendFriendRequest('${userId}')">👥 Добавить в друзья</button>`
                                }
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        if (!found) {
            resultsHTML = '<div class="no-data">Пользователь не найден</div>';
        }
        
        resultsContainer.innerHTML = resultsHTML;
        
    } catch (error) {
        console.error('❌ Ошибка поиска друзей:', error);
        alert('❌ Ошибка поиска друзей');
    }
}

async sendFriendRequest(toUserId) {
    if (!this.currentUser) return;
    
    const notificationId = `notification_${Date.now()}`;
    const notificationData = {
        type: 'friend_request',
        fromUserId: this.currentUser.uid,
        fromUserName: this.userProfile.nickname || this.userProfile.username,
        message: `${this.userProfile.nickname || this.userProfile.username} хочет добавить вас в друзья`,
        timestamp: Date.now(),
        read: false,
        responded: false
    };
    
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${toUserId}/${notificationId}`), notificationData);
        await this.limitNotifications(toUserId);
        alert('✅ Запрос дружбы отправлен!');
    } catch (error) {
        console.error('❌ Ошибка отправки запроса дружбы:', error);
        alert('❌ Ошибка отправки запроса дружбы');
    }
}

    // === СИСТЕМА КОМАНД ===
async loadTeamsList() {
    try {
        console.log('🔄 Загрузка списка команд...');
        
        if (!this.currentUser) {
            const fullTeamsContainer = document.getElementById('fullTeamsList');
            const incompleteTeamsContainer = document.getElementById('incompleteTeamsList');
            fullTeamsContainer.innerHTML = '<div class="no-data">Для просмотра команд необходимо авторизоваться</div>';
            incompleteTeamsContainer.innerHTML = '<div class="no-data">Для просмотра команд необходимо авторизоваться</div>';
            return;
        }

        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, 'teams'));
        const fullTeamsContainer = document.getElementById('fullTeamsList');
        const incompleteTeamsContainer = document.getElementById('incompleteTeamsList');
        
        if (!snapshot.exists()) {
            fullTeamsContainer.innerHTML = '<div class="no-data">Нет созданных команд</div>';
            incompleteTeamsContainer.innerHTML = '<div class="no-data">Нет команд с неполным составом</div>';
            return;
        }
        
        const teams = snapshot.val();
        let fullTeamsHTML = '';
        let incompleteTeamsHTML = '';
        
        for (const [teamId, team] of Object.entries(teams)) {
            try {
                const teamCard = await this.createTeamCard(teamId, team);
                const memberCount = Object.keys(team.members || {}).length;
                const isFullTeam = memberCount >= 5;
                
                if (isFullTeam) {
                    fullTeamsHTML += teamCard;
                } else {
                    incompleteTeamsHTML += teamCard;
                }
            } catch (error) {
                console.error(`❌ Ошибка создания карточки команды ${teamId}:`, error);
            }
        }
        
        fullTeamsContainer.innerHTML = fullTeamsHTML || '<div class="no-data">Нет команд с полным составом</div>';
        incompleteTeamsContainer.innerHTML = incompleteTeamsHTML || '<div class="no-data">Нет команд с неполным составом</div>';
        
    } catch (error) {
        console.error('❌ Ошибка загрузки списка команд:', error);
        const fullTeamsContainer = document.getElementById('fullTeamsList');
        const incompleteTeamsContainer = document.getElementById('incompleteTeamsList');
        
        let errorMessage = 'Ошибка загрузки команд';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = 'Нет доступа к списку команд. Проверьте авторизацию.';
        }
        
        fullTeamsContainer.innerHTML = `<div class="no-data">${errorMessage}</div>`;
        incompleteTeamsContainer.innerHTML = `<div class="no-data">${errorMessage}</div>`;
    }
}

async createTeamCard(teamId, team) {
    const memberCount = Object.keys(team.members || {}).length;
    const maxMembers = 5;
    const isFull = memberCount >= maxMembers;
    
    let captainName = 'Неизвестно';
    try {
        const captainSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${team.captain}`));
        if (captainSnapshot.exists()) {
            const captain = captainSnapshot.val();
            captainName = captain.nickname || captain.username;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о капитане:', error);
    }
    
    let hasApplied = false;
    if (this.currentUser) {
        const applicationsSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teamApplications/${teamId}`));
        if (applicationsSnapshot.exists()) {
            const applications = applicationsSnapshot.val();
            hasApplied = Object.values(applications).some(app => app.userId === this.currentUser.uid && !app.responded);
        }
    }
    
    return `
        <div class="team-mini-card">
            <div class="team-mini-header">
                <h4 class="clickable-team" onclick="app.showTeamCardModal('${teamId}')" 
                    style="cursor: pointer; color: var(--accent-primary); text-decoration: underline; transition: all 0.3s ease;">
                    ${team.name}
                </h4>
                <span class="team-status ${isFull ? 'status-full' : 'status-open'}">
                    ${isFull ? '✅ Полный состав' : '🟢 Ищут игроков'}
                </span>
            </div>
            <div class="team-mini-info">
                <p><strong>Слоган:</strong> ${team.slogan || 'Без слогана'}</p>
                <p><strong>Капитан:</strong> <span class="clickable-nickname" onclick="app.viewUserProfile('${team.captain}')">${captainName}</span></p>
                <p><strong>Состав:</strong> ${memberCount}/${maxMembers} игроков</p>
                <p><strong>Средний MMR:</strong> ${team.averageMMR || 0}</p>
            </div>
            <div class="team-mini-actions">
                ${!isFull && this.currentUser && !hasApplied && (!this.userProfile.teamId || this.userProfile.teamId !== teamId) ? 
                    `<button class="add-btn" onclick="app.applyToTeam('${teamId}')">📨 Подать заявку</button>` : 
                    ''
                }
                ${hasApplied ? 
                    '<span class="add-btn" style="background: var(--accent-warning);">⏳ Заявка отправлена</span>' : 
                    ''
                }
                ${this.currentUser && this.userProfile.teamId === teamId ? 
                    '<span class="add-btn" style="background: var(--accent-success);">✅ Ваша команда</span>' : 
                    ''
                }
            </div>
        </div>
    `;
}

async applyToTeam(teamId) {
    if (!this.currentUser) {
        alert('❌ Вы не авторизованы');
        return;
    }
    
    if (this.userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    try {
        const applicationId = `application_${Date.now()}`;
        const applicationData = {
            userId: this.currentUser.uid,
            userNickname: this.userProfile.nickname || this.userProfile.username,
            userMMR: this.userProfile.mmr || 0,
            userPosition: this.userProfile.position || '',
            teamId: teamId,
            timestamp: Date.now(),
            responded: false
        };
        
        // Используем this.firebase вместо window.firebase
        await this.firebase.set(this.firebase.ref(this.firebase.database, `teamApplications/${teamId}/${applicationId}`), applicationData);
        
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${teamId}`));
        if (teamSnapshot.exists()) {
            const team = teamSnapshot.val();
            
            const notificationId = `notification_${Date.now()}`;
            const notificationData = {
                type: 'team_application',
                fromUserId: this.currentUser.uid,
                fromUserName: this.userProfile.nickname || this.userProfile.username,
                teamId: teamId,
                teamName: team.name,
                applicationId: applicationId,
                message: `${this.userProfile.nickname || this.userProfile.username} подал заявку в вашу команду "${team.name}"`,
                timestamp: Date.now(),
                read: false,
                responded: false
            };
            
            await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${team.captain}/${notificationId}`), notificationData);
            await this.limitNotifications(team.captain);
        }
        
        alert('✅ Заявка отправлена!');
        this.loadTeamsList();
        
    } catch (error) {
        console.error('❌ Ошибка подачи заявки:', error);
        alert('❌ Ошибка подачи заявки');
    }
}

// Временный метод для тестирования - можно удалить позже
async testNewsCreation() {
    if (!this.currentUser) {
        alert('❌ Сначала авторизуйтесь');
        return;
    }
    
    try {
        console.log('🧪 Тестирование создания новости...');
        
        await this.createNews('team-created', {
            captainName: 'TestCaptain',
            captainId: this.currentUser.uid,
            teamName: 'TestTeam',
            teamId: 'test_team_123',
            message: `Тестовая новость: создана команда "TestTeam" с капитаном TestCaptain`
        });
        
        console.log('✅ Тестовая новость создана');
        alert('✅ Тестовая новость создана! Проверьте консоль и раздел новостей.');
        
        // Перезагружаем новости
        this.loadNews();
        
    } catch (error) {
        console.error('❌ Ошибка тестирования:', error);
        alert('❌ Ошибка тестирования новостей');
    }
}


async createTeam(teamName, slogan) {
    if (!this.currentUser) return;
    
    if (this.userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const teamData = {
        name: teamName,
        slogan: slogan,
        captain: this.currentUser.uid,
        members: {
            [this.currentUser.uid]: {
                role: 'captain',
                nickname: this.userProfile.nickname || this.userProfile.username,
                position: this.userProfile.position || '',
                mmr: this.userProfile.mmr || 0,
                joinedAt: Date.now()
            }
        },
        averageMMR: this.userProfile.mmr || 0,
        tournamentStatus: 'not_participating',
        createdAt: Date.now(),
        createdBy: this.currentUser.uid,
        updatedAt: Date.now()
    };
    
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.set(this.firebase.ref(this.firebase.database, `teams/${teamId}`), teamData);
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`), {
            teamId: teamId
        });
        
        this.userProfile.teamId = teamId;
        this.updateTeamUI();
        
        alert('✅ Команда создана! Вы - капитан команды.');
        this.closeCreateTeamModal();
        await this.createTeamCreatedNews(teamId, this.currentUser.uid);
        
    } catch (error) {
        console.error('❌ Ошибка создания команды:', error);
        alert('❌ Ошибка создания команды');
    }
}

async loadTeamInfo() {
    if (!this.userProfile || !this.userProfile.teamId) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`));
        if (snapshot.exists()) {
            const team = snapshot.val();
            this.updateTeamUI(team);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о команде:', error);
    }
}

    updateTeamUI(team = null) {
        const noTeamSection = document.getElementById('noTeamSection');
        const teamSection = document.getElementById('teamSection');
        
        if (this.userProfile && this.userProfile.teamId && team) {
            noTeamSection.classList.add('hidden');
            teamSection.classList.remove('hidden');
            this.renderTeamVisitingCard(team);
        } else {
            noTeamSection.classList.remove('hidden');
            teamSection.classList.add('hidden');
        }
    }

renderTeamVisitingCard(team) {
    document.getElementById('teamCardName').textContent = team.name;
    
    const sloganElement = document.getElementById('teamCardSlogan');
    sloganElement.textContent = team.slogan || 'Без слогана';
    
    // Добавляем возможность редактирования слогана для капитана
    if (this.currentUser && this.currentUser.uid === team.captain) {
        sloganElement.classList.add('editable');
        sloganElement.title = 'Кликните для редактирования слогана';
        sloganElement.style.cursor = 'pointer';
        
        // Удаляем старый обработчик если есть и добавляем новый
        sloganElement.onclick = null;
        sloganElement.addEventListener('click', () => {
            this.editTeamSlogan(team);
        });
    } else {
        sloganElement.classList.remove('editable');
        sloganElement.title = '';
        sloganElement.style.cursor = 'default';
        sloganElement.onclick = null;
    }
    
    document.getElementById('teamAverageMMR').textContent = team.averageMMR || '0';
    document.getElementById('teamCreationDate').textContent = new Date(team.createdAt).toLocaleDateString('ru-RU');
    
    const tournamentStatus = team.tournamentStatus === 'participating' ? 'Участвует' : 'Не участвует';
    const tournamentColor = team.tournamentStatus === 'participating' ? '#FFD700' : 'var(--text-secondary)';
    document.getElementById('teamTournamentStatus').textContent = tournamentStatus;
    document.getElementById('teamTournamentStatus').style.color = tournamentColor;
    
    this.loadCaptainInfo(team.captain);
    this.renderTeamPlayers(team.members || {});
}

async editTeamSlogan(team) {
    if (!this.userProfile.teamId || this.currentUser.uid !== team.captain) {
        return;
    }
    
    const newSlogan = prompt('Введите новый слоган команды:', team.slogan || '');
    
    if (newSlogan === null) return; // Пользователь отменил
    
    const trimmedSlogan = newSlogan.trim();
    
    if (trimmedSlogan.length > 100) {
        alert('❌ Слоган не может превышать 100 символов');
        return;
    }
    
    try {
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`), {
            slogan: trimmedSlogan,
            updatedAt: Date.now()
        });
        
        // Обновляем UI
        document.getElementById('teamCardSlogan').textContent = trimmedSlogan || 'Без слогана';
        alert('✅ Слоган команды обновлен!');
        
    } catch (error) {
        console.error('❌ Ошибка обновления слогана:', error);
        alert('❌ Ошибка обновления слогана');
    }
}

async loadCaptainInfo(captainId) {
    try {
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${captainId}`));
        if (snapshot.exists()) {
            const captain = snapshot.val();
            document.getElementById('teamCaptainName').textContent = captain.nickname || captain.username;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о капитане:', error);
        document.getElementById('teamCaptainName').textContent = 'Неизвестно';
    }
}

    renderTeamPlayers(members) {
        const playersGrid = document.getElementById('teamPlayersGrid');
        playersGrid.innerHTML = '';
        
        const positions = {
            'carry': 'Керри',
            'mid': 'Мидер',
            'offlane': 'Оффлейнер', 
            'support4': 'Саппорт 4',
            'support5': 'Саппорт 5'
        };
        
        Object.entries(members).forEach(([memberId, memberData]) => {
            const isCaptain = memberData.role === 'captain';
            const positionName = positions[memberData.position] || 'Не указана';
            
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card-bublas';
            playerCard.innerHTML = `
                <div class="player-role-bublas">
                    ${isCaptain ? '👑 ' : ''}${positionName}
                    ${isCaptain ? '<span style="color: var(--accent-gold); font-size: 0.8em;">(Капитан)</span>' : ''}
                </div>
                <div class="player-name-bublas">${memberData.nickname}</div>
                <div style="margin-top: 8px; color: var(--text-secondary); font-size: 0.9em;">
                    MMR: ${memberData.mmr || '0'}
                </div>
            `;
            
            playersGrid.appendChild(playerCard);
        });
    }

    // === СИСТЕМА УВЕДОМЛЕНИЙ ===
async loadNotifications() {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}`));
        const notifications = snapshot.val() || {};
        
        const sortedNotifications = Object.entries(notifications)
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        
        this.updateNotificationsUI(sortedNotifications);
    } catch (error) {
        console.error('❌ Ошибка загрузки уведомлений:', error);
    }
}

updateNotificationsUI(notifications) {
    const systemList = document.getElementById('systemNotificationsList');
    const historyList = document.getElementById('notificationHistoryList');
    const badge = document.getElementById('notificationBadge');
    
    let systemHTML = '';
    let historyHTML = '';
    let unreadCount = 0;
    
    if (notifications && Object.keys(notifications).length > 0) {
        Object.entries(notifications).forEach(([id, notification]) => {
            const notificationElement = this.createNotificationElement(id, notification);
            
            // Разделяем на системные (непрочитанные/необработанные) и историю
            if (!notification.read || 
                (notification.type === 'friend_request' && !notification.responded) || 
                (notification.type === 'team_invite' && !notification.responded) ||
                (notification.type === 'team_application' && !notification.responded) ||
                (notification.type === 'match_invite' && !notification.responded)) {
                systemHTML += notificationElement;
                if (!notification.read) unreadCount++;
            } else {
                historyHTML += notificationElement;
            }
        });
    }
    
    systemList.innerHTML = systemHTML || '<div class="no-data">Нет системных уведомлений</div>';
    historyList.innerHTML = historyHTML || '<div class="no-data">История уведомлений пуста</div>';
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

createNotificationElement(id, notification) {
    let actionsHTML = '';
    
    // Для системных уведомлений (непрочитанных) показываем кнопки действий
    if (!notification.read || 
        (notification.type === 'friend_request' && !notification.responded) || 
        (notification.type === 'team_invite' && !notification.responded) ||
        (notification.type === 'team_application' && !notification.responded) ||
        (notification.type === 'match_invite' && !notification.responded)) {
        
        switch(notification.type) {
            case 'team_invite':
                actionsHTML = `
                    <button class="save-btn" onclick="app.acceptTeamInvite('${id}', '${notification.teamId}')">✓ Принять</button>
                    <button class="cancel-btn" onclick="app.rejectTeamInvite('${id}')">✗ Отклонить</button>
                `;
                break;
            case 'friend_request':
                actionsHTML = `
                    <button class="save-btn" onclick="app.acceptFriendRequest('${id}', '${notification.fromUserId}')">✓ Принять</button>
                    <button class="cancel-btn" onclick="app.rejectFriendRequest('${id}', '${notification.fromUserId}')">✗ Отклонить</button>
                `;
                break;
            case 'team_application':
                actionsHTML = `
                    <button class="save-btn" onclick="app.acceptTeamApplication('${id}', '${notification.applicationId}', '${notification.teamId}', '${notification.fromUserId}')">✓ Принять</button>
                    <button class="cancel-btn" onclick="app.rejectTeamApplication('${id}', '${notification.applicationId}', '${notification.teamId}', '${notification.fromUserId}')">✗ Отклонить</button>
                `;
                break;
            case 'match_invite':
                actionsHTML = `
                    <button class="save-btn" data-action="acceptMatchInvite" data-notification-id="${id}" data-match-id="${notification.matchId}">✓ Принять</button>
                    <button class="cancel-btn" data-action="rejectMatchInvite" data-notification-id="${id}" data-match-id="${notification.matchId}">✗ Отклонить</button>
                `;
                break;
            default:
                if (!notification.read) {
                    actionsHTML = `<button class="add-btn" onclick="app.markNotificationAsRead('${id}')">✓ Прочитано</button>`;
                }
                break;
        }
    } else {
        // Для истории уведомлений (прочитанных) показываем только кнопку удаления
        actionsHTML = `
            <button class="cancel-btn delete-notification-btn" onclick="app.deleteNotification('${id}')" 
                    title="Удалить уведомление" style="padding: 6px 12px; font-size: 0.8em;">
                🗑️ Удалить
            </button>
        `;
    }
    
    let messageWithLinks = notification.message;
    if (notification.fromUserName) {
        const userNameRegex = new RegExp(notification.fromUserName, 'g');
        messageWithLinks = messageWithLinks.replace(userNameRegex, 
            `<span class="clickable-nickname" onclick="app.viewUserProfile('${notification.fromUserId}')">${notification.fromUserName}</span>`
        );
    }
    
    return `
        <div class="notification-item ${notification.read ? '' : 'unread'}">
            <div class="notification-content">
                <div class="notification-type">${this.getNotificationType(notification.type)}</div>
                <div>${messageWithLinks}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
            <div class="notification-actions">
                ${actionsHTML}
            </div>
        </div>
    `;
}

async deleteNotification(notificationId) {
    if (!this.currentUser || !confirm('🗑️ Удалить это уведомление?')) {
        return;
    }
    
    try {
        await this.firebase.remove(
            this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`)
        );
        
        console.log('✅ Уведомление удалено:', notificationId);
        this.loadNotifications();
        
    } catch (error) {
        console.error('❌ Ошибка удаления уведомления:', error);
        alert('❌ Ошибка удаления уведомления');
    }
}

async acceptFriendRequest(notificationId, fromUserId) {
    if (!this.currentUser) return;
    
    try {
        await this.addFriend(this.currentUser.uid, fromUserId);
        await this.addFriend(fromUserId, this.currentUser.uid);
        
        // Используем this.firebase вместо window.firebase
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'friend_accepted',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            message: `${this.userProfile.nickname || this.userProfile.username} принял(а) ваш запрос дружбы`,
            timestamp: Date.now(),
            read: false,
            responded: true
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${fromUserId}/${acceptNotificationId}`), acceptNotification);
        await this.limitNotifications(fromUserId);
        
        this.loadNotifications();
        this.loadFriendsList();
        alert('✅ Друг добавлен!');
        
    } catch (error) {
        console.error('❌ Ошибка принятия запроса дружбы:', error);
        alert('❌ Ошибка принятия запроса дружбы');
    }
}

async addFriend(userId, friendId) {
    // Используем this.firebase вместо window.firebase
    const userRef = this.firebase.ref(this.firebase.database, `users/${userId}`);
    const snapshot = await this.firebase.get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const friends = userData.friends || [];
        
        if (!friends.includes(friendId)) {
            friends.push(friendId);
            await this.firebase.update(userRef, { friends });
        }
    }
}

async rejectFriendRequest(notificationId, fromUserId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        this.loadNotifications();
        alert('✅ Запрос дружбы отклонен');
    } catch (error) {
        console.error('❌ Ошибка отклонения запроса:', error);
    }
}

async acceptTeamInvite(notificationId, teamId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamRef = this.firebase.ref(this.firebase.database, `teams/${teamId}`);
        const teamSnapshot = await this.firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.members && team.members[this.currentUser.uid]) {
            alert('ℹ️ Вы уже состоите в этой команде');
            return;
        }
        
        const updatedMembers = {
            ...team.members,
            [this.currentUser.uid]: {
                role: 'member',
                nickname: this.userProfile.nickname || this.userProfile.username,
                position: this.userProfile.position || '',
                mmr: this.userProfile.mmr || 0,
                joinedAt: Date.now()
            }
        };
        
        const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
        
        await this.firebase.update(teamRef, {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`), {
            teamId: teamId
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'team_join',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            message: `${this.userProfile.nickname || this.userProfile.username} принял приглашение и присоединился к команде "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${team.captain}/${acceptNotificationId}`), acceptNotification);
        await this.limitNotifications(team.captain);
        
        this.userProfile.teamId = teamId;
        this.updateTeamUI();
        this.loadNotifications();
        
        alert('✅ Вы присоединились к команде!');
        await this.createPlayerJoinedNews(this.currentUser.uid, teamId);
        
    } catch (error) {
        console.error('❌ Ошибка принятия приглашения:', error);
        alert('❌ Ошибка принятия приглашения');
    }
}

async rejectTeamInvite(notificationId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        this.loadNotifications();
        alert('✅ Приглашение отклонено');
    } catch (error) {
        console.error('❌ Ошибка отклонения приглашения:', error);
    }
}
async acceptTeamApplication(notificationId, applicationId, teamId, userId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists() || teamSnapshot.val().captain !== this.currentUser.uid) {
            alert('❌ Только капитан может принимать заявки');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (Object.keys(team.members || {}).length >= 5) {
            alert('❌ Команда уже заполнена');
            return;
        }
        
        const userSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${userId}`));
        if (!userSnapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = userSnapshot.val();
        
        const updatedMembers = {
            ...team.members,
            [userId]: {
                role: 'member',
                nickname: user.nickname || user.username,
                position: user.position || '',
                mmr: user.mmr || 0,
                joinedAt: Date.now()
            }
        };
        
        const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teams/${teamId}`), {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${userId}`), {
            teamId: teamId
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teamApplications/${teamId}/${applicationId}`), {
            responded: true,
            accepted: true
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'application_accepted',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            teamId: teamId,
            teamName: team.name,
            message: `Ваша заявка в команду "${team.name}" была принята!`,
            timestamp: Date.now(),
            read: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${userId}/${acceptNotificationId}`), acceptNotification);
        await this.limitNotifications(userId);
        
        this.loadNotifications();
        this.loadTeamInfo();
        alert('✅ Игрок принят в команду!');
await this.createPlayerJoinedNews(userId, teamId);
        
    } catch (error) {
        console.error('❌ Ошибка принятия заявки:', error);
        alert('❌ Ошибка принятия заявки');
    }
}

async rejectTeamApplication(notificationId, applicationId, teamId, userId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists() || teamSnapshot.val().captain !== this.currentUser.uid) {
            alert('❌ Только капитан может отклонять заявки');
            return;
        }
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teamApplications/${teamId}/${applicationId}`), {
            responded: true,
            accepted: false
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const team = teamSnapshot.val();
        const rejectNotificationId = `notification_${Date.now()}`;
        const rejectNotification = {
            type: 'application_rejected',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            teamId: teamId,
            teamName: team.name,
            message: `Ваша заявка в команду "${team.name}" была отклонена`,
            timestamp: Date.now(),
            read: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${userId}/${rejectNotificationId}`), rejectNotification);
        await this.limitNotifications(userId);
        
        this.loadNotifications();
        alert('✅ Заявка отклонена');
        
    } catch (error) {
        console.error('❌ Ошибка отклонения заявки:', error);
        alert('❌ Ошибка отклонения заявки');
    }
}

async markNotificationAsRead(notificationId) {
    if (!this.currentUser) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        await this.firebase.update(this.firebase.ref(this.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
            read: true
        });
        this.loadNotifications();
    } catch (error) {
        console.error('❌ Ошибка отметки уведомления:', error);
    }
}
    // === ОГРАНИЧЕНИЕ УВЕДОМЛЕНИЙ ===
async limitNotifications(userId) {
    try {
        if (!this.currentUser) return;
        
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `notifications/${userId}`));
        if (!snapshot.exists()) return;
        
        const notifications = snapshot.val();
        const notificationEntries = Object.entries(notifications);
        
        if (notificationEntries.length > 5) {
            const sortedNotifications = notificationEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const notificationsToDelete = sortedNotifications.slice(0, notificationEntries.length - 5);
            
            for (const [notificationId] of notificationsToDelete) {
                try {
                    await this.firebase.remove(this.firebase.ref(this.firebase.database, `notifications/${userId}/${notificationId}`));
                } catch (deleteError) {
                    console.warn(`⚠️ Не удалось удалить уведомление ${notificationId}:`, deleteError);
                }
            }
        }
    } catch (error) {
        console.error('❌ Ошибка ограничения уведомлений:', error);
    }
}

// === СИСТЕМА ЛИДЕРБОРДА ===
async loadLeaderboards() {
    try {
        console.log('🔄 Загрузка лидерборда...');
        
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, 'users'));
        const leaderboardsList = document.getElementById('leaderboardsList');
        
        if (!snapshot.exists()) {
            leaderboardsList.innerHTML = '<div class="no-data">Нет зарегистрированных игроков</div>';
            return;
        }
        
        const users = snapshot.val();
        const filterPosition = document.getElementById('leaderboardFilter').value;
        
// В методе loadLeaderboards() после получения пользователей:
let players = Object.entries(users)
    .map(([userId, user]) => ({
        id: userId,
        ...user,
        mmr: user.mmr || 0
    }))
    .filter(user => user.mmr > 0 && !user.isBanned); // ← добавить проверку на бан
        
        // Применяем фильтр по позиции
        if (filterPosition !== 'all') {
            players = players.filter(user => user.position === filterPosition);
        }
        
        // Сортируем по MMR (по убыванию)
        players.sort((a, b) => b.mmr - a.mmr);
        
        this.updateLeaderboardsStats(players);
        await this.renderLeaderboardsList(players);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки лидерборда:', error);
        const leaderboardsList = document.getElementById('leaderboardsList');
        leaderboardsList.innerHTML = '<div class="no-data">Ошибка загрузки лидерборда</div>';
    }
}

updateLeaderboardsStats(players) {
    const totalPlayers = players.length;
    const averageMMR = totalPlayers > 0 
        ? Math.round(players.reduce((sum, player) => sum + player.mmr, 0) / totalPlayers)
        : 0;
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('averageMMR').textContent = averageMMR;
}

async renderLeaderboardsList(players) {
    const leaderboardsList = document.getElementById('leaderboardsList');
    
    if (players.length === 0) {
        const filterPosition = document.getElementById('leaderboardFilter').value;
        const message = filterPosition === 'all' 
            ? 'Нет игроков с указанным MMR'
            : `Нет игроков с позицией "${this.getPositionName(filterPosition)}"`;
        leaderboardsList.innerHTML = `<div class="no-data">${message}</div>`;
        return;
    }
    
    let leaderboardsHTML = '';
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const rank = i + 1;
        
        // Получаем информацию о команде игрока
        let teamInfo = 'Нет команды';
        let teamRole = '';
        let teamId = null;
        
        if (player.teamId) {
            try {
                const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${player.teamId}`));
                if (teamSnapshot.exists()) {
                    const team = teamSnapshot.val();
                    const memberData = team.members[player.id];
                    teamInfo = team.name;
                    teamRole = memberData ? this.getPositionName(memberData.position) : '';
                    teamId = player.teamId;
                }
            } catch (error) {
                console.error(`❌ Ошибка загрузки информации о команде для игрока ${player.id}:`, error);
            }
        }
        
        // Определяем класс для ранга
        let rankClass = 'rank-other';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';
        else if (rank <= 10) rankClass = 'rank-4-10';
        
        leaderboardsHTML += `
            <div class="leaderboard-item ${rankClass}">
                <div class="leaderboard-rank">${rank}</div>
                <div class="leaderboard-player">
                    <div class="leaderboard-avatar">
                        ${player.avatarUrl ? 
                            `<img src="${player.avatarUrl}" alt="Аватар" onerror="this.style.display='none'; this.parentElement.innerHTML='👤';">` : 
                            '👤'
                        }
                    </div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-nickname" onclick="app.viewUserProfile('${player.id}')">
                            ${player.nickname || player.username}
                        </div>
                        <div class="leaderboard-details">
                            <span class="leaderboard-position">${this.getPositionName(player.position)}</span>
                            ${teamId ? 
                                `<span class="leaderboard-team clickable-team" onclick="app.showTeamCardModal('${teamId}')">${teamInfo}${teamRole ? ` (${teamRole})` : ''}</span>` :
                                `<span class="leaderboard-team">${teamInfo}</span>`
                            }
                            ${player.telegram ? 
                                `<a href="https://t.me/${player.telegram.replace('@', '')}" class="leaderboard-telegram" target="_blank">${player.telegram}</a>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
                <div class="leaderboard-mmr">${player.mmr}</div>
            </div>
        `;
    }
    
    leaderboardsList.innerHTML = leaderboardsHTML;
}
async checkAndHideAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (!adminBtn) return;
    
    if (!this.currentUser) {
        adminBtn.style.display = 'none';
        return;
    }
    
    try {
        const isAdmin = await this.checkAdminRights();
        adminBtn.style.display = isAdmin ? 'flex' : 'none';
    } catch (error) {
        console.error('❌ Error checking admin rights:', error);
        adminBtn.style.display = 'none';
    }
}

// Метод проверки прав администратора
async checkAdminRights() {
    if (!this.currentUser) return false;
    
    try {
        // Проверяем email против списка админов
        const userEmail = this.currentUser.email;
        
        // Проверяем локальную конфигурацию
        if (typeof ADMIN_CONFIG !== 'undefined') {
            if (ADMIN_CONFIG.superAdmins.includes(userEmail)) {
                return true;
            }
        }
        
        // Проверяем базу данных Firebase
        const adminKey = userEmail.replace(/[.#$[\]]/g, '_');
        const snapshot = await this.firebase.get(
            this.firebase.ref(this.firebase.database, `adminUsers/${adminKey}`)
        );
        
        return snapshot.exists();
        
    } catch (error) {
        console.error('❌ Error checking admin rights:', error);
        return false;
    }
}
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    getPositionName(position) {
        const positions = {
            'carry': 'Керри',
            'mid': 'Мидер',
            'offlane': 'Оффлейнер',
            'support4': 'Саппорт 4',
            'support5': 'Саппорт 5'
        };
        return positions[position] || 'Не указана';
    }

    getNotificationType(type) {
        const types = {
            'friend_request': 'Запрос дружбы',
            'friend_accepted': 'Друг добавлен',
            'team_invite': 'Приглашение в команду',
            'team_join': 'Игрок присоединился',
            'team_leave': 'Игрок покинул команду',
            'team_disbanded': 'Команда распущена',
            'team_deleted': 'Команда удалена',
            'team_application': 'Заявка в команду',
            'application_accepted': 'Заявка принята',
            'application_rejected': 'Заявка отклонена',
            'team_removed': 'Удаление из команды',
            'team_captain': 'Новый капитан',
            'system': 'Системное уведомление'
        };
        return types[type] || 'Уведомление';
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString('ru-RU');
    }

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

    // === ПРОСМОТР ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ ===
async viewUserProfile(userId) {
    try {
        // Используем this.firebase вместо window.firebase
        const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${userId}`));
        if (!snapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = snapshot.val();
        this.showUserProfileModal(user);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля пользователя:', error);
        alert('❌ Ошибка загрузки профиля');
    }
}

async showTeamCardModal(teamId) {
    try {
        console.log('🔄 Loading team card for:', teamId);
        
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        this.renderTeamCardModal(teamId, team);
        
    } catch (error) {
        console.error('❌ Error loading team card:', error);
        alert('❌ Ошибка загрузки информации о команде');
    }
}

renderTeamCardModal(teamId, team) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content team-card-modal">
            <div class="modal-header">
                <h2>🏆 Карточка команды</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body team-card-modal-body">
                ${this.createTeamVisitingCardHTML(teamId, team)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

createTeamVisitingCardHTML(teamId, team) {
    const members = team.members || {};
    const memberCount = Object.keys(members).length;
    const isFullTeam = memberCount >= 5;
    
    // Получаем информацию о капитане
    let captainName = 'Неизвестно';
    if (members[team.captain]) {
        captainName = members[team.captain].nickname || 'Неизвестно';
    }
    
    // Создаем HTML для состава команды
    let playersHTML = '';
    Object.entries(members).forEach(([memberId, memberData]) => {
        const isCaptain = memberId === team.captain;
        const positionName = this.getPositionName(memberData.position);
        
        playersHTML += `
            <div class="player-card-bublas">
                <div class="player-role-bublas">
                    ${isCaptain ? '👑 ' : ''}${positionName}
                    ${isCaptain ? '<span style="color: var(--accent-gold); font-size: 0.8em;">(Капитан)</span>' : ''}
                </div>
                <div class="player-name-bublas" onclick="app.viewUserProfile('${memberId}')">
                    ${memberData.nickname}
                </div>
                <div style="margin-top: 8px; color: var(--text-secondary); font-size: 0.9em;">
                    MMR: ${memberData.mmr || '0'}
                </div>
            </div>
        `;
    });
    
    return `
        <div class="team-visiting-card">
            <div class="card-header">
                <div class="header-highlight"></div>
                <h2 class="team-name-bublas">${team.name}</h2>
                <p class="team-subtitle">${team.slogan || 'Без слогана'}</p>
            </div>
            
            <div class="team-card-content">
                <div class="players-section-bublas">
                    <h3 class="section-title-bublas">Состав команды</h3>
                    <div class="player-grid-bublas">
                        ${playersHTML}
                    </div>
                </div>
                
                <div class="stats-section-bublas">
                    <div class="mmr-display-bublas">
                        <div class="mmr-label-bublas">Средний MMR команды</div>
                        <div class="mmr-value-bublas">${team.averageMMR || 0}</div>
                    </div>
                    
                    <div class="tournament-section-bublas">
                        <div class="tournament-text-bublas">Участие в турнирах</div>
                        <div class="tournament-badge-bublas">
                            ${team.tournamentStatus === 'participating' ? '✅ Участвует' : '❌ Не участвует'}
                        </div>
                    </div>
                    
                    <div class="team-info-bublas">
                        <div class="info-item">
                            <strong>Статус состава:</strong>
                            <span class="team-status ${isFullTeam ? 'status-full' : 'status-open'}">
                                ${isFullTeam ? '✅ Полный состав' : '🟢 Ищут игроков'}
                            </span>
                        </div>
                        <div class="info-item">
                            <strong>Участников:</strong> ${memberCount}/5
                        </div>
                        <div class="info-item">
                            <strong>ID команды:</strong> ${teamId}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="team-footer-bublas">
                <div>Капитан команды: <span class="clickable-nickname" onclick="app.viewUserProfile('${team.captain}')">${captainName}</span></div>
                <div>Дата создания: ${new Date(team.createdAt).toLocaleDateString('ru-RU')}</div>
                
                ${this.userProfile && this.userProfile.teamId !== teamId ? `
                    <div class="team-actions" style="margin-top: 15px;">
                        <button class="add-btn" onclick="app.applyToTeamFromCard('${teamId}')" 
                                ${isFullTeam ? 'disabled style="background: var(--text-secondary);"' : ''}>
                            📨 Подать заявку
                        </button>
                    </div>
                ` : ''}
                
                ${this.userProfile && this.userProfile.teamId === teamId ? `
                    <div class="team-actions" style="margin-top: 15px;">
                        <span class="add-btn" style="background: var(--accent-success);">✅ Ваша команда</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

async applyToTeamFromCard(teamId) {
    if (!this.currentUser) {
        alert('❌ Для подачи заявки необходимо авторизоваться');
        return;
    }
    
    if (this.userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    // Используем существующий метод подачи заявки
    await this.applyToTeam(teamId);
    
    // Закрываем модальное окно после подачи заявки
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

async applyToTeamFromCard(teamId) {
    if (!this.currentUser) {
        alert('❌ Для подачи заявки необходимо авторизоваться');
        return;
    }
    
    if (this.userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    // Используем существующий метод подачи заявки
    await this.applyToTeam(teamId);
    
    // Закрываем модальное окно после подачи заявки
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

    showUserProfileModal(user) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>👤 Профиль игрока</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="user-profile-view">
                        <div class="profile-avatar" style="margin: 0 auto 20px;">
                            ${user.avatarUrl ? 
                                `<img src="${user.avatarUrl}" alt="Аватар" style="width: 80px; height: 80px; border-radius: 50%;">` : 
                                '<span class="avatar-icon">👤</span>'
                            }
                        </div>
                        <div class="user-info">
                            <h3>${user.nickname || user.username}</h3>
                            <p><strong>ID:</strong> ${user.userId || '---'}</p>
                            <p><strong>MMR:</strong> ${user.mmr || 0}</p>
                            <p><strong>Позиция:</strong> ${this.getPositionName(user.position)}</p>
                            <p><strong>Telegram:</strong> ${user.telegram || 'Не указан'}</p>
                            <p><strong>Статус:</strong> 
                                <span class="status-dot ${user.lastOnline && (Date.now() - user.lastOnline < 300000) ? 'status-online' : 'status-offline'}"></span>
                                ${user.lastOnline && (Date.now() - user.lastOnline < 300000) ? 'Онлайн' : 'Оффлайн'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
    showCreateTeamModal() {
        document.getElementById('createTeamModal').classList.remove('hidden');
    }

    closeCreateTeamModal() {
        document.getElementById('createTeamModal').classList.add('hidden');
        document.getElementById('teamNameInput').value = '';
        document.getElementById('teamSloganInput').value = '';
    }

    showJoinTeamModal() {
        document.getElementById('joinTeamModal').classList.remove('hidden');
    }

    closeJoinTeamModal() {
        document.getElementById('joinTeamModal').classList.add('hidden');
        document.getElementById('teamIdInput').value = '';
    }

    closeEditTeamModal() {
        document.getElementById('editTeamModal').classList.add('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // === СТАТУС ПОДКЛЮЧЕНИЯ ===
    updateConnectionStatus(connected) {
        const status = document.getElementById('connectionStatus');
        if (!status) return;
        
        const dot = status.querySelector('.status-dot');
        const text = status.querySelector('.status-text');
        
        if (connected) {
            status.classList.remove('hidden');
            if (dot) dot.classList.add('connected');
            if (text) text.textContent = 'Подключено';
        } else {
            status.classList.remove('hidden');
            if (dot) dot.classList.remove('connected');
            if (text) text.textContent = 'Нет подключения';
        }
    }

    // === АНИМИРОВАННЫЙ ФОН ===
    createAnimatedBackground() {
        const bg = document.getElementById('animatedBg');
        if (!bg) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 100 + 50;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 30 + 20;
            const animationDelay = Math.random() * 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${animationDuration}s`;
            particle.style.animationDelay = `${animationDelay}s`;
            
            bg.appendChild(particle);
        }
    }

        // 👇 ДОБАВЛЯЕМ ЗДЕСЬ НОВЫЙ МЕТОД initAdminPanel()
initAdminPanel() {
    try {
        // Проверяем, что файл админ-панели загружен
        if (typeof AdminPanel === 'undefined') {
            console.warn('⚠️ AdminPanel not found - skipping admin initialization');
            return;
        }
        
        // Проверяем, что админ конфиг загружен
        if (typeof ADMIN_CONFIG === 'undefined') {
            console.warn('⚠️ ADMIN_CONFIG not found - admin panel will not work');
            return;
        }
        
        console.log('🔐 Admin config detected:', ADMIN_CONFIG.adminEmail);
        
        // Создаем экземпляр админ-панели
        this.adminPanel = new AdminPanel(this);
        
        // Инициализируем админ-панель только после авторизации
        this.setupAdminAuthListener();
        
    } catch (error) {
        console.error('❌ Error initializing admin panel:', error);
    }
}

initMatchmakingSystem() {
    try {
        if (typeof MatchmakingSystem === 'undefined') {
            console.warn('⚠️ MatchmakingSystem not found - skipping matchmaking initialization');
            return;
        }
        
        this.matchmakingSystem = new MatchmakingSystem(this);
        this.matchmakingSystem.init();
        console.log('✅ Matchmaking system initialized');
        
    } catch (error) {
        console.error('❌ Error initializing matchmaking system:', error);
    }
}

setupAdminAuthListener() {
    // Слушаем изменения авторизации
    this.firebase.onAuthStateChanged((user) => {
        if (user && this.adminPanel) {
            // Переинициализируем админ-панель при смене пользователя
            setTimeout(() => {
                this.adminPanel.init().then(() => {
                    console.log('✅ Admin panel reinitialized for user:', user.email);
                }).catch(error => {
                    console.error('❌ Admin panel reinitialization failed:', error);
                });
            }, 1000);
        }
    });
}

setupEventListeners() {
    console.log('🔧 Настройка обработчиков событий...');

    // === НАВИГАЦИЯ ===
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', () => this.showSection('profile'));
    
    const friendsBtn = document.getElementById('friendsBtn');
    if (friendsBtn) friendsBtn.addEventListener('click', () => this.showSection('friends'));
    
    const teamsListBtn = document.getElementById('teamsListBtn');
    if (teamsListBtn) teamsListBtn.addEventListener('click', () => this.showSection('teams'));
    
    const teamBtn = document.getElementById('teamBtn');
    if (teamBtn) teamBtn.addEventListener('click', () => this.showSection('team'));
    
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            this.showSection('notification');
            this.loadNotifications();
        });
    }

    // Делегирование событий для уведомлений матчапов
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            const notificationId = target.getAttribute('data-notification-id');
            const matchId = target.getAttribute('data-match-id');
            
            if (action === 'acceptMatchInvite' && this.matchmakingSystem) {
                this.matchmakingSystem.acceptMatchInvite(notificationId, matchId);
            } else if (action === 'rejectMatchInvite' && this.matchmakingSystem) {
                this.matchmakingSystem.rejectMatchInvite(notificationId, matchId);
            }
        }
    });

    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', async () => {
            if (!this.currentUser) {
                alert('❌ Для доступа к админ-панели необходимо авторизоваться');
                this.showSection('auth');
                return;
            }
            
            const isAdmin = await this.checkAdminRights();
            if (!isAdmin) {
                alert('❌ Недостаточно прав для доступа к админ-панели');
                this.showSection('profile');
                return;
            }
            
            this.showSection('admin');
            if (this.adminPanel) {
                this.adminPanel.hideAdminPanel();
            }
        });
    }
    
const matchesBtn = document.getElementById('matchesBtn');
if (matchesBtn) {
    matchesBtn.addEventListener('click', () => {
        if (!this.currentUser) {
            alert('❌ Для доступа к матчапам необходимо авторизоваться');
            this.showSection('auth');
            return;
        }
        
        // Используем метод из matchmakingSystem
        if (this.matchmakingSystem) {
            this.matchmakingSystem.showMatchmakingSection();
        } else {
            // Если система матчапов не инициализирована, показываем простую заглушку
            this.showBasicMatchmakingStub();
        }
    });
}
    
    const newsBtn = document.getElementById('newsBtn');
    if (newsBtn) {
        newsBtn.addEventListener('click', () => {
            if (!this.currentUser) {
                alert('❌ Для просмотра новостей необходимо авторизоваться');
                this.showSection('auth');
                return;
            }
            this.showSection('news');
            this.loadNews();
        });
    }
    
    const leaderboardsBtn = document.getElementById('leaderboardsBtn');
    if (leaderboardsBtn) {
        leaderboardsBtn.addEventListener('click', () => {
            this.showSection('leaderboards');
            this.loadLeaderboards();
        });
    }
    
    // === АВТОРИЗАЦИЯ ===
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        this.loginUser(email, password);
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const nickname = document.getElementById('registerNickname').value;
        const telegram = document.getElementById('registerTelegram').value;
        this.registerUser(email, password, confirmPassword, nickname, telegram);
    });
    
    // Табы авторизации
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-tab-pane').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
    
    // === ПРОФИЛЬ ===
    document.getElementById('saveProfileBtn').addEventListener('click', this.saveProfile);
    document.getElementById('logoutBtn').addEventListener('click', this.logoutUser);
    
    // Аватарки
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        document.getElementById('avatarUpload').click();
    });
    
    document.getElementById('avatarUpload').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            this.uploadAvatar(file);
            event.target.value = '';
        }
    });
    
    // === ДРУЗЬЯ ===
    document.getElementById('searchFriendBtn').addEventListener('click', () => this.searchFriends());
    
    // === КОМАНДЫ ===
    document.getElementById('createTeamBtn').addEventListener('click', () => this.showCreateTeamModal());
    document.getElementById('joinTeamBtn').addEventListener('click', () => this.showJoinTeamModal());
    
    // === ЛИДЕРБОРД ===
    const leaderboardFilter = document.getElementById('leaderboardFilter');
    if (leaderboardFilter) {
        leaderboardFilter.addEventListener('change', () => this.loadLeaderboards());
    }

    const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', () => this.loadLeaderboards());
    }
    
    // === УДАЛЕНИЕ КОМАНДЫ ===
    document.getElementById('confirmDeleteTeamBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.deleteTeam();
    });

    document.getElementById('cancelDeleteTeamBtn')?.addEventListener('click', () => {
        this.closeDeleteTeamModal();
    });

    document.getElementById('closeDeleteTeamModal')?.addEventListener('click', () => {
        this.closeDeleteTeamModal();
    });

    document.getElementById('deleteTeamForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.deleteTeam();
    });
    
    // Закрытие модальных окон
    document.getElementById('closeCreateTeamModal').addEventListener('click', () => this.closeCreateTeamModal());
    document.getElementById('cancelCreateTeamBtn').addEventListener('click', () => this.closeCreateTeamModal());
    document.getElementById('closeJoinTeamModal').addEventListener('click', () => this.closeJoinTeamModal());
    document.getElementById('cancelJoinTeamBtn').addEventListener('click', () => this.closeJoinTeamModal());
    
    // Табы уведомлений
    document.querySelectorAll('.notification-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            document.querySelectorAll('.notification-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.notification-tab-pane').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // === НОВОСТИ ===
    const refreshNewsBtn = document.getElementById('refreshNews');
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', () => this.loadNews());
    }

    const newsFilter = document.getElementById('newsFilter');
    if (newsFilter) {
        newsFilter.addEventListener('change', () => this.loadNews());
    }

    const timeFilter = document.getElementById('timeFilter');
    if (timeFilter) {
        timeFilter.addEventListener('change', () => this.loadNews());
    }
    
    // === ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ ===
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            this.closeAllModals();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            this.closeAllModals();
        }
    });
    
    console.log('✅ Обработчики событий настроены');
}


    // === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК КОМАНД ===
    switchTeamTab(tabName) {
        console.log(`🔄 Переключение на вкладку: ${tabName}`);
        document.querySelectorAll('.team-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.team-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        const activeButton = document.querySelector(`[onclick="app.switchTeamTab('${tabName}')"]`);
        const activePane = document.getElementById(tabName);
        
        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activePane.classList.add('active');
        }
    }


    setupTeamEventListeners() {
        console.log('🔧 Настройка обработчиков событий для команд...');
        
        const confirmCreateTeamBtn = document.getElementById('confirmCreateTeamBtn');
        if (confirmCreateTeamBtn) {
            confirmCreateTeamBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const teamName = document.getElementById('teamNameInput').value.trim();
                const slogan = document.getElementById('teamSloganInput').value.trim();
                
                if (!teamName) {
                    alert('❌ Введите название команды');
                    return;
                }
                
                this.createTeam(teamName, slogan);
            });
        }
        
        const invitePlayersBtn = document.getElementById('invitePlayersBtn');
        if (invitePlayersBtn) {
            invitePlayersBtn.addEventListener('click', () => this.showInvitePlayersModal());
        }
        
        const editTeamBtn = document.getElementById('editTeamBtn');
        if (editTeamBtn) {
            editTeamBtn.addEventListener('click', () => this.showEditTeamModal());
        }
        
        const deleteTeamBtn = document.getElementById('deleteTeamBtn');
        if (deleteTeamBtn) {
            deleteTeamBtn.addEventListener('click', () => this.showDeleteTeamModal());
        }
        
        const leaveTeamBtn = document.getElementById('leaveTeamBtn');
        if (leaveTeamBtn) {
            leaveTeamBtn.addEventListener('click', () => this.leaveTeam());
        }
        
        console.log('✅ Обработчики событий для команд настроены');
    }

    showInvitePlayersModal() {
        if (!this.userProfile.teamId) {
            alert('❌ У вас нет команды для приглашения игроков');
            return;
        }
        
        document.getElementById('invitePlayersModal').classList.remove('hidden');
        this.loadFriendsForInvite();
    }

    closeInvitePlayersModal() {
        document.getElementById('invitePlayersModal').classList.add('hidden');
        document.getElementById('friendSearchInput').value = '';
        document.getElementById('friendsSearchResults').innerHTML = '';
    }

async loadFriendsForInvite() {
    if (!this.currentUser || !this.userProfile.friends || this.userProfile.friends.length === 0) {
        document.getElementById('friendsListForInvite').innerHTML = '<div class="no-data">У вас пока нет друзей</div>';
        return;
    }
    
    const friendsList = document.getElementById('friendsListForInvite');
    let friendsHTML = '';
    
    try {
        for (const friendId of this.userProfile.friends) {
            // Используем this.firebase вместо window.firebase
            const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${friendId}`));
            if (snapshot.exists()) {
                const friend = snapshot.val();
                
                const hasTeam = friend.teamId && friend.teamId !== this.userProfile.teamId;
                
                friendsHTML += `
                    <div class="friend-card">
                        <div class="friend-info">
                            <div class="member-avatar">
                                ${friend.avatarUrl ? 
                                    `<img src="${friend.avatarUrl}" alt="Аватар" style="width: 100%; height: 100%; border-radius: 50%;">` : 
                                    '👤'
                                }
                            </div>
                            <div>
                                <h4>${friend.nickname || friend.username}</h4>
                                <p>${this.getPositionName(friend.position)} | MMR: ${friend.mmr || 0}</p>
                                <p>Telegram: ${friend.telegram || 'Не указан'}</p>
                            </div>
                        </div>
                        <div>
                            ${hasTeam ? 
                                '<span class="add-btn" style="background: var(--text-secondary); cursor: not-allowed;">✅ Уже в команде</span>' :
                                `<button class="add-btn" onclick="app.sendTeamInvite('${friendId}')">👥 Пригласить</button>`
                            }
                        </div>
                    </div>
                `;
            }
        }
        
        friendsList.innerHTML = friendsHTML || '<div class="no-data">У вас пока нет друзей</div>';
        
    } catch (error) {
        console.error('❌ Ошибка загрузки списка друзей:', error);
        friendsList.innerHTML = '<div class="no-data">Ошибка загрузки списка друзей</div>';
    }
}

async sendTeamInvite(friendId) {
    if (!this.currentUser || !this.userProfile.teamId) {
        alert('❌ У вас нет команды для отправки приглашений');
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.captain !== this.currentUser.uid) {
            alert('❌ Только капитан команды может отправлять приглашения');
            return;
        }
        
        const notificationId = `notification_${Date.now()}`;
        const notificationData = {
            type: 'team_invite',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            teamId: this.userProfile.teamId,
            teamName: team.name,
            teamSlogan: team.slogan || '',
            message: `${this.userProfile.nickname || this.userProfile.username} приглашает вас в команду "${team.name}"`,
            timestamp: Date.now(),
            read: false,
            responded: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${friendId}/${notificationId}`), notificationData);
        await this.limitNotifications(friendId);
        
        alert('✅ Приглашение отправлено!');
        
    } catch (error) {
        console.error('❌ Ошибка отправки приглашения:', error);
        alert('❌ Ошибка отправки приглашения');
    }
}
async leaveTeam() {
    if (!this.currentUser || !this.userProfile.teamId) return;
    
    if (!confirm('❌ Вы уверены, что хотите покинуть команду?')) {
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamRef = this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`);
        const teamSnapshot = await this.firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        const updatedMembers = { ...team.members };
        delete updatedMembers[this.currentUser.uid];
        
        if (Object.keys(updatedMembers).length === 0) {
            await this.firebase.remove(teamRef);
            
            const applicationsRef = this.firebase.ref(this.firebase.database, `teamApplications/${this.userProfile.teamId}`);
            await this.firebase.remove(applicationsRef);
            
            console.log('✅ Команда удалена (последний участник вышел)');
        } else {
            const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
            
            await this.firebase.update(teamRef, {
                members: updatedMembers,
                averageMMR: newAverageMMR
            });
            
            try {
                const leaveNotificationId = `notification_${Date.now()}`;
                const leaveNotification = {
                    type: 'team_leave',
                    fromUserId: this.currentUser.uid,
                    fromUserName: this.userProfile.nickname || this.userProfile.username,
                    message: `${this.userProfile.nickname || this.userProfile.username} покинул(а) вашу команду "${team.name}"`,
                    timestamp: Date.now(),
                    read: false
                };
                
                await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${team.captain}/${leaveNotificationId}`), leaveNotification);
                await this.limitNotifications(team.captain);
            } catch (notificationError) {
                console.error('❌ Ошибка отправки уведомления капитану:', notificationError);
            }
        }
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${this.currentUser.uid}`), {
            teamId: null
        });
        
        this.userProfile.teamId = null;
        this.updateTeamUI();
        
        alert('✅ Вы покинули команду');
        await this.createPlayerLeftNews(this.currentUser.uid, this.userProfile.teamId);
        
    } catch (error) {
        console.error('❌ Ошибка выхода из команды:', error);
        alert('❌ Ошибка выхода из команды');
    }
}
    showDeleteTeamModal() {
        if (!this.currentUser || !this.userProfile.teamId) return;
        
        const teamName = document.getElementById('teamCardName').textContent;
        document.getElementById('teamNameToDelete').textContent = teamName;
        document.getElementById('confirmTeamNameInput').value = '';
        document.getElementById('deleteTeamModal').classList.remove('hidden');
    }

async deleteTeam() {
    if (!this.currentUser || !this.userProfile.teamId) return;
    
    const teamName = document.getElementById('teamCardName').textContent;
    const confirmInput = document.getElementById('confirmTeamNameInput').value.trim();
    
    if (confirmInput !== teamName) {
        alert('❌ Название команды не совпадает!');
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamRef = this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`);
        const teamSnapshot = await this.firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.captain !== this.currentUser.uid) {
            alert('❌ Только капитан может удалить команду');
            return;
        }
        
        // Уведомляем всех участников о удалении команды
        Object.keys(team.members || {}).forEach(async memberId => {
            try {
                const deleteNotificationId = `notification_${Date.now()}`;
                const deleteNotification = {
                    type: 'team_deleted',
                    fromUserId: this.currentUser.uid,
                    fromUserName: this.userProfile.nickname || this.userProfile.username,
                    message: `Команда "${team.name}" была удалена капитаном`,
                    timestamp: Date.now(),
                    read: false
                };
                
                await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${memberId}/${deleteNotificationId}`), deleteNotification);
                
                await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${memberId}`), {
                    teamId: null
                });
                
                await this.limitNotifications(memberId);
            } catch (memberError) {
                console.error(`❌ Ошибка уведомления участника ${memberId}:`, memberError);
            }
        });
        
        await this.firebase.remove(teamRef);
        
        const applicationsRef = this.firebase.ref(this.firebase.database, `teamApplications/${this.userProfile.teamId}`);
        await this.firebase.remove(applicationsRef);
        
        this.userProfile.teamId = null;
        this.updateTeamUI();
        
        this.closeDeleteTeamModal();
        alert('✅ Команда удалена!');
        await this.createTeamDeletedNews(this.userProfile.teamId, this.currentUser.uid);
        
    } catch (error) {
        console.error('❌ Ошибка удаления команды:', error);
        alert('❌ Ошибка удаления команды');
    }
}
    closeDeleteTeamModal() {
        document.getElementById('deleteTeamModal').classList.add('hidden');
    }

async showEditTeamModal() {
    if (!this.currentUser || !this.userProfile || !this.userProfile.teamId) {
        alert('❌ У вас нет команды для редактирования');
        return;
    }
    
    try {
        console.log('🔄 Проверка прав капитана...');
        // Используем this.firebase вместо window.firebase
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        if (team.captain !== this.currentUser.uid) {
            alert('❌ Только капитан может редактировать команду');
            return;
        }
        
        console.log('✅ Пользователь является капитаном, открываем модальное окно');
        document.getElementById('editTeamModal').classList.remove('hidden');
        await this.loadTeamMembersForEdit(team);
        
    } catch (error) {
        console.error('❌ Ошибка проверки прав капитана:', error);
        alert('❌ Ошибка доступа к редактированию команды');
    }
}

async loadTeamMembersForEdit(team = null) {
    if (!this.userProfile.teamId) return;
    
    try {
        if (!team) {
            const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`));
            if (!snapshot.exists()) return;
            team = snapshot.val();
        }
        
        console.log('🔄 Загрузка членов команды для редактирования...');
        const membersContainer = document.getElementById('teamMembersEditList');
        
        let membersHTML = `
            <div class="team-general-settings">
                <h3 style="color: var(--accent-primary); margin-bottom: 15px;">⚙️ Общие настройки команды</h3>
                
                <!-- Поле для редактирования слогана -->
                <div class="form-group">
                    <label for="teamSloganEdit">Слоган команды:</label>
                    <input type="text" id="teamSloganEdit" class="form-input" 
                           value="${team.slogan || ''}" 
                           placeholder="Введите новый слоган команды" 
                           maxlength="100">
                    <div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 5px;">
                        Максимум 100 символов
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="teamTournamentStatusEdit">Статус участия в турнирах:</label>
                    <select id="teamTournamentStatusEdit" class="form-input">
                        <option value="not_participating" ${team.tournamentStatus === 'not_participating' ? 'selected' : ''}>Не участвует</option>
                        <option value="participating" ${team.tournamentStatus === 'participating' ? 'selected' : ''}>Участвует в турнирах</option>
                    </select>
                </div>
                
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="save-btn" onclick="app.updateTeamGeneralSettings()">💾 Сохранить настройки</button>
                </div>
            </div>
            
            <h3 style="color: var(--accent-primary); margin: 30px 0 15px 0;">👥 Управление составом</h3>
        `;
        
        // Остальной код для списка участников остается без изменений
        Object.entries(team.members || {}).forEach(([memberId, memberData]) => {
            const isCaptain = memberData.role === 'captain';
            const isCurrentUser = memberId === this.currentUser.uid;
            
            membersHTML += `
                <div class="team-member-edit">
                    <div class="member-edit-info">
                        <h4>${memberData.nickname} ${isCurrentUser ? '(Вы)' : ''}</h4>
                        <p>Текущая роль: ${this.getPositionName(memberData.position)} | MMR: ${memberData.mmr || 0}</p>
                        <p>Статус: ${isCaptain ? '👑 Капитан' : '👤 Участник'}</p>
                    </div>
                    <div class="member-edit-actions">
                        <div class="member-fields">
                            <input type="text" id="nickname_${memberId}" value="${memberData.nickname}" class="form-input" placeholder="Никнейм" style="margin-bottom: 5px;">
                            <select class="form-input" id="position_${memberId}" style="margin-bottom: 5px;">
                                <option value="">Выберите позицию</option>
                                <option value="carry" ${memberData.position === 'carry' ? 'selected' : ''}>Керри</option>
                                <option value="mid" ${memberData.position === 'mid' ? 'selected' : ''}>Мидер</option>
                                <option value="offlane" ${memberData.position === 'offlane' ? 'selected' : ''}>Оффлейнер</option>
                                <option value="support4" ${memberData.position === 'support4' ? 'selected' : ''}>Саппорт 4</option>
                                <option value="support5" ${memberData.position === 'support5' ? 'selected' : ''}>Саппорт 5</option>
                            </select>
                            <input type="number" id="mmr_${memberId}" value="${memberData.mmr || 0}" class="form-input" placeholder="MMR" style="margin-bottom: 5px;">
                        </div>
                        <div class="member-action-buttons">
                            <button class="add-btn" onclick="app.updateTeamMember('${memberId}')">💾 Обновить</button>
                            ${!isCaptain ? `
                                <button class="cancel-btn" onclick="app.removeTeamMember('${memberId}')">❌ Удалить</button>
                                <button class="save-btn" onclick="app.transferCaptaincy('${memberId}')">👑 Сделать капитаном</button>
                            ` : `
                                <span class="add-btn" style="background: var(--accent-gold); color: black; cursor: default;">👑 Капитан команды</span>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });
        
        membersContainer.innerHTML = membersHTML || '<div class="no-data">Нет участников в команде</div>';
        console.log('✅ Члены команды загружены для редактирования');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки членов команды для редактирования:', error);
        const membersContainer = document.getElementById('teamMembersEditList');
        membersContainer.innerHTML = '<div class="no-data">Ошибка загрузки участников</div>';
    }
}

async updateTeamGeneralSettings() {
    if (!this.userProfile.teamId) return;
    
    try {
        const tournamentStatus = document.getElementById('teamTournamentStatusEdit').value;
        const teamSlogan = document.getElementById('teamSloganEdit').value.trim();
        
        // Валидация слогана
        if (teamSlogan.length > 100) {
            alert('❌ Слоган не может превышать 100 символов');
            return;
        }
        
        const updateData = {
            tournamentStatus: tournamentStatus,
            updatedAt: Date.now()
        };
        
        // Добавляем слоган только если он не пустой
        if (teamSlogan) {
            updateData.slogan = teamSlogan;
        } else {
            updateData.slogan = ''; // Можно очистить слоган
        }
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`), updateData);
        
        // Обновляем UI
        this.loadTeamInfo();
        
        alert('✅ Настройки команды обновлены!');
        
    } catch (error) {
        console.error('❌ Ошибка обновления настроек команды:', error);
        alert('❌ Ошибка обновления настроек команды');
    }
}

async updateTeamMember(memberId) {
    if (!this.userProfile.teamId) return;
    
    try {
        const newNickname = document.getElementById(`nickname_${memberId}`).value.trim();
        const newPosition = document.getElementById(`position_${memberId}`).value;
        const newMMR = parseInt(document.getElementById(`mmr_${memberId}`).value) || 0;
        
        if (!newNickname) {
            alert('❌ Введите никнейм игрока');
            return;
        }
        
        // Используем this.firebase вместо window.firebase
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}/members/${memberId}`), {
            nickname: newNickname,
            position: newPosition,
            mmr: newMMR
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${memberId}`), {
            nickname: newNickname,
            mmr: newMMR,
            position: newPosition
        });
        
        if (memberId === this.currentUser.uid) {
            this.userProfile.nickname = newNickname;
            this.userProfile.mmr = newMMR;
            this.userProfile.position = newPosition;
            this.updateProfileUI();
        }
        
        await this.recalculateTeamAverageMMR();
        
        alert('✅ Данные игрока обновлены!');
        this.loadTeamMembersForEdit();
        this.loadTeamInfo();
        
    } catch (error) {
        console.error('❌ Ошибка обновления данных игрока:', error);
        alert('❌ Ошибка обновления данных');
    }
}

async recalculateTeamAverageMMR() {
    if (!this.userProfile.teamId) return;
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamSnapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`));
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        const newAverageMMR = await this.calculateTeamAverageMMR(team.members);
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`), {
            averageMMR: newAverageMMR,
            updatedAt: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Ошибка пересчета MMR команды:', error);
    }
}

async removeTeamMember(memberId) {
    if (!this.userProfile.teamId || !confirm('❌ Вы уверены, что хотите удалить этого игрока из команды?')) {
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamRef = this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`);
        const teamSnapshot = await this.firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        const updatedMembers = { ...team.members };
        delete updatedMembers[memberId];
        
        const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
        
        await this.firebase.update(teamRef, {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await this.firebase.update(this.firebase.ref(this.firebase.database, `users/${memberId}`), {
            teamId: null
        });
        
        const removeNotificationId = `notification_${Date.now()}`;
        const removeNotification = {
            type: 'team_removed',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            teamId: this.userProfile.teamId,
            teamName: team.name,
            message: `Вас удалили из команды "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${memberId}/${removeNotificationId}`), removeNotification);
        await this.limitNotifications(memberId);
        
        alert('✅ Игрок удален из команды');
        this.loadTeamMembersForEdit();
        this.loadTeamInfo();
        await this.createPlayerLeftNews(memberId, this.userProfile.teamId);
        
    } catch (error) {
        console.error('❌ Ошибка удаления игрока:', error);
        alert('❌ Ошибка удаления игрока');
    }
}

async transferCaptaincy(newCaptainId) {
    if (!this.userProfile.teamId || !confirm('👑 Вы уверены, что хотите передать капитанство?')) {
        return;
    }
    
    try {
        // Используем this.firebase вместо window.firebase
        const teamRef = this.firebase.ref(this.firebase.database, `teams/${this.userProfile.teamId}`);
        const teamSnapshot = await this.firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        
        const updatedMembers = { ...team.members };
        updatedMembers[this.currentUser.uid].role = 'member';
        updatedMembers[newCaptainId].role = 'captain';
        
        await this.firebase.update(teamRef, {
            captain: newCaptainId,
            members: updatedMembers
        });
        
        const captainNotificationId = `notification_${Date.now()}`;
        const captainNotification = {
            type: 'team_captain',
            fromUserId: this.currentUser.uid,
            fromUserName: this.userProfile.nickname || this.userProfile.username,
            teamId: this.userProfile.teamId,
            teamName: team.name,
            message: `Вы стали капитаном команды "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await this.firebase.set(this.firebase.ref(this.firebase.database, `notifications/${newCaptainId}/${captainNotificationId}`), captainNotification);
        await this.limitNotifications(newCaptainId);
        
        this.userProfile.teamId = null;
        
        alert('✅ Капитанство передано!');
        this.closeEditTeamModal();
        this.loadTeamInfo();
        await this.createCaptainChangeNews(newCaptainId, this.userProfile.teamId);
        
    } catch (error) {
        console.error('❌ Ошибка передачи капитанства:', error);
        alert('❌ Ошибка передачи капитанства');
    }
}

// === СИСТЕМА НОВОСТЕЙ ===
async loadNews() {
    if (!this.currentUser) {
        console.log('❌ loadNews: Пользователь не авторизован');
        document.getElementById('newsList').innerHTML = '<div class="no-data">Для просмотра новостей необходимо авторизоваться</div>';
        return;
    }

    try {
        console.log('🔄 Загрузка новостей...');
        
        const newsRef = this.firebase.ref(this.firebase.database, 'news');
        console.log('📡 Ссылка на новости:', newsRef.toString());
        
        const snapshot = await this.firebase.get(newsRef);
        console.log('📊 Снапшот новостей:', snapshot.exists() ? 'существует' : 'не существует');
        
        const newsContainer = document.getElementById('newsList');
        
        if (!snapshot.exists()) {
            console.log('📭 В базе нет новостей');
            newsContainer.innerHTML = '<div class="no-data">📰 Новостей пока нет. События появятся здесь автоматически!</div>';
            return;
        }
        
        const newsData = snapshot.val();
        console.log('📨 Полученные новости:', newsData);
        
        let allNews = Object.entries(newsData)
            .map(([id, item]) => ({ id, ...item }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('📋 Отсортированные новости:', allNews);
        
        // Применяем фильтры
        allNews = this.filterNews(allNews);
        console.log('🎯 Отфильтрованные новости:', allNews);
        
        this.renderNewsList(allNews);
        this.updateNewsStats(allNews);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки новостей:', error);
        console.error('🔧 Детали ошибки:', error.code, error.message);
        document.getElementById('newsList').innerHTML = '<div class="no-data">Ошибка загрузки новостей</div>';
    }
}

    filterNews(news) {
        const typeFilter = document.getElementById('newsFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        
        let filteredNews = news;

        // Фильтр по типу
        if (typeFilter !== 'all') {
            filteredNews = filteredNews.filter(item => item.type === typeFilter);
        }

        // Фильтр по времени
        if (timeFilter !== 'all') {
            const now = Date.now();
            const timeRanges = {
                'today': 24 * 60 * 60 * 1000,
                'week': 7 * 24 * 60 * 60 * 1000,
                'month': 30 * 24 * 60 * 60 * 1000
            };
            
            filteredNews = filteredNews.filter(item => 
                now - item.timestamp < timeRanges[timeFilter]
            );
        }

        return filteredNews;
    }

    renderNewsList(news) {
        const newsContainer = document.getElementById('newsList');
        
        if (!news || news.length === 0) {
            newsContainer.innerHTML = '<div class="no-data">📰 Новостей по выбранным фильтрам нет</div>';
            return;
        }

        let newsHTML = '';
        
        news.forEach(item => {
            const timeAgo = this.getNewsTimeAgo(item.timestamp);
            const typeIcon = this.getNewsTypeIcon(item.type);
            
            newsHTML += `
                <div class="news-item ${item.type}">
                    <div class="news-header">
                        <span class="news-type ${item.type}">
                            ${typeIcon} ${this.getNewsTypeText(item.type)}
                        </span>
                        <span class="news-time">${timeAgo}</span>
                    </div>
                    <div class="news-content">
                        ${this.formatNewsMessage(item)}
                    </div>
                    ${this.getNewsActions(item)}
                </div>
            `;
        });

        newsContainer.innerHTML = newsHTML;
    }

    getNewsTypeIcon(type) {
        const icons = {
            'team-change': '🔄',
            'captain-change': '👑',
            'team-deleted': '🗑️',
            'player-joined': '➕',
            'player-left': '➖',
            'team-created': '🏆'
        };
        return icons[type] || '📢';
    }

    getNewsTypeText(type) {
        const texts = {
            'team-change': 'Смена команды',
            'captain-change': 'Новый капитан', 
            'team-deleted': 'Удаление команды',
            'player-joined': 'Новый участник',
            'player-left': 'Уход из команды',
            'team-created': 'Создание команды'
        };
        return texts[type] || 'Событие';
    }

    formatNewsMessage(news) {
        let message = news.message;
        
        // Делаем имена игроков кликабельными
        if (news.playerName && news.playerId) {
            message = message.replace(
                news.playerName, 
                `<span class="clickable-nickname" onclick="app.viewUserProfile('${news.playerId}')">${news.playerName}</span>`
            );
        }
        
        if (news.captainName && news.captainId) {
            message = message.replace(
                news.captainName, 
                `<span class="clickable-nickname" onclick="app.viewUserProfile('${news.captainId}')">${news.captainName}</span>`
            );
        }
        
        // Делаем названия команд кликабельными
        if (news.teamName && news.teamId) {
            message = message.replace(
                news.teamName, 
                `<span class="clickable-team" onclick="app.showTeamCardModal('${news.teamId}')">${news.teamName}</span>`
            );
        }
        
        if (news.fromTeam && news.fromTeamId) {
            message = message.replace(
                news.fromTeam, 
                `<span class="clickable-team" onclick="app.showTeamCardModal('${news.fromTeamId}')">${news.fromTeam}</span>`
            );
        }
        
        if (news.toTeam && news.toTeamId) {
            message = message.replace(
                news.toTeam, 
                `<span class="clickable-team" onclick="app.showTeamCardModal('${news.toTeamId}')">${news.toTeam}</span>`
            );
        }

        return message;
    }

    getNewsActions(news) {
        let actions = '';
        
        if (news.playerId) {
            actions += `<button class="news-action-btn" onclick="app.viewUserProfile('${news.playerId}')">👤 Профиль игрока</button>`;
        }
        
        if (news.teamId) {
            actions += `<button class="news-action-btn" onclick="app.showTeamCardModal('${news.teamId}')">🏆 Инфо команды</button>`;
        }
        
        if (actions) {
            return `<div class="news-actions">${actions}</div>`;
        }
        
        return '';
    }

    getNewsTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return new Date(timestamp).toLocaleDateString('ru-RU');
    }

    updateNewsStats(news) {
        const totalNews = news.length;
        const today = new Date().setHours(0, 0, 0, 0);
        const todayNews = news.filter(item => item.timestamp >= today).length;
        
        document.getElementById('totalNews').textContent = totalNews;
        document.getElementById('todayNews').textContent = todayNews;
    }

    // === МЕТОДЫ ДЛЯ СОЗДАНИЯ НОВОСТЕЙ ===
async createNews(type, data) {
    if (!this.currentUser) {
        console.log('❌ createNews: Пользователь не авторизован');
        return;
    }
    
    try {
        console.log('🔄 Создание новости:', type);
        console.log('📝 Данные для новости:', data);
        
        const newsId = `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newsData = {
            type: type,
            ...data,
            timestamp: Date.now(),
            createdBy: this.currentUser.uid
        };
        
        console.log('📨 Полные данные новости:', newsData);
        console.log('🔗 Путь в базе:', `news/${newsId}`);
        
        const newsRef = this.firebase.ref(this.firebase.database, `news/${newsId}`);
        console.log('📡 Ссылка на запись:', newsRef.toString());
        
        await this.firebase.set(newsRef, newsData);
        console.log('✅ Новость успешно создана в базе:', newsId);
        
        // Проверяем, что новость действительно записалась
        const checkRef = this.firebase.ref(this.firebase.database, `news/${newsId}`);
        const checkSnapshot = await this.firebase.get(checkRef);
        console.log('✅ Проверка записи:', checkSnapshot.exists() ? 'НОВОСТЬ ЗАПИСАНА' : 'НОВОСТЬ НЕ ЗАПИСАНА');
        
    } catch (error) {
        console.error('❌ Ошибка создания новости:', error);
        console.error('🔧 Код ошибки:', error.code);
        console.error('🔧 Сообщение ошибки:', error.message);
        alert('❌ Ошибка создания новости: ' + error.message);
    }
}

    async createTeamCreatedNews(teamId, captainId) {
        const [captain, team] = await Promise.all([
            this.getUserProfile(captainId),
            this.getTeamInfo(teamId)
        ]);
        
        if (captain && team) {
            await this.createNews('team-created', {
                captainName: captain.nickname || captain.username,
                captainId: captainId,
                teamName: team.name,
                teamId: teamId,
                message: `Создана новая команда "${team.name}" с капитаном ${captain.nickname}`
            });
        }
    }

    async createPlayerJoinedNews(playerId, teamId) {
        const [player, team] = await Promise.all([
            this.getUserProfile(playerId),
            this.getTeamInfo(teamId)
        ]);
        
        if (player && team) {
            await this.createNews('player-joined', {
                playerName: player.nickname || player.username,
                playerId: playerId,
                teamName: team.name,
                teamId: teamId,
                message: `Игрок ${player.nickname} присоединился к команде ${team.name}`
            });
        }
    }

    async createPlayerLeftNews(playerId, teamId) {
        const [player, team] = await Promise.all([
            this.getUserProfile(playerId),
            this.getTeamInfo(teamId)
        ]);
        
        if (player && team) {
            await this.createNews('player-left', {
                playerName: player.nickname || player.username,
                playerId: playerId,
                teamName: team.name,
                teamId: teamId,
                message: `Игрок ${player.nickname} покинул команду ${team.name}`
            });
        }
    }

    async createCaptainChangeNews(playerId, teamId) {
        const [player, team] = await Promise.all([
            this.getUserProfile(playerId),
            this.getTeamInfo(teamId)
        ]);
        
        if (player && team) {
            await this.createNews('captain-change', {
                playerName: player.nickname || player.username,
                playerId: playerId,
                teamName: team.name,
                teamId: teamId,
                message: `Игрок ${player.nickname} стал новым капитаном команды ${team.name}`
            });
        }
    }

    async createTeamDeletedNews(teamId, captainId) {
        const [captain, team] = await Promise.all([
            this.getUserProfile(captainId),
            this.getTeamInfo(teamId)
        ]);
        
        if (captain && team) {
            await this.createNews('team-deleted', {
                captainName: captain.nickname || captain.username,
                captainId: captainId,
                teamName: team.name,
                teamId: teamId,
                message: `Команда ${team.name} была удалена капитаном ${captain.nickname}`
            });
        }
    }

    // Вспомогательные методы
    async getUserProfile(userId) {
        try {
            const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `users/${userId}`));
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('❌ Ошибка получения профиля:', error);
            return null;
        }
    }

    async getTeamInfo(teamId) {
        try {
            const snapshot = await this.firebase.get(this.firebase.ref(this.firebase.database, `teams/${teamId}`));
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('❌ Ошибка получения информации о команде:', error);
            return null;
        }
    }

// === ТЕСТОВЫЙ МЕТОД ДЛЯ ПРОВЕРКИ НОВОСТЕЙ ===
    async testNewsCreation() {
        if (!this.currentUser) {
            alert('❌ Сначала авторизуйтесь');
            return;
        }
        
        try {
            console.log('🧪 Тестирование создания новости...');
            
            // Создаем тестовую новость
            await this.createNews('team-created', {
                captainName: 'TestCaptain',
                captainId: this.currentUser.uid,
                teamName: 'TestTeam',
                teamId: 'test_team_123',
                message: `Тестовая новость: создана команда "TestTeam" с капитаном TestCaptain`
            });
            
            console.log('✅ Тестовая новость создана');
            alert('✅ Тестовая новость создана! Проверьте раздел новостей.');
            
            // Перезагружаем новости
            this.loadNews();
            
        } catch (error) {
            console.error('❌ Ошибка тестирования:', error);
            alert('❌ Ошибка тестирования новостей: ' + error.message);
        }
    }

}


// Создаем и инициализируем приложение
const app = new IllusiveApp();

// Делаем методы доступными глобально для обработчиков событий в HTML
window.app = app;

// Экспортируем основные методы для использования в HTML
// (эти методы уже используют this.firebase внутри класса)
window.sendFriendRequest = (userId) => app.sendFriendRequest(userId);
window.applyToTeam = (teamId) => app.applyToTeam(teamId);
window.acceptFriendRequest = (notificationId, fromUserId) => app.acceptFriendRequest(notificationId, fromUserId);
window.rejectFriendRequest = (notificationId, fromUserId) => app.rejectFriendRequest(notificationId, fromUserId);
window.acceptTeamInvite = (notificationId, teamId) => app.acceptTeamInvite(notificationId, teamId);
window.rejectTeamInvite = (notificationId) => app.rejectTeamInvite(notificationId);
window.acceptTeamApplication = (notificationId, applicationId, teamId, userId) => app.acceptTeamApplication(notificationId, applicationId, teamId, userId);
window.rejectTeamApplication = (notificationId, applicationId, teamId, userId) => app.rejectTeamApplication(notificationId, applicationId, teamId, userId);
window.markNotificationAsRead = (notificationId) => app.markNotificationAsRead(notificationId);
window.viewUserProfile = (userId) => app.viewUserProfile(userId);
window.sendTeamInvite = (friendId) => app.sendTeamInvite(friendId);
window.updateTeamMember = (memberId) => app.updateTeamMember(memberId);
window.removeTeamMember = (memberId) => app.removeTeamMember(memberId);
window.transferCaptaincy = (newCaptainId) => app.transferCaptaincy(newCaptainId);
window.updateTeamGeneralSettings = () => app.updateTeamGeneralSettings();
window.recalculateTeamAverageMMR = () => app.recalculateTeamAverageMMR();
window.loadLeaderboards = () => app.loadLeaderboards();
// Глобальная функция для тестирования новостей
window.testNews = () => {
    if (app && app.testNewsCreation) {
        app.testNewsCreation();
    } else {
        alert('❌ Приложение не инициализировано');
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', async function() {  // ДОБАВЛЕНО async
    console.log('📄 DOM загружен, запуск приложения...');
    
    setTimeout(async () => {  // ДОБАВЛЕНО async
        console.log('🔍 Проверка элементов навигации:');
        console.log('- teamsListBtn:', document.getElementById('teamsListBtn'));
        console.log('- editTeamBtn:', document.getElementById('editTeamBtn'));
        console.log('- firebase loaded:', !!window.firebase);
        
        try {
            await app.init();  // ДОБАВЛЕНО await
        } catch (error) {
            console.error('❌ Fatal error during app initialization:', error);
            alert('Ошибка инициализации приложения. Пожалуйста, обновите страницу.');
        }
    }, 100);
});

window.showTeamCardModal = (teamId) => app.showTeamCardModal(teamId);
window.applyToTeamFromCard = (teamId) => app.applyToTeamFromCard(teamId);
// Глобальная функция для удаления уведомлений
window.deleteNotification = (notificationId) => {
    if (app && app.deleteNotification) {
        app.deleteNotification(notificationId);
    }
};

window.app = app;
window.showTeamCardModal = (teamId) => app.showTeamCardModal(teamId);
window.applyToTeamFromCard = (teamId) => app.applyToTeamFromCard(teamId);