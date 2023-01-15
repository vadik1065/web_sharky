/**
 * Главный модуль игры.
 */

class Game extends GameItem {

    static DELAY_HIDE_LINES = 1000;     // время скрывания выбранных игровых линий
    static DELAY_RISK_STEP = 1000;      // задержка при переходе к следующему шагу риск-игры
    static TAKE_WIN_INTERVAL = 200;     // интервал перетекания выигрыша
    static DELAY_SHOW_BANNER = 1000;    // задержка после показа баннера бонус-игры
    static DELAY_BONUS_SPIN = 500;      // задержка между спинами бонус-игры

    /** Идентификатор игры */
    static gameId = 23;

    /** Идентификатор текущего игрока */
    userId = 0;

    /** Режим запуска игры - 'real' или 'demo' */
    startMode;

    /** Идентификатор фрейма игры */
    frameUID;

    /** Идентификатор сессии авторизации */
    sessionID;

    /** Параметры работы игры */
    options;

    //==========================================================================
    //  Настройка игровых объектов и элементов управления
    //==========================================================================

    /** Изображения основных объектов */
    images;

    /** Описание символов */
    symbols;

    /** Описание барабанов */
    reelDef;

    /** Описание игровых линий */
    lines;

    /** Описание элементов управления игрой. Координаты относительно фоновой картинки */
    controlDef;

    /** Описание меню и пунктов меню */
    menuDef;

    /** Описание окон помощи по игре */
    helpDef;

    // Описание объектов риск игры

    riskGameDef;

    // Описание для бонус-игры

    bonusDef;

    // Настройка окна выбора линий
    linesWinDef;

    // Настройка окна выбора ставки
    betWinDef;

    // Настройка диалоговых окон
    dialogDef;

    // Настройка отображения джекпотов
    jackpotDef;

    //==========================================================================
    //  Управление состоянием игры
    //==========================================================================

    /** Идентификаторы состояния игры */
    static State = {
        WAIT_ROTATE:        'waitRotate',       // ожидание вращения барабанов
        HELP:               'help',             // показ страниц помощи по игре
        ROTATE:             'rotate',           // вращение барабанов в обычной игре
        CHANGE_TOTAL_BET:   'changeTotalBet',   // изменение общей ставки (числа линий, ставки на линию, пополнение баланса и т.п.)
        DISABLED:           'disabled',         // все функции заблокированы
        SHOW_WIN_LINES:     'showWinLines',     // показ выигрышных линий
        WAIT_USER:          'waitUser',         // ожидание действий игрока после показа выигрыша
        TAKE_WIN:           'takeWin',          // собирание выигрыша
        SHOW_BONUS_BANNER:  'startBonus',       // показ баннера начала бонус-игры
        WAIT_BONUS_ROTATE:  'waitBonusRotate',  // ожидание вращения барабанов при старте бонус-игры
        SHOW_EXTRA_LINES:   'showExtraLines',   // показ дополнительных выигрышных линий по символу расширения
        BONUS_ROTATE:       'bonusRotate',      // вращение в бонус-игре
        BONUS_FINISH:       'bonusFinish',      // завершение бонус-игры (показ завершающего баннера)
        RISK_GAME:          'riskGame',         // отображение блока риск-игры
        SHOW_JACKPOT:       'showJackpot'       // показ выигрыша в джекпот
    };

    /** Текущее состояние игры */
    state;

    /** Флаг блокировки интерфейса. Используется при открытии диалоговых окон. */
    uiLocked;

    /**
     * Установить текущее состояние игры.
     *
     * @param {Game.State} state новое состояние игры
     */
    setState( state ) {
        this.state = state;

        Log.warn( 'Game state changed to [' + state + ']' );

        if ( ! this.uiLocked && this.controlBox ) {
            this.setGameUIEnabled( state != Game.State.CHANGE_TOTAL_BET );
            this.controlBox.setState( state );
        }
    }

    /**
     * Установить доступность игрового интерфейса (фона, барабанов, линий и т.п.).
     *
     * @param {boolean} enabled состояние доступности
     */
    setGameUIEnabled( enabled ) {
        if ( this.background ) {
            this.background.setEnabled( enabled );
            this.reelBox.setEnabled( enabled );
            this.lineBox.setEnabled( enabled );
        }
    }

    /**
     * Получить текущее состояние блокировки интерфейса.
     *
     * @returns {boolean} Возвращает флаг блокировки.
     */
    isUILocked() {
        return this.uiLocked;
    }

    /**
     * Установить блокировку интерфейса.
     *
     * @param {boolean} state состояние блокировки
     */
    setUILocked( locked ) {
        this.uiLocked = locked;
        if ( locked ) { // заблокировать
            this.setGameUIEnabled( false );
            if ( this.controlBox ) {
                if ( this.state != Game.State.SHOW_JACKPOT ) {
                    this.controlBox.setState( Game.State.DISABLED );
                }
            }
        }
        else {          // разблокировать
            if ( this.controlBox ) {
                this.setGameUIEnabled( this.state != Game.State.CHANGE_TOTAL_BET );
                this.controlBox.setState( this.state );
            }
        }
    }

    //==========================================================================
    //  Параметры демо-режима
    //==========================================================================

    /** Флаг остановка демо-режима */
    stopDemo = false;

    /** Флаг разрешения демо-режима */
    demoEnabled = true;

    /** Текущее состояние демо-режима */
    demoMode = true;

    /** Тип демо-режима */
    static DemoType = {
        NO_BALANCE:   0,
        WITH_BALANCE: 1
    };
    demoType = Game.DemoType.WITH_BALANCE;

    //==========================================================================
    //  Игровые объекты
    //==========================================================================

    /** Фоновая картинка */
    background;

    /** Барабаны */
    reelBox;

    /** Элементы управления игрой */
    controlBox;

    /** Группа игровых линий */
    lineBox;

    /** Окно выбора числа линий */
    linesWindow = null;

    /** Окно выбора ставки на линию */
    betWindow = null;

    /** Окно меню */
    menuWindow;

    /** Выбранное число линий */
    selectedLines;

    /** Выбранная ставка на линию */
    selectedBet;

    /** Текущая полная ставка ( selectedLines * selectedBet ) */
    totalBet;

    /** Объект помощи по игре */
    helpBox;

    /** Риск игра  */
    riskBox;

    /** Текстовый баннер бонус-игры */
    textBanner;

    /** Объект проигрывания звуковых файлов */
    soundPlayer;

    /** Массив джекпотов */
    jackpots;

    /** Количество разрешенных джекпотов */
    jackpotAllowedCount;

    static JACKPOT_ALLOWED_COUNT = 2;   // по умолчанию - два джекпота разрешено

    /** Адрес файла конфигурации */
    configFile;

    //==========================================================================

    rootItem;

    windowWidth;

    windowHeight;

    //==========================================================================

    app = null;

    // Массив загружаемых картинок, который используется для исключения
    // повторной загрузки.
    loadedUrls;

    // Данные, полученные от сервера
    serverData;

    // Флаг окончания загрузки картинок
    imagesLoaded;

    // Флаг окончания загрузки звуков
    soundsLoaded;

    //==========================================================================
    // Текущее состояние игры

    /** Демо-баланс */
    demoBalance;

    /** Реальный баланс */
    realBalance;

    /** Номер последнего спина */
    lastSpinId;

    //==========================================================================

    static _inWindow;
    static _inst;

    static instance() {
        return Game._inst;
    }

    //==========================================================================

    constructor( config, elementId = null ) {

        super( null );

        Game._inst = this;

        this.userId = 0;
        this.startMode = Game.siteParam( 'type' );
        this.frameUID = Game.siteParam( 'uid' );
        this.sessionID = Game.siteParam( 'session' );

        this.menuWindow = null;

        this.selectedLines = 1;
        this.selectedBet = 1000;
        this.totalBet = this.selectedLines * this.selectedBet;

        this.imagesLoaded = false;
        this.soundsLoaded = false;

        if ( elementId == null ) {
            Log.out( 'Add game to window' );
            Game._inWindow = true;
            this.rootItem = window;
            this.app = new PIXI.Application( {
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                resizeTo: window,
                antialias: true
            } );
            document.body.appendChild( this.app.view );
            window.onresize = this.onWindowResized;
        }
        else {
            Log.out( 'Add game to item [' + elementId + ']' );
            Game._inWindow = false;
            let elem = document.getElementById( elementId );
            this.rootItem = elem;
            this.app = new PIXI.Application( {
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                resizeTo: elem,
                antialias: true
            } );
            elem.appendChild( this.app.view );
        }

        this.draw();

        // Загрузить файл конфигурации

        this.initLoad();
        this.configFile = ( config == 'desktop' ) ? './conf/desktop.json' : './conf/mobile.json';
//        this.configFile = './conf/mobile.json';
//        this.configFile = './conf/desktop.json';
        this.addToLoad( this.configFile );
        this.startLoad( ( result )=>{ this.onConfigLoaded( result ) } );

        // Специальные шрифты

        let font1 = new FontFace('RobotoBold', 'url(./fonts/roboto-bold.woff)');
        font1.load().then( function( fontFace ) {
            document.fonts.add( fontFace );
        })
        .catch( function(error) {
            Log.error( error );
        });

        // Отправить асинхронный запрос на сервер для запуска игры.
        // При запуске в демо-режиме сбрасываем идентификатор сессии для создания новой анонимной сессии.
        // При запуске в реальном режиме, отправляем идентификатор сессии, полученный от сайта игрока.

        this.serverData = null;
        Network.initilize();
        Network.setSessionID( this.startMode == 'demo' ? '' : this.sessionID );
        this.sendGameStartRequest();

        // Подключить слушатель событий внешнего сайта

        window.addEventListener( 'message', e => {
            const message = e.data;
            if ( message.uid !== this.frameUID )
                return;
            Log.out( 'Get event: ' + JSON.stringify( message ) );
            if ( message.event === 'user.login' ) {
                this.onUserLogin( message.payload );
            }
            else if ( message.event === 'user.logout' ) {
                this.onUserLogout();
            }
            else if ( message.event === 'game.closed' ) {
                this.onGameClosed();
            }
        }, false );
    };

    //==========================================================================
    //  Интеграция с внешним сайтом
    //==========================================================================

    /**
     * Флаг авторизации игрока из игры.
     */
    isGameUserLogin = false;

    /**
     * Флаг необходимости открыть окно пополнения баланса после авторизации игрока.
     */
    needMakeDeposit = false;

    static siteParam( name, defaultValue = '' ) {
        const params = new URLSearchParams( window.location.search );
        let value = defaultValue;
        if ( params.has( name ) ) {
            value = params.get( name );
        }
        Log.out( 'Site param "' + name + '" = "' + value + '"' );
        return value;
    }

    static sendMessage( params ) {
        Log.out( 'Send message: ' + JSON.stringify( params ) );
        window.parent.postMessage( params, '*' );
    }

    sendUserLogin() {
        this.isGameUserLogin = true;
        Game.sendMessage({
            uid: this.frameUID,
            event: 'dialogs.login',
            payload: {
                closeOnCancel: false
            }
        });
    }

    sendOpenDeposit() {
        Game.sendMessage({
            uid: this.frameUID,
            event: 'dialogs.replenish',
            payload: {
                closeOnCancel: false
            }
        });
    }

    sendUserLogout() {
        Game.sendMessage({
            uid: this.frameUID,
            event: 'pages.logout'
        });
    }

    sendGameClose() {
        Game.sendMessage({
            uid: this.frameUID,
            event: 'game.close'
        });
    }

    onGameClosed() {
        Network.sendRequest( 'game/exit', { gameId: Game.gameId, exit: 1 }, null, null );
    }

    /**
     * Обработка успешной авторизации игрока.
     */
    onUserLogin( data ) {
        Log.out( 'User login: ' + JSON.stringify( data ) );

        // Перезапустить игру в реальном режиме, если был запрос авторизации из игры

        if ( this.isGameUserLogin ) {
            Log.out( 'Restart game in real mode after user login' );
            this.userId = data.id;
            this.sessionID = data.session;
            Network.setSessionID( data.session );
            this.restart();
        }

        // Если необходимо пополнить баланс, отправить запрос на пополнение баланса

        if ( this.needMakeDeposit ) {
            this.needMakeDeposit = false;
            Game.sendOpenDeposit();
        }
    }

    /**
     * Игрок выполнил логаут.
     */
    onUserLogout() {
        this.userId = 0;
    }

    /**
     * Проверка авторизации игрока.
     */
    isUserLogged() {
        return ( this.sessionID != '' );
    }

    /**
     * Обработка пункта меню "Вход/Выход".
     */
    onSignInOut() {
        this.menuWindowClose();
        if ( this.isFullscreen() ) {
            this.setFullscreen( false );
        }
        if ( this.isUserLogged() ) {
            this.sendUserLogout();
        }
        else {
            this.sendUserLogin();
        }
    }

    /**
     * Обработка пункта меню "Пополнение баланса".
     */
    onMakeDeposit() {
        this.menuWindowClose();
        if ( this.isFullscreen() ) {
            this.setFullscreen( false );
        }
        if ( this.isUserLogged() ) {
            this.sendOpenDeposit();
        }
        else {
            this.needMakeDeposit = true;
            this.sendUserLogin();
        }
    }

    //==========================================================================

    /**
     * Показать диалог об ошибке.
     *
     * @param {object} params параметры
     */
    showError( params ) {

        // Если запущен другой экземпляр игры, показать диалог и закрыть игру

        if ( params.error.type == Network.ERROR_SERVER && params.error.code == Network.INVALID_FRAME_UID ) {

            let dialogClose = new Dialog( this, this.dialogDef, 'The game has been stopped.\nAnother instance of the game is running.', ['Close'],
                () => {
                    dialogClose.close();
                    this.sendGameClose();
                }
            );
        }
        else {

            // Показать диалог об ошибке, и потом повторить вращение барабанов
            // с тем же номером спина

            let dialog = new Dialog( this, this.dialogDef, params.message, params.buttons,
                ( btn ) => {
                    dialog.close();
                    if ( btn >= 0 || params.callOnClose ) params.callback();
                }
            );
        }
    }

    //==========================================================================
    //  Загрузка файлов ресурсов
    //==========================================================================

    initLoad() {
        this.loadedUrls = [];
    }

    /**
     * Добавить в загрузку адреса картинок.
     */
    addToLoad( url ) {
        if ( Array.isArray( url ) ) {
            for ( let i = 0; i < url.length; ++i ) {
                let u = url[i];
                if ( u != '' && this.loadedUrls.indexOf( u ) < 0 ) {
                    Log.out( 'Add to load [' + u + ']' );
                    this.loadedUrls.push( u );
                }
            }
        }
        else if ( url != '' && this.loadedUrls.indexOf( url ) < 0 ) {
            Log.out( 'Add to load [' + url + ']' );
            this.loadedUrls.push( url );
        }
    }

    /**
     * Добавить в загрузку картинки из описания элемента, содержащего
     * файлы для вертикальной и горизонтальной ориентации.
     *
     * @param {object} itemDef объект описания
     */
    addToLoadItem( itemDef ) {
        this.addToLoad( itemDef.vertical.urls );
        this.addToLoad( itemDef.horizontal.urls );
    }

    /**
     * Начать загрузку добавленных файлов.
     *
     * @param {type} callback
     */
    startLoad( onLoadedFunc, onProgressFunc = null ) {
        let promise = PIXI.Assets.load( this.loadedUrls, (v)=>{
            if ( onProgressFunc ) onProgressFunc( v * 100 );
        });
        promise.then( ( result )=>{
            if ( onLoadedFunc ) onLoadedFunc( result );
        });
    }

    /**
     * Проверить факт загрузки заданного ресурса.
     *
     * @param {string} url
     *
     * @returns {Boolean}
     */
    isLoaded( url ) {
        return ( PIXI.Assets.get( url ) != undefined );
    }

    //==========================================================================

    /**
     * Обработка загруженной конфигурации игры.
     *
     * @param {type} conf
     */
    onConfigLoaded( result ) {
        let conf = result[ this.configFile ];

        this.options = Tools.clone( conf.options );
        Log.enabled = this.options.logEnabled || false;

        // Сохранить настройку основных элементов игры

        this.images = Tools.clone( conf['images'] );
        this.symbols = Tools.clone( conf.symbols );
        this.reelDef = Tools.clone( conf.reelDef );
        this.lines = Tools.clone( conf.lines );
        this.controlDef = Tools.clone( conf.controlDef );
        this.menuDef = Tools.clone( conf.menuDef );
        this.helpDef = Tools.clone( conf.helpDef );
        this.riskGameDef = Tools.clone( conf.riskGameDef );
        this.bonusDef = Tools.clone( conf.bonusDef );
        this.linesWinDef = Tools.clone( conf.linesWinDef );
        this.betWinDef = Tools.clone( conf.betWinDef );
        this.dialogDef = Tools.clone( conf.dialogDef );
        this.jackpotDef = Tools.clone( conf.jackpotDef );

        // Запустить загрузку всех звуковых файлов

        this.soundPlayer = new SoundPlayer( this );
        this.soundPlayer.addListener( 'downloadFinished', () => { this.onSoundDownloaded(); });
        this.soundPlayer.addListener( 'downloadError', () => { this.onSoundDownloadFailed(); });
        this.soundPlayer.download();

        // Загрузить изображения, необходимые для начала игры

        this.initLoad();

        this.addToLoadItem( this.images.bkg );          // основной фон нормальной игры
        this.addToLoad( this.images.closeIcon.urls );   // кнопка закрытия окон

        let itemDef = this.controlDef;                  // картинки для элементов управления
        let names = Object.keys( itemDef );
        let cnt = names.length;
        for ( let i = 0; i < cnt; ++i ) {
            let name = names[ i ];
            this.addToLoadItem( itemDef[ name ] );
        }

        let lineDef = this.lines;                       // картинки для игровых линий
        names = Object.keys( lineDef );
        cnt = names.length;
        for ( let i = 0; i < cnt; ++i ) {
            let name = names[ i ];
            this.addToLoad( lineDef[ name ].urls );
        }

        let symbols = this.symbols.info;                // нормальные картинки для символов
        let symbolIds = Object.keys( symbols );
        for ( let i = 0; i < symbolIds.length; ++i ) {
            let id = symbolIds[ i ];
            let normal = symbols[ id ].normal;
            this.addToLoad( normal.url );
            if ( normal.animate ) {
                this.addToLoad( normal.animate );
            }
            if ( normal.sprite ) {
                this.addToLoad( normal.sprite.url );
            }
        }

        let helpDef = this.helpDef;                     // картинки для страниц помощи
        this.addToLoad( helpDef.urls );

        let bonusDef = this.bonusDef;                   // картинки для баннера бонус-игры
        this.addToLoadItem( bonusDef.banner );

        let jackpotDef = this.jackpotDef;               // картинки для анимации джекпотов
        this.addToLoadItem( jackpotDef );

        this.startLoad(
            () => this.onResourcesLoaded(),
            ( progress ) => {
                Log.out( 'Image download: ' + progress.toFixed(2) + '%' );
                this.emit('image.progress', progress);
            }
        );
    }

    //==========================================================================

    onSoundDownloaded() {
        Log.out( 'Sound download finished' );
        let game = Game.instance();
        game.soundsLoaded = true;
        if ( game.serverData && game.imagesLoaded ) {
            game.create();
        }
        this.emit('music.progress', 100);
    }

    onSoundDownloadFailed( data ) {
        Log.error( '### Sound download error: ' + data.name + ', err = ' + data.error );
    }

    /**
     * Метод вызывается по окончании загрузки всех картинок.
     *
     * Если ответ от сервера уже пришел, создать игру.
     */
    onResourcesLoaded() {
        let game = Game.instance();
        game.imagesLoaded = true;
        if ( game.serverData && game.soundsLoaded ) {
            game.create();
        }
        this.emit('image.progress', 100);
    }

    /**
     * Отправить на сервер запрос начала игры.
     */
    sendGameStartRequest() {
        Network.setFrameUID( this.frameUID );
        Network.sendRequest( 'game/run', { gameId: Game.gameId }, this.onGameStarted, this.onGameStartError );
    }

    /**
     * Обработка нормального ответа от сервера на запрос начала игры.
     *
     * Если картиники и звуки уже загружены, создать игру.
     *
     * @param {object} params объект с параметрами, полученными от сервера
     */
    onGameStarted( params ) {
        let game = Game.instance();
        game.serverData = params;
        game.updateGameData( params );
        if ( game.imagesLoaded && game.soundsLoaded ) {
            game.create();
        }
    }

    /**
     * Обработка ошибки на запрос начала игры.
     *
     * @param {object} params параметры ошибки:
     * 'errorType' тип ошибки (сетевая или серверная)
     * 'error' числовой код ошибки
     * 'errorText' строка описания ошибки
     */
    onGameStartError( params ) {

        let game = Game.instance();

        // Показать диалог с сообщением об ошибке и потом повторить запрос на  начало игры

        game.showError({
            error: params,
            message: 'Can not start game due\nnetwork error.',
            buttons: ['Repeat'],
            callback: game.sendGameStartRequest,
            callOnClose: true
        });
    }

    /**
     * Перезапустить игру.
     */
    restart() {
        Network.setFrameUID( this.frameUID );
        Network.sendRequest( 'game/run', { gameId: Game.gameId }, this.onRunGame, this.onRunGameError );
    }

    onRunGame( params ) {
        let game = Game.instance();
        game.lastSpinId = 0;
        game.serverData = params;
        game.updateGameData( params );
        game.showMsgAbove( 'GAME OVER, PLACE YOUR BET' );
        game.showBalance();
        game.setState( Game.State.WAIT_ROTATE );
        if ( params.restore ) {
            game.restoreState( params.restore );
        }
    }

    onRunGameError( params ) {
        let game = Game.instance();
        game.showError({
            error: params,
            message: 'Can not restart game due\nnetwork error.',
            buttons: ['Repeat'],
            callback: game.restart,
            callOnClose: true
        });
    }

    /**
     * Восстановить состояние игры.
     *
     * @param {object} params параметры, полученные отсервера
     */
    restoreState( params ) {
        this.serverData = params;
        Log.out( 'Restore state: ' + JSON.stringify( params ) );

        this.lastSpinId = params.spinId;
        this.selectedBet = params.bet;
        this.selectedLines = params.lines;
        this.updateTotalBet();
        this.lineBox.selectLines( this.selectedLines );

        this.reelBox.setStoppedSymbols( params.setSymbols );
        if ( params.action == 'spin' ) {
            this.spinWinAmount = 0;

            let bonusGame = params.bonusGame;
            this.isBonusProcess = false;
            if ( bonusGame ) {
                if ( bonusGame.lastFreeSpin > 0 ) {
                    this.lastFreeSpin = bonusGame.lastFreeSpin;
                    this.freeSpinCount = params.bonusTotalFreeSpin;
                    if ( bonusGame.winFreeSpin == 0 ) { // продолжение бонус-игры
                        this.isBonusProcess = true;
                    }
                    else {                              // выпала бонус-игра
                        if ( bonusGame.winFreeSpin == params.bonusTotalFreeSpin ) {
                            this.freeSpinNum = 0;
                        }
                        else {                          // бонус в бонусе
                            this.isBonusProcess = true;
                        }
                    }
                }
                if ( bonusGame.lastFreeSpin == 0 && bonusGame.winFreeSpin == 0 ) {  // последний спин бонус-игры
                    this.isBonusProcess = true;
                    this.freeSpinCount = params.bonusTotalFreeSpin;
                    this.lastFreeSpin = 1;
                }
            }
            if ( this.isBonusProcess ) {
                this.specSymbol = bonusGame.bonusSymbol;
                this.freeSpinNum = this.freeSpinCount - this.lastFreeSpin + 1;

                // Из общей суммы выигрыша в бонус-игру вычесть выигрыш по линиям
                // и по линиям с символов расширения, т.к. эти суммы буду добавлены
                // припоказе линий
                this.totalWinAmount = params.bonusWin - params.linesWin;
                let keys = Object.keys( bonusGame.setWonLines );
                for ( let i = 0; i < keys.length; ++i ) {
                    let key = keys[ i ];
                    this.totalWinAmount -= bonusGame.setWonLines[ key ][ 1 ];
                }

                // Переключиться в бонус-режим
                this.background.setBonusMode( true );
                this.reelBox.setBonusMode( true );
                this.reelBox.setSymbols( params.setSymbols );
                this.reelBox.setStoppedSymbols( params.setSymbols );
                this.playLoop( 'banner' );
                this.setState( Game.State.BONUS_ROTATE );
            }
            else {
                this.totalWinAmount = 0;
                this.setState( Game.State.ROTATE );
            }
            this.onRotationStopped();
        }
        else if ( params.action == 'dealerCard' ) {
            this.riskStepPlayed = params.riskStep;
            this.totalWinAmount = params.riskWin;
            this.allCardsClosed = true;
            this.setState( Game.State.RISK_GAME );
            this.riskBox.open( params.riskStep + 1 );
            let restoreDealerCard = () => {
                this.riskBox.setClickedCard( false );
                this.onGetDealerCard( params );
            };
            if ( this.isRiskImagesDownloaded ) {
                restoreDealerCard();
            }
            else {
                this.afterRiskImagesDownloaded = restoreDealerCard;
            }
        }
        else if ( params.action == 'userCard' ) {
            this.riskStepPlayed = params.riskStep - 1;
            this.totalWinAmount = params.riskWin;
            this.allCardsClosed = true;
            this.setState( Game.State.RISK_GAME );
            this.riskBox.open( params.riskStep );
            let restoreUserCard = () => {
                this.onGetDealerCard( params );
                this.riskBox.setClickedCard( params.userCardIndex );
                this.onGetUserCards( params );
            };
            if ( this.isRiskImagesDownloaded ) {
                restoreUserCard();
            }
            else {
                this.afterRiskImagesDownloaded = restoreUserCard;
            }
        }
    }

    //==========================================================================

    /**
     * Создать все игровые элементы.
     *
     * Должен вызываться после загрузки всех картинок и получения нормального
     * ответа от сервера о начале игры.
     *
     * Пример данных сервера на запрос начала игры:
     * {
     *  "jpAllowedCnt":2,
     *  "jp1Status":1,"jp1MinBet":1000,"jp1Amount":0,
     *  "jp2Status":1,"jp2MinBet":5000,"jp2Amount":0,
     *  "amountBalance":0,"demoEnabled":1,"demoType":1,"demoMode":1,"demoBalance":1000000,"realBalance":0,
     *  "bets":[100,200,300,400,500,600,700,800,900,1000,1200,1500,1800,2000,2500,3000,3500,4000,4500,5000,6000,7000,8000,9000,10000],
     *  "lines":[1,2,3,4,5,6,7,8,9,10],
     *  "lastBet":1000,
     *  "lastLines":1,
     *  "denomination":[1],
     *  "denominationDefaultIndex":0,
     *  "setSymbols":[[4,8,10],[6,8,7],[8,6,4],[6,9,8],[8,6,7]]
     *  }
     */
    create() {
        let game = Game.instance();

        game.soundPlayer.setMute( Options.soundMuted() );

        let params = game.serverData;

        // NOTE: Порядок создания объектов определяет z-порядок видимости !

        game.background = new Background( game );

        game.controlBox = new ControlBox( game );
        game.controlBox.draw();
        game.controlBox.addListener( 'startBtnClick', game.onStartBtnClick );
        game.controlBox.addListener( 'linesBtnClick', game.onLinesBtnClick );
        game.controlBox.addListener( 'betBtnClick', game.onBetBtnClick );
        game.controlBox.addListener( 'menuBtnClick',  game.onMenuBtnClick );
        game.controlBox.addListener( 'maxBetBtnClick', game.onMaxBetBtnClick );
        game.controlBox.addListener( 'autoPlayBtnClick', game.onAutoPlayBtnClick );
        game.controlBox.addListener( 'helpPrevBtnClick', game.paytablePrevPage );
        game.controlBox.addListener( 'helpCloseBtnClick', game.paytableClose );
        game.controlBox.addListener( 'helpNextBtnClick', game.paytableNextPage );

        game.reelBox = new ReelBox( game, game.reelDef.rotateStep );
        game.reelBox.setSymbols( params.restore ? params.restore.setSymbols : params.setSymbols );
        game.reelBox.addListener( 'rotationStopped', game.onRotationStopped );

        game.lineBox = new LineBox( game );
        game.lineBox.addListener( 'winLineIsShown', game.onWinLineShown );
        game.lineBox.addListener( 'firstWinCycleFinished', game.onFirstWinCycleFinished );
        game.lineBox.addListener( 'extraLinesShowStarted', game.onExtraLinesShowStarted );
        game.lineBox.addListener( 'extraLineIsShown', game.onExtraLineShown );
        game.lineBox.addListener( 'extraLinesShowFinished', game.onExtraLinesShowFinished );

        game.helpBox = new HelpBox( game, game.helpDef );

        game.menuWindow = new MenuWindow( game, game.menuDef );
        game.menuWindow.addListener( 'close', game.menuWindowClose );
        game.menuWindow.addListener( 'showPaytable', ()=>{ game.onShowPaytable() } );
        game.menuWindow.addListener( 'signInOut', ()=>{ game.onSignInOut() } );
        game.menuWindow.addListener( 'makeDeposit', ()=>{ game.onMakeDeposit() } );

        game.linesWindow = new LinesWindow( game, game.linesWinDef );
        game.linesWindow.setAllowedLines( params.lines );
        game.linesWindow.addListener( 'linesChanged', game.onLinesChanged );
        game.linesWindow.addListener( 'close', game.linesWindowClose );

        game.betWindow = new BetWindow( game, game.betWinDef );
        game.betWindow.setAllowedBets( params.bets );
        game.betWindow.addListener( 'betChanged', game.onBetChanged );
        game.betWindow.addListener( 'close', game.betWindowClose );

        game.riskBox = new RiskBox( game, game.riskGameDef );
        game.riskBox.addListener( "userCardClicked", game.onUserCardClicked );
        game.riskBox.addListener( "userCardOpened",  game.onUserCardOpened );
        game.riskBox.addListener( "allCardsOpened",  game.onAllCardsOpened );
        game.riskBox.addListener( "allCardsClosed",  game.onAllCardsClosed );
        game.startRiskImagesDownload();

        game.textBanner = new TextBanner( game, game.bonusDef );

        game.jackpots = [
            new Jackpot1( game, game.jackpotDef ),
            new Jackpot2( game, game.jackpotDef )
        ];

        game.lastSpinId = 0;
        if ( params.lastLines && params.lastBet ) {
            game.selectedLines = params.lastLines;
            game.selectedBet = params.lastBet;
            game.updateTotalBet();
            game.lineBox.selectLines( game.selectedLines );
        }

        game.showMsgAbove( 'GAME OVER, PLACE YOUR BET' );
        game.showBalance();
        game.setState( Game.State.WAIT_ROTATE );

        game.onWindowResized();

        Log.out( 'Create game. Start mode = ' + game.startMode + ', session ID = [' + game.sessionID + ']' );

        if ( game.startMode == 'demo' ) {

            // Если задан лимит времени демо-режима, запускаем таймер останова демо-игры

            if ( game.options.demoLimitTime > 0 ) {
                setTimeout( ()=>{
                    game.stopDemo = true;
                    if ( game.state == Game.State.WAIT_ROTATE || game.state == Game.State.WAIT_USER || game.state == Game.State.HELP ) {
                        game.onStopDemo();
                    }
                }, game.options.demoLimitTime * 1000 );
            }
        }
        else if ( game.sessionID == '' ) {

            // Если был задан реальный режим игры, но не было авторизации, запускаем авторизацию

            game.sendUserLogin();
        }
        else {
            if ( params.restore ) {
              game.restoreState( params.restore );
            }
        }
    }

    /**
     * Обработка останова демо-режима.
     */
    onStopDemo() {
        if ( this.isAutoPlay() ) {
            this.toggleAutoPlay();
        }
        if ( this.isUserLogged() ) {
            let dialog = new Dialog( this, this.dialogDef, 'Demo game is over.', ['Close'],
                () => {
                    dialog.close();
                    this.sendGameClose();
                }
            );
        }
        else {
            this.sendUserLogin();
        }

    }

    //==========================================================================

    /** Флаг вертикальной ориентации окна игры */
    verticalOrientation;

    /**
     * Обработка изменения размеров главного окна игры
     */
    onWindowResized() {
        let game = Game.instance();

        let owner = game.rootItem;
        game.windowWidth = Game._inWindow ? owner.innerWidth : owner.clientWidth;
        game.windowHeight = Game._inWindow ? owner.innerHeight : owner.clientHeight;
        Log.out( 'Window resized to: width = ' + game.windowWidth + ', height = ' + game.windowHeight  );
        game.verticalOrientation = ( game.windowWidth < game.windowHeight );

        game.app.resize();
        game.draw();
    }

    isVertical() {
        return this.verticalOrientation;
    }

    isHorizontal() {
        return ! this.verticalOrientation;
    }

    //==========================================================================

    /**
     * Добавить игровой элемент на сцену игры.
     */
    addChild( obj ) {
        this.children.push( obj );
        this.app.stage.addChild( obj.pixiObj );
    };

    addTiker( func, ctx = null ) {
        this.app.ticker.add( func, ctx );
    }

    removeTiker( func, ctx = null ) {
        this.app.ticker.remove( func, ctx );
    }

    controlItem( name ) {
        return ( this.controlBox ) ? this.controlBox.item( name ) : null;
    }

    //==========================================================================

    /**
     * Получить текущий масштаб.
     *
     * Текущий масштаб определяется главным фонов игры.
     *
     * @returns Возвращает объект с двумя свойствами:
     *  x - масшаб по горизонтали
     *  y - масштаб по вертикали.
     */
    scale() {
        if ( this.background ) {
            return this.background.scale();
        }
        let options = this.isVertical() ? this.images.bkg.vertical : this.images.bkg.horizontal;
        return {
            x: this.windowWidth / options.width,
            y: this.windowHeight / options.height
        };
    }

    pos() {
        if ( this.background ) {
            return this.background.pos();
        }
        return {
            x: 0,
            y: 0
        }
    }

    size() {
        if ( this.background ) {
            return this.background.size();
        }
        return {
            width: this.windowWidth,
            height: this.windowHeight
        };
    }

    //==========================================================================
    // Методы для вывода информации в инфо-бокс
    //==========================================================================

    showJackpotInfo() {
        let infoBox = this.controlItem('infoBox');
        if ( infoBox ) {
            infoBox.showJackpots();
        }
    }

    hideJackpotInfo() {
        let infoBox = this.controlItem('infoBox');
        if ( infoBox ) {
            infoBox.hideJackpots();
        }
    }

    showMsgAbove( msg, highlite = false ) {
        let infoBox = this.controlItem('infoBox');
        if ( infoBox ) {
            infoBox.showAbove( msg, highlite );
        }
    }

    showMsgBelow( msg ) {
        let infoBox = this.controlItem('infoBox');
        if ( infoBox ) {
            infoBox.showBelow( msg );
        }
    }

    //==========================================================================
    // Методы проигрывания звуковых файлов и управления звуком
    //==========================================================================

    startPlay( name, onEndFunc = null, funcParams = null ) {
        this.soundPlayer.startPlay( name, onEndFunc, funcParams );
    }

    playLoop( name ) {
        this.soundPlayer.playLoop( name );
    }

    stopPlay( name ) {
        this.soundPlayer.stopPlay( name );
    }

    setSoundMute( state ) {
        Options.setSoundMuted( state );
        this.soundPlayer.setMute( state );
    }

    isSoundMuted() {
        return this.soundPlayer.isMuted();
    }

    //==========================================================================
    //  Функции управления полноэкранным режимом
    //==========================================================================

    fullScreenState = false;

    setFullscreen( state ) {
        Log.out( 'Fullscreen is ' + ( this.fullScreenState ? 'on' : 'off' ) + ', set to ' + ( state ? 'on' : 'off' ) );
        this.fullScreenState = state;
        if ( state ) {  // перейти в полноэкранный режим

            var element = document.querySelector("html");
            if ( element.requestFullscreen ) element.requestFullscreen();
            else if ( element.webkitrequestFullscreen ) element.webkitRequestFullscreen();
            else if ( element.mozRequestFullscreen ) element.mozRequestFullScreen();
        }
        else {          // выйти из полноэкранного режима

            if ( document.requestFullscreen ) document.requestFullscreen();
            else if ( document.webkitRequestFullscreen ) document.webkitRequestFullscreen();
            else if ( document.mozRequestFullscreen ) document.mozRequestFullScreen();
            else if ( document.cancelFullScreen ) document.cancelFullScreen();
            else if ( document.exitFullscreen ) document.exitFullscreen();
        }
    }

    isFullscreen() {
        return this.fullScreenState;
    }

    //==========================================================================

    /**
     * Обновить параметры игры на основании данных, полученных от сервера.
     */
    updateGameData( params ) {
        if ( params.userId ) {
            this.userId = params.userId;
        }
        this.demoBalance = params.demoBalance;
        this.realBalance = params.amountBalance;
        this.updateDemoMode( params );
        this.updateJackpots( params );
    }

    /**
     * Получить текущий баланс (демо или реальный).
     */
    balance() {
        return this.isDemoActive() ? this.demoBalance : this.realBalance;
    }

    /**
     * Показать баланс в инфобоксе.
     */
    showBalance( append = 0 ) {
        this.showMsgBelow( ( this.isDemoActive() ? 'DEMO BALANCE: ' : 'BALANCE: ' ) + Tools.formatAmount( this.balance() + append ) );
    }

    /**
     * Обновить текущий баланс.
     *
     * Добавляет заданную сумму к текущему игровому балансу.
     *
     * @param {number} amount сумма изменения баланса
     */
    updateBalance( amount ) {
        if ( this.isDemoActive() ) {
            this.demoBalance += amount;
        }
        else {
            this.realBalance += amount;
        }
    }

    //==========================================================================

    /**
     * Проверить активность демо-режима.
     */
    isDemoActive() {
        return this.demoEnabled && this.demoMode;
    }

    /**
     * Получить тип демо-режима.
     *
     * @return {Game.DemoType} возвращает тип демо-режима.
     */
    demoType() {
        return this.demoType;
    }

    updateDemoMode( params ) {
        this.demoEnabled = ( params.demoEnabled > 0 );
        this.demoMode = ( params.demoMode > 0 );
        this.demoType = params.demoType;
    }

    //==========================================================================
    //  Обработка джекпотов
    //==========================================================================

    /**
     * Обновить информацию по джекпотам.
     *
     * @param {object} params данные, полученные от сервера.
     */
    updateJackpots( params ) {

        if ( ! this.jackpots || params.jpAllowedCnt == undefined || params.jp1Status == undefined || params.jp2Status == undefined ) {
            Log.out( "Skip update jackpot's info" );
            return;
        }

        let jp1 = this.jackpots[0];
        jp1.status = params.jp1Status;
        if ( params.jp1Status > 0 ) {
            jp1.minBet = params.jp1MinBet;
            jp1.amount = params.jp1Amount;
        }

        let jp2 = this.jackpots[1];
        jp2.status = params.jp2Status;
        if ( params.jp2Status > 0 ) {
            jp2.minBet = params.jp2MinBet;
            jp2.amount = params.jp2Amount;
        }

        this.jackpotAllowedCount = Game.JACKPOT_ALLOWED_COUNT;
        if ( params.jpAllowedCnt ) {
            var cnt = params.jpAllowedCnt;
            if ( 1 <= cnt && cnt <= 2 ) {
                this.jackpotAllowedCount = cnt;
            }
        }

        let jackpotEnable = [ false, false ];
        if ( this.jackpotAllowedCount == 1 ) {  // разрешен только один джекпот
            let usedJackpotIndex = -1;
            let lastMinBet = 0;
            for ( let i = 0; i < 2; ++i ) {
                let jpStatus = this.jackpots[i].status;
                if ( jpStatus > 0 ) {
                    let jpMinBet = this.jackpots[i].minBet;
                    if ( lastMinBet < jpMinBet && jpMinBet <= this.totalBet  ) {
                        usedJackpotIndex = i;
                        lastMinBet = jpMinBet;
                    }
                }
            }
            if ( usedJackpotIndex >= 0 ) {
                jackpotEnable[ usedJackpotIndex ] = ! this.isDemoActive();
            }
        }
        else {                                  // разрешены оба джекпота
            for ( let i = 0; i < 2; ++i ) {
                if ( this.jackpots[i].status > 0 && this.jackpots[i].minBet <= this.totalBet ) {
                    jackpotEnable[ i ] = ! this.isDemoActive();
                }
            }
        }
        for ( let i = 0; i < 2; ++i ) {
            this.jackpots[i].setEnabled( jackpotEnable[ i ] );
        }
    }

    /**
     * Проверить выигрыш джекпота.
     *
     * Используется текущее значение в serverData.
     */
    isJackpotWin() {
        if ( this.serverData["jackpotWon"] ) {
            let jackpotWin = this.serverData["jackpotWon"];
            if ( jackpotWin['1'] && jackpotWin['1'] > 0 ) { // выигрыш 1-го джекпота
                return true;
            }
            if ( jackpotWin['2'] && jackpotWin['2'] > 0 ) { // выигрыш 2-го джекпота
                return true;
            }
        }
        return false;
    }

    /**
     * Показать выпавший джекпот.
     *
     * После завершения показа вызывается метод onRotationStopped().
     */
    showJackpot() {
        if ( this.serverData["jackpotWon"] ) {
            let jackpotWin = this.serverData["jackpotWon"];
            if ( jackpotWin['1'] && jackpotWin['1'] > 0 ) { // выигрыш 1-го джекпота
                let winAmount = jackpotWin['1'];
                this.serverData["jackpotWon"]['1'] = 0;
                this.jackpots[0].amount = 0;
                this.jackpots[0].show( winAmount, ()=>{ this.onRotationStopped(); } );
                return;
            }
            if ( jackpotWin['2'] && jackpotWin['2'] > 0 ) { // выигрыш 2-го джекпота
                let winAmount = jackpotWin['2'];
                this.serverData["jackpotWon"]['2'] = 0;
                this.jackpots[1].amount = 0;
                this.jackpots[1].show( winAmount, ()=>{ this.onRotationStopped(); } );
                return;
            }
        }
    }

    /**
     * Скрыть показ джекпота.
     */
    hideJackpot() {
        if ( this.jackpots[0].isVisible() ) {
            this.jackpots[0].hide();
        }
        if ( this.jackpots[1].isVisible() ) {
            this.jackpots[1].hide();
        }
    }

    //==========================================================================

    /**
     * Обработка нажатия на кнопку меню.
     */
    onMenuBtnClick() {
        let game = Game.instance();
        game.betWindowClose();
        game.linesWindowClose();
        let visible = game.menuWindow.isVisible();
        game.menuWindow.setVisible( ! visible );
    }

    menuWindowClose() {
        Log.out( 'Close menu window' );
        let game = Game.instance();
        game.menuWindow.setVisible( false );
    }

    //==========================================================================

    /**
     * Обработка пункта меню "Показать таблицу выигрышей".
     */
    onShowPaytable() {
        if ( this.helpBox != null && this.helpBox.isOpened() ) {
            this.paytableClose();
        }
        else {
            this.paytableOpen();
        }
        this.menuWindowClose();
    }

    isPaytableOpened() {
        return ( this.helpBox == null ) ? false : this.helpBox.isOpened();
    }

    paytableOpen() {
        this.helpBox.open();
        this.setState( Game.State.HELP );
    }

    paytablePrevPage() {
        Game.instance().helpBox.prevPage();
    }

    paytableNextPage() {
        Game.instance().helpBox.nextPage();
    }

    paytableClose() {
        let game = Game.instance();
        game.helpBox.close();
        game.setState( Game.State.WAIT_ROTATE );
    }

    //==========================================================================

    /**
     * Обработка нажатия на кнопку выбора числа линий.
     */
    onLinesBtnClick() {
        let game = Game.instance();
        game.betWindowClose();
        game.menuWindowClose();
        let visible = ! game.linesWindow.isVisible();
        game.linesWindow.setVisible( visible );
        if ( visible && game.state == Game.State.WAIT_ROTATE ) {
            game.setState( Game.State.CHANGE_TOTAL_BET );
        }
    }

    /**
     * Закрыть окно выбора числа линий.
     */
    linesWindowClose() {
        let game = Game.instance();
        game.linesWindow.setVisible( false );
        if ( game.state == Game.State.CHANGE_TOTAL_BET ) {
            game.setState( Game.State.WAIT_ROTATE );
        }
    }

    /**
     * Обработка выбора числа линий в окне выбора.
     */
    onLinesChanged( params ) {
        let game = Game.instance();
        game.selectedLines = params.lines;
        game.updateTotalBet();
        if ( game.linesWindow.isVisible() ) {
            game.linesWindowClose();
        }
        game.lineBox.selectLines( game.selectedLines );
        game.lineBox.showLines();
        setTimeout( ()=>{ game.lineBox.hideLines() }, Game.DELAY_HIDE_LINES );
        if ( game.helpBox ) game.helpBox.update();
    }

    //==========================================================================

    /**
     * Обработка нажатия на кнопку выбора ставки на линию.
     *
     * Она же - кнопка начала риск-игры, если был выигрыш по линиям.
     */
    onBetBtnClick() {
        let game = Game.instance();

        if ( game.state == Game.State.WAIT_USER ) {

            // В состоянии ожидания действий игрока, кнопка запускает риск-игру

            game.stopPlay( 'decidegamble' );
            game.startRiskGame();
        }
        else {

            // В обычном состоянии - открываем или закрываем окно выбора ставки

            game.linesWindowClose();
            game.menuWindowClose();
            let visible = ! game.betWindow.isVisible();
            game.betWindow.setVisible( visible );
            if ( visible && game.state == Game.State.WAIT_ROTATE ) {
                game.setState( Game.State.CHANGE_TOTAL_BET );
            }
        }
    }

    /**
     * Закрыть окно выбора числа линий.
     */
    betWindowClose() {
        let game = Game.instance();
        game.betWindow.setVisible( false );
        if ( game.state == Game.State.CHANGE_TOTAL_BET ) {
            game.setState( Game.State.WAIT_ROTATE );
        }
    }

    /**
     * Обработка выбора ставки на линию в окне выбора.
     */
    onBetChanged( params ) {
        let game = Game.instance();
        game.selectedBet = params.bet;
        game.updateTotalBet();
        if ( game.betWindow.isVisible() ) {
            game.betWindowClose();
        }
        if ( game.helpBox ) game.helpBox.update();
    }

    /**
     * Обновить полную ставку.
     */
    updateTotalBet() {
        this.totalBet = this.selectedLines * this.selectedBet;
        this.controlItem( 'lines' ).draw();
        this.controlItem( 'totalBet' ).draw();
        if ( this.totalBet > this.balance() ) {
            this.controlItem('autoPlay').setEnabled( false );
        }
        this.updateJackpots( this.serverData );
    }

    //==========================================================================

    /**
     * Обработка нажатия на кнопку "MaxBet".
     */
    onMaxBetBtnClick() {
        Game.instance().setMaxBet();
    }

    /**
     * Установка максимально возможной ставки.
     */
    setMaxBet() {

        this.startPlay( "changemaxbet" );

        let bets = this.betWindow.allowedBets();
        let betCount = bets.length;

        let lines = this.linesWindow.allowedLines();
        let linesCount = lines.length;

        let lastBet = 0;
        let lastLines = 0;
        let lastAmount = 0;

        for ( let i = linesCount - 1; i >= 0; --i ) {

            for ( let j = betCount - 1; j >= 0; --j ) {

                let amount = lines[i] * bets[j];
                if ( amount <= this.balance() && amount > lastAmount ) {
                    lastAmount = amount;
                    lastLines = lines[ i ];
                    lastBet = bets[ j ];
                }
            }
        }

        if ( lastAmount <= this.balance() ) {
            if ( lastBet == 0 || lastLines == 0 ) {
                lastLines = lines[0];
                lastBet = bets[0];
            }
            this.onBetChanged( { bet: lastBet } );
            this.onLinesChanged( { lines: lastLines } );
        }
    }

    //==========================================================================

    /**
     * Обработка нажатия на кнопку "AutoPlay".
     */
    onAutoPlayBtnClick() {
        Game.instance().toggleAutoPlay();
    }

    toggleAutoPlay() {
        let btn = this.controlBox.item( 'autoPlay' );
        let newState = ! btn.isActive();
        Log.out( 'Toggle autoplay to ' + newState );
        btn.setActive( newState );
        this.startPlay( newState ? 'autoplaystart' : 'autoplaystop' );
        if ( newState ) {   // включен авто-режим

            if ( this.state == Game.State.WAIT_ROTATE ) {               // ожидание вращения в обычной игре
                this.menuWindowClose();
                this.startRotate();
            }
            else if ( this.state == Game.State.HELP ) {                 // показ помощи по игре
                this.linesWindowClose();
                this.betWindowClose();
                this.paytableClose();
                this.menuWindowClose();
                this.startRotate();
            }
            else if ( this.state == Game.State.WAIT_BONUS_ROTATE ) {    // ожидание вращения при начале бонус-игры
                this.startBonusRotate();
            }
            else if ( this.state == Game.State.WAIT_USER ) {            // ожидание выбора игроком - рискнуть или забрать
                this.stopPlay( 'decidegamble' );
                this.startTakeWin();
            }
            else if ( this.state == Game.State.BONUS_FINISH ) {         // показ завершающего баннера бонус-игры
                this.setBonusGameUI( false );
            }
        }
    }

    isAutoPlay() {
        return this.controlBox.item( 'autoPlay' ).isActive();
    }

    //==========================================================================

    /**
     * Обработка клика по кнопке "Start".
     */
    onStartBtnClick() {
        let game = Game.instance();

        if ( game.nextLineTimer != 0 ) {
            clearTimeout( game.nextLineTimer );
            game.nextLineTimer = 0;
        }

        if ( game.state == Game.State.WAIT_ROTATE ) {           // при ожидании вращения

            game.menuWindowClose();

            // Запускаем вращение барабанов, если полная ставка не превышает баланс

            if ( game.totalBet <= game.balance() ) {
                game.startRotate();
            }
            else {

                // Если игрок авторизован, открываем окно пополнения баланса

                if ( game.userId > 0 ) {
                    game.sendOpenDeposit();
                }
            }
        }
        else if ( game.state == Game.State.HELP ) {             // при показе страниц помощи

            // Закрываем все окна и запускаем вращение барабанов
            game.linesWindowClose();
            game.betWindowClose();
            game.paytableClose();
            game.menuWindowClose();
            game.startRotate();
        }
        else if ( game.state == Game.State.WAIT_USER ) {        // при ожидании действий пользователя

            // Выключаем звук выбора и запускаем собирание выигрыша
            game.stopPlay( 'decidegamble' );
            game.startTakeWin();
        }
        else if ( game.state == Game.State.RISK_GAME ) {        // в риск-игре

            // Закрываем блок риск-игры и забираем выигрыш, полученный
            // на предыдущих шагах
            game.riskBox.close();
            game.startTakeWin();
        }
        else if ( game.state == Game.State.SHOW_WIN_LINES ) {   // при показе выигрышных линий

            // Остановить звук выигрышной линии и показ выигрышных линий

            if ( game.currentWinLineSound ) {
                game.stopPlay( game.currentWinLineSound );
            }
            game.lineBox.stopShowWinLines();

            // Подсчитать и показать выигрыш по спину

            game.calculateSpinAmount();

            // Пойти дальше в зависимости от текущего состояния

            if ( game.isBonusProcess ) {        // в процессе бонус-игры

                if ( game.isBonusStarted() ) {      // выпал бонус в бонусе

                    // Показать баннер дополнительных бесплатных спинов в бонус-игре
                    // и потом перейти к следующему раунду бонус-игры

                    game.showFreeSpinBanner( game.bonusNextRound );
                }
                else {

                    // Переходим к следующему раунду бонус-игры

                    game.bonusNextRound();
                }
            }
            else if ( game.isBonusStarted() ) { // в обычной игре выпала бонус-игра

                // Начинаем бонус-игру
                game.totalWinAmount = game.spinWinAmount;
                Log.info( 'Set total win to ' + game.totalWinAmount );
                game.startBonus();
            }
            else if ( game.isAutoPlay() ) {     // авто-режим в обычной слот-игре

                // Забираем выигрыш
                game.totalWinAmount = game.spinWinAmount;
                Log.out( 'Set total win to ' + game.totalWinAmount );
                game.startTakeWin();
            }
            else {                              // обычная слот-игра

                // Переходим в режим ожидания решения игрока
                game.totalWinAmount = game.spinWinAmount;
                Log.info( 'Set total win to ' + game.totalWinAmount );
                game.waitUserDecision();

                // Начать повторный показ выигрышных линий
                game.lineBox.continueShowWinLines();
            }
        }
        else if ( game.state == Game.State.SHOW_EXTRA_LINES ) { // при показе выигрышных линий по символу расширения

            // Остановить показ линий

            game.stopPlay( game.currentWinLineSound );
            game.lineBox.stopShowExtraLines();
            game.reelBox.setEnabled( true );

            // Подсчитать полный выигрыш по спину

            game.calculateSpinAmount();

            // Перейти к следущему раунду бонус-игры
            game.bonusNextRound();
        }
        else if ( game.state == Game.State.WAIT_BONUS_ROTATE ) {    // при показе начального баннера бонус-игры

            // Прячем баннер и запускаем вращение барабанов
            game.startBonusRotate();
        }
        else if ( game.state == Game.State.BONUS_FINISH ) {         // при показе завершающего баннера бонус-игры

            // Выключаем бонус-режим
            game.stopPlay( "origin/feature_end_long" );
            game.setBonusGameUI( false );
        }
        else if ( game.state == Game.State.SHOW_JACKPOT ) {         // при показе выигрыша джекпота

            // Скрываем показ джекпота
            game.hideJackpot();
        }
    }

    //==========================================================================

    /**
     * Общая сумма выигрыша.
     *
     * Включает сумму выигрыша по текущему спину и по всем спинами бонус-игры.
     */
    totalWinAmount;

    /** Сумма выигрыша по текущему спину */
    spinWinAmount;

    /** Таймер показа следующей выигрышной линии */
    nextLineTimer = 0;

    /**
     * Начать слот-игру.
     */
    startSlot() {

        Log.out( '--------- Start slot ---------' );

        this.lineBox.stopShowWinLines();

        // Проверяем останов демо-режима

        if ( this.stopDemo ) {
            this.onStopDemo();
            return;
        }

        if ( this.isBonusProcess ) {

            // В бонус-игре автоматически запускаем вращение барабанов

            this.startRotate();
            return;
        }

        // В обычной слот-игре

        if ( this.savedTotalWinAmount > 0 ) {
            Log.out( 'Winner paid ' + this.savedTotalWinAmount );
            this.showMsgAbove( 'WINNER PAID ' + Tools.formatAmount( this.savedTotalWinAmount ), true );
        }
        else {
            Log.out( 'Game over' );
            this.showMsgAbove( 'GAME OVER, PLACE YOUR BET' );
        }
        this.showBalance();

        if ( this.isAutoPlay() ) {
            if ( this.totalBet <= this.balance() ) {
                setTimeout( ()=>{ this.startRotate() }, Game.DELAY_BONUS_SPIN );
            }
            else {
                this.setMaxBet();
                if ( this.totalBet <= this.balance() ) {
                    setTimeout( ()=>{ this.startRotate() }, Game.DELAY_BONUS_SPIN );
                }
                else {
                    this.toggleAutoPlay();
                    this.setState( Game.State.WAIT_ROTATE );
                    if ( this.userId > 0 ) {
                        Game.sendOpenDeposit();
                    }
                }
            }
        }
        else {
            this.setState( Game.State.WAIT_ROTATE );
        }
    }

    /**
     * Запустить вращение барабанов.
     */
    startRotate() {

        let game = Game.instance();

        game.setState( this.isBonusProcess ? Game.State.BONUS_ROTATE : Game.State.ROTATE );
        game.lineBox.stopShowWinLines();
        game.reelBox.startRotate();

        // Очистить сумму выигрыша по текущему спину
        game.spinWinAmount = 0;
        game.savedTotalWinAmount = 0;

        if ( game.isBonusProcess ) {    // в бонус-игре

            // Показать номер текущей бесплатной игры

            game.freeSpinNum = game.freeSpinCount - game.lastFreeSpin + 1;
            game.showMsgAbove( "FEATURE WIN: " + Tools.formatAmount( game.totalWinAmount ) + "\nFREE GAME " + game.freeSpinNum + " OF " + game.freeSpinCount, true );
        }
        else {                          // в обычной игре

            // Очистить общую сумму выигрыша
            game.totalWinAmount = 0;

            // Запустить музыку вращения барабанов
            game.playLoop( 'reelrun' );

            // Показать информацию о джекпотах
            game.showJackpotInfo();
        }

        // Отправить запрос на сервер

        game.sendSpinRequest();
    }

    /**
     * Отправить запрос на спин.
     */
    sendSpinRequest() {
        this.serverData = null;
        let params = {
            'gameId':       Game.gameId,
            'spinId':       this.lastSpinId,
            'bet':          this.selectedBet,
            'lines':        this.selectedLines,
            'denomination': 1
        };
        Network.setFrameUID( this.frameUID );
        Network.sendRequest( 'game/spin', params, this.onSpinData, this.onSpinError );
    }

    /**
     * Обработка данных, полученных от сервера на запрос спина.
     *
     * @param {object} params
     *
     * Пример:
     *  {
     *      "jpAllowedCnt":2,"jp1Status":1,"jp2Status":1,"jp1MinBet":1000,"jp1Amount":0,"jp2MinBet":5000,"jp2Amount":0,
     *      "amountBalance":992000,
     *      "demoEnabled":1,"demoType":1,"demoMode":1,"demoBalance":992000,"realBalance":0,
     *      "spinId":1,
     *      "setSymbols":[[4,8,7],[5,10,7],[7,3,9],[6,3,9],[10,9,5]],
     *      "setWonLines":{"2":[2,5000]},
     *      "jackpotWon":null,
     *      "bonusGame":[],
     *      "riskGame":[{"dealer":13,"pick":2,"cards":[11,3,9]}]
     *  }
     */
    onSpinData( params ) {
        let game = Game.instance();

        game.serverData = params;   // сохранить данные, полученные от сервера

        game.updateGameData( params );
        game.lastSpinId = params.spinId;

        if ( game.isBonusProcess ) {   // в бонус-игре
            if ( game.isBonusStarted() ) {     // выпал бонус в бонусе
                game.freeSpinCount += params["bonusGame"]["winFreeSpin"];
            }
            game.lastFreeSpin = params["bonusGame"]["lastFreeSpin"];
        }
        else {                          // в обычной слот-игре
            if ( game.isBonusStarted() ) {     // выпала бонус-игра
                game.freeSpinCount = params["bonusGame"]["winFreeSpin"];
                game.lastFreeSpin = params["bonusGame"]["lastFreeSpin"];
                game.freeSpinNum = 0;
            }
        }
        game.reelBox.stopRotate( params.setSymbols );
    }

    /**
     * Обработка ошибки запроса спина.
     *
     * @param {object} params параметры ошибки:
     * 'errorType' тип ошибки (сетевая или серверная)
     * 'error' числовой код ошибки
     * 'errorText' строка описания ошибки
     */
    onSpinError( params ) {
        let game = Game.instance();
        game.reelBox.stopRotate();

        // Остановить барабаны так, чтобы не было выигрышных комбинаций

        game.reelBox.stopRotate( [
            [4,2,3],
            [6,9,4],
            [1,4,6],
            [4,7,6],
            [8,6,2]
        ]);

        game.showError({
            error: params,
            message: 'The network error has occurred.\nYou can repeat the spin reels.',
            buttons: ['Repeat'],
            callback: game.startRotate,
            callOnClose: game.isBonusProcess
        });
    }

    /**
     * Обработчик события полного останова барабанов.
     */
    onRotationStopped() {

        let game = Game.instance();
        if ( ! game.isBonusProcess ) {      // в обычной игре
            game.stopPlay( 'reelrun' );
            game.hideJackpotInfo();
            game.showMsgAbove( 'PLACE YOUR BET' );
            game.showBalance();
        }

        if ( game.serverData ) {    // есть данные от сервера

            // Если есть выигрыш джекпота - запустить показ джекпота,
            // после которого повторно вызвать onRotationStopped()

            if ( game.isJackpotWin() ) {
                game.setState( Game.State.SHOW_JACKPOT );
                game.showJackpot();
                return;
            }

            if ( ! game.isBonusProcess ) {  // в процессе обычной игры

                // Проверить наличие выигрышных линий

                let winLines = game.serverData.setWonLines;
                if ( Object.keys( winLines ).length > 0 ) { // если есть выигрышные линии

                    // Запустить показ выигрышных линий

                    game.setState( Game.State.SHOW_WIN_LINES );
                    game.lineBox.startShowWinLines( winLines );
                }
                else {

                    // Перейти к следующему раунду игры

                    game.startSlot();
                }
            }
            else {                          // в процессе бонус-игры

                // Начать анимацию спина в бонус-игре

                game.beginBonusSpinAnimation();
            }
        }
        else {                      // ситуация возможна при ошибке!

            // Ничего не делаем, кроме отключения авто-режима в обычной игре,
            // т.к. должен быть диалог об ошибке
            if ( ! game.isBonusProcess && game.isAutoPlay() ) {
                game.toggleAutoPlay();
            }
        }
    }

    /**
     * Обработка показа выигрышной линии.
     *
     * @param {object} params параметры вызова:
     * 'line' - номер выигрышной линии в символьном виде
     * 'win' - массив из двух элементов:
     *      0 - число выигрышных символов в линии
     *      1 - сумма выигрыша по линии
     */

    currentWinLineSound;

    onWinLineShown( params ) {

        let game = Game.instance();

        let lineNum = params.line;
        let winSymCount = params.win[0];
        let winAmount = params.win[1];

        // Подсчитать и показать выигрыш по линии и общий выигрыш

        game.spinWinAmount += winAmount;
        game.showMsgAbove( Tools.formatAmount( game.spinWinAmount ) + " WIN", true );

        // Если показ линий уже остановлен - выйти без звука

        if ( game.lineBox.lineShowStopped ) {
            return;
        }

        // Начать проигрывание мелодии. По завершении мелодии
        // переход к следующей линии

        let lineBox = game.lineBox;
        if ( lineNum === "101" ) {  // выпали скаттер-символы начала бонус игры
            game.currentWinLineSound = '';
            this.nextLineTimer = setTimeout( lineBox.onNextLine, LineBox.NEXT_LINE_INTERVAL, { self: lineBox } );
            return;
        }

        if ( lineNum === "100" ) {  // выпали обычные скаттер-символы (компас)
            game.currentWinLineSound = ( winSymCount < 5 ) ? "origin/win_compass2" : "origin/win_compass";
            game.startPlay( game.currentWinLineSound, lineBox.onNextLine, { self: lineBox } );
            return;
        }

        // Найти основной символ выигрышной линии

        let soundFile;
        let pirate = 0;
        let finalSymbols = game.serverData.setSymbols;      // символы останова
        let winLine = game.lines[ lineNum ].form;           // форма выигрышной линии
        for ( let i = 0; i < winSymCount; ++i ) {

            var symbolPos = winLine[i];
            var sId = finalSymbols[i][symbolPos];    // номер (ID) символа

            if ( (sId === 6 || sId === 7) && winSymCount >= 4 ) {  // символы "K" и "Q"
                soundFile = "origin/win_kq";
                break;
            }
            if ( (8 <= sId  && sId <= 10) && winSymCount >= 4 ) {    // символы "9", "10", "J"
                soundFile = "origin/win_jt9";
                break;
            }
            if ( sId === 4 ) {                // символ "сундук"
                soundFile = ( winSymCount <= 4 ) ? "origin/win_chest2" : "origin/win_chest";
                break;
            }
            if ( sId === 2 ) {                // символ "попугай"
                soundFile = ( winSymCount <= 4 ) ? "origin/win_parrot2" : "origin/win_parrot";
                break;
            }
            if ( sId === 5 ) {                // символ "сабли"
                soundFile = ( winSymCount <= 4 ) ? "origin/win_sword2" : "origin/win_sword";
                break;
            }
            if ( sId === 1 ) {               // символ "пират"
                ++pirate;
            }
        }

        if ( ! soundFile ) {
            if ( pirate >= 3 ) {
                soundFile = "origin/win_pirate";
            }
            else {
                let lineBet = game.selectedBet;
                if ( winAmount < lineBet * 5 ) {
                    soundFile = "win2";
                }
                else if ( winAmount < lineBet * 10 ) {
                    soundFile = "win5";
                }
                else if ( winAmount < lineBet * 20 ) {
                    soundFile = "win10";
                }
                else if ( winAmount <= lineBet * 25 ) {
                    soundFile = "win20";
                }
                else {
                    soundFile = "win25";
                }
            }
        }

        if ( soundFile ) {
            // Проиграть звук комбинации символов
            game.currentWinLineSound = soundFile;
            game.startPlay( soundFile, lineBox.onNextLine, { self: lineBox } );
        }
        else {
            // Если не задан звук - просто пауза
            Log.warn( 'Skip win line sound' );
            game.currentWinLineSound = '';
            this.nextLineTimer = setTimeout( lineBox.onNextLine, LineBox.NEXT_LINE_INTERVAL, { self: lineBox } );
        }
    }

    /**
     * Обработка завершения первого цикла показа выигрышных линий.
     */
    onFirstWinCycleFinished() {
        Log.out( 'First win cycle finished' );
        let game = Game.instance();

        // Остановить показ выигрышных линий
        game.lineBox.stopShowWinLines();

        if ( game.isBonusProcess ) {        // в процессе бонус-игры

            // Остановить показ обычных выигрышных линий
            game.lineBox.stopShowWinLines();

            if ( game.isBonusStarted() ) {                 // выпал бонус в бонусе

                // Показать баннер дополнительных бесплатных спинов в бонус-игре
                // и потом перейти к следующему раунду бонус-игры

                game.showFreeSpinBanner( ()=>{ game.bonusNextRound() } );
            }
            else {

                // Перейти к следующему раунду бонус-игры

                game.bonusNextRound();
            }
        }
        else if ( game.isBonusStarted() ) {    // в обычной игре выпала бонус-игра

            // Начать бонус-игру
            game.totalWinAmount += game.spinWinAmount;
            Log.info( 'Set total win to ' + game.totalWinAmount );
            game.startBonus();
        }
        else if ( game.isAutoPlay() ) {     // обычная игра в авто-режиме

            // Запустить собирание выигрыша
            game.totalWinAmount = game.spinWinAmount;
            Log.info( 'Set total win to ' + game.totalWinAmount );
            game.startTakeWin();
        }
        else {                              // обычная игра без авто-режима

            // Перейти в состояние ожидания решения игрока
            game.totalWinAmount = game.spinWinAmount;
            Log.info( 'Set total win to ' + game.totalWinAmount );
            game.waitUserDecision();

            // Продолжить показ выигрышных линий
            game.lineBox.continueShowWinLines();
        }
    }

    /**
     * Ждать решения игрока.
     */
    waitUserDecision() {

        // Перейти в режим ожидания выбора игрока
        this.setState( Game.State.WAIT_USER );
        this.showMsgAbove( Tools.formatAmount( this.totalWinAmount ) + " SATOSHI WIN\nGamble or Take win", true );

        // Включаем мелодию "принятия решения"
        this.playLoop( 'decidegamble' );
    }

    /**
     * Подсчитать полный выигрыш по текущему спину.
     */
    calculateSpinAmount() {
        this.spinWinAmount = 0;
        let wonLines = this.serverData.setWonLines;
        let lines = Object.keys( wonLines );
        for ( let i = 0; i < lines.length; ++i ) {
            this.spinWinAmount += wonLines[ lines[i] ][ 1 ];
        }
        if ( this.isBonusProcess ) {    // в процессе бонус-игры

            // Добавить выигрыш по линиям с символом расширения, если они есть

            let bonusGame = this.serverData.bonusGame;
            if ( bonusGame && bonusGame.setBonusReel && bonusGame.setBonusReel.length > 0 ) {  // есть линии по символу расширения

                wonLines = bonusGame.setWonLines;
                let lines = Object.keys( wonLines );
                for ( let i = 0; i < lines.length; ++i ) {
                    this.spinWinAmount += wonLines[ lines[i] ][ 1 ];
                }
            }
        }

        // Показать последний и общий выигрыш
        this.showMsgAbove( Tools.formatAmount( this.spinWinAmount ) + " WIN", true );
//        this.showMsgBelow( "GAMBLE AMOUNT " + Tools.formatAmount( this.totalWinAmount + this.spinWinAmount ) );
    }

    //==========================================================================
    //  Собирание и зачисление выигрыша
    //==========================================================================

    /** Сумма списания выигрыша за один тик таймера */
    takeWinAmount;

    /** Сохраненная общая сумма выигрыша */
    savedTotalWinAmount;

    /** Идентификатор таймера собирания выигрыша */
    takeWinTimer;

    /**
     * Начать процесс собирания общего выигрыша.
     */
    startTakeWin() {

        let game = Game.instance();

        Log.out( 'Start take win ' + game.totalWinAmount );

        game.takeWinAmount = Math.ceil( game.totalWinAmount / (1000 / Game.TAKE_WIN_INTERVAL) );
        if ( game.takeWinAmount == 0 ) {
            game.startSlot();
            return;
        }

        game.lineBox.stopShowWinLines();
        game.setState( Game.State.TAKE_WIN );

        game.showMsgBelow( "GAMBLE AMOUNT " + Tools.formatAmount( game.totalWinAmount ) );
        game.showBalance();

        // Сохранить сумму выигрыша на случай восстановления
        game.savedTotalWinAmount = game.totalWinAmount;

        // Включаем звук
        game.startPlay( 'creditincrease' );

        // Забрать кусочек выигрыша
        game.takeWinPiece();

        // Отправляем запрос на сервер о зачислении выигрыша
        game.serverData = null;
        let params = {
            "gameId":       Game.gameId,                // идентификатор игры
            "spinId":       game.lastSpinId,            // идентификатор спина
            "totalWin":     game.savedTotalWinAmount,   // общая сумма выигрыша
            "riskGameStep": game.riskStepPlayed         // число сыгранных шагов риск-игры
        };
        Network.setFrameUID( game.frameUID );
        Network.sendRequest( "game/set_win", params, game.onSetWinData, game.onSetWinError );
    }

    /**
     * Забрать кусочек выигрыша.
     */
    takeWinPiece() {
        let game = Game.instance();
        if ( game.totalWinAmount > game.takeWinAmount ) {
            game.totalWinAmount -= game.takeWinAmount;
        }
        else {
            game.totalWinAmount = 0;
        }
        Log.out( 'Take win ' + game.totalWinAmount );
        if ( game.totalWinAmount == 0 ) {    // весь выигрыш перетек
            game.stopPlay( 'creditincrease' );
            if ( game.serverData != null ) {     // и запрос на зачисление завершился успешно
                game.startPlay("wincountstop");
                game.updateBalance( game.savedTotalWinAmount );
                game.startSlot();
                return;
            }
        }
        game.showMsgAbove( "GAMBLE AMOUNT " + Tools.formatAmount( game.totalWinAmount ) );
        game.showBalance( game.savedTotalWinAmount - game.totalWinAmount );
        if ( game.totalWinAmount > 0 ) {
            game.takeWinTimer = setTimeout( game.takeWinPiece, Game.TAKE_WIN_INTERVAL );
        }
    }

    /**
     * Обработка успешного зачисления выигрыша.
     *
     * @param {object} data данные, полученные от сервера
     */
    onSetWinData( data ) {
        Log.out( 'Enroll win successfully' );
        let game = Game.instance();
        game.serverData = data;
        if ( game.totalWinAmount == 0 ) {    // весь выигрыш перетек
            game.stopPlay( 'creditincrease' );
            game.updateBalance( game.savedTotalWinAmount );
            game.startSlot();
        }
    }

    /**
     * Обработка ошибки зачисления выигрыша.
     *
     * @param {object} params параметры ошибки:
     * 'errorType' тип ошибки (сетевая или серверная)
     * 'error' числовой код ошибки
     * 'errorText' строка описания ошибки
     */
    onSetWinError( params ) {

        // Остановить перетекание выигрыша

        let game = Game.instance();
        clearTimeout( game.takeWinTimer );
        game.stopPlay( 'creditincrease' );

        // Восстановить состояние перед перетеканием выигрыша

        game.totalWinAmount = game.savedTotalWinAmount;
        game.showMsgBelow( "GAMBLE AMOUNT " + Tools.formatAmount( game.totalWinAmount ) );
        game.showBalance();
        Log.out( 'Restore total win ' + game.totalWinAmount );

        // Показать диалог об ошибке, и потом повторить зачисление выигрыша

        game.showError({
            error: params,
            message: 'The network error has occurred.\nYou can repeat the crediting\nof the winnings.',
            buttons: ['Repeat'],
            callback: game.startTakeWin,
            callOnClose: false
        });
    }

    //==========================================================================
    //  Риск-игра
    //==========================================================================

    /** Флаг загрузки изображений риск-игры */
    isRiskImageDownloaded;

    /** Функция, вызываемая после завершения загрузки картинок риск-игры */
    afterRiskImagesDownloaded;

    /** Параметры текущего шага риск-игры, полученные от сервера при запросах спина и шагов риск-игры */
    riskGameData;

    /** Число сыгранных шагов риск-игры */
    riskStepPlayed = 0;

    /** Флаг закрытия всех карт */
    allCardsClosed;

    /**
     *  Предзагрузка изображений для риск-игры
     */
    startRiskImagesDownload() {

        // Формируем массив для загрузки

        this.afterRiskImagesDownloaded = null;
        this.isRiskImageDownloaded = false;
        let loadedUrls = [];
        loadedUrls.push( this.riskGameDef.bkgImage.urls[0] );
        loadedUrls.push( this.riskGameDef.dealerButton.urls[0] );
        loadedUrls.push( this.riskGameDef.pickButton.urls[0] );
        loadedUrls.push( this.riskGameDef.cards.openSprite );
        loadedUrls.push( this.riskGameDef.cards.closeSprite );
        let cardPath = this.riskGameDef.cards.path;
        loadedUrls.push( cardPath + '1_clubs.png' );
        const suits = [ "clubs", "diamonds", "hearts", "spades" ];
        for ( let s = 0; s < 4; ++s ) {
            const suit = suits[ s ];
            for ( let c = 2; c <= 14; ++c ) {
                loadedUrls.push( cardPath + c + '_' + suit + '.png' );
            }
        }

        // Начинаем загрузку

        Log.out( 'Start download the risk game images' );
        PIXI.Assets.load( loadedUrls ).then( ()=>{

            // Загрузка завершена

            Log.out( 'The risk game images is downloaded' );
            this.isRiskImageDownloaded = true;
            if ( this.afterRiskImagesDownloaded ) {
                this.afterRiskImagesDownloaded();
            }
        });
    }

    /**
     * Начать риск-игру.
     */
    startRiskGame() {
        if ( ! this.riskBox.isOpened() ) {

            this.setState( Game.State.RISK_GAME );
            this.lineBox.stopShowWinLines();
            this.serverReplyReceived = false;

            // Сохранить описание риск-игры, полученное от сервера.
            // При старте риск-игры, объект содержит один параметр
            // 'dealer' - номер карты дилера.

            this.riskGameData = Tools.clone( this.serverData.riskGame );
            this.riskStepPlayed = 0;
            Log.out( 'Start risk game. Step ' + this.riskStepPlayed );

            // Открыть окно игры и отправить запрос на карту дилера

            this.riskBox.open();
            this.allCardsClosed = true;
            this.sendDealerCardRequest();
        }
    }

    /**
     * Отправить запрос на получение карты дилера.
     */
    sendDealerCardRequest() {
        let params = {
            "gameId":    Game.gameId,          // идентификатор игры
            "spinId":    this.lastSpinId,      // идентификатор спина
            "prevSteps": this.riskStepPlayed   // число сыгранных шагов риск-игры
        };
        Network.setFrameUID( this.frameUID );
        Network.sendRequest( 'game/risk_dealer_card', params, this.onGetDealerCard, this.onDealerCardError );
    }

    /**
     * Обработка ответа сервера с картой дилера.
     *
     * @param {type} data данные, полученные от сервера:
     * 'dealer' - номер карты дилера
     */
    onGetDealerCard( data ) {
        let game = Game.instance();

        // Сохранить только карту дилера. Карты игрока удалены.

        game.riskGameData = {
            dealer: data.riskGame.dealer,
            suits: {
                dealer: data.riskGame.suits.dealer
            }
        };
        if ( game.allCardsClosed ) {    // все карты закрыты

            if ( game.isRiskImageDownloaded ) { // все картинки загружены

                // Показать новую карту дилера

                game.showDealerCard();
            }
            else {

                // Установить функцию после загрузки

                game.afterRiskImagesDownloaded = game.showDealerCard;
            }
        }
    }

    /**
     * Ошибка запроса карты дилера.
     *
     * @param {object} params параметры ошибки:
     * 'errorType' тип ошибки (сетевая или серверная)
     * 'error' числовой код ошибки
     * 'errorText' строка описания ошибки
     */
    onDealerCardError( params ) {

        let game = Game.instance();

        // Показать диалог об ошибке, и потом повторить запрос карты дилера

        game.showError({
            error: params,
            message: 'The network error has occurred.\nRepeat last request?',
            buttons: ['Repeat'],
            callback: game.sendDealerCardRequest,
            callOnClose: true
        });
    }

    /**
     * Показать карту дилера.
     */
    showDealerCard() {

        this.startPlay( '23_btd_card_open' );
        this.riskBox.openDealerCard( this.riskGameData.dealer, this.riskGameData.suits.dealer );

        // Разрешить кнопку "Start/Take"
        this.controlBox.item( 'start' ).setEnabled( true );

        if ( this.riskStepPlayed == 0 ) {
            this.showMsgAbove( 'CHOOSE CARD TO GAMBLE\nOR TAKE THE WIN!' );
            this.showMsgBelow( 'GAMBLE TO WIN ' + Tools.formatAmount( this.totalWinAmount * 2, 0 ) );
        }
        else {
            this.showMsgAbove( 'GAMBLE AMOUNT ' + Tools.formatAmount( this.totalWinAmount, 0 ) + '\nGAMBLE TO WIN ' + Tools.formatAmount( this.totalWinAmount * 2, 0 ) );
            this.showMsgBelow( '' );
        }
    }

    /**
     * Обработка клика на закрытой карте игрока.
     */
    onUserCardClicked( data ) {
        let game = Game.instance();

        // Заблокировать кнопку "Start/Take"
        game.controlBox.item( 'start' ).setEnabled( false );

        // Отправить запрос на получение карт игрока
        let params = {
            "gameId":        Game.gameId,           // идентификатор игры
            "spinId":        game.lastSpinId,       // идентификатор спина
            "prevSteps":     game.riskStepPlayed,   // число сыгранных шагов риск-игры
            "userCardIndex": data.index             // индекс выбранной игроком карты
        };
        Network.setFrameUID( game.frameUID );
        Network.sendRequest( 'game/risk_user_cards', params, game.onGetUserCards, game.onUserCardsError );
    }

    /**
     * Обработка ответа сервера на запрос карт игрока.
     *
     * @param {type} data карты игрока. Содержит параметр 'riskGame'
     * со свойствами:
     *      'pick' - номер выбранной карты игрока
     *      'cards' - массив закрытых карт игрока
     */
    onGetUserCards( data ) {
        let game = Game.instance();

        // Добавить карты игрока к карте дилера
        game.riskGameData.pick = data.riskGame.pick;
        game.riskGameData.cards = data.riskGame.cards;
        game.riskGameData.suits = data.riskGame.suits;

         // Открыть выбранную игроком карту
         game.riskBox.openUserCard( game.riskGameData.pick, game.riskGameData.suits.pick );

        // Проиграть мелодию в зависимости от выборанной карты игрока
        let sound;
        let dealerCard = game.riskGameData.dealer;
        if ( dealerCard == 1 ) dealerCard = 15;
        let userCard = game.riskGameData.pick;
        if ( userCard == 1 ) userCard = 15;
        if ( dealerCard > userCard ) {          // проигрыш игрока
            sound = "23_btd_card_open";
            game.showMsgAbove( 'LOSS' );
            game.showMsgBelow( 'GAMBLE TO WIN ' + Tools.formatAmount( game.totalWinAmount * 2, 0 ) );
        }
        else if ( dealerCard == userCard ) {   // равенство карт
            sound = "22_btd_card_open_same";
            game.showMsgAbove( 'PARITY' );
            game.showMsgBelow( 'GAMBLE TO WIN ' + Tools.formatAmount( game.totalWinAmount * 2, 0 ) );
        }
        else {                                 // выигрыш игрока
            sound = "gamblewin";
            game.totalWinAmount *= 2;
            game.showMsgAbove( 'GAMBLE AMOUNT ' + Tools.formatAmount( game.totalWinAmount, 0 ) + '\nGAMBLE TO WIN ' + Tools.formatAmount( game.totalWinAmount * 2, 0 ) );
            game.showMsgBelow( '' );
        }
        game.startPlay( sound );
    }

    /**
     * Обработка ошибки при запросе карт игрока.
     *
     * @param {object} params параметры ошибки:
     * 'errorType' тип ошибки (сетевая или серверная)
     * 'error' числовой код ошибки
     * 'errorText' строка описания ошибки
     */
    onUserCardsError( params ) {

        let game = Game.instance();

        // Показать диалог об ошибке, и потом повторить запрос карт игрока

        game.showError({
            error: params,
            message: 'The network error has occurred.\nRepeat last request?',
            buttons: ['Repeat'],
            callback: game.onUserCardClicked,
            callOnClose: true
        });
    }

    /**
     * Обработка после открытия выбранной карты игрока.
     */
    onUserCardOpened() {
        let game = Game.instance();

        // Открыть закрытые карты

        game.startPlay( '23_btd_card_open' );
        setTimeout( ()=>{
            game.riskBox.openClosedCards( game.riskGameData.cards, game.riskGameData.suits.cards );
        }, Game.DELAY_RISK_STEP );
    }

    /**
     * Обработка после открытия всех закрытых карт игрока.
     */
    onAllCardsOpened() {
        let game = Game.instance();

        let dealerCard = game.riskGameData.dealer;
        if ( dealerCard == 1 ) dealerCard = 15;
        let userCard = game.riskGameData.pick;
        if ( userCard == 1 ) userCard = 15;

        Log.out( 'Dealer card: ' + dealerCard + ', user card: ' + userCard );

        if ( dealerCard > userCard ) {          // если игрок проиграл

            // Закончить риск-игру и перейти к нормальной слот-игре

            setTimeout( ()=>{
                game.riskBox.close();
                game.startSlot();
            }, Game.DELAY_RISK_STEP );
            return;
        }

        // Перейти к следующему шагу риск-игры

        ++game.riskStepPlayed;
        game.allCardsClosed = false;
        game.riskGameData = null;

        // Отправить запрос на карту дилера на следующем шаге игры

        game.sendDealerCardRequest();

        // Закрыть все открытые карты (и дилера, и игрока)

        setTimeout( ()=>{
            game.startPlay( '23_btd_card_open' );
            game.riskBox.closeAllCards();
        }, Game.DELAY_RISK_STEP );
    }

    /**
     * После закрытия всех карт.
     *
     */
    onAllCardsClosed() {
        let game = Game.instance();
        game.allCardsClosed = true;
        if ( game.riskGameData != null ) {  // уже получен ответ от сервера с картой дилера

            // Показать новую карту дилера

            game.showDealerCard();
        }
    }

    //==========================================================================
    //  Обработка бонус-игры
    //==========================================================================

    isBonusFilesLoaded = false; // флаг загрузки файлов, необходимых для бонус-игры

    startBannerFinished = false;

    isBonusProcess;             // флаг начала бонус-игры. Устанавливается после завершения показа стартового баннера

    specSymbol;                 // символ расширения в бонус-игре
    freeSpinCount;              // общее число бесплатных спинов бонус-игры
    freeSpinNum;                // число сыгранных бесплатных спинов
    lastFreeSpin;               // оставшееся число бесплатных спинов

    /**
     * Проверка выпадения бонус-игры.
     *
     * Условие бонус-игры: наличие в текущем описании вращения барабана
     * свойства "winFreeSpin" внутри "bonusGame" и значение свойства > 0.
     *
     * @returns {boolean}
     */

    isBonusStarted() {
        Log.out( 'Check start bonus game' );
        if ( this.serverData ) {
            if ( this.serverData["bonusGame"] ) {
                if ( this.serverData.bonusGame["winFreeSpin"] ) {
                    return ( this.serverData.bonusGame.winFreeSpin > 0 );
                }
            }
        }
        return false;
    }

    /**
     * Запуск бонус-игры.
     */
    startBonus() {

        let bonusData = this.serverData.bonusGame;
        this.freeSpinCount = bonusData["winFreeSpin"];
        this.lastFreeSpin = bonusData["lastFreeSpin"];
        this.specSymbol = bonusData["bonusSymbol"];
        this.freeSpinNum = 0;
        this.startBannerFinished = false;

        this.boatArray = [];

        // Проверить загрузку файлов для бонус-игры.

        if ( ! this.isBonusFilesLoaded ) {

            // Запустить загрузку необходимых файлов

            this.initLoad();

            this.addToLoadItem( this.bonusDef.bkg );

            let symbols = this.symbols.info;                // нормальные картинки для символов
            let symbolIds = Object.keys( symbols );
            for ( let i = 0; i < symbolIds.length; ++i ) {
                let id = symbolIds[ i ];
                let bonus = symbols[ id ].bonus;
                this.addToLoad( bonus.url );
                if ( bonus.animate ) {
                    this.addToLoad( bonus.animate );
                }
                if ( bonus.sprite ) {
                    this.addToLoad( bonus.sprite.url );
                }
            }

            Log.warn( 'Start load the bonus files.' );
            this.startLoad( ()=>{ this.onBonusFilesLoaded() });
        }

        // Показать стартовый баннер начала бонус-игры

        this.textBanner.show( '' + this.freeSpinCount + ' Free Games' );
        this.setState( Game.State.SHOW_BONUS_BANNER );
        this.startPlay( 'autoplaystop', ()=>{
            this.startBannerFinished = true;
            this.onBannerAnimationFinished();
        });
    }

    /**
     * Обработка завершения файлов, необходимых для бонус-игры.
     */
    onBonusFilesLoaded() {
        this.isBonusFilesLoaded = true;
        if ( this.startBannerFinished ) {
            this.setBonusGameUI( true );
            return;
        }
        Log.warn( 'Bonus files are loaded. Wait bonus banner.' );
    }

    /**
     * Обработка завершения анимации стартового баннера.
     */
    onBannerAnimationFinished() {
        let game = Game.instance();
        Log.warn( 'Bonus banner stopped' );
        if ( game.isBonusFilesLoaded ) {    // файлы для бонус-игры загружены
            game.setBonusGameUI( true );
            return;
        }
        Log.warn( 'Bonus banner stopped. Wait bonus files.' );
    }

    /**
     * Показать баннер дополнительных бесплатных спинов в бонус-игре.
     */
    showFreeSpinBanner( callback ) {
        this.textBanner.show( "" + this.serverData.bonusGame.winFreeSpin + ' MORE FREE GAMES' );
        setTimeout( ()=>{

            // Через время, закрыть баннер и сделать переход к заданной функции

            this.textBanner.hide();
            callback();

        }, Game.DELAY_SHOW_BANNER);
    }

    /**
     * Переключить интерфейс в режим бонус-игры или обычной игры.
     */
    setBonusGameUI( state ) {
        this.isBonusProcess = state;
        if ( state ) {  // переход в бонус-режим

            this.background.setBonusMode( true );
            this.reelBox.setBonusMode( true );
            this.reelBox.setSymbols( this.serverData.setSymbols );
            if ( this.isAutoPlay() ) {  // если авторежим включен

                // Запускаем вращение в бонус-игре

                setTimeout( ()=>{ this.startBonusRotate(); }, Game.DELAY_SHOW_BANNER );
            }
            else {

                // Предлагаем нажать кнопку СТАРТ

                this.setState( Game.State.WAIT_BONUS_ROTATE );
                this.showMsgAbove( 'PRESS START TO BEGIN' );
            }
        }
        else {          // переход в режим нормальной игры

            this.specSymbol = -1;

            this.textBanner.hide();
            this.background.setBonusMode( false );
            this.reelBox.setBonusMode( false );
            this.reelBox.setSymbols( this.serverData.setSymbols );
            if ( this.isAutoPlay() ) {  // включен авто-режим

                // Перейти к собиранию выигрыша
                this.startTakeWin();
            }
            else {

                // Перейти в состояние ожидания действий игрока
                this.waitUserDecision();
            }
        }
    }

    /**
     * Запуск вращения в бонус-игре.
     */
    startBonusRotate() {

        // Закрываем стартовый баннер

        this.textBanner.hide();
        this.controlItem('start').setEnabled( false );

        // Запускаем анимацию лодки, отплывающей от корабля

        this.animateSailingBoat( () => {    // по окончании анимации

            // Включаем фоновую музыку
            this.playLoop( 'origin/feature_background' );

            // Запускаем вращение
            this.startRotate();

            // Запускаем движение всех лодок
            this.startMovingBoats();
        } );
    }

    /**
     * Начать анимацию спина в бонус-игре.
     */
    beginBonusSpinAnimation() {

        this.swimmerArray = [];

        // Показать атаку акулы на лодку

        if ( ! this.startSharkAnimation() ) {   // нет акулы

            // Показать лодку, отплывающую от корабля в 1-ом барабане.
            // По окончании анимации или если корабля нет - подготовить и запустить
            // пловцов за сундуками

            if ( ! this.animateSailingBoat( ()=>{ this.prepareSwimmers(); } ) ) {
                this.prepareSwimmers();
            }
        }
    }

    /**
     * Найти акулу в позиции лодки и запустить анимацию.
     *
     * @return {boolean} Возвращает true, если есть акула в позиции движущейся лодки
     * и запущена анимация. Иначе возвращает false.
     */
    startSharkAnimation() {
        let sharkSymbol = this.symbols.scatter.shark;
        let symbols = this.serverData["setSymbols"];
        let boatCnt = this.boatArray.length;
        for ( let i = 0; i < boatCnt; ++i ) {
            let boat = this.boatArray[ i ];
            let reelNo = boat.currentReel;  // индекс барабана, в котором находится лодка
            if ( reelNo <= 4 ) {
                let symIndex = boat.symbolIndex;
                if ( symbols[ reelNo ][ symIndex ] === sharkSymbol ) {  // акула в позиции лодки

                    // Удалить лодку
                    boat.destroy();
                    this.boatArray.splice(i,1);

                    // Показать нападение акулы
                    this.animateSharkAttack( reelNo, symIndex );
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Объект анимации акулы, нападающей на лодку.
     * @type AnimatedItem
     */
    sharkAttack;

    /**
     * Показать анимацию акулы, нападающей на лодку.
     *
     * @param {type} reelNo
     * @param {type} symIndex
     */

    animateSharkAttack( reelNo, symIndex ) {

        Log.out( 'Animate shark attack in reel ' + reelNo + ' slot ' + symIndex );

        let options = Tools.clone( this.bonusDef.sharkAttack );

        let reelPos = this.reelDef.pos;
        options.vertical.x = reelPos.vertical[ reelNo ].x;
        options.vertical.y = reelPos.vertical[ reelNo ].y + options.vertical.height * symIndex;

        options.horizontal.x = reelPos.horizontal[ reelNo ].x;
        options.horizontal.y = reelPos.horizontal[ reelNo ].y + options.horizontal.height * symIndex;

        // Создать объект анимации акулы
        this.sharkAttack = new AnimatedItem( this, options );
        this.sharkAttack.addListener( 'animationStopped', ()=>{ // по окончании анимации

            setTimeout( ()=>{

                // Удалить текущую анимацию

                this.sharkAttack.setVisible( false );
                delete this.sharkAttack;
                this.sharkAttack = null;

                // Повторить анимацию спина бонус-игры

                this.beginBonusSpinAnimation();
            }, 100 );

        });

        // Запустить анимацию
        this.startPlay( 'origin/event_sharkattack' );
        this.sharkAttack.start();
    }

    /**
     * Массив движущихся лодок.
     */
    boatArray;

    /**
     * Создать новую движущуюся лодку.
     *
     * @param {int} index номер позиции на барабане от 0 до 2
     *
     * @return {object}
     */

    createMovingBoat( index ) {

        Log.out( 'Create moving boat in slot ' + index );

        let options = Tools.clone( this.bonusDef.movingBoat );

        options.vertical.y += options.vertical.height * index;
        options.horizontal.y += options.horizontal.height * index;

        let boat = new MovingBoat( this, options, index );
        boat.addListener( 'movingStopped', ()=>{    // по окончании движения

            Log.warn( 'Moving boat sopped. ' );

            // Удалить лодку, если она вышла за последний барабан

            if ( boat.currentReel > 4 ) {
                let index = this.boatArray.indexOf( boat );
                if ( index >= 0 ) {
                    boat.destroy();
                    this.boatArray.splice( index, 1 );
                }
            }
        });
        this.boatArray.push( boat );

        return boat;
    }

    /**
     * Объект анимации лодки, отплывающей от корабля.
     * @type AnimatedItem
     */
    sailingBoat;

    /**
     * Запуск анимации лодки, отплывающей от корабля, на 1-ом барабане.
     *
     * @return {boolean} Возвращает true, если символ для анимации найден,
     * и анимация запущена. Иначе возвращает false.
     */
    animateSailingBoat( callback ) {
        let reel = this.reelBox.reel( 0 );
        let stoppedSymbols = reel.stoppedSymbols;
        let boatSymbol = this.bonusDef.sailingBoat.symbol;
        for ( let i = 0; i < 3; ++i ) {
            if ( stoppedSymbols[ i ] == boatSymbol ) {

                Log.out( 'Animate sailing boat in slot ' + i );

                let options = Tools.clone( this.bonusDef.sailingBoat );
                options.vertical.y += options.vertical.height * i;
                options.horizontal.y += options.horizontal.height * i;

                // Создать анимацию лодки
                this.sailingBoat = new AnimatedItem( this, options );
                this.sailingBoat.addListener( 'animationStopped', ()=>{ // по окончании анимации

                    // Создать движущуюся лодку
                    this.createMovingBoat( i );

                    // Удалить анимацию
                    setTimeout( ()=>{
                        this.sailingBoat.setVisible( false );
                        delete this.sailingBoat;
                        this.sailingBoat = null;
                        callback();
                    }, 100 );
                });

                // Запустить анимацию
                this.startPlay( 'origin/event_shipnewboat' );
                this.sailingBoat.start();
                return true;
            }
        }
        return false;
    }

    /**
     * Показать все движущиеся лодки.
     */
    showMovingBoats() {
        let boatCnt = this.boatArray.length;
        for ( var i = 0; i < boatCnt; ++i ) {
            var boat = this.boatArray[ i ];
            boat.setVisible( true );
        }
    }

    /**
     * Запустить движение всех движущихся лодок.
     */
    startMovingBoats() {
        let boatCnt = this.boatArray.length;
        if ( boatCnt > 0 ) {
            console.log( 'Start ' + boatCnt + ' boat(s) moving ...');
            for ( var i = 0; i < boatCnt; ++i ) {
                var boat = this.boatArray[ i ];
                boat.currentReel += 1;
                boat.showManInBoat();
                boat.startMoving();
            }
        }
    }

    /**
     * Спрятать все движущиеся лодки.
     */
    hideMovingBoats() {
        let boatCnt = this.boatArray.length;
        for ( var i = 0; i < boatCnt; ++i ) {
            var boat = this.boatArray[ i ];
            boat.setVisible( false );
        }
    }

    /**
     * Массив пловцов за сундуками.
     */
    swimmerArray;

    /**
     * Индекс последней лодки, собравшей выигрышы из сундуков.
     */
    lastBoatIndex;

    /**
     * Подготовить пловцов за сундуками.
     */
    prepareSwimmers() {

        let boatCnt = this.boatArray.length;            // число лодочников
        let chestWin = this.serverData.bonusGame.bonusWin;
        let chestCnt = chestWin ? chestWin.length : 0;  // число сундуков

        Log.out( 'Prepare swimmers: boatCnt = ' + boatCnt + ', chestCht = ' + chestCnt );

        if ( boatCnt > 0 && chestCnt > 0 ) {

            for ( let i = 0; i < boatCnt; ++i ) {   // цикл по всем лодкам

                var boat = this.boatArray[i];
                var boatPos = boat.symbolIndex;         // позиция лодки на барабане
                var boatReel = boat.currentReel;        // индекс барабана лодки

                for ( let j = 0; j < chestCnt; ++j ) {  // цикл по всем сундукам

                    var chest = chestWin[ j ];
                    var chestPos = chest[ 0 ] - 1;          // позиция сундука на барабане
                    var chestReel = chest[ 1 ] - 1;         // индекс барабана сундука

                    // Определить положение сундука относительно лодки

                    let direction = '';
                    if ( chestReel == boatReel && chestPos == boatPos ) {           // сундук в позиции лодки
                        direction = 'here';
                    }
                    else if ( chestReel == boatReel-1 && chestPos == boatPos ) {    // сундук слева
                        direction = 'left';
                    }
                    else if ( chestReel == boatReel-1 && chestPos == boatPos-1 ) {  // сундук слева-вверху
                        direction = 'left-up';
                    }
                    else if ( chestReel == boatReel && chestPos == boatPos-1 ) {    // сундук сверху
                        direction = 'up';
                    }
                    else if ( chestReel == boatReel+1 && chestPos == boatPos-1 ) {  // сундук сверху-справа
                        direction = 'right-up';
                    }
                    else if ( chestReel == boatReel+1 && chestPos == boatPos ) {    // сундук справа
                        direction = 'right';
                    }
                    else if ( chestReel == boatReel+1 && chestPos == boatPos+1 ) {  // сундук справа-снизу
                        direction = 'right-down';
                    }
                    else if ( chestReel == boatReel && chestPos == boatPos+1 ) {    // сундук снизу
                        direction = 'down';
                    }
                    else if ( chestReel == boatReel-1 && chestPos == boatPos+1 ) {  // сундук снизу-слева
                        direction = 'left-down';
                    }

                    // Создать пловца, если есть сундук в окрестности лодки

                    if ( direction != '' ) {
                        Log.out( 'Create swimmer in reel ' + boatReel + ', pos ' + boatPos + ', direction ' + direction );
                        let params = {
                            boatIndex: i,
                            reelIndex: boatReel,
                            slotIndex: boatPos,
                            direction: direction,
                            amount: chest[ 2 ]
                        };
                        let swimmer = new Swimmer( this, this.bonusDef.swimmer, params );
                        this.swimmerArray.push( swimmer );
                    }
                }
            }
        }

        // Запустить сбор бонусов из сундуков

        this.lastBoatIndex = -1;
        this.collectChestWins();
    }

    /**
     * Собрать выигрыши с сундуков.
     */
    collectChestWins() {

        if ( this.swimmerArray.length > 0 ) {   // есть еще пловцы

            // Запустить анимацию очередного выигрыша

            let swimmer = this.swimmerArray[0];

            if ( swimmer.params.boatIndex !== this.lastBoatIndex ) {

                if ( this.lastBoatIndex >= 0 ) {     // показать человека в лодке
                    this.boatArray[ this.lastBoatIndex ].showManInBoat();
                }

                this.lastBoatIndex = swimmer.params.boatIndex;
                let boat = this.boatArray[ this.lastBoatIndex ];
                if ( swimmer.params.chestDirection == 'here' ) {
                    // при анимации сундука в позиции лодки - спрятать лодку
                    boat.setVisible( false );
                }
                else {
                    // при анимации пловца - показать пустую лодку
                    boat.showEmptyBoat();
                }
            }

            // Добавить бонус из сундука к сумме выигрыша по спину

            swimmer.addListener( 'bonusReceived', (params)=>{
                this.spinWinAmount += params.amount;
                this.showMsgAbove( Tools.formatAmount( this.spinWinAmount ) + " WIN", true );
            });

            // По окончании движения пловца, удалить его и запустить движение другого пловца

            swimmer.addListener( 'swimmerStopped', ()=>{
                this.swimmerArray.splice( 0, 1 );
                swimmer.destroy();
                setTimeout( ()=>{ this.collectChestWins(); }, 100 );
            });

            // Запустить анимацию пловца

            swimmer.start();
            return;
        }

        // В позициях всех лодочников заменить символы на мужика в лодке

        var boatCnt = this.boatArray.length;
        if ( boatCnt > 0 ) {
            let mainInBoat = this.symbols.scatter.manInBoat;
            for ( var i = 0; i < boatCnt; ++i ) {
                var boat = this.boatArray[ i ];
                var reelIndex = boat.currentReel;
                var symIndex = boat.symbolIndex;
                this.serverData.setSymbols[ reelIndex ][ symIndex ] = mainInBoat;
            }
            this.reelBox.setSymbols( this.serverData.setSymbols );
            this.reelBox.setStoppedSymbols( this.serverData.setSymbols );
        }

        // Показать человека в лодке

        if ( this.lastBoatIndex >= 0 ) {
            this.boatArray[ this.lastBoatIndex ].showManInBoat();
            this.lastBoatIndex = -1;
        }

        // Спрятать все движущиеся лодки

        this.hideMovingBoats();

        // Проверить наличие выигрышных линий

        let winLines = this.serverData.setWonLines;
        if ( Object.keys( winLines ).length > 0 ) { // если есть выигрышные линии

            // Запустить показ обычных выигрышных линий

            this.setState( Game.State.SHOW_WIN_LINES );
            this.lineBox.startShowWinLines( winLines );
        }
        else {

            // Перейти к следующему раунду игры

            this.bonusNextRound();
        }
    }

    /**
     * Следующий раунд бонус-игры.
     */
    bonusNextRound(){

        let game = Game.instance();

        // Выключить кнопку "Старт", чтобы за время таймаута не было лишнего нажатия
        game.controlBox.item( 'start' ).setEnabled( false );

        // Добавить к общему выигрышу выигрыш за последний спин
        game.totalWinAmount += game.spinWinAmount;
        Log.info( 'Set total win to ' + game.totalWinAmount );
        game.spinWinAmount = 0;

        Log.info( 'Next bonus round. Free spin num ' + game.freeSpinNum + ', total free spin ' + game.freeSpinCount );
        if ( game.freeSpinNum == game.freeSpinCount ) { // сыграли все бесплатные спины
            setTimeout( game.onBonusGameFinished, Game.DELAY_BONUS_SPIN );
        }
        else {
            game.startMovingBoats();
            setTimeout( ()=>{ game.startSlot() }, Game.DELAY_BONUS_SPIN );
        }
    }

    /**
     * По окончании бонус-игры.
     */
    onBonusGameFinished() {

        let game = Game.instance();

        game.setState( Game.State.BONUS_FINISH );

        game.lineBox.stopShowWinLines();
        game.stopPlay( 'origin/feature_background' );

        // Показать баннер завершения бонус-игры
        let text = "Feature Win\n" + Tools.formatAmount( game.totalWinAmount ) + "\n"
                  + game.freeSpinCount + " Free Games played";
        game.textBanner.show( text );

        // Проиграть мелодию при показе завершающего баннера
        game.startPlay( "origin/feature_end_long", ()=>{   // по завершении мелодии

            // Спрятать баннер и выключить бонус-режим
            game.setBonusGameUI( false );
        });
    }

}
