/**
 * Окно выбора ставки на линию.
 */

class BetWindow extends Window {

    // Массив всех возможных линий
    bets;

    // Массив флагов доступности линий для выбора
    betEnabled;

    // Текущая выбранная кнопка линий.
    lastSelectedButton;

    totalBetText;

    linesText;

    constructor( parent, options ) {

        let game = Game.instance();

        super( game.background, options );
        parent.addChild( this );

        this.bets = [
             100,  200,  300,  400,   500,
             600,  700,  800,  900,  1000,
            1200, 1500, 1800, 2000,  2500,
            3000, 3500, 4000, 4500,  5000,
            6000, 7000, 8000, 9000, 10000
        ];
        this.betEnabled = [
            true, true, true, true, true,
            true, true, true, true, true,
            true, true, true, true, true,
            true, true, true, true, true,
            true, true, true, true, true,
        ];

        // children[0]
        new TextItem( this, 'BET PER LINE', {
            fontFamily: 'Arial',
            fontSize: 26,
            x: 30,
            y: 15,
        });

        // children[1]
        let closeOptions = Tools.clone( game.images.closeIcon );
        closeOptions.x = 700;
        closeOptions.y = 15;
        closeOptions.width = 30;
        closeOptions.height = 30;
        let closeBtn = new ImageButton( this, 'closeBetWindow', closeOptions);
        closeBtn.addListener( 'click', ()=>{ this.emit( 'close') });

        // children[2] ...
        this.lastSelectedButton = null;
        let bets = this.bets;
        for ( let i = 0; i < bets.length; ++i ) {

            let btnOptions = Tools.clone( options.buttons );
            btnOptions.x = 30 + ( i % 5 ) * 143;
            btnOptions.y = 70 + Math.floor( i / 5 ) * 75;
            btnOptions.interactive = true;
            btnOptions.selected = {
                fill: btnOptions.valueColor,
                valueColor: 0
            };
            let btn = new ValueButton( this, bets[i], btnOptions );
            if ( bets[i] == game.selectedBet ) {
                btn.setSelected( true );
                this.lastSelectedButton = btn;
            }
            btn.addListener( 'click', (params)=>{
                let w = params.window;
                if ( w.value != game.selectedBet ) {
                    if ( this.lastSelectedButton != null ) {
                        this.lastSelectedButton.setSelected( false );
                    }
                    this.lastSelectedButton = w;
                    w.setSelected( true );
                    this.emit( 'betChanged', { bet: w.value } );
                }
                else {
                    game.betWindowClose();
                }
            });
        }

        this.totalBetText = new TextItem( this, '', {
            fontFamily: 'Arial',
            fontSize: 26,
            x: 30,
            y: 450,
        });

        this.linesText = new TextItem( this, '', {
            fontFamily: 'Arial',
            fontSize: 26,
            align: 'right',
            rightMargin: 30,
            y: 450,
        });

        this.setVisible( false );
    }

    scale() {
        let game = Game.instance();
        let scale = Tools.clone( this.parent.scale() );
        if ( game.isHorizontal() ) {
            scale.x *= this.options.horizontal.width / this.options.vertical.width;
            scale.y *= this.options.horizontal.height / this.options.vertical.height;
        }
        return scale;
    }

    draw() {
        super.draw();

        let game = Game.instance();

        let bets = this.bets;
        for ( let i = 0; i < bets.length; ++i ) {

            let btn = this.children[ 2 + i ];
            if ( bets[i] == game.selectedBet ) {
                btn.setSelected( true );
                this.lastSelectedButton = btn;
            }
            else {
                btn.setSelected( false );
            }
            btn.setEnabled( this.betEnabled[i] );
        }

        this.totalBetText.updateText( 'TOTAL BET ' + Tools.formatAmount( game.totalBet ) );
        this.linesText.updateText( 'LINES ' + Tools.formatAmount( game.selectedLines ) );
    }

    /**
     * Установить список доступных для выбора ставок на линию.
     *
     * @param {array} bets массив ставок на линию
     */
    setAllowedBets( bets ) {
        let cnt = this.bets.length;
        for ( let i = 0; i < cnt; ++i ) {
            let b = this.bets[ i ];
            this.betEnabled[ i ] = ( bets.indexOf( b ) >= 0 );
        }
    }

    /**
     * Получить список доступных ставок на линию.
     *
     * @returns {array} Возвращает массив доступных ставок
     */
    allowedBets() {
        let data = [];
        let cnt = this.bets.length;
        for ( let i = 0; i < cnt; ++i ) {
            if ( this.betEnabled[ i ] ) {
                data.push( this.bets[ i ] );
            }
        }
        return data;
    }
}
