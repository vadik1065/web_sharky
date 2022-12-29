/**
 * Панель элементов управления игрой.
 */

class ControlBox extends GameItem {

    constructor( parent ) {

        super( parent );

        let game = Game.instance();

        let btn = new StartButton( this, 'start' );
        btn.addListener( 'click', () => { this.emit( 'startBtnClick' ) } );

        btn = new MenuButton( this, 'menu' );
        btn.addListener( 'click', () => { this.emit( 'menuBtnClick' ) } );

        btn = new LinesButton( this, 'lines' );
        btn.addListener( 'click', () => { this.emit( 'linesBtnClick' ) } );

        btn = new TotalBetButton( this, 'totalBet' );
        btn.addListener( 'click', () => { this.emit( 'betBtnClick' ) } );

        btn = new MaxBetButton( this, 'maxBet' );
        btn.addListener( 'click', () => { this.emit( 'maxBetBtnClick' ) } );

        btn = new AutoPlayButton( this, 'autoPlay' );
        btn.addListener( 'click', () => { this.emit( 'autoPlayBtnClick' ) } );

        new InfoBox( this, 'infoBox' );

        btn = new ImageButton( this, 'helpPrev', game.controlDef[ 'helpPrev' ] );
        btn.addListener( 'click', () => { this.emit( 'helpPrevBtnClick' ) } );
        btn.setVisible( false );

        btn = new ImageButton( this, 'helpClose', game.controlDef[ 'helpClose' ] );
        btn.addListener( 'click', () => { this.emit( 'helpCloseBtnClick' ) } );
        btn.setVisible( false );

        btn = new ImageButton( this, 'helpNext', game.controlDef[ 'helpNext' ] );
        btn.addListener( 'click', () => { this.emit( 'helpNextBtnClick' ) } );
        btn.setVisible( false );
    }

    /**
     * Обновить размеры всех элементов управления.
     */
    draw() {

        let game = Game.instance();

        // Кнопка 'maxBet' видима только в горизонтальном режиме
        this.item('maxBet').setVisible( game.isHorizontal() );

        this.setState( game.state );

        super.draw();
    }

    scale() {
        return Game.instance().scale();
    }

    pos() {
        return Game.instance().background.pos();
    }

    size() {
        return Game.instance().background.size();
    }

    /**
     * Получить элемент управления с заданным ID.
     *
     * @param {string} id идентификатор/имя элемента
     * @returns {object}
     */
    item( id ) {
        let cnt = this.children.length;
        for ( let i = 0; i < cnt; ++i ) {
            let item = this.children[ i ];
            if ( item.id == id ) {
                return item;
            }
        }
        Log.out( 'Not found item with id = [' + id + ']' );
        return null;
    }

    /**
     * Установить текущее состояние элементов управления.
     *
     * @param {string} state символьное имя состояния
     */
    setState( state ) {
        let game = Game.instance();

        if ( game.isUILocked() ) {
            state = Game.State.DISABLED;
        }
        let startBtn = this.item( 'start' );
        if ( state == Game.State.WAIT_USER || state == Game.State.RISK_GAME ) {
            startBtn.setState( StartButton.State.TAKE_WIN  );
        }
        else {
            startBtn.setState( StartButton.State.START  );
        }

        let totalBetBtn = this.item( 'totalBet' );
        if ( state == Game.State.WAIT_USER ) {
            totalBetBtn.setState( TotalBetButton.State.GAMBLE  );
        }
        else {
            totalBetBtn.setState( TotalBetButton.State.TOTAL_BET  );
        }

        if ( state == Game.State.HELP ) {

            this.item( 'infoBox' ).setVisible( false );

            this.item( 'helpPrev' ).setVisible( true );
            this.item( 'helpClose' ).setVisible( true );
            this.item( 'helpNext' ).setVisible( true );
            this.item( 'helpPrev' ).setEnabled( true );
            this.item( 'helpClose' ).setEnabled( true );
            this.item( 'helpNext' ).setEnabled( true );
        }
        else if ( state == Game.State.CHANGE_TOTAL_BET ) {
            if ( game.isPaytableOpened() ) {

                this.item( 'infoBox' ).setVisible( false );

                this.item( 'helpPrev' ).setVisible( true );
                this.item( 'helpClose' ).setVisible( true );
                this.item( 'helpNext' ).setVisible( true );
                this.item( 'helpPrev' ).setEnabled( false );
                this.item( 'helpClose' ).setEnabled( false );
                this.item( 'helpNext' ).setEnabled( false );
            }
            else {

                this.item( 'infoBox' ).setVisible( true );
                this.item( 'infoBox' ).setEnabled( false );

                this.item( 'helpPrev' ).setVisible( false );
                this.item( 'helpClose' ).setVisible( false );
                this.item( 'helpNext' ).setVisible( false );
            }
        }
        else {
            this.item( 'infoBox' ).setVisible( true );

            this.item( 'helpPrev' ).setVisible( false );
            this.item( 'helpClose' ).setVisible( false );
            this.item( 'helpNext' ).setVisible( false );
        }

        this.item( 'menu' ).setEnabled( state != Game.State.SHOW_JACKPOT );

        switch ( state ) {

            case Game.State.CHANGE_TOTAL_BET:
                this.item( 'lines' ).setEnabled( true );
                this.item( 'totalBet' ).setEnabled( true );
                this.item( 'maxBet' ).setEnabled( true );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( false );
                break;

            case Game.State.ROTATE:
            case Game.State.TAKE_WIN:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( true );
                this.item( 'start' ).setEnabled( false );
                this.item( 'infoBox' ).setVisible( true );
                this.item( 'infoBox' ).setEnabled( true );
                break;

            case Game.State.RISK_GAME:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( true );
                this.item( 'infoBox' ).setVisible( true );
                break;

            case Game.State.HELP:
                this.item( 'lines' ).setEnabled( true );
                this.item( 'totalBet' ).setEnabled( true );
                this.item( 'maxBet' ).setEnabled( true );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( true );
                this.item( 'infoBox' ).setVisible( false );
                break;

            case Game.State.SHOW_WIN_LINES:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( ! game.isBonusProcess );
                this.item( 'infoBox' ).setEnabled( true );
                this.item( 'start' ).setEnabled( true );
                break;

            case Game.State.SHOW_EXTRA_LINES:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'infoBox' ).setEnabled( true );
                this.item( 'start' ).setEnabled( true );
                break;

            case Game.State.WAIT_USER:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( true );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( true );
                this.item( 'infoBox' ).setEnabled( true );
                this.item( 'start' ).setEnabled( true );
                break;

            case Game.State.DISABLED:
            case Game.State.SHOW_BONUS_BANNER:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( false );
                this.item( 'infoBox' ).setEnabled( true );
                break;

            case Game.State.SHOW_JACKPOT:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( true );
                this.item( 'infoBox' ).setEnabled( false );
                break;

            case Game.State.BONUS_ROTATE:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'infoBox' ).setVisible( true );
                this.item( 'infoBox' ).setEnabled( true );
                this.item( 'autoPlay' ).setEnabled( false );
                this.item( 'start' ).setEnabled( false );
                break;

            case Game.State.WAIT_BONUS_ROTATE:
            case Game.State.BONUS_FINISH:
                this.item( 'lines' ).setEnabled( false );
                this.item( 'totalBet' ).setEnabled( false );
                this.item( 'maxBet' ).setEnabled( false );
                this.item( 'infoBox' ).setEnabled( true );
                this.item( 'autoPlay' ).setEnabled( true );
                this.item( 'start' ).setEnabled( true );
                break;

            default: // WAIT_ROTATE
                if ( game.isPaytableOpened() ) {
                    this.setState( Game.State.HELP );
                }
                else {
                    this.item( 'lines' ).setEnabled( true );
                    this.item( 'totalBet' ).setEnabled( true );
                    this.item( 'maxBet' ).setEnabled( true );

                    let spinEnabled = ( game.totalBet <= game.balance() );
                    this.item('autoPlay').setEnabled( spinEnabled );
                    this.item('start').setEnabled( spinEnabled || game.isUserLogged() );
                    this.item( 'start' ).setState( StartButton.State.START  );

                    this.item( 'infoBox' ).setEnabled( true );
                    this.item( 'infoBox' ).setVisible( true );

                    this.item( 'helpPrev' ).setVisible( false );
                    this.item( 'helpClose' ).setVisible( false );
                    this.item( 'helpNext' ).setVisible( false );
                }
        }
    }
};
