// === Illusive Community Matchmaking System ===
class MatchmakingSystem {
    constructor(mainApp) {
        this.app = mainApp;
        this.currentMatches = {};
        this.userMatches = {};
        
        this.init = this.init.bind(this);
        this.showMatchmakingSection = this.showMatchmakingSection.bind(this);
        this.createMatch = this.createMatch.bind(this);
        this.findMatches = this.findMatches.bind(this);
        this.loadUserMatches = this.loadUserMatches.bind(this);
        this.joinMatch = this.joinMatch.bind(this);
        this.acceptMatchInvite = this.acceptMatchInvite.bind(this);
        this.rejectMatchInvite = this.rejectMatchInvite.bind(this);
    }

    async init() {
        console.log('🎮 Matchmaking system initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики будут добавлены в основном приложении
    }

showMatchmakingSection() {
    this.app.hideAllSections();
    document.getElementById('matchmakingContent').classList.remove('hidden');
    this.showMatchmakingStub();
}

showMatchmakingStub() {
    const matchmakingSection = document.getElementById('matchmakingContent');
    
    matchmakingSection.innerHTML = `
        <div class="section-header">
            <h2>🎮 Система Матчапов</h2>
            <p>Найдите достойных противников для вашей команды</p>
        </div>
        <div class="matchmaking-stub">
            <div class="matchmaking-stub-icon">🚧</div>
            <h3 class="matchmaking-stub-title">Раздел в разработке</h3>
            
            <div class="matchmaking-stub-content">
                <p class="matchmaking-stub-description">
                    Мы усердно работаем над созданием удобной системы матчапов, где вы сможете 
                    находить подходящих противников, создавать матчи и участвовать в турнирах.
                </p>
                
                <div class="matchmaking-features-grid">
                    <div class="matchmaking-feature-card">
                        <div class="matchmaking-feature-icon">⚔️</div>
                        <h4 class="matchmaking-feature-title">Поиск противников</h4>
                        <p class="matchmaking-feature-desc">
                            Автоматический подбор команд по MMR, позициям и предпочтениям
                        </p>
                    </div>
                    
                    <div class="matchmaking-feature-card">
                        <div class="matchmaking-feature-icon">🏆</div>
                        <h4 class="matchmaking-feature-title">Турниры</h4>
                        <p class="matchmaking-feature-desc">
                            Участвуйте в регулярных турнирах и зарабатывайте рейтинг для команды
                        </p>
                    </div>
                    
                    <div class="matchmaking-feature-card">
                        <div class="matchmaking-feature-icon">📊</div>
                        <h4 class="matchmaking-feature-title">Статистика</h4>
                        <p class="matchmaking-feature-desc">
                            Подробная статистика матчей, винрейт и прогресс вашей команды
                        </p>
                    </div>
                    
                    <div class="matchmaking-feature-card">
                        <div class="matchmaking-feature-icon">⚙️</div>
                        <h4 class="matchmaking-feature-title">Настройки</h4>
                        <p class="matchmaking-feature-desc">
                            Гибкие настройки поиска и предпочтений для идеального матча
                        </p>
                    </div>
                </div>
                
                <div class="matchmaking-announcement">
                    <p>🎯 К сожалению, мы не успели доделать функции матчапов к текущему релизу, но скоро обязательно это исправим!</p>
                </div>
                
                <div class="matchmaking-progress">
                    <div class="progress-info">
                        <span>Ожидайте релиз в ближайшее время</span>
                        <span>75%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 75%"></div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button class="save-btn" onclick="matchmakingSystem.showBasicMatchmakingInfo()" 
                            style="padding: 12px 30px; font-size: 1.1em;">
                        📋 Посмотреть планируемый функционал
                    </button>
                </div>
            </div>
        </div>
    `;
}

showBasicMatchmakingInfo() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>🎮 Планируемый функционал матчапов</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 25px;">
                    <h4 style="color: var(--accent-primary); margin-bottom: 15px;">Основные возможности:</h4>
                    <ul style="color: var(--text-secondary); line-height: 1.8; padding-left: 20px;">
                        <li><strong>Создание матчей</strong> - 1vs1, 2vs2, 5vs5 с настройкой времени и условий</li>
                        <li><strong>Умный поиск</strong> - подбор противников по MMR, позициям и рейтингу</li>
                        <li><strong>Система уведомлений</strong> - приглашения в матчи и подтверждения</li>
                        <li><strong>Статистика матчей</strong> - история, винрейт, прогресс команд</li>
                        <li><strong>Турнирная система</strong> - автоматические турниры с призами</li>
                        <li><strong>Рейтинговая система</strong> - ELO рейтинг для команд и игроков</li>
                    </ul>
                </div>
                
                <div style="background: rgba(76, 175, 80, 0.1); padding: 20px; border-radius: var(--radius-medium); border: 1px solid var(--accent-primary);">
                    <h4 style="color: var(--accent-primary); margin-bottom: 10px;">🎯 Что уже готово:</h4>
                    <p style="color: var(--text-secondary); margin: 0;">
                        • Базовая архитектура системы<br>
                        • Интеграция с профилями и командами<br>
                        • Система уведомлений<br>
                        • Интерфейс для создания матчей
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <button class="save-btn" onclick="this.closest('.modal').remove()">
                        Понятно, ждем с нетерпением! 🎮
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}



loadMatchmakingUI() {
    const matchmakingHTML = `
        <div class="section-header">
            <h2>🎮 Система Матчапов</h2>
            <p>Создавайте и находите матчи для тренировок</p>
        </div>
        <div class="matchmaking-container">
            <div class="matchmaking-actions">
                <button class="matchmaking-btn create-match-btn" data-action="createMatch">
                    ➕ Создать Матчап
                </button>
                <button class="matchmaking-btn find-matches-btn" data-action="findMatches">
                    🔍 Найти Матчап
                </button>
                <button class="matchmaking-btn my-matches-btn" data-action="loadUserMatches">
                    📋 Мои Матчапы
                </button>
            </div>
            
            <div id="matchmakingContentArea" class="matchmaking-content">
                <!-- Контент будет загружаться динамически -->
            </div>
        </div>
    `;

    const matchmakingSection = document.getElementById('matchmakingContent');
    matchmakingSection.innerHTML = matchmakingHTML;

    // Устанавливаем делегирование событий
    this.setupEventDelegation();
}

setupEventDelegation() {
    // Делегирование событий для кнопок матчапов
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Обработка основных кнопок матчапов
        if (target.classList.contains('matchmaking-btn') && target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            this.handleMatchmakingAction(action);
            return;
        }
        
        // Обработка кнопок в формах матчапов
        if (target.classList.contains('match-type-option') && target.hasAttribute('data-type')) {
            const matchType = target.getAttribute('data-type');
            this.loadMatchDetailsForm(matchType);
            return;
        }
        
        // Обработка кнопок создания матча
        if (target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            const matchType = target.getAttribute('data-match-type');
            
            switch(action) {
                case 'submitMatchCreation':
                    this.submitMatchCreation(matchType);
                    return;
                case 'cancelMatchCreation':
                    this.cancelMatchCreation();
                    return;
                case 'acceptMatchInvite':
                    const notificationId = target.getAttribute('data-notification-id');
                    const matchId = target.getAttribute('data-match-id');
                    this.acceptMatchInvite(notificationId, matchId);
                    return;
                case 'rejectMatchInvite':
                    const notifId = target.getAttribute('data-notification-id');
                    const mId = target.getAttribute('data-match-id');
                    this.rejectMatchInvite(notifId, mId);
                    return;
            }
        }
        
        // Обработка кнопок в списке матчапов
        if (target.classList.contains('join-match-btn') && target.hasAttribute('data-match-id')) {
            const matchId = target.getAttribute('data-match-id');
            this.joinMatch(matchId);
            return;
        }
        
        // Обработка кнопок управления матчами
        if (target.classList.contains('cancel-match-btn') && target.hasAttribute('data-match-id')) {
            const matchId = target.getAttribute('data-match-id');
            this.cancelMatch(matchId);
            return;
        }
        
        if (target.classList.contains('start-match-btn') && target.hasAttribute('data-match-id')) {
            const matchId = target.getAttribute('data-match-id');
            this.startMatch(matchId);
            return;
        }

        // Обработка кнопок фильтра матчапов
        if (target.id === 'searchMatchesBtn' || (target.classList.contains('add-btn') && target.closest('.matches-filter'))) {
            this.loadAvailableMatches();
            return;
        }
    });

    // Обработка изменений в фильтрах
    document.addEventListener('change', (e) => {
        const target = e.target;
        
        if (target.id === 'matchTypeFilter') {
            this.loadAvailableMatches();
        }
    });
}

handleMatchmakingAction(action) {
    switch(action) {
        case 'createMatch':
            this.createMatch();
            break;
        case 'findMatches':
            this.findMatches();
            break;
        case 'loadUserMatches':
            this.loadUserMatches();
            break;
    }
}

async createMatch() {
    if (!this.app.currentUser || !this.app.userProfile) {
        alert('❌ Для создания матчапа необходимо авторизоваться');
        return;
    }

    if (!this.app.userProfile.teamId) {
        alert('❌ Для создания матчапа необходимо состоять в команде');
        return;
    }

    const contentArea = document.getElementById('matchmakingContentArea');
    contentArea.innerHTML = `
        <div class="create-match-form">
            <h3>➕ Создание Матчапа</h3>
            <div class="match-type-selection">
                <h4>Выберите тип матча:</h4>
                <div class="match-type-options">
                    <div class="match-type-option" data-type="1v1">
                        <div class="match-type-icon">⚔️</div>
                        <div class="match-type-info">
                            <h5>1 vs 1</h5>
                            <p>Только для мидеров</p>
                        </div>
                    </div>
                    <div class="match-type-option" data-type="2v2">
                        <div class="match-type-icon">👥</div>
                        <div class="match-type-info">
                            <h5>2 vs 2</h5>
                            <p>Пары из команды</p>
                        </div>
                    </div>
                    <div class="match-type-option" data-type="5v5">
                        <div class="match-type-icon">🏆</div>
                        <div class="match-type-info">
                            <h5>5 vs 5</h5>
                            <p>Командный матч</p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="matchDetailsForm" class="match-details-form hidden">
                <!-- Детали матча будут загружены здесь -->
            </div>
        </div>
    `;
}

    setupMatchTypeSelection() {
        document.querySelectorAll('.match-type-option').forEach(option => {
            option.addEventListener('click', async () => {
                const matchType = option.getAttribute('data-type');
                await this.loadMatchDetailsForm(matchType);
            });
        });
    }

async loadMatchDetailsForm(matchType) {
    const userPosition = this.app.userProfile.position;
    
    // Проверяем возможность создания матча в зависимости от позиции
    if (matchType === '1v1' && userPosition !== 'mid') {
        alert('❌ Матчи 1 vs 1 доступны только для мидеров');
        return;
    }

    if (matchType === '2v2') {
        const canCreate2v2 = await this.check2v2Eligibility();
        if (!canCreate2v2) {
            alert('❌ Для создания матча 2 vs 2 у вас должен быть напарник в команде');
            return;
        }
    }

    if (matchType === '5v5') {
        const canCreate5v5 = await this.check5v5Eligibility();
        if (!canCreate5v5) {
            alert('❌ Для создания командного матча в вашей команде должно быть 5 игроков');
            return;
        }
    }

    const formContainer = document.getElementById('matchDetailsForm');
    formContainer.classList.remove('hidden');

    let formHTML = `
        <h4>Детали матча</h4>
        <div class="form-group">
            <label>Дата и время матча:</label>
            <input type="datetime-local" id="matchDateTime" class="form-input" required>
        </div>
        <div class="form-group">
            <label>Описание (необязательно):</label>
            <textarea id="matchDescription" class="form-input" placeholder="Дополнительная информация о матче..." rows="3"></textarea>
        </div>
    `;

    // Добавляем информацию о команде в зависимости от типа матча
    switch(matchType) {
        case '1v1':
            formHTML += this.get1v1MatchInfo();
            break;
        case '2v2':
            const partnerInfo = await this.get2v2PartnerInfo();
            formHTML += partnerInfo;
            break;
        case '5v5':
            const teamInfo = await this.get5v5TeamInfo();
            formHTML += teamInfo;
            break;
    }

    formHTML += `
        <div class="form-actions">
            <button class="save-btn" data-action="submitMatchCreation" data-match-type="${matchType}">
                🎮 Создать Матчап
            </button>
            <button class="cancel-btn" data-action="cancelMatchCreation">
                ❌ Отмена
            </button>
        </div>
    `;

    formContainer.innerHTML = formHTML;
}

    get1v1MatchInfo() {
        return `
            <div class="match-info">
                <h5>Информация о матче 1 vs 1:</h5>
                <p>• Тип: Мидер против мидера</p>
                <p>• Ваш MMR: ${this.app.userProfile.mmr || 0}</p>
                <p>• Будет искаться противник с близким MMR</p>
            </div>
        `;
    }

    async get2v2PartnerInfo() {
        const partner = await this.find2v2Partner();
        if (!partner) return '<p class="error">❌ Не удалось найти напарника</p>';

        const averageMMR = Math.round((this.app.userProfile.mmr + partner.mmr) / 2);
        
        return `
            <div class="match-info">
                <h5>Информация о матче 2 vs 2:</h5>
                <p>• Ваша пара: ${this.app.userProfile.nickname} + ${partner.nickname}</p>
                <p>• Позиции: ${this.app.getPositionName(this.app.userProfile.position)} + ${this.app.getPositionName(partner.position)}</p>
                <p>• Средний MMR пары: ${averageMMR}</p>
                <p>• Будет искаться пара с близким MMR</p>
            </div>
        `;
    }

    async get5v5TeamInfo() {
        const teamInfo = await this.getTeamInfo();
        if (!teamInfo) return '<p class="error">❌ Не удалось загрузить информацию о команде</p>';

        return `
            <div class="match-info">
                <h5>Информация о командном матче:</h5>
                <p>• Команда: ${teamInfo.name}</p>
                <p>• Средний MMR команды: ${teamInfo.averageMMR || 0}</p>
                <p>• Состав: ${Object.keys(teamInfo.members).length}/5 игроков</p>
                <p>• Будет искаться команда с близким MMR</p>
            </div>
        `;
    }

    async find2v2Partner() {
        if (!this.app.userProfile.teamId) return null;

        try {
            const teamSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, `teams/${this.app.userProfile.teamId}`)
            );
            
            if (!teamSnapshot.exists()) return null;

            const team = teamSnapshot.val();
            const userPosition = this.app.userProfile.position;
            
            // Определяем пару для позиции
            const pairs = {
                'carry': 'support5',
                'support5': 'carry',
                'offlane': 'support4', 
                'support4': 'offlane'
            };

            const partnerPosition = pairs[userPosition];
            if (!partnerPosition) return null;

            // Ищем игрока с нужной позицией
            for (const [memberId, memberData] of Object.entries(team.members)) {
                if (memberId !== this.app.currentUser.uid && memberData.position === partnerPosition) {
                    return {
                        userId: memberId,
                        nickname: memberData.nickname,
                        position: memberData.position,
                        mmr: memberData.mmr || 0
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('❌ Error finding 2v2 partner:', error);
            return null;
        }
    }

    async getTeamInfo() {
        if (!this.app.userProfile.teamId) return null;

        try {
            const teamSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, `teams/${this.app.userProfile.teamId}`)
            );
            
            return teamSnapshot.exists() ? teamSnapshot.val() : null;
        } catch (error) {
            console.error('❌ Error getting team info:', error);
            return null;
        }
    }

    async check2v2Eligibility() {
        const partner = await this.find2v2Partner();
        return partner !== null;
    }

    async check5v5Eligibility() {
        const teamInfo = await this.getTeamInfo();
        return teamInfo && Object.keys(teamInfo.members || {}).length === 5;
    }

    async submitMatchCreation(matchType) {
        const dateTime = document.getElementById('matchDateTime').value;
        const description = document.getElementById('matchDescription').value;

        if (!dateTime) {
            alert('❌ Укажите дату и время матча');
            return;
        }

        const matchData = {
            type: matchType,
            creatorId: this.app.currentUser.uid,
            creatorName: this.app.userProfile.nickname || this.app.userProfile.username,
            dateTime: new Date(dateTime).getTime(),
            description: description || '',
            status: 'searching',
            createdAt: Date.now()
        };

        // Добавляем информацию в зависимости от типа матча
        switch(matchType) {
            case '1v1':
                matchData.creatorMMR = this.app.userProfile.mmr || 0;
                matchData.creatorPosition = this.app.userProfile.position;
                break;
            
            case '2v2':
                const partner = await this.find2v2Partner();
                if (!partner) {
                    alert('❌ Не удалось найти напарника');
                    return;
                }
                matchData.participants = {
                    [this.app.currentUser.uid]: {
                        nickname: this.app.userProfile.nickname,
                        position: this.app.userProfile.position,
                        mmr: this.app.userProfile.mmr || 0
                    },
                    [partner.userId]: {
                        nickname: partner.nickname,
                        position: partner.position,
                        mmr: partner.mmr
                    }
                };
                matchData.averageMMR = Math.round((this.app.userProfile.mmr + partner.mmr) / 2);
                break;
            
            case '5v5':
                const teamInfo = await this.getTeamInfo();
                if (!teamInfo) {
                    alert('❌ Не удалось загрузить информацию о команде');
                    return;
                }
                matchData.teamId = this.app.userProfile.teamId;
                matchData.teamName = teamInfo.name;
                matchData.participants = teamInfo.members;
                matchData.averageMMR = teamInfo.averageMMR || 0;
                break;
        }

        try {
            const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await this.app.firebase.set(
                this.app.firebase.ref(this.app.firebase.database, `matches/${matchId}`),
                matchData
            );

            // Добавляем матч в список матчей пользователя
            await this.app.firebase.update(
                this.app.firebase.ref(this.app.firebase.database, `userMatches/${this.app.currentUser.uid}`),
                { [matchId]: true }
            );

            alert('✅ Матчап успешно создан!');
            this.loadMatchmakingUI();

        } catch (error) {
            console.error('❌ Error creating match:', error);
            alert('❌ Ошибка создания матчапа');
        }
    }

    cancelMatchCreation() {
        this.loadMatchmakingUI();
    }

async findMatches() {
    if (!this.app.currentUser) {
        alert('❌ Для поиска матчапов необходимо авторизоваться');
        return;
    }

    const contentArea = document.getElementById('matchmakingContentArea');
    contentArea.innerHTML = `
        <div class="find-matches-section">
            <h3>🔍 Поиск Матчапов</h3>
            <div class="matches-filter">
                <select id="matchTypeFilter" class="form-input">
                    <option value="all">Все типы</option>
                    <option value="1v1">1 vs 1</option>
                    <option value="2v2">2 vs 2</option>
                    <option value="5v5">5 vs 5</option>
                </select>
                <button class="add-btn" id="searchMatchesBtn">
                    🔍 Поиск
                </button>
            </div>
            <div id="availableMatchesList" class="matches-list">
                <!-- Список матчапов будет здесь -->
            </div>
        </div>
    `;

    await this.loadAvailableMatches();
}

    async loadAvailableMatches() {
        const filterType = document.getElementById('matchTypeFilter').value;
        
        try {
            const matchesSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, 'matches')
            );

            const availableMatchesList = document.getElementById('availableMatchesList');
            
            if (!matchesSnapshot.exists()) {
                availableMatchesList.innerHTML = '<div class="no-data">Нет доступных матчапов</div>';
                return;
            }

            let matchesHTML = '';
            const matches = matchesSnapshot.val();
            let matchCount = 0;

            for (const [matchId, match] of Object.entries(matches)) {
                // Пропускаем свои матчи и завершенные
                if (match.creatorId === this.app.currentUser.uid || match.status !== 'searching') {
                    continue;
                }

                // Фильтрация по типу
                if (filterType !== 'all' && match.type !== filterType) {
                    continue;
                }

                matchCount++;
                matchesHTML += this.createMatchCard(matchId, match);
            }

            if (matchCount === 0) {
                matchesHTML = '<div class="no-data">Нет доступных матчапов по выбранному фильтру</div>';
            }

            availableMatchesList.innerHTML = matchesHTML;

        } catch (error) {
            console.error('❌ Error loading matches:', error);
            document.getElementById('availableMatchesList').innerHTML = 
                '<div class="no-data">Ошибка загрузки матчапов</div>';
        }
    }

createMatchCard(matchId, match) {
    const matchDate = new Date(match.dateTime).toLocaleString('ru-RU');
    let participantsInfo = '';

    switch(match.type) {
        case '1v1':
            participantsInfo = `👤 ${match.creatorName} (MMR: ${match.creatorMMR})`;
            break;
        case '2v2':
            const participants = Object.values(match.participants || {});
            participantsInfo = `👥 ${participants.map(p => p.nickname).join(' + ')} (Avg MMR: ${match.averageMMR})`;
            break;
        case '5v5':
            participantsInfo = `🏆 ${match.teamName} (Avg MMR: ${match.averageMMR})`;
            break;
    }

    return `
        <div class="match-card">
            <div class="match-header">
                <h4>${this.getMatchTypeDisplayName(match.type)}</h4>
                <span class="match-status searching">🔍 В поиске</span>
            </div>
            <div class="match-info">
                <p><strong>Создатель:</strong> ${match.creatorName}</p>
                <p><strong>Участники:</strong> ${participantsInfo}</p>
                <p><strong>Дата и время:</strong> ${matchDate}</p>
                ${match.description ? `<p><strong>Описание:</strong> ${match.description}</p>` : ''}
            </div>
            <div class="match-actions">
                <button class="add-btn join-match-btn" data-match-id="${matchId}">
                    ✅ Присоединиться
                </button>
            </div>
        </div>
    `;
}

    getMatchTypeDisplayName(matchType) {
        const types = {
            '1v1': '⚔️ 1 vs 1 (Мидеры)',
            '2v2': '👥 2 vs 2 (Пары)',
            '5v5': '🏆 5 vs 5 (Команды)'
        };
        return types[matchType] || matchType;
    }

    async joinMatch(matchId) {
        if (!this.app.currentUser) return;

        try {
            const matchSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, `matches/${matchId}`)
            );

            if (!matchSnapshot.exists()) {
                alert('❌ Матчап не найден');
                return;
            }

            const match = matchSnapshot.val();

            // Отправляем уведомление создателю матча
            const notificationId = `match_invite_${Date.now()}`;
            const notificationData = {
                type: 'match_invite',
                fromUserId: this.app.currentUser.uid,
                fromUserName: this.app.userProfile.nickname || this.app.userProfile.username,
                matchId: matchId,
                matchType: match.type,
                message: `${this.app.userProfile.nickname} хочет присоединиться к вашему матчапу (${this.getMatchTypeDisplayName(match.type)})`,
                timestamp: Date.now(),
                read: false,
                responded: false
            };

            await this.app.firebase.set(
                this.app.firebase.ref(this.app.firebase.database, `notifications/${match.creatorId}/${notificationId}`),
                notificationData
            );

            await this.app.limitNotifications(match.creatorId);

            alert('✅ Запрос на присоединение отправлен! Ожидайте подтверждения от создателя матча.');

        } catch (error) {
            console.error('❌ Error joining match:', error);
            alert('❌ Ошибка присоединения к матчу');
        }
    }

async loadUserMatches() {
    if (!this.app.currentUser) {
        alert('❌ Для просмотра матчапов необходимо авторизоваться');
        return;
    }

    const contentArea = document.getElementById('matchmakingContentArea');
    contentArea.innerHTML = `
        <div class="user-matches-section">
            <h3>📋 Мои Матчапы</h3>
            <div class="matches-tabs">
                <button class="match-tab-btn active" data-tab="active">
                    Активные
                </button>
                <button class="match-tab-btn" data-tab="pending">
                    Ожидающие
                </button>
                <button class="match-tab-btn" data-tab="history">
                    История
                </button>
            </div>
            <div id="userMatchesList" class="matches-list">
                <!-- Список матчапов пользователя -->
            </div>
        </div>
    `;

    // Добавляем обработчики для табов
    this.setupMatchesTabs();

    await this.loadUserMatchesList('active');
}

setupMatchesTabs() {
    const tabsContainer = document.querySelector('.matches-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('match-tab-btn') && target.hasAttribute('data-tab')) {
                const tab = target.getAttribute('data-tab');
                
                // Убираем активный класс у всех кнопок
                document.querySelectorAll('.match-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Добавляем активный класс текущей кнопке
                target.classList.add('active');
                
                // Загружаем данные для выбранной вкладки
                this.loadUserMatchesList(tab);
            }
        });
    }
}
    async loadUserMatchesList(tab) {
        try {
            // Загружаем матчи пользователя
            const userMatchesSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, `userMatches/${this.app.currentUser.uid}`)
            );

            const userMatchesList = document.getElementById('userMatchesList');
            let matchesHTML = '';

            if (!userMatchesSnapshot.exists()) {
                matchesHTML = '<div class="no-data">У вас пока нет матчапов</div>';
                userMatchesList.innerHTML = matchesHTML;
                return;
            }

            const userMatchIds = Object.keys(userMatchesSnapshot.val());
            const allMatchesSnapshot = await this.app.firebase.get(
                this.app.firebase.ref(this.app.firebase.database, 'matches')
            );

            if (!allMatchesSnapshot.exists()) {
                matchesHTML = '<div class="no-data">Матчапы не найдены</div>';
                userMatchesList.innerHTML = matchesHTML;
                return;
            }

            const allMatches = allMatchesSnapshot.val();
            let matchCount = 0;

            for (const matchId of userMatchIds) {
                const match = allMatches[matchId];
                if (!match) continue;

                // Фильтрация по вкладке
                let showMatch = false;
                switch(tab) {
                    case 'active':
                        showMatch = match.status === 'confirmed' || match.status === 'searching';
                        break;
                    case 'pending':
                        showMatch = match.status === 'pending';
                        break;
                    case 'history':
                        showMatch = match.status === 'completed' || match.status === 'cancelled';
                        break;
                }

                if (showMatch) {
                    matchCount++;
                    matchesHTML += this.createUserMatchCard(matchId, match);
                }
            }

            if (matchCount === 0) {
                matchesHTML = `<div class="no-data">Нет матчапов в разделе "${this.getTabDisplayName(tab)}"</div>`;
            }

            userMatchesList.innerHTML = matchesHTML;

        } catch (error) {
            console.error('❌ Error loading user matches:', error);
            document.getElementById('userMatchesList').innerHTML = 
                '<div class="no-data">Ошибка загрузки матчапов</div>';
        }
    }

createUserMatchCard(matchId, match) {
    const matchDate = new Date(match.dateTime).toLocaleString('ru-RU');
    const statusInfo = this.getMatchStatusInfo(match.status);

    return `
        <div class="user-match-card">
            <div class="match-header">
                <h4>${this.getMatchTypeDisplayName(match.type)}</h4>
                <span class="match-status ${match.status}">${statusInfo.text}</span>
            </div>
            <div class="match-info">
                <p><strong>Дата:</strong> ${matchDate}</p>
                <p><strong>Статус:</strong> ${statusInfo.display}</p>
                ${match.description ? `<p><strong>Описание:</strong> ${match.description}</p>` : ''}
            </div>
            <div class="match-actions">
                ${this.getUserMatchActions(matchId, match)}
            </div>
        </div>
    `;
}

getUserMatchActions(matchId, match) {
    if (match.status === 'searching' && match.creatorId === this.app.currentUser.uid) {
        return `
            <button class="cancel-btn cancel-match-btn" data-match-id="${matchId}">
                ❌ Отменить
            </button>
        `;
    }
    
    if (match.status === 'confirmed') {
        return `
            <button class="save-btn start-match-btn" data-match-id="${matchId}">
                🎮 Начать матч
            </button>
        `;
    }

    return '';
}
    getMatchStatusInfo(status) {
        const statuses = {
            'searching': { text: '🔍 В поиске', display: 'В поиске противника' },
            'pending': { text: '⏳ Ожидание', display: 'Ожидание подтверждения' },
            'confirmed': { text: '✅ Подтвержден', display: 'Матч подтвержден' },
            'completed': { text: '🏁 Завершен', display: 'Матч завершен' },
            'cancelled': { text: '❌ Отменен', display: 'Матч отменен' }
        };
        return statuses[status] || { text: status, display: status };
    }

getUserMatchActions(matchId, match) {
    if (match.status === 'searching' && match.creatorId === this.app.currentUser.uid) {
        return `
            <button class="cancel-btn cancel-match-btn" data-match-id="${matchId}">
                ❌ Отменить
            </button>
        `;
    }
    
    if (match.status === 'confirmed') {
        return `
            <button class="save-btn start-match-btn" data-match-id="${matchId}">
                🎮 Начать матч
            </button>
        `;
    }

    return '';
}

    switchUserMatchesTab(tab) {
        document.querySelectorAll('.match-tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.loadUserMatchesList(tab);
    }

    getTabDisplayName(tab) {
        const tabs = {
            'active': 'Активные',
            'pending': 'Ожидающие', 
            'history': 'История'
        };
        return tabs[tab] || tab;
    }

    // Методы для обработки уведомлений о матчах
async acceptMatchInvite(notificationId, matchId) {
    if (!this.app.currentUser) {
        alert('❌ Пользователь не авторизован');
        return;
    }

    try {
        console.log('🔄 Accepting match invite:', { notificationId, matchId });

        // Сначала проверяем существование матча
        const matchRef = this.app.firebase.ref(this.app.firebase.database, `matches/${matchId}`);
        const matchSnapshot = await this.app.firebase.get(matchRef);
        
        if (!matchSnapshot.exists()) {
            alert('❌ Матчап не найден');
            return;
        }

        const match = matchSnapshot.val();
        console.log('📊 Match data:', match);

        // Проверяем, что матч еще в поиске
        if (match.status !== 'searching') {
            alert('❌ Этот матчап уже не доступен для присоединения');
            return;
        }

        // Проверяем, что пользователь не пытается присоединиться к своему же матчу
        if (match.creatorId === this.app.currentUser.uid) {
            alert('❌ Вы не можете присоединиться к своему собственному матчу');
            return;
        }

        // Обновляем статус матча
        const updateData = {
            status: 'confirmed',
            opponentId: this.app.currentUser.uid,
            opponentName: this.app.userProfile.nickname || this.app.userProfile.username,
            confirmedAt: Date.now()
        };

        console.log('📝 Updating match with:', updateData);
        
        await this.app.firebase.update(matchRef, updateData);

        // Отмечаем уведомление как обработанное
        await this.app.firebase.update(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${this.app.currentUser.uid}/${notificationId}`),
            {
                responded: true,
                read: true
            }
        );

        // Добавляем матч в список матчей пользователя
        await this.app.firebase.update(
            this.app.firebase.ref(this.app.firebase.database, `userMatches/${this.app.currentUser.uid}`),
            { [matchId]: true }
        );

        // Отправляем уведомление создателю матча
        const confirmNotificationId = `match_confirmed_${Date.now()}`;
        const confirmNotification = {
            type: 'match_confirmed',
            fromUserId: this.app.currentUser.uid,
            fromUserName: this.app.userProfile.nickname || this.app.userProfile.username,
            matchId: matchId,
            message: `${this.app.userProfile.nickname} принял ваш матчап!`,
            timestamp: Date.now(),
            read: false
        };

        await this.app.firebase.set(
            this.app.firebase.ref(this.app.firebase.database, `notifications/${match.creatorId}/${confirmNotificationId}`),
            confirmNotification
        );

        await this.app.limitNotifications(match.creatorId);

        alert('✅ Матчап подтвержден!');
        this.app.loadNotifications();

    } catch (error) {
        console.error('❌ Error accepting match invite:', error);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('❌ Недостаточно прав для принятия матчапа. Проверьте правила безопасности Firebase.');
        } else {
            alert('❌ Ошибка подтверждения матча: ' + error.message);
        }
    }
}

    async rejectMatchInvite(notificationId, matchId) {
        try {
            // Отмечаем уведомление как отклоненное
            await this.app.firebase.update(
                this.app.firebase.ref(this.app.firebase.database, `notifications/${this.app.currentUser.uid}/${notificationId}`),
                {
                    responded: true,
                    read: true
                }
            );

            alert('✅ Приглашение отклонено');
            this.app.loadNotifications();

        } catch (error) {
            console.error('❌ Error rejecting match invite:', error);
            alert('❌ Ошибка отклонения приглашения');
        }
    }

    async cancelMatch(matchId) {
        if (!confirm('❌ Вы уверены, что хотите отменить этот матчап?')) {
            return;
        }

        try {
            await this.app.firebase.update(
                this.app.firebase.ref(this.app.firebase.database, `matches/${matchId}`),
                {
                    status: 'cancelled',
                    cancelledAt: Date.now()
                }
            );

            alert('✅ Матчап отменен');
            this.loadUserMatches();

        } catch (error) {
            console.error('❌ Error cancelling match:', error);
            alert('❌ Ошибка отмены матча');
        }
    }

    async startMatch(matchId) {
        // Здесь можно добавить логику начала матча
        alert('🎮 Матч начинается! Удачи!');
        // В будущем можно интегрировать с системой отслеживания результатов
    }
}

// Глобальная переменная для системы матчапов
let matchmakingSystem = null;

