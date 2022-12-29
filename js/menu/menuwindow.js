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

        let winOptions = Tools.clone( menuDef.window );
        super( parent, winOptions );

        this.menuDef = menuDef;
        let menuItemDef = this.menuDef.items;

        this.signInOutItem = new MenuItem( this, menuItemDef[ 'signInOut' ] );
        this.signInOutItem.addListener( 'click', ()=>{ this.emit( 'signInOut' ); });

        this.paytableItem = new MenuItem( this, menuItemDef[ 'paytable' ] );
        this.paytableItem.addListener( 'click', ()=>{ this.emit( 'showPaytable' ); });

        this.depositItem = new MenuItem( this, menuItemDef[ 'deposit' ] );
        this.depositItem.addListener( 'click', ()=>{ this.emit( 'makeDeposit' ); });

        this.soundItem = new MenuItem( this, menuItemDef[ 'sound' ] );
        this.soundItem.addListener( 'click', ()=>{ this.onSoundClick(); });

        this.fullScreenState = false;
        this.fullScreenItem = new MenuItem( this, menuItemDef[ 'fullScreen' ] );
        this.fullScreenItem.addListener( 'click', ()=>{ this.onFullScreenClick(); });

        this.setVisible( false );
    }

    draw() {
        let game = Game.instance();
        let winOptions = game.isVertical() ? this.menuDef.window.vertical : this.menuDef.window.horizontal;
        this.options.x = winOptions.x;
        this.options.y = winOptions.y;
        this.options.width = winOptions.width;
        this.options.height = winOptions.height;
        super.draw();
    }

    /**
     * Переключить видимость окна меню.
     *
     * @param {boolean} state состояние видимости
     */
    setVisible( state ) {

        if ( state ) {  // открыть меню

            // Установить доступность элементов меню в зависимости от текущего состояния игры

            let game = Game.instance();
            let gameState = game.state;

            this.signInOutItem.setState( game.isUserLogged() > 0 ? 1 : 0 );
            this.signInOutItem.setEnabled( ! game.isUILocked() );

            this.paytableItem.setEnabled( ! game.isUILocked() && ( gameState == Game.State.WAIT_ROTATE || gameState == Game.State.HELP ) );

            this.depositItem.setEnabled( ! game.isUILocked() );

            this.soundItem.setState( game.isSoundMuted() ? 1 : 0 );
        }

        super.setVisible( state );
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

