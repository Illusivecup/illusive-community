// === ЗАЩИТА ОТ ДВОЙНОЙ ЗАГРУЗКИ ===
if (window.illusiveAppInitialized) {
    console.log('🛑 Script already loaded, skipping...');
    throw new Error('Script already loaded');
}
window.illusiveAppInitialized = true;

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentUser = null;
let userProfile = null;

// === ПРОВЕРКА FIREBASE ===
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.firebase && window.firebase.auth) {
                console.log('✅ Firebase loaded');
                resolve();
            } else {
                console.log('⏳ Waiting for Firebase...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}


// === ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ===
async function initializeApp() {
    try {
        console.log('🚀 Инициализация Illusive Community...');
        
        createAnimatedBackground();
        setupEventListeners();
        setupNavigation();
        setupAuthStateListener();
        setupTeamEventListeners();
        
        updateConnectionStatus(true);
        
        console.log('✅ Illusive Community успешно инициализирован');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
}

// === НАВИГАЦИЯ ===
function setupNavigation() {
    const teamsListBtn = document.getElementById('teamsListBtn');
    if (teamsListBtn) {
        teamsListBtn.addEventListener('click', () => showSection('teams'));
        console.log('✅ Обработчик для teamsListBtn установлен');
    } else {
        console.error('❌ Кнопка teamsListBtn не найдена');
    }
}

function showSection(sectionName) {
    console.log(`🔄 Переход в раздел: ${sectionName}`);
    
    // Проверяем авторизацию для защищенных разделов
    const protectedSections = ['friends', 'teams', 'team', 'notification'];
    if (protectedSections.includes(sectionName) && !currentUser) {
        alert('❌ Для доступа к этому разделу необходимо авторизоваться');
        showSection('profile'); // Перенаправляем в профиль
        return;
    }
    
    hideAllSections();
    const targetSection = document.getElementById(`${sectionName}Content`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Загружаем данные для конкретного раздела
        switch(sectionName) {
            case 'friends':
                loadFriendsList();
                break;
            case 'teams':
                loadTeamsList();
                break;
            case 'team':
                loadTeamInfo();
                break;
            case 'notification':
                loadNotifications();
                break;
        }
        console.log(`✅ Раздел ${sectionName} открыт`);
    } else {
        console.error(`❌ Раздел ${sectionName}Content не найден`);
    }
}

function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
}

function setupAuthStateListener() {
    firebase.onAuthStateChanged(firebase.auth, async (user) => {
        if (user) {
            console.log('👤 Пользователь авторизован:', user.email);
            currentUser = user;
            try {
                await loadUserProfile(user.uid);
                showAuthenticatedUI();
            } catch (error) {
                console.error('❌ Ошибка загрузки профиля:', error);
                // Показываем UI даже если профиль не загрузился
                showAuthenticatedUI();
            }
        } else {
            console.log('👤 Пользователь не авторизован');
            currentUser = null;
            userProfile = null;
            showUnauthenticatedUI();
        }
    });
}
async function loadUserProfile(userId) {
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `users/${userId}`));
        if (snapshot.exists()) {
            userProfile = snapshot.val();
            
            // Гарантируем, что friends всегда будет массивом
            if (!userProfile.friends || !Array.isArray(userProfile.friends)) {
                userProfile.friends = [];
            }
            
            console.log('📁 Профиль загружен:', userProfile);
            console.log('👥 Друзей в профиле:', userProfile.friends.length);
            updateProfileUI();
            
            // Обновляем время последнего онлайна
            await updateLastOnline();
        } else {
            console.log('📁 Профиль не найден, создаем новый');
            await createUserProfile(userId, currentUser.email, '', '');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
        throw error; // Пробрасываем ошибку выше
    }
}

async function updateLastOnline() {
    if (!currentUser) return;
    
    try {
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            lastOnline: Date.now()
        });
    } catch (error) {
        console.error('❌ Ошибка обновления времени онлайна:', error);
    }
}

// === ФУНКЦИИ АВТОРИЗАЦИИ ===
async function registerUser(email, password, confirmPassword, nickname, telegram) {
    const messageElement = document.getElementById('registerMessage');
    
    // Валидация
    if (!email || !password || !confirmPassword || !nickname) {
        showAuthMessage('❌ Заполните все обязательные поля', 'error', messageElement);
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthMessage('❌ Пароли не совпадают', 'error', messageElement);
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('❌ Пароль должен содержать минимум 6 символов', 'error', messageElement);
        return;
    }
    
    try {
        showAuthMessage('⏳ Регистрация...', 'info', messageElement);
        
        const userCredential = await firebase.createUserWithEmailAndPassword(firebase.auth, email, password);
        console.log('✅ Пользователь зарегистрирован:', userCredential.user.email);
        
        // Создаем профиль с дополнительными полями
        await createUserProfile(userCredential.user.uid, email, nickname, telegram);
        
        showAuthMessage('✅ Регистрация успешна!', 'success', messageElement);
        
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
        
        showAuthMessage(errorMessage, 'error', messageElement);
    }
}

async function createUserProfile(userId, email, nickname, telegram) {
    const profileData = {
        username: email.split('@')[0],
        nickname: nickname,
        telegram: telegram || '',
        mmr: 0,
        position: '',
        userId: userId,
        avatarUrl: '',
        friends: [], // Гарантируем, что friends всегда массив
        friendRequests: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOnline: Date.now()
    };
    
    try {
        await firebase.set(firebase.ref(firebase.database, `users/${userId}`), profileData);
        userProfile = profileData;
        updateProfileUI();
        console.log('✅ Профиль создан с никнеймом и Telegram');
    } catch (error) {
        console.error('❌ Ошибка создания профиля:', error);
        throw error;
    }
}

async function loginUser(email, password) {
    const messageElement = document.getElementById('loginMessage');
    
    if (!email || !password) {
        showAuthMessage('❌ Заполните все поля', 'error', messageElement);
        return;
    }
    
    try {
        showAuthMessage('⏳ Вход...', 'info', messageElement);
        
        const userCredential = await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
        console.log('✅ Пользователь вошел:', userCredential.user.email);
        
        showAuthMessage('✅ Вход успешен!', 'success', messageElement);
        
        // Очищаем поля
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
        
        showAuthMessage(errorMessage, 'error', messageElement);
    }
}

async function logoutUser() {
    try {
        await firebase.signOut(firebase.auth);
        console.log('✅ Пользователь вышел');
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
}

function showAuthMessage(message, type, element) {
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
}

// === УПРАВЛЕНИЕ UI ===
function showUnauthenticatedUI() {
    hideAllSections();
    document.getElementById('authContent').classList.remove('hidden');
    
    // Скрываем навигацию для неавторизованных пользователей
    document.querySelector('.navigation-grid').classList.add('hidden');
}

function showAuthenticatedUI() {
    hideAllSections();
    document.getElementById('profileContent').classList.remove('hidden');
    
    // Показываем навигацию для авторизованных пользователей
    document.querySelector('.navigation-grid').classList.remove('hidden');
}

function updateProfileUI() {
    if (!userProfile) return;
    
    document.getElementById('profileUsername').textContent = userProfile.nickname || userProfile.username || 'Гость';
    document.getElementById('profileUserId').textContent = `ID: ${userProfile.userId || '---'}`;
    document.getElementById('profileNickname').value = userProfile.nickname || '';
    document.getElementById('profileMMR').value = userProfile.mmr || '';
    document.getElementById('profilePosition').value = userProfile.position || '';
    document.getElementById('profileTelegram').value = userProfile.telegram || '';
    
    updateAvatarUI();
}

// === СИСТЕМА АВАТАРОК (BASE64) ===
async function uploadAvatar(file) {
    if (!currentUser) {
        alert('❌ Пользователь не авторизован');
        return;
    }
    
    console.log('📁 Начало загрузки аватарки:', file.name, file.size, file.type);
    
    // Проверка размера файла
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
        
        // Конвертируем файл в base64
        const base64String = await fileToBase64(file);
        console.log('✅ Файл конвертирован в base64, длина:', base64String.length);
        
        // Сохраняем в базу данных
        console.log('💾 Сохраняем в базу данных...');
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            avatarUrl: base64String,
            updatedAt: Date.now()
        });
        
        // Обновляем локальный профиль
        userProfile.avatarUrl = base64String;
        updateAvatarUI();
        
        console.log('✅ Аватар успешно обновлен!');
        alert('✅ Аватар успешно обновлен!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки аватара:', error);
        alert('❌ Ошибка загрузки аватара: ' + error.message);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            console.log('📷 Base64 создан успешно');
            resolve(reader.result);
        };
        reader.onerror = error => {
            console.error('❌ Ошибка конвертации в base64:', error);
            reject(error);
        };
    });
}

function updateAvatarUI() {
    const avatarImage = document.getElementById('avatarImage');
    const defaultAvatar = document.getElementById('defaultAvatar');
    
    console.log('🔄 Обновление UI аватарки...');
    console.log('📷 userProfile.avatarUrl:', userProfile?.avatarUrl ? 'есть' : 'нет');
    
    if (userProfile && userProfile.avatarUrl) {
        console.log('✅ Показываем загруженную аватарку');
        avatarImage.src = userProfile.avatarUrl;
        avatarImage.style.display = 'block';
        defaultAvatar.style.display = 'none';
        
        avatarImage.onerror = function() {
            console.error('❌ Ошибка загрузки изображения аватарки');
            avatarImage.style.display = 'none';
            defaultAvatar.style.display = 'block';
        };
        
        avatarImage.onload = function() {
            console.log('✅ Аватарка успешно загружена в DOM');
        };
    } else {
        console.log('ℹ️ Показываем аватар по умолчанию');
        avatarImage.style.display = 'none';
        defaultAvatar.style.display = 'block';
    }
}

// === УПРАВЛЕНИЕ ПРОФИЛЕМ ===
async function saveProfile() {
    if (!currentUser || !userProfile) return;
    
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
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), updateData);
        userProfile = { ...userProfile, ...updateData };
        updateProfileUI();
        alert('✅ Профиль сохранен!');
        console.log('💾 Профиль обновлен');
    } catch (error) {
        console.error('❌ Ошибка сохранения профиля:', error);
        alert('❌ Ошибка сохранения профиля');
    }
}

// === СИСТЕМА УВЕДОМЛЕНИЙ ===
async function loadNotifications() {
    if (!currentUser) return;
    
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `notifications/${currentUser.uid}`));
        const notifications = snapshot.val() || {};
        
        // Сортируем уведомления по времени (новые сверху)
        const sortedNotifications = Object.entries(notifications)
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
        
        updateNotificationsUI(sortedNotifications);
    } catch (error) {
        console.error('❌ Ошибка загрузки уведомлений:', error);
    }
}

function updateNotificationsUI(notifications) {
    const systemList = document.getElementById('systemNotificationsList');
    const historyList = document.getElementById('notificationHistoryList');
    const badge = document.getElementById('notificationBadge');
    
    let systemHTML = '';
    let historyHTML = '';
    let unreadCount = 0;
    
    if (notifications && Object.keys(notifications).length > 0) {
        Object.entries(notifications).forEach(([id, notification]) => {
            const notificationElement = createNotificationElement(id, notification);
            
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
    
    // Обновляем бейдж
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function createNotificationElement(id, notification) {
    let actionsHTML = '';
    
    switch(notification.type) {
        case 'team_invite':
            actionsHTML = `
                <button class="save-btn" onclick="acceptTeamInvite('${id}', '${notification.teamId}')">✓ Принять</button>
                <button class="cancel-btn" onclick="rejectTeamInvite('${id}')">✗ Отклонить</button>
            `;
            break;
        case 'friend_request':
            actionsHTML = `
                <button class="save-btn" onclick="acceptFriendRequest('${id}', '${notification.fromUserId}')">✓ Принять</button>
                <button class="cancel-btn" onclick="rejectFriendRequest('${id}', '${notification.fromUserId}')">✗ Отклонить</button>
            `;
            break;
        case 'team_application':
            actionsHTML = `
                <button class="save-btn" onclick="acceptTeamApplication('${id}', '${notification.applicationId}', '${notification.teamId}', '${notification.fromUserId}')">✓ Принять</button>
                <button class="cancel-btn" onclick="rejectTeamApplication('${id}', '${notification.applicationId}', '${notification.teamId}', '${notification.fromUserId}')">✗ Отклонить</button>
            `;
            break;
        default:
            if (!notification.read) {
                actionsHTML = `<button class="add-btn" onclick="markNotificationAsRead('${id}')">✓ Прочитано</button>`;
            }
    }
    
    // Добавляем кликабельные никнеймы в сообщение
    let messageWithLinks = notification.message;
    if (notification.fromUserName) {
        const userNameRegex = new RegExp(notification.fromUserName, 'g');
        messageWithLinks = messageWithLinks.replace(userNameRegex, 
            `<span class="clickable-nickname" onclick="viewUserProfile('${notification.fromUserId}')">${notification.fromUserName}</span>`
        );
    }
    
    return `
        <div class="notification-item ${notification.read ? '' : 'unread'}">
            <div class="notification-content">
                <div class="notification-type">${getNotificationType(notification.type)}</div>
                <div>${messageWithLinks}</div>
                <div class="notification-time">${formatTime(notification.timestamp)}</div>
            </div>
            <div class="notification-actions">
                ${actionsHTML}
            </div>
        </div>
    `;
}

async function sendFriendRequest(toUserId) {
    if (!currentUser) return;
    
    const notificationId = `notification_${Date.now()}`;
    const notificationData = {
        type: 'friend_request',
        fromUserId: currentUser.uid,
        fromUserName: userProfile.nickname || userProfile.username,
        message: `${userProfile.nickname || userProfile.username} хочет добавить вас в друзья`,
        timestamp: Date.now(),
        read: false,
        responded: false
    };
    
    try {
        await firebase.set(firebase.ref(firebase.database, `notifications/${toUserId}/${notificationId}`), notificationData);
        
        // Ограничиваем количество уведомлений
        await limitNotifications(toUserId);
        
        alert('✅ Запрос дружбы отправлен!');
    } catch (error) {
        console.error('❌ Ошибка отправки запроса дружбы:', error);
        alert('❌ Ошибка отправки запроса дружбы');
    }
}

async function acceptFriendRequest(notificationId, fromUserId) {
    if (!currentUser) return;
    
    try {
        // Добавляем друг друга в друзья
        await addFriend(currentUser.uid, fromUserId);
        await addFriend(fromUserId, currentUser.uid);
        
        // Помечаем уведомление как обработанное
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        // Создаем уведомление для отправителя
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'friend_accepted',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            message: `${userProfile.nickname || userProfile.username} принял(а) ваш запрос дружбы`,
            timestamp: Date.now(),
            read: false,
            responded: true
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${fromUserId}/${acceptNotificationId}`), acceptNotification);
        
        // Ограничиваем количество уведомлений
        await limitNotifications(fromUserId);
        
        loadNotifications();
        loadFriendsList();
        alert('✅ Друг добавлен!');
        
    } catch (error) {
        console.error('❌ Ошибка принятия запроса дружбы:', error);
        alert('❌ Ошибка принятия запроса дружбы');
    }
}

async function addFriend(userId, friendId) {
    const userRef = firebase.ref(firebase.database, `users/${userId}`);
    const snapshot = await firebase.get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const friends = userData.friends || [];
        
        if (!friends.includes(friendId)) {
            friends.push(friendId);
            await firebase.update(userRef, { friends });
        }
    }
}

// === ОГРАНИЧЕНИЕ УВЕДОМЛЕНИЙ ===
async function limitNotifications(userId) {
    try {
        if (!currentUser) return;
        
        const snapshot = await firebase.get(firebase.ref(firebase.database, `notifications/${userId}`));
        if (!snapshot.exists()) return;
        
        const notifications = snapshot.val();
        const notificationEntries = Object.entries(notifications);
        
        // Если больше 5 уведомлений, удаляем самые старые
        if (notificationEntries.length > 5) {
            const sortedNotifications = notificationEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const notificationsToDelete = sortedNotifications.slice(0, notificationEntries.length - 5);
            
            for (const [notificationId] of notificationsToDelete) {
                try {
                    await firebase.remove(firebase.ref(firebase.database, `notifications/${userId}/${notificationId}`));
                } catch (deleteError) {
                    console.warn(`⚠️ Не удалось удалить уведомление ${notificationId}:`, deleteError);
                }
            }
            
            console.log(`🗑️ Удалено ${notificationsToDelete.length} старых уведомлений`);
        }
    } catch (error) {
        console.error('❌ Ошибка ограничения уведомлений:', error);
    }
}

// === СИСТЕМА ПОИСКА ДРУЗЕЙ ===
async function searchFriends() {
    if (!currentUser) {
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
        const snapshot = await firebase.get(firebase.ref(firebase.database, 'users'));
        const resultsContainer = document.getElementById('friendSearchResults');
        let resultsHTML = '';
        let found = false;
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            
            Object.entries(users).forEach(([userId, user]) => {
                if (userId === currentUser.uid) return;
                
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
                    const isAlreadyFriend = userProfile.friends && userProfile.friends.includes(userId);
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
                                    `<button class="add-btn" onclick="sendFriendRequest('${userId}')">👥 Добавить в друзья</button>`
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
        let errorMessage = 'Ошибка поиска друзей';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = 'Нет доступа к поиску пользователей';
        }
        alert(`❌ ${errorMessage}`);
    }
}

// === СИСТЕМА ДРУЗЕЙ ===
// === ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ СПИСКА ДРУЗЕЙ ===
async function loadFriendsList() {
    // Проверяем авторизацию и наличие профиля
    if (!currentUser || !userProfile) {
        const friendsList = document.getElementById('friendsList');
        friendsList.innerHTML = '<div class="no-data">Для просмотра друзей необходимо авторизоваться</div>';
        return;
    }
    
    // Проверяем наличие friends в userProfile
    if (!userProfile.friends || !Array.isArray(userProfile.friends) || userProfile.friends.length === 0) {
        const friendsList = document.getElementById('friendsList');
        friendsList.innerHTML = '<div class="no-data">У вас пока нет друзей</div>';
        return;
    }
    
    const friendsList = document.getElementById('friendsList');
    let friendsHTML = '';
    let loadedFriends = 0;
    
    try {
        // Используем Promise.all для параллельной загрузки всех друзей
        const friendPromises = userProfile.friends.map(async (friendId) => {
            try {
                const snapshot = await firebase.get(firebase.ref(firebase.database, `users/${friendId}`));
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
                                    <p>${friend.position ? getPositionName(friend.position) : 'Позиция не указана'} | MMR: ${friend.mmr || 0}</p>
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
                return ''; // Возвращаем пустую строку если пользователь не найден
            } catch (error) {
                console.error(`❌ Ошибка загрузки информации о друге ${friendId}:`, error);
                return ''; // Возвращаем пустую строку при ошибке
            }
        });
        
        // Ждем завершения всех промисов
        const friendElements = await Promise.all(friendPromises);
        friendsHTML = friendElements.filter(html => html !== '').join('');
        
        loadedFriends = friendElements.filter(html => html !== '').length;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки списка друзей:', error);
        let errorMessage = 'Ошибка загрузки списка друзей';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = 'Нет доступа к списку друзей';
        }
        friendsHTML = `<div class="no-data">${errorMessage}</div>`;
    }
    
    // Если не загрузилось ни одного друга или список пуст
    if (!friendsHTML || loadedFriends === 0) {
        friendsList.innerHTML = '<div class="no-data">У вас пока нет друзей или не удалось загрузить список</div>';
    } else {
        friendsList.innerHTML = friendsHTML;
    }
}

// === СИСТЕМА КОМАНД (ОБЩИЙ СПИСОК) ===
async function loadTeamsList() {
    try {
        console.log('🔄 Загрузка списка команд...');
        
        if (!currentUser) {
            console.error('❌ Пользователь не авторизован');
            const fullTeamsContainer = document.getElementById('fullTeamsList');
            const incompleteTeamsContainer = document.getElementById('incompleteTeamsList');
            fullTeamsContainer.innerHTML = '<div class="no-data">Для просмотра команд необходимо авторизоваться</div>';
            incompleteTeamsContainer.innerHTML = '<div class="no-data">Для просмотра команд необходимо авторизоваться</div>';
            return;
        }

        const snapshot = await firebase.get(firebase.ref(firebase.database, 'teams'));
        const fullTeamsContainer = document.getElementById('fullTeamsList');
        const incompleteTeamsContainer = document.getElementById('incompleteTeamsList');
        
        if (!snapshot.exists()) {
            console.log('ℹ️ Нет созданных команд');
            fullTeamsContainer.innerHTML = '<div class="no-data">Нет созданных команд</div>';
            incompleteTeamsContainer.innerHTML = '<div class="no-data">Нет команд с неполным составом</div>';
            return;
        }
        
        const teams = snapshot.val();
        let fullTeamsHTML = '';
        let incompleteTeamsHTML = '';
        
        for (const [teamId, team] of Object.entries(teams)) {
            try {
                const teamCard = await createTeamCard(teamId, team);
                
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
        
        console.log('✅ Список команд загружен');
        
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

async function createTeamCard(teamId, team) {
    const memberCount = Object.keys(team.members || {}).length;
    const maxMembers = 5;
    const isFull = memberCount >= maxMembers;
    
    let captainName = 'Неизвестно';
    try {
        const captainSnapshot = await firebase.get(firebase.ref(firebase.database, `users/${team.captain}`));
        if (captainSnapshot.exists()) {
            const captain = captainSnapshot.val();
            captainName = captain.nickname || captain.username;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о капитане:', error);
    }
    
    let hasApplied = false;
    if (currentUser) {
        const applicationsSnapshot = await firebase.get(firebase.ref(firebase.database, `teamApplications/${teamId}`));
        if (applicationsSnapshot.exists()) {
            const applications = applicationsSnapshot.val();
            hasApplied = Object.values(applications).some(app => app.userId === currentUser.uid && !app.responded);
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
                <p><strong>Капитан:</strong> <span class="clickable-nickname" onclick="viewUserProfile('${team.captain}')">${captainName}</span></p>
                <p><strong>Состав:</strong> ${memberCount}/${maxMembers} игроков</p>
                <p><strong>Средний MMR:</strong> ${team.averageMMR || 0}</p>
            </div>
            <div class="team-mini-actions">
                ${!isFull && currentUser && !hasApplied && (!userProfile.teamId || userProfile.teamId !== teamId) ? 
                    `<button class="add-btn" onclick="applyToTeam('${teamId}')">📨 Подать заявку</button>` : 
                    ''
                }
                ${hasApplied ? 
                    '<span class="add-btn" style="background: var(--accent-warning);">⏳ Заявка отправлена</span>' : 
                    ''
                }
                ${currentUser && userProfile.teamId === teamId ? 
                    '<span class="add-btn" style="background: var(--accent-success);">✅ Ваша команда</span>' : 
                    ''
                }
            </div>
        </div>
    `;
}

// === СИСТЕМА ЗАЯВОК В КОМАНДЫ ===
async function applyToTeam(teamId) {
    if (!currentUser) {
        alert('❌ Вы не авторизованы');
        return;
    }
    
    if (userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    try {
        const applicationId = `application_${Date.now()}`;
        const applicationData = {
            userId: currentUser.uid,
            userNickname: userProfile.nickname || userProfile.username,
            userMMR: userProfile.mmr || 0,
            userPosition: userProfile.position || '',
            teamId: teamId,
            timestamp: Date.now(),
            responded: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `teamApplications/${teamId}/${applicationId}`), applicationData);
        
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${teamId}`));
        if (teamSnapshot.exists()) {
            const team = teamSnapshot.val();
            
            const notificationId = `notification_${Date.now()}`;
            const notificationData = {
                type: 'team_application',
                fromUserId: currentUser.uid,
                fromUserName: userProfile.nickname || userProfile.username,
                teamId: teamId,
                teamName: team.name,
                applicationId: applicationId,
                message: `${userProfile.nickname || userProfile.username} подал заявку в вашу команду "${team.name}"`,
                timestamp: Date.now(),
                read: false,
                responded: false
            };
            
            await firebase.set(firebase.ref(firebase.database, `notifications/${team.captain}/${notificationId}`), notificationData);
            await limitNotifications(team.captain);
        }
        
        alert('✅ Заявка отправлена!');
        loadTeamsList();
        
    } catch (error) {
        console.error('❌ Ошибка подачи заявки:', error);
        alert('❌ Ошибка подачи заявки');
    }
}

async function acceptTeamApplication(notificationId, applicationId, teamId, userId) {
    if (!currentUser) return;
    
    try {
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists() || teamSnapshot.val().captain !== currentUser.uid) {
            alert('❌ Только капитан может принимать заявки');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (Object.keys(team.members || {}).length >= 5) {
            alert('❌ Команда уже заполнена');
            return;
        }
        
        const userSnapshot = await firebase.get(firebase.ref(firebase.database, `users/${userId}`));
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
        
        const newAverageMMR = await calculateTeamAverageMMR(updatedMembers);
        
        await firebase.update(firebase.ref(firebase.database, `teams/${teamId}`), {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await firebase.update(firebase.ref(firebase.database, `users/${userId}`), {
            teamId: teamId
        });
        
        await firebase.update(firebase.ref(firebase.database, `teamApplications/${teamId}/${applicationId}`), {
            responded: true,
            accepted: true
        });
        
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'application_accepted',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            teamId: teamId,
            teamName: team.name,
            message: `Ваша заявка в команду "${team.name}" была принята!`,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${userId}/${acceptNotificationId}`), acceptNotification);
        await limitNotifications(userId);
        
        loadNotifications();
        loadTeamInfo();
        alert('✅ Игрок принят в команду!');
        
    } catch (error) {
        console.error('❌ Ошибка принятия заявки:', error);
        alert('❌ Ошибка принятия заявки');
    }
}

async function rejectTeamApplication(notificationId, applicationId, teamId, userId) {
    if (!currentUser) return;
    
    try {
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${teamId}`));
        if (!teamSnapshot.exists() || teamSnapshot.val().captain !== currentUser.uid) {
            alert('❌ Только капитан может отклонять заявки');
            return;
        }
        
        await firebase.update(firebase.ref(firebase.database, `teamApplications/${teamId}/${applicationId}`), {
            responded: true,
            accepted: false
        });
        
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const team = teamSnapshot.val();
        const rejectNotificationId = `notification_${Date.now()}`;
        const rejectNotification = {
            type: 'application_rejected',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            teamId: teamId,
            teamName: team.name,
            message: `Ваша заявка в команду "${team.name}" была отклонена`,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${userId}/${rejectNotificationId}`), rejectNotification);
        await limitNotifications(userId);
        
        loadNotifications();
        alert('✅ Заявка отклонена');
        
    } catch (error) {
        console.error('❌ Ошибка отклонения заявки:', error);
        alert('❌ Ошибка отклонения заявки');
    }
}

// === ПРОСМОТР ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ ===
async function viewUserProfile(userId) {
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `users/${userId}`));
        if (!snapshot.exists()) {
            alert('❌ Пользователь не найден');
            return;
        }
        
        const user = snapshot.val();
        showUserProfileModal(user);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля пользователя:', error);
        alert('❌ Ошибка загрузки профиля');
    }
}

function showUserProfileModal(user) {
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
                        <p><strong>Позиция:</strong> ${getPositionName(user.position)}</p>
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

// === СИСТЕМА КОМАНД ===
async function createTeam(teamName, slogan) {
    if (!currentUser) return;
    
    if (userProfile.teamId) {
        alert('❌ Вы уже состоите в команде');
        return;
    }
    
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const teamData = {
        name: teamName,
        slogan: slogan,
        captain: currentUser.uid,
        members: {
            [currentUser.uid]: {
                role: 'captain',
                nickname: userProfile.nickname || userProfile.username,
                position: userProfile.position || '',
                mmr: userProfile.mmr || 0,
                joinedAt: Date.now()
            }
        },
        averageMMR: userProfile.mmr || 0,
        tournamentStatus: 'not_participating',
        createdAt: Date.now(),
        createdBy: currentUser.uid,
        updatedAt: Date.now()
    };
    
    try {
        await firebase.set(firebase.ref(firebase.database, `teams/${teamId}`), teamData);
        
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            teamId: teamId
        });
        
        userProfile.teamId = teamId;
        updateTeamUI();
        
        alert('✅ Команда создана! Вы - капитан команды.');
        closeCreateTeamModal();
        
    } catch (error) {
        console.error('❌ Ошибка создания команды:', error);
        alert('❌ Ошибка создания команды');
    }
}

async function joinTeam(teamId) {
    if (!currentUser) return;
    
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `teams/${teamId}`));
        if (!snapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = snapshot.val();
        
        if (!team.members) team.members = {};
        if (!team.members[currentUser.uid]) {
            team.members[currentUser.uid] = {
                role: 'member',
                nickname: userProfile.nickname || userProfile.username,
                position: userProfile.position || '',
                mmr: userProfile.mmr || 0,
                joinedAt: Date.now()
            };
            
            const newAverageMMR = await calculateTeamAverageMMR(team.members);
            
            await firebase.update(firebase.ref(firebase.database, `teams/${teamId}`), {
                members: team.members,
                averageMMR: newAverageMMR
            });
        }
        
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            teamId: teamId
        });
        
        userProfile.teamId = teamId;
        updateTeamUI();
        
        alert('✅ Вы присоединились к команде!');
        closeJoinTeamModal();
        
    } catch (error) {
        console.error('❌ Ошибка присоединения к команде:', error);
        alert('❌ Ошибка присоединения к команде');
    }
}

async function sendTeamInvite(friendId) {
    if (!currentUser || !userProfile.teamId) {
        alert('❌ У вас нет команды для отправки приглашений');
        return;
    }
    
    try {
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${userProfile.teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.captain !== currentUser.uid) {
            alert('❌ Только капитан команды может отправлять приглашения');
            return;
        }
        
        const notificationId = `notification_${Date.now()}`;
        const notificationData = {
            type: 'team_invite',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            teamId: userProfile.teamId,
            teamName: team.name,
            teamSlogan: team.slogan || '',
            message: `${userProfile.nickname || userProfile.username} приглашает вас в команду "${team.name}"`,
            timestamp: Date.now(),
            read: false,
            responded: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${friendId}/${notificationId}`), notificationData);
        await limitNotifications(friendId);
        
        alert('✅ Приглашение отправлено!');
        
    } catch (error) {
        console.error('❌ Ошибка отправки приглашения:', error);
        alert('❌ Ошибка отправки приглашения');
    }
}

async function acceptTeamInvite(notificationId, teamId) {
    if (!currentUser) return;
    
    try {
        const teamRef = firebase.ref(firebase.database, `teams/${teamId}`);
        const teamSnapshot = await firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.members && team.members[currentUser.uid]) {
            alert('ℹ️ Вы уже состоите в этой команде');
            return;
        }
        
        const updatedMembers = {
            ...team.members,
            [currentUser.uid]: {
                role: 'member',
                nickname: userProfile.nickname || userProfile.username,
                position: userProfile.position || '',
                mmr: userProfile.mmr || 0,
                joinedAt: Date.now()
            }
        };
        
        const newAverageMMR = await calculateTeamAverageMMR(updatedMembers);
        
        await firebase.update(teamRef, {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            teamId: teamId
        });
        
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        const acceptNotificationId = `notification_${Date.now()}`;
        const acceptNotification = {
            type: 'team_join',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            message: `${userProfile.nickname || userProfile.username} принял приглашение и присоединился к команде "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${team.captain}/${acceptNotificationId}`), acceptNotification);
        await limitNotifications(team.captain);
        
        userProfile.teamId = teamId;
        updateTeamUI();
        loadNotifications();
        
        alert('✅ Вы присоединились к команде!');
        
    } catch (error) {
        console.error('❌ Ошибка принятия приглашения:', error);
        alert('❌ Ошибка принятия приглашения');
    }
}

async function rejectTeamInvite(notificationId) {
    if (!currentUser) return;
    
    try {
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        
        loadNotifications();
        alert('✅ Приглашение отклонено');
    } catch (error) {
        console.error('❌ Ошибка отклонения приглашения:', error);
    }
}

async function loadTeamInfo() {
    if (!userProfile || !userProfile.teamId) return;
    
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `teams/${userProfile.teamId}`));
        if (snapshot.exists()) {
            const team = snapshot.val();
            updateTeamUI(team);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о команде:', error);
    }
}

function updateTeamUI(team = null) {
    const noTeamSection = document.getElementById('noTeamSection');
    const teamSection = document.getElementById('teamSection');
    
    if (userProfile && userProfile.teamId && team) {
        noTeamSection.classList.add('hidden');
        teamSection.classList.remove('hidden');
        renderTeamVisitingCard(team);
    } else {
        noTeamSection.classList.remove('hidden');
        teamSection.classList.add('hidden');
    }
}

function renderTeamVisitingCard(team) {
    document.getElementById('teamCardName').textContent = team.name;
    document.getElementById('teamCardSlogan').textContent = team.slogan || 'Без слогана';
    document.getElementById('teamAverageMMR').textContent = team.averageMMR || '0';
    document.getElementById('teamCreationDate').textContent = new Date(team.createdAt).toLocaleDateString('ru-RU');
    
    const tournamentStatus = team.tournamentStatus === 'participating' ? 'Участвует' : 'Не участвует';
    const tournamentColor = team.tournamentStatus === 'participating' ? '#FFD700' : 'var(--text-secondary)';
    document.getElementById('teamTournamentStatus').textContent = tournamentStatus;
    document.getElementById('teamTournamentStatus').style.color = tournamentColor;
    
    loadCaptainInfo(team.captain);
    renderTeamPlayers(team.members || {});
}

async function loadCaptainInfo(captainId) {
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, `users/${captainId}`));
        if (snapshot.exists()) {
            const captain = snapshot.val();
            document.getElementById('teamCaptainName').textContent = captain.nickname || captain.username;
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки информации о капитане:', error);
        document.getElementById('teamCaptainName').textContent = 'Неизвестно';
    }
}

function renderTeamPlayers(members) {
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

async function calculateTeamAverageMMR(members) {
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

// === ОБНОВЛЕННАЯ ФУНКЦИЯ ВЫХОДА ИЗ КОМАНДЫ ===
async function leaveTeam() {
    if (!currentUser || !userProfile.teamId) return;
    
    if (!confirm('❌ Вы уверены, что хотите покинуть команду?')) {
        return;
    }
    
    try {
        const teamRef = firebase.ref(firebase.database, `teams/${userProfile.teamId}`);
        const teamSnapshot = await firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        const updatedMembers = { ...team.members };
        delete updatedMembers[currentUser.uid];
        
        // Если команда остается пустой, удаляем её
        if (Object.keys(updatedMembers).length === 0) {
            await firebase.remove(teamRef);
            
            // Удаляем все заявки на вступление в команду
            const applicationsRef = firebase.ref(firebase.database, `teamApplications/${userProfile.teamId}`);
            await firebase.remove(applicationsRef);
            
            console.log('✅ Команда удалена (последний участник вышел)');
        } else {
            const newAverageMMR = await calculateTeamAverageMMR(updatedMembers);
            
            await firebase.update(teamRef, {
                members: updatedMembers,
                averageMMR: newAverageMMR
            });
            
            // Уведомляем капитана
            try {
                const leaveNotificationId = `notification_${Date.now()}`;
                const leaveNotification = {
                    type: 'team_leave',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile.nickname || userProfile.username,
                    message: `${userProfile.nickname || userProfile.username} покинул(а) вашу команду "${team.name}"`,
                    timestamp: Date.now(),
                    read: false
                };
                
                await firebase.set(firebase.ref(firebase.database, `notifications/${team.captain}/${leaveNotificationId}`), leaveNotification);
                await limitNotifications(team.captain);
            } catch (notificationError) {
                console.error('❌ Ошибка отправки уведомления капитану:', notificationError);
            }
        }
        
        await firebase.update(firebase.ref(firebase.database, `users/${currentUser.uid}`), {
            teamId: null
        });
        
        userProfile.teamId = null;
        updateTeamUI();
        
        alert('✅ Вы покинули команду');
        
    } catch (error) {
        console.error('❌ Ошибка выхода из команды:', error);
        alert('❌ Ошибка выхода из команды');
    }
}

// === ФУНКЦИЯ УДАЛЕНИЯ КОМАНДЫ ===
function showDeleteTeamModal() {
    if (!currentUser || !userProfile.teamId) return;
    
    const teamName = document.getElementById('teamCardName').textContent;
    document.getElementById('teamNameToDelete').textContent = teamName;
    document.getElementById('confirmTeamNameInput').value = '';
    document.getElementById('deleteTeamModal').classList.remove('hidden');
}

async function deleteTeam() {
    if (!currentUser || !userProfile.teamId) return;
    
    const teamName = document.getElementById('teamCardName').textContent;
    const confirmInput = document.getElementById('confirmTeamNameInput').value.trim();
    
    if (confirmInput !== teamName) {
        alert('❌ Название команды не совпадает!');
        return;
    }
    
    try {
        const teamRef = firebase.ref(firebase.database, `teams/${userProfile.teamId}`);
        const teamSnapshot = await firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        
        if (team.captain !== currentUser.uid) {
            alert('❌ Только капитан может удалить команду');
            return;
        }
        
        // Уведомляем всех участников о удалении команды
        Object.keys(team.members || {}).forEach(async memberId => {
            try {
                const deleteNotificationId = `notification_${Date.now()}`;
                const deleteNotification = {
                    type: 'team_deleted',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile.nickname || userProfile.username,
                    message: `Команда "${team.name}" была удалена капитаном`,
                    timestamp: Date.now(),
                    read: false
                };
                
                await firebase.set(firebase.ref(firebase.database, `notifications/${memberId}/${deleteNotificationId}`), deleteNotification);
                
                await firebase.update(firebase.ref(firebase.database, `users/${memberId}`), {
                    teamId: null
                });
                
                await limitNotifications(memberId);
            } catch (memberError) {
                console.error(`❌ Ошибка уведомления участника ${memberId}:`, memberError);
            }
        });
        
        await firebase.remove(teamRef);
        
        const applicationsRef = firebase.ref(firebase.database, `teamApplications/${userProfile.teamId}`);
        await firebase.remove(applicationsRef);
        
        userProfile.teamId = null;
        updateTeamUI();
        
        closeDeleteTeamModal();
        alert('✅ Команда удалена!');
        
    } catch (error) {
        console.error('❌ Ошибка удаления команды:', error);
        alert('❌ Ошибка удаления команды');
    }
}

function closeDeleteTeamModal() {
    document.getElementById('deleteTeamModal').classList.add('hidden');
}

// === РЕДАКТИРОВАНИЕ КОМАНДЫ ===
async function showEditTeamModal() {
    if (!currentUser || !userProfile || !userProfile.teamId) {
        alert('❌ У вас нет команды для редактирования');
        return;
    }
    
    try {
        console.log('🔄 Проверка прав капитана...');
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${userProfile.teamId}`));
        if (!teamSnapshot.exists()) {
            alert('❌ Команда не найдена');
            return;
        }
        
        const team = teamSnapshot.val();
        if (team.captain !== currentUser.uid) {
            alert('❌ Только капитан может редактировать команду');
            return;
        }
        
        console.log('✅ Пользователь является капитаном, открываем модальное окно');
        document.getElementById('editTeamModal').classList.remove('hidden');
        await loadTeamMembersForEdit(team);
        
    } catch (error) {
        console.error('❌ Ошибка проверки прав капитана:', error);
        alert('❌ Ошибка доступа к редактированию команды');
    }
}

async function loadTeamMembersForEdit(team = null) {
    if (!userProfile.teamId) return;
    
    try {
        if (!team) {
            const snapshot = await firebase.get(firebase.ref(firebase.database, `teams/${userProfile.teamId}`));
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
                <button class="save-btn" onclick="updateTeamGeneralSettings()" style="margin-bottom: 20px;">💾 Сохранить настройки</button>
            </div>
            <h3 style="color: var(--accent-primary); margin: 20px 0 15px 0;">👥 Управление составом</h3>
        `;
        
        Object.entries(team.members || {}).forEach(([memberId, memberData]) => {
            const isCaptain = memberData.role === 'captain';
            const isCurrentUser = memberId === currentUser.uid;
            
            membersHTML += `
                <div class="team-member-edit">
                    <div class="member-edit-info">
                        <h4>${memberData.nickname} ${isCurrentUser ? '(Вы)' : ''}</h4>
                        <p>Текущая роль: ${getPositionName(memberData.position)} | MMR: ${memberData.mmr || 0}</p>
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
                            <button class="add-btn" onclick="updateTeamMember('${memberId}')">💾 Обновить</button>
                            ${!isCaptain ? `
                                <button class="cancel-btn" onclick="removeTeamMember('${memberId}')">❌ Удалить</button>
                                <button class="save-btn" onclick="transferCaptaincy('${memberId}')">👑 Сделать капитаном</button>
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

async function updateTeamGeneralSettings() {
    if (!userProfile.teamId) return;
    
    try {
        const tournamentStatus = document.getElementById('teamTournamentStatusEdit').value;
        
        await firebase.update(firebase.ref(firebase.database, `teams/${userProfile.teamId}`), {
            tournamentStatus: tournamentStatus,
            updatedAt: Date.now()
        });
        
        alert('✅ Настройки команды обновлены!');
        loadTeamInfo();
        
    } catch (error) {
        console.error('❌ Ошибка обновления настроек команды:', error);
        alert('❌ Ошибка обновления настроек команды');
    }
}

async function updateTeamMember(memberId) {
    if (!userProfile.teamId) return;
    
    try {
        const newNickname = document.getElementById(`nickname_${memberId}`).value.trim();
        const newPosition = document.getElementById(`position_${memberId}`).value;
        const newMMR = parseInt(document.getElementById(`mmr_${memberId}`).value) || 0;
        
        if (!newNickname) {
            alert('❌ Введите никнейм игрока');
            return;
        }
        
        await firebase.update(firebase.ref(firebase.database, `teams/${userProfile.teamId}/members/${memberId}`), {
            nickname: newNickname,
            position: newPosition,
            mmr: newMMR
        });
        
        await firebase.update(firebase.ref(firebase.database, `users/${memberId}`), {
            nickname: newNickname,
            mmr: newMMR,
            position: newPosition
        });
        
        if (memberId === currentUser.uid) {
            userProfile.nickname = newNickname;
            userProfile.mmr = newMMR;
            userProfile.position = newPosition;
            updateProfileUI();
        }
        
        await recalculateTeamAverageMMR();
        
        alert('✅ Данные игрока обновлены!');
        loadTeamMembersForEdit();
        loadTeamInfo();
        
    } catch (error) {
        console.error('❌ Ошибка обновления данных игрока:', error);
        alert('❌ Ошибка обновления данных');
    }
}

async function recalculateTeamAverageMMR() {
    if (!userProfile.teamId) return;
    
    try {
        const teamSnapshot = await firebase.get(firebase.ref(firebase.database, `teams/${userProfile.teamId}`));
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        const newAverageMMR = await calculateTeamAverageMMR(team.members);
        
        await firebase.update(firebase.ref(firebase.database, `teams/${userProfile.teamId}`), {
            averageMMR: newAverageMMR,
            updatedAt: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Ошибка пересчета MMR команды:', error);
    }
}

async function removeTeamMember(memberId) {
    if (!userProfile.teamId || !confirm('❌ Вы уверены, что хотите удалить этого игрока из команды?')) {
        return;
    }
    
    try {
        const teamRef = firebase.ref(firebase.database, `teams/${userProfile.teamId}`);
        const teamSnapshot = await firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        const updatedMembers = { ...team.members };
        delete updatedMembers[memberId];
        
        const newAverageMMR = await calculateTeamAverageMMR(updatedMembers);
        
        await firebase.update(teamRef, {
            members: updatedMembers,
            averageMMR: newAverageMMR
        });
        
        await firebase.update(firebase.ref(firebase.database, `users/${memberId}`), {
            teamId: null
        });
        
        const removeNotificationId = `notification_${Date.now()}`;
        const removeNotification = {
            type: 'team_removed',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            teamId: userProfile.teamId,
            teamName: team.name,
            message: `Вас удалили из команды "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${memberId}/${removeNotificationId}`), removeNotification);
        await limitNotifications(memberId);
        
        alert('✅ Игрок удален из команды');
        loadTeamMembersForEdit();
        loadTeamInfo();
        
    } catch (error) {
        console.error('❌ Ошибка удаления игрока:', error);
        alert('❌ Ошибка удаления игрока');
    }
}

async function transferCaptaincy(newCaptainId) {
    if (!userProfile.teamId || !confirm('👑 Вы уверены, что хотите передать капитанство?')) {
        return;
    }
    
    try {
        const teamRef = firebase.ref(firebase.database, `teams/${userProfile.teamId}`);
        const teamSnapshot = await firebase.get(teamRef);
        
        if (!teamSnapshot.exists()) return;
        
        const team = teamSnapshot.val();
        
        const updatedMembers = { ...team.members };
        updatedMembers[currentUser.uid].role = 'member';
        updatedMembers[newCaptainId].role = 'captain';
        
        await firebase.update(teamRef, {
            captain: newCaptainId,
            members: updatedMembers
        });
        
        const captainNotificationId = `notification_${Date.now()}`;
        const captainNotification = {
            type: 'team_captain',
            fromUserId: currentUser.uid,
            fromUserName: userProfile.nickname || userProfile.username,
            teamId: userProfile.teamId,
            teamName: team.name,
            message: `Вы стали капитаном команды "${team.name}"`,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.set(firebase.ref(firebase.database, `notifications/${newCaptainId}/${captainNotificationId}`), captainNotification);
        await limitNotifications(newCaptainId);
        
        userProfile.teamId = null;
        
        alert('✅ Капитанство передано!');
        closeEditTeamModal();
        loadTeamInfo();
        
    } catch (error) {
        console.error('❌ Ошибка передачи капитанства:', error);
        alert('❌ Ошибка передачи капитанства');
    }
}

function closeEditTeamModal() {
    document.getElementById('editTeamModal').classList.add('hidden');
}

// === ОБНОВЛЕННЫЕ ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ КОМАНД ===
function setupTeamEventListeners() {
    console.log('🔧 Настройка обработчиков событий для команд...');
    
    const confirmCreateTeamBtn = document.getElementById('confirmCreateTeamBtn');
    if (confirmCreateTeamBtn) {
        confirmCreateTeamBtn.addEventListener('click', () => {
            const teamName = document.getElementById('teamNameInput').value.trim();
            const slogan = document.getElementById('teamSloganInput').value.trim();
            
            if (!teamName) {
                alert('❌ Введите название команды');
                return;
            }
            
            createTeam(teamName, slogan);
        });
    }
    
    const invitePlayersBtn = document.getElementById('invitePlayersBtn');
    if (invitePlayersBtn) {
        invitePlayersBtn.addEventListener('click', showInvitePlayersModal);
    }
    
    const searchFriendsBtn = document.getElementById('searchFriendsBtn');
    if (searchFriendsBtn) {
        searchFriendsBtn.addEventListener('click', searchFriendsForInvite);
    }
    
    const editTeamBtn = document.getElementById('editTeamBtn');
    if (editTeamBtn) {
        editTeamBtn.addEventListener('click', showEditTeamModal);
        console.log('✅ Обработчик для editTeamBtn установлен');
    } else {
        console.error('❌ Кнопка editTeamBtn не найдена');
    }
    
    const deleteTeamBtn = document.getElementById('deleteTeamBtn');
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', showDeleteTeamModal);
    }
    
    const leaveTeamBtn = document.getElementById('leaveTeamBtn');
    if (leaveTeamBtn) {
        leaveTeamBtn.addEventListener('click', leaveTeam);
    }
    
    const closeInvitePlayersModal = document.getElementById('closeInvitePlayersModal');
    if (closeInvitePlayersModal) {
        closeInvitePlayersModal.addEventListener('click', closeInvitePlayersModal);
    }
    
    const cancelInvitePlayersBtn = document.getElementById('cancelInvitePlayersBtn');
    if (cancelInvitePlayersBtn) {
        cancelInvitePlayersBtn.addEventListener('click', closeInvitePlayersModal);
    }
    
    const confirmDeleteTeamBtn = document.getElementById('confirmDeleteTeamBtn');
    if (confirmDeleteTeamBtn) {
        confirmDeleteTeamBtn.addEventListener('click', deleteTeam);
    }
    
    const closeDeleteTeamModal = document.getElementById('closeDeleteTeamModal');
    if (closeDeleteTeamModal) {
        closeDeleteTeamModal.addEventListener('click', closeDeleteTeamModal);
    }
    
    const cancelDeleteTeamBtn = document.getElementById('cancelDeleteTeamBtn');
    if (cancelDeleteTeamBtn) {
        cancelDeleteTeamBtn.addEventListener('click', closeDeleteTeamModal);
    }
    
    console.log('✅ Обработчики событий для команд настроены');
}

function showInvitePlayersModal() {
    if (!userProfile.teamId) {
        alert('❌ У вас нет команды для приглашения игроков');
        return;
    }
    
    document.getElementById('invitePlayersModal').classList.remove('hidden');
    loadFriendsForInvite();
}

function closeInvitePlayersModal() {
    document.getElementById('invitePlayersModal').classList.add('hidden');
    document.getElementById('friendSearchInput').value = '';
    document.getElementById('friendsSearchResults').innerHTML = '';
}

async function loadFriendsForInvite() {
    if (!currentUser || !userProfile.friends || userProfile.friends.length === 0) {
        document.getElementById('friendsListForInvite').innerHTML = '<div class="no-data">У вас пока нет друзей</div>';
        return;
    }
    
    const friendsList = document.getElementById('friendsListForInvite');
    let friendsHTML = '';
    
    try {
        for (const friendId of userProfile.friends) {
            const snapshot = await firebase.get(firebase.ref(firebase.database, `users/${friendId}`));
            if (snapshot.exists()) {
                const friend = snapshot.val();
                
                const hasTeam = friend.teamId && friend.teamId !== userProfile.teamId;
                
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
                                <p>${getPositionName(friend.position)} | MMR: ${friend.mmr || 0}</p>
                                <p>Telegram: ${friend.telegram || 'Не указан'}</p>
                            </div>
                        </div>
                        <div>
                            ${hasTeam ? 
                                '<span class="add-btn" style="background: var(--text-secondary); cursor: not-allowed;">✅ Уже в команде</span>' :
                                `<button class="add-btn" onclick="sendTeamInvite('${friendId}')">👥 Пригласить</button>`
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

async function searchFriendsForInvite() {
    const searchTerm = document.getElementById('friendSearchInput').value.trim();
    const resultsContainer = document.getElementById('friendsSearchResults');
    
    if (!searchTerm) {
        alert('❌ Введите имя для поиска');
        return;
    }
    
    try {
        const snapshot = await firebase.get(firebase.ref(firebase.database, 'users'));
        let resultsHTML = '';
        let found = false;
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            
            Object.entries(users).forEach(([userId, user]) => {
                if (userId === currentUser.uid) return;
                
                const nicknameMatch = user.nickname && user.nickname.toLowerCase().includes(searchTerm.toLowerCase());
                const usernameMatch = user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase());
                
                if (nicknameMatch || usernameMatch) {
                    found = true;
                    const isFriend = userProfile.friends && userProfile.friends.includes(userId);
                    const hasTeam = user.teamId && user.teamId !== userProfile.teamId;
                    
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
                                    <p>${getPositionName(user.position)} | MMR: ${user.mmr || 0}</p>
                                    <p>Telegram: ${user.telegram || 'Не указан'}</p>
                                </div>
                            </div>
                            <div>
                                ${!isFriend ? 
                                    `<button class="add-btn" onclick="sendFriendRequest('${userId}')">👥 Добавить в друзья</button>` :
                                    hasTeam ? 
                                        '<span class="add-btn" style="background: var(--text-secondary); cursor: not-allowed;">✅ Уже в команде</span>' :
                                        `<button class="add-btn" onclick="sendTeamInvite('${userId}')">👥 Пригласить в команду</button>`
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
        resultsContainer.innerHTML = '<div class="no-data">Ошибка поиска</div>';
    }
}

// === УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ===
function showCreateTeamModal() {
    document.getElementById('createTeamModal').classList.remove('hidden');
}

function closeCreateTeamModal() {
    document.getElementById('createTeamModal').classList.add('hidden');
    document.getElementById('teamNameInput').value = '';
    document.getElementById('teamSloganInput').value = '';
}

function showJoinTeamModal() {
    document.getElementById('joinTeamModal').classList.remove('hidden');
}

function closeJoinTeamModal() {
    document.getElementById('joinTeamModal').classList.add('hidden');
    document.getElementById('teamIdInput').value = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// === НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ===
function setupEventListeners() {
    console.log('🔧 Настройка обработчиков событий...');
    
    // Навигация
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', () => showSection('profile'));
    
    const friendsBtn = document.getElementById('friendsBtn');
    if (friendsBtn) friendsBtn.addEventListener('click', () => showSection('friends'));
    
    const teamsListBtn = document.getElementById('teamsListBtn');
    if (teamsListBtn) {
        teamsListBtn.addEventListener('click', () => showSection('teams'));
    } else {
        console.error('❌ Кнопка teamsListBtn не найдена при настройке обработчиков');
    }
    
    const teamBtn = document.getElementById('teamBtn');
    if (teamBtn) teamBtn.addEventListener('click', () => showSection('team'));
    
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showSection('notification');
            loadNotifications();
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
   // В функции setupEventListeners замените обработчики кликов на обработчики отправки форм:

// Удалите старые обработчики:
// document.getElementById('loginBtn').addEventListener('click', () => { ... });
// document.getElementById('registerBtn').addEventListener('click', () => { ... });

// Добавьте новые обработчики форм:
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(email, password);
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const nickname = document.getElementById('registerNickname').value;
    const telegram = document.getElementById('registerTelegram').value;
    registerUser(email, password, confirmPassword, nickname, telegram);
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
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    
    // Аватарки
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        document.getElementById('avatarUpload').click();
    });
    
    document.getElementById('avatarUpload').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('📁 Выбран файл:', file.name, file.size, file.type);
            uploadAvatar(file);
            event.target.value = '';
        }
    });
    
    // Друзья
    document.getElementById('searchFriendBtn').addEventListener('click', searchFriends);
    
    // Команды
    document.getElementById('createTeamBtn').addEventListener('click', showCreateTeamModal);
    document.getElementById('joinTeamBtn').addEventListener('click', showJoinTeamModal);
    
    // Закрытие модальных окон
    document.getElementById('closeCreateTeamModal').addEventListener('click', closeCreateTeamModal);
    document.getElementById('cancelCreateTeamBtn').addEventListener('click', closeCreateTeamModal);
    document.getElementById('closeJoinTeamModal').addEventListener('click', closeJoinTeamModal);
    document.getElementById('cancelJoinTeamBtn').addEventListener('click', closeJoinTeamModal);
    
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
            closeAllModals();
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
    
    console.log('✅ Обработчики событий настроены');
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function getPositionName(position) {
    const positions = {
        'carry': 'Керри',
        'mid': 'Мидлер',
        'offlane': 'Оффлейнер',
        'support4': 'Саппорт 4',
        'support5': 'Саппорт 5'
    };
    return positions[position] || 'Не указана';
}

function getNotificationType(type) {
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

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString('ru-RU');
}

// === СТАТУС ПОДКЛЮЧЕНИЯ ===
function updateConnectionStatus(connected) {
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
function createAnimatedBackground() {
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

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
window.markNotificationAsRead = async function(notificationId) {
    if (!currentUser) return;
    
    try {
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            read: true
        });
        loadNotifications();
    } catch (error) {
        console.error('❌ Ошибка отметки уведомления:', error);
    }
};

window.acceptFriendRequest = acceptFriendRequest;

window.rejectFriendRequest = async function(notificationId, fromUserId) {
    if (!currentUser) return;
    
    try {
        await firebase.update(firebase.ref(firebase.database, `notifications/${currentUser.uid}/${notificationId}`), {
            responded: true,
            read: true
        });
        loadNotifications();
        alert('✅ Запрос дружбы отклонен');
    } catch (error) {
        console.error('❌ Ошибка отклонения запроса:', error);
    }
};

window.acceptTeamInvite = acceptTeamInvite;
window.rejectTeamInvite = rejectTeamInvite;
window.sendTeamInvite = sendTeamInvite;
window.applyToTeam = applyToTeam;
window.acceptTeamApplication = acceptTeamApplication;
window.rejectTeamApplication = rejectTeamApplication;
window.viewUserProfile = viewUserProfile;
window.showEditTeamModal = showEditTeamModal;
window.updateTeamMember = updateTeamMember;
window.removeTeamMember = removeTeamMember;
window.transferCaptaincy = transferCaptaincy;
window.closeEditTeamModal = closeEditTeamModal;
window.updateTeamGeneralSettings = updateTeamGeneralSettings;
window.recalculateTeamAverageMMR = recalculateTeamAverageMMR;

// Переключение вкладок в разделе команд
window.switchTeamTab = function(tabName) {
    console.log(`🔄 Переключение на вкладку: ${tabName}`);
    document.querySelectorAll('.team-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.team-tab-pane').forEach(pane => pane.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="switchTeamTab('${tabName}')"]`);
    const activePane = document.getElementById(tabName);
    
    if (activeButton && activePane) {
        activeButton.classList.add('active');
        activePane.classList.add('active');
        console.log(`✅ Вкладка ${tabName} активирована`);
    } else {
        console.error(`❌ Не удалось найти элементы для вкладки ${tabName}`);
    }
};

// Функция для отладки
window.debugTeams = function() {
    console.log('=== ДЕБАГ КОМАНД ===');
    console.log('👤 Текущий пользователь:', currentUser?.uid);
    console.log('📋 Профиль пользователя:', userProfile);
    console.log('🏆 ID команды пользователя:', userProfile?.teamId);
    console.log('🔧 Кнопка редактирования:', document.getElementById('editTeamBtn'));
    console.log('📋 Кнопка списка команд:', document.getElementById('teamsListBtn'));
};

// Функция для тестирования системы аватарок
window.testAvatarSystem = function() {
    console.log('🧪 Тестирование системы аватарок...');
    console.log('👤 Текущий пользователь:', currentUser?.uid);
    console.log('📷 userProfile:', userProfile);
    console.log('🖼️ avatarUrl присутствует:', !!userProfile?.avatarUrl);
    
    const avatarImage = document.getElementById('avatarImage');
    const defaultAvatar = document.getElementById('defaultAvatar');
    console.log('📱 avatarImage элемент:', avatarImage);
    console.log('📱 defaultAvatar элемент:', defaultAvatar);
    console.log('📱 avatarImage src:', avatarImage?.src);
    
    updateAvatarUI();
    
    console.log('🎯 Готов к загрузке аватарки');
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, запуск приложения...');
    
    setTimeout(() => {
        console.log('🔍 Проверка элементов навигации:');
        console.log('- teamsListBtn:', document.getElementById('teamsListBtn'));
        console.log('- editTeamBtn:', document.getElementById('editTeamBtn'));
    }, 1000);
    
    initializeApp();
});