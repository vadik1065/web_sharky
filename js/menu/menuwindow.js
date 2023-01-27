/**
 * Окно меню.
 *
 * Формирует события:
 *
 * 'close' - закрыть окно меню. Параметры:
 *      'menuItem' - выбранный объект элемента меню
 *
 * 'showPaytable' - открыть окна помощи по игре. Параметров нет.
 *
 * 'makeDeposit' - Сделать депозит (пополнение баланса). Параметров нет.
 */

class MenuWindow extends Window {

    /** Настрока меню */
    menuDef;

    /** Элемент меню авторизации/выхода */
    signInOutItem;

    /** Элемент меню помощи по игре (таблица выигрышей, правила и т.п.) */
    paytableItem;

    /** Элемент меню пополнения/вывода с баланса */
    depositItem;

    /**
     * Элемент меню переключения звука.
     *
     * Состояния:
     * 0 - звук выключен, включить звук
     * 1 - звук включен, выключить звук
     */
    soundItem;

    /** Пункт меню переключения полного экрана */
    fullScreenItem;

    /** Текущее состояние полного экрана */
    fullScreenState;

    constructor( parent, menuDef ) {

        let isTelegram = Game.instance().isTelegram();

        // Расположение окна меню привязываем к расположению кнопки "Menu"

        let menuBtnOptions = Game.instance().controlDef.menu;

        let options = isTelegram ? menuDef.telegram.window : menuDef.window;
        let winOptions = {
            vertical: Tools.clone( options ),
            horizontal: Tools.clone( options )
        };
        winOptions.vertical.x = menuBtnOptions.vertical.x + 10;
        winOptions.vertical.y = menuBtnOptions.vertical.y - options.height;
        winOptions.horizontal.x = menuBtnOptions.horizontal.x + 10;
        winOptions.horizontal.y = menuBtnOptions.horizontal.y - options.height;

        super( parent, winOptions );

        // Пункты меню создаем в зависимости от темы "telegram" игры

        let menuItemDef = isTelegram ? menuDef.telegram.items : menuDef.items;

        if ( ! isTelegram ) {
            this.signInOutItem = new MenuItem( this, menuItemDef[ 'signInOut' ] );
            this.signInOutItem.addListener( 'click', ()=>{ this.emit( 'signInOut' ); });

            this.depositItem = new MenuItem( this, menuItemDef[ 'deposit' ] );
            this.depositItem.addListener( 'click', ()=>{ this.emit( 'makeDeposit' ); });

            this.fullScreenItem = new MenuItem( this, menuItemDef[ 'fullScreen' ] );
            this.fullScreenItem.addListener( 'click', ()=>{ this.onFullScreenClick(); });
            this.fullScreenState = false;
        }

        this.paytableItem = new MenuItem( this, menuItemDef[ 'paytable' ] );
        this.paytableItem.addListener( 'click', ()=>{ this.emit( 'showPaytable' ); });

        this.soundItem = new MenuItem( this, menuItemDef[ 'sound' ] );
        this.soundItem.addListener( 'click', ()=>{ this.onSoundClick(); });

        this.setVisible( false );
    }

    /**
     * Переключить видимость окна меню.
     *
     * @param {boolean} state состояние видимости
     */
    setVisible( state ) {

        super.setVisible( state );

        if ( state ) {  // открыть меню

            // Установить доступность элементов меню в зависимости от текущего состояния игры

            let game = Game.instance();
            let gameState = game.state;

            if ( ! game.isTelegram() ) {
                this.signInOutItem.setState( game.isUserLogged() > 0 ? 1 : 0 );
                this.signInOutItem.setEnabled( ! game.isUILocked() );
                this.depositItem.setEnabled( ! game.isUILocked() );
            }

            this.paytableItem.setEnabled( ! game.isUILocked() && ( gameState == Game.State.WAIT_ROTATE || gameState == Game.State.HELP ) );
            this.soundItem.setState( game.isSoundMuted() ? 1 : 0 );
        }
    }

    onPaytableClick() {
        this.emit( 'showPaytable' );
    }

    /**
     * Обработка переключения звука.
     */
    onSoundClick() {
        let game = Game.instance();
        game.setSoundMute( ! game.isSoundMuted() );
        this.emit( 'close', { menuItem: this.soundItem } );
    }

    /**
     * Обработка переключения полноэкранного режима.
     */
    onFullScreenClick() {
        let game = Game.instance();
        game.setFullscreen( ! game.isFullscreen() );
        this.emit( 'close', { menuItem: this.fullScreenItem } );
    }
}

