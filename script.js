// === Illusive Community App ===
class IllusiveApp {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.isInitialized = false;
        
        // Инициализируем Firebase методы
        this.initializeFirebaseMethods();
        
        // Привязываем контекст для всех методов
        this.init = this.init.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupAuthStateListener = this.setupAuthStateListener.bind(this);
        this.showSection = this.showSection.bind(this);
        this.hideAllSections = this.hideAllSections.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.registerUser = this.registerUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
    }

initializeFirebaseMethods() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not loaded');
        return;
    }

    // Убедитесь, что Firebase инициализирован
    if (!firebase.apps.length && window.firebaseConfig) {
        firebase.initializeApp(window.firebaseConfig);
    }

    // Правильные методы для Firebase 9.x
    this.firebase = {
        // App
        app: firebase.app,
        
        // Auth methods
        auth: firebase.auth(),
        createUserWithEmailAndPassword: (email, password) => 
            firebase.auth().createUserWithEmailAndPassword(email, password),
        signInWithEmailAndPassword: (email, password) => 
            firebase.auth().signInWithEmailAndPassword(email, password),
        signOut: () => firebase.auth().signOut(),
        onAuthStateChanged: (callback) => 
            firebase.auth().onAuthStateChanged(callback),
        
        // Database methods - правильный синтаксис для Firebase 9.x
        database: firebase.database,
        ref: firebase.database.ref,
        set: firebase.database.set,
        get: firebase.database.get,
        update: firebase.database.update,
        push: firebase.database.push,
        onValue: firebase.database.onValue,
        off: firebase.database.off,
        remove: firebase.database.remove,
        
        // Storage methods
        storage: firebase.storage(),
        storageRef: (path) => firebase.storage().ref(path),
        uploadBytes: (ref, file) => ref.put(file),
        getDownloadURL: (ref) => ref.getDownloadURL()
    };

    console.log('✅ Firebase methods initialized');
}

    async init() {
        if (this.isInitialized) {
            console.log('🛑 App already initialized');
            return;
        }

        try {
            console.log('🚀 Инициализация Illusive Community...');
            
            // Проверяем загрузку Firebase
            await this.waitForFirebase();
            
            this.createAnimatedBackground();
            this.setupEventListeners();
            this.setupNavigation();
            this.setupAuthStateListener();
            this.setupTeamEventListeners();
            
            this.updateConnectionStatus(true);
            this.isInitialized = true;
            
            console.log('✅ Illusive Community успешно инициализирован');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.updateConnectionStatus(false);
        }
    }

    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.app) {
                    console.log('✅ Firebase loaded successfully');
                    resolve();
                } else {
                    console.log('⏳ Waiting for Firebase...');
                    setTimeout(checkFirebase, 100);
                }
            };
            
            // Таймаут 10 секунд
            setTimeout(() => {
                reject(new Error('Firebase loading timeout'));
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
        const protectedSections = ['friends', 'teams', 'team', 'notification'];
        if (protectedSections.includes(sectionName) && !this.currentUser) {
            alert('❌ Для доступа к этому разделу необходимо авторизоваться');
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
                })
                .catch(error => {
                    console.error('❌ Ошибка загрузки профиля:', error);
                    this.showAuthenticatedUI();
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
            
            await window.firebase.signInWithEmailAndPassword(window.firebase.auth, email, password);
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
            await window.firebase.signOut(window.firebase.auth);
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
                    const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${friendId}`));
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
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, 'users'));
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
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${toUserId}/${notificationId}`), notificationData);
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

            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, 'teams'));
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
            const captainSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${team.captain}`));
            if (captainSnapshot.exists()) {
                const captain = captainSnapshot.val();
                captainName = captain.nickname || captain.username;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки информации о капитане:', error);
        }
        
        let hasApplied = false;
        if (this.currentUser) {
            const applicationsSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teamApplications/${teamId}`));
            if (applicationsSnapshot.exists()) {
                const applications = applicationsSnapshot.val();
                hasApplied = Object.values(applications).some(app => app.userId === this.currentUser.uid && !app.responded);
            }
        }
        
        return `
            <div class="team-mini-card">
                <div class="team-mini-header">
                    <h4>${team.name}</h4>
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `teamApplications/${teamId}/${applicationId}`), applicationData);
            
            const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${teamId}`));
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
                
                await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${team.captain}/${notificationId}`), notificationData);
                await this.limitNotifications(team.captain);
            }
            
            alert('✅ Заявка отправлена!');
            this.loadTeamsList();
            
        } catch (error) {
            console.error('❌ Ошибка подачи заявки:', error);
            alert('❌ Ошибка подачи заявки');
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
            await window.firebase.set(window.firebase.ref(window.firebase.database, `teams/${teamId}`), teamData);
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${this.currentUser.uid}`), {
                teamId: teamId
            });
            
            this.userProfile.teamId = teamId;
            this.updateTeamUI();
            
            alert('✅ Команда создана! Вы - капитан команды.');
            this.closeCreateTeamModal();
            
        } catch (error) {
            console.error('❌ Ошибка создания команды:', error);
            alert('❌ Ошибка создания команды');
        }
    }

    async loadTeamInfo() {
        if (!this.userProfile || !this.userProfile.teamId) return;
        
        try {
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`));
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
        document.getElementById('teamCardSlogan').textContent = team.slogan || 'Без слогана';
        document.getElementById('teamAverageMMR').textContent = team.averageMMR || '0';
        document.getElementById('teamCreationDate').textContent = new Date(team.createdAt).toLocaleDateString('ru-RU');
        
        const tournamentStatus = team.tournamentStatus === 'participating' ? 'Участвует' : 'Не участвует';
        const tournamentColor = team.tournamentStatus === 'participating' ? '#FFD700' : 'var(--text-secondary)';
        document.getElementById('teamTournamentStatus').textContent = tournamentStatus;
        document.getElementById('teamTournamentStatus').style.color = tournamentColor;
        
        this.loadCaptainInfo(team.captain);
        this.renderTeamPlayers(team.members || {});
    }

    async loadCaptainInfo(captainId) {
        try {
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${captainId}`));
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
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}`));
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
                
                if (!notification.read || (notification.type === 'friend_request' && !notification.responded) || 
                    (notification.type === 'team_invite' && !notification.responded) ||
                    (notification.type === 'team_application' && !notification.responded)) {
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
            default:
                if (!notification.read) {
                    actionsHTML = `<button class="add-btn" onclick="app.markNotificationAsRead('${id}')">✓ Прочитано</button>`;
                }
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

    async acceptFriendRequest(notificationId, fromUserId) {
        if (!this.currentUser) return;
        
        try {
            await this.addFriend(this.currentUser.uid, fromUserId);
            await this.addFriend(fromUserId, this.currentUser.uid);
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${fromUserId}/${acceptNotificationId}`), acceptNotification);
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
        const userRef = window.firebase.ref(window.firebase.database, `users/${userId}`);
        const snapshot = await window.firebase.get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const friends = userData.friends || [];
            
            if (!friends.includes(friendId)) {
                friends.push(friendId);
                await window.firebase.update(userRef, { friends });
            }
        }
    }

    async rejectFriendRequest(notificationId, fromUserId) {
        if (!this.currentUser) return;
        
        try {
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            const teamRef = window.firebase.ref(window.firebase.database, `teams/${teamId}`);
            const teamSnapshot = await window.firebase.get(teamRef);
            
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
            
            await window.firebase.update(teamRef, {
                members: updatedMembers,
                averageMMR: newAverageMMR
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${this.currentUser.uid}`), {
                teamId: teamId
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${team.captain}/${acceptNotificationId}`), acceptNotification);
            await this.limitNotifications(team.captain);
            
            this.userProfile.teamId = teamId;
            this.updateTeamUI();
            this.loadNotifications();
            
            alert('✅ Вы присоединились к команде!');
            
        } catch (error) {
            console.error('❌ Ошибка принятия приглашения:', error);
            alert('❌ Ошибка принятия приглашения');
        }
    }

    async rejectTeamInvite(notificationId) {
        if (!this.currentUser) return;
        
        try {
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${teamId}`));
            if (!teamSnapshot.exists() || teamSnapshot.val().captain !== this.currentUser.uid) {
                alert('❌ Только капитан может принимать заявки');
                return;
            }
            
            const team = teamSnapshot.val();
            
            if (Object.keys(team.members || {}).length >= 5) {
                alert('❌ Команда уже заполнена');
                return;
            }
            
            const userSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${userId}`));
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
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teams/${teamId}`), {
                members: updatedMembers,
                averageMMR: newAverageMMR
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${userId}`), {
                teamId: teamId
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teamApplications/${teamId}/${applicationId}`), {
                responded: true,
                accepted: true
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${userId}/${acceptNotificationId}`), acceptNotification);
            await this.limitNotifications(userId);
            
            this.loadNotifications();
            this.loadTeamInfo();
            alert('✅ Игрок принят в команду!');
            
        } catch (error) {
            console.error('❌ Ошибка принятия заявки:', error);
            alert('❌ Ошибка принятия заявки');
        }
    }

    async rejectTeamApplication(notificationId, applicationId, teamId, userId) {
        if (!this.currentUser) return;
        
        try {
            const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${teamId}`));
            if (!teamSnapshot.exists() || teamSnapshot.val().captain !== this.currentUser.uid) {
                alert('❌ Только капитан может отклонять заявки');
                return;
            }
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teamApplications/${teamId}/${applicationId}`), {
                responded: true,
                accepted: false
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${userId}/${rejectNotificationId}`), rejectNotification);
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
            await window.firebase.update(window.firebase.ref(window.firebase.database, `notifications/${this.currentUser.uid}/${notificationId}`), {
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
            
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `notifications/${userId}`));
            if (!snapshot.exists()) return;
            
            const notifications = snapshot.val();
            const notificationEntries = Object.entries(notifications);
            
            if (notificationEntries.length > 5) {
                const sortedNotifications = notificationEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                const notificationsToDelete = sortedNotifications.slice(0, notificationEntries.length - 5);
                
                for (const [notificationId] of notificationsToDelete) {
                    try {
                        await window.firebase.remove(window.firebase.ref(window.firebase.database, `notifications/${userId}/${notificationId}`));
                    } catch (deleteError) {
                        console.warn(`⚠️ Не удалось удалить уведомление ${notificationId}:`, deleteError);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Ошибка ограничения уведомлений:', error);
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    getPositionName(position) {
        const positions = {
            'carry': 'Керри',
            'mid': 'Мидлер',
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
            const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${userId}`));
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

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    setupEventListeners() {
        console.log('🔧 Настройка обработчиков событий...');
        
        // Навигация
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
        
        // Новые кнопки
        const matchesBtn = document.getElementById('matchesBtn');
        if (matchesBtn) {
            matchesBtn.addEventListener('click', () => {
                alert('🎮 Функционал "Матчапы" в разработке');
            });
        }
        
        const newsBtn = document.getElementById('newsBtn');
        if (newsBtn) {
            newsBtn.addEventListener('click', () => {
                alert('📰 Функционал "Новости" в разработке');
            });
        }
        
        const leaderboardsBtn = document.getElementById('leaderboardsBtn');
        if (leaderboardsBtn) {
            leaderboardsBtn.addEventListener('click', () => {
                alert('🏅 Функционал "Leaderboards" в разработке');
            });
        }
        
        // Авторизация
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
        
        // Профиль
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
        
        // Друзья
        document.getElementById('searchFriendBtn').addEventListener('click', () => this.searchFriends());
        
        // Команды
        document.getElementById('createTeamBtn').addEventListener('click', () => this.showCreateTeamModal());
        document.getElementById('joinTeamBtn').addEventListener('click', () => this.showJoinTeamModal());
        
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
        
        // Глобальные обработчики
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
                const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `users/${friendId}`));
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
            const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`));
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${friendId}/${notificationId}`), notificationData);
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
            const teamRef = window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`);
            const teamSnapshot = await window.firebase.get(teamRef);
            
            if (!teamSnapshot.exists()) {
                alert('❌ Команда не найдена');
                return;
            }
            
            const team = teamSnapshot.val();
            
            const updatedMembers = { ...team.members };
            delete updatedMembers[this.currentUser.uid];
            
            if (Object.keys(updatedMembers).length === 0) {
                await window.firebase.remove(teamRef);
                
                const applicationsRef = window.firebase.ref(window.firebase.database, `teamApplications/${this.userProfile.teamId}`);
                await window.firebase.remove(applicationsRef);
                
                console.log('✅ Команда удалена (последний участник вышел)');
            } else {
                const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
                
                await window.firebase.update(teamRef, {
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
                    
                    await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${team.captain}/${leaveNotificationId}`), leaveNotification);
                    await this.limitNotifications(team.captain);
                } catch (notificationError) {
                    console.error('❌ Ошибка отправки уведомления капитану:', notificationError);
                }
            }
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${this.currentUser.uid}`), {
                teamId: null
            });
            
            this.userProfile.teamId = null;
            this.updateTeamUI();
            
            alert('✅ Вы покинули команду');
            
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
            const teamRef = window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`);
            const teamSnapshot = await window.firebase.get(teamRef);
            
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
                    
                    await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${memberId}/${deleteNotificationId}`), deleteNotification);
                    
                    await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${memberId}`), {
                        teamId: null
                    });
                    
                    await this.limitNotifications(memberId);
                } catch (memberError) {
                    console.error(`❌ Ошибка уведомления участника ${memberId}:`, memberError);
                }
            });
            
            await window.firebase.remove(teamRef);
            
            const applicationsRef = window.firebase.ref(window.firebase.database, `teamApplications/${this.userProfile.teamId}`);
            await window.firebase.remove(applicationsRef);
            
            this.userProfile.teamId = null;
            this.updateTeamUI();
            
            this.closeDeleteTeamModal();
            alert('✅ Команда удалена!');
            
        } catch (error) {
            console.error('❌ Ошибка удаления команды:', error);
            alert('❌ Ошибка удаления команды');
        }
    }

    closeDeleteTeamModal() {
        document.getElementById('deleteTeamModal').classList.add('hidden');
    }

   async showEditTeamModal() {  // ДОБАВЛЕНО async
    if (!this.currentUser || !this.userProfile || !this.userProfile.teamId) {
        alert('❌ У вас нет команды для редактирования');
        return;
    }
    
    try {
        console.log('🔄 Проверка прав капитана...');
        const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`));
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
        await this.loadTeamMembersForEdit(team);  // ДОБАВЛЕНО await если loadTeamMembersForEdit тоже async
        
    } catch (error) {
        console.error('❌ Ошибка проверки прав капитана:', error);
        alert('❌ Ошибка доступа к редактированию команды');
    }
}

    async loadTeamMembersForEdit(team = null) {
        if (!this.userProfile.teamId) return;
        
        try {
            if (!team) {
                const snapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`));
                if (!snapshot.exists()) return;
                team = snapshot.val();
            }
            
            console.log('🔄 Загрузка членов команды для редактирования...');
            const membersContainer = document.getElementById('teamMembersEditList');
            
            let membersHTML = `
                <div class="team-general-settings">
                    <h3 style="color: var(--accent-primary); margin-bottom: 15px;">⚙️ Общие настройки команды</h3>
                    <div class="form-group">
                        <label>Статус участия в турнирах:</label>
                        <select id="teamTournamentStatusEdit" class="form-input">
                            <option value="not_participating" ${team.tournamentStatus === 'not_participating' ? 'selected' : ''}>Не участвует</option>
                            <option value="participating" ${team.tournamentStatus === 'participating' ? 'selected' : ''}>Участвует в турнирах</option>
                        </select>
                    </div>
                    <button class="save-btn" onclick="app.updateTeamGeneralSettings()" style="margin-bottom: 20px;">💾 Сохранить настройки</button>
                </div>
                <h3 style="color: var(--accent-primary); margin: 20px 0 15px 0;">👥 Управление составом</h3>
            `;
            
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
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`), {
                tournamentStatus: tournamentStatus,
                updatedAt: Date.now()
            });
            
            alert('✅ Настройки команды обновлены!');
            this.loadTeamInfo();
            
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
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}/members/${memberId}`), {
                nickname: newNickname,
                position: newPosition,
                mmr: newMMR
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${memberId}`), {
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
            const teamSnapshot = await window.firebase.get(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`));
            if (!teamSnapshot.exists()) return;
            
            const team = teamSnapshot.val();
            const newAverageMMR = await this.calculateTeamAverageMMR(team.members);
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`), {
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
            const teamRef = window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`);
            const teamSnapshot = await window.firebase.get(teamRef);
            
            if (!teamSnapshot.exists()) return;
            
            const team = teamSnapshot.val();
            const updatedMembers = { ...team.members };
            delete updatedMembers[memberId];
            
            const newAverageMMR = await this.calculateTeamAverageMMR(updatedMembers);
            
            await window.firebase.update(teamRef, {
                members: updatedMembers,
                averageMMR: newAverageMMR
            });
            
            await window.firebase.update(window.firebase.ref(window.firebase.database, `users/${memberId}`), {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${memberId}/${removeNotificationId}`), removeNotification);
            await this.limitNotifications(memberId);
            
            alert('✅ Игрок удален из команды');
            this.loadTeamMembersForEdit();
            this.loadTeamInfo();
            
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
            const teamRef = window.firebase.ref(window.firebase.database, `teams/${this.userProfile.teamId}`);
            const teamSnapshot = await window.firebase.get(teamRef);
            
            if (!teamSnapshot.exists()) return;
            
            const team = teamSnapshot.val();
            
            const updatedMembers = { ...team.members };
            updatedMembers[this.currentUser.uid].role = 'member';
            updatedMembers[newCaptainId].role = 'captain';
            
            await window.firebase.update(teamRef, {
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
            
            await window.firebase.set(window.firebase.ref(window.firebase.database, `notifications/${newCaptainId}/${captainNotificationId}`), captainNotification);
            await this.limitNotifications(newCaptainId);
            
            this.userProfile.teamId = null;
            
            alert('✅ Капитанство передано!');
            this.closeEditTeamModal();
            this.loadTeamInfo();
            
        } catch (error) {
            console.error('❌ Ошибка передачи капитанства:', error);
            alert('❌ Ошибка передачи капитанства');
        }
    }
}

// Создаем и инициализируем приложение
const app = new IllusiveApp();

// Делаем методы доступными глобально для обработчиков событий в HTML
window.app = app;

// Экспортируем основные методы для использования в HTML
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