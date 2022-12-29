/**
 * Окно выбора числа линий.
 */

class LinesWindow extends Window {

    // Массив всех возможных линий
    lines;

    // Массив флагов доступности линий для выбора
    lineEnabled;

    // Текущая выбранная кнопка линий.
    lastSelectedButton;

    totalBetText;

    betLineText;

    constructor( parent, options ) {

        let game = Game.instance();

        super( game.background, options );

        parent.addChild( this );

        this.lines = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        ];
        this.lineEnabled = [
            true, true, true, true, true, true, true, true, true, true
        ];

        new TextItem( this, 'LINES', {
            fontFamily: 'Arial',
            fontSize: 26,
            x: 30,
            y: 15,
        });

        let closeBtn = new ImageButton( this, 'closeLinesWindow', {
            x: 600,
            y: 15,
            width: 30,
            height: 30,
            urls: game.images.closeIcon.urls
        });
        closeBtn.addListener( 'click', ()=>{ this.emit( 'close') });

        this.lastSelectedButton = null;
        let lines = this.lines;
        for ( let i = 0; i < lines.length; ++i ) {

            let btnOptions = Tools.clone( this.options.buttons );
            btnOptions.x = 30 + ( i % 5 ) * 122;
            btnOptions.y = 80 + Math.floor( i / 5 ) * 80;
            btnOptions.interactive = true;
            btnOptions.selected = {
                fill: 0xFFCC00,
                valueColor: 0
            };
            let btn = new ValueButton( this, lines[i], btnOptions );
            if ( lines[i] == game.selectedLines ) {
                btn.setSelected( true );
                this.lastSelectedButton = btn;
            }
            btn.addListener( 'click', (params)=>{
                let w = params.window;
                if ( w.value != game.selectedLines ) {
                    if ( this.lastSelectedButton != null ) {
                        this.lastSelectedButton.setSelected( false );
                    }
                    this.lastSelectedButton = w;
                    w.setSelected( true );
                    this.emit( 'linesChanged', { lines: w.value } );
                }
                else {
                    game.linesWindowClose();
                }
            });
        }

        this.totalBetText = new TextItem( this, '', {
            fontFamily: 'Arial',
            fontSize: 26,
            x: 30,
            y: 250,
        });

        this.betLineText = new TextItem( this, '', {
            fontFamily: 'Arial',
            fontSize: 26,
            align: 'right',
            rightMargin: 30,
            y: 250,
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

        let lines = this.lines;
        for ( let i = 0; i < lines.length; ++i ) {

            let btn = this.children[ 2 + i ];
            if ( lines[i] == game.selectedLines ) {
                btn.setSelected( true );
                this.lastSelectedButton = btn;
            }
            else {
                btn.setSelected( false );
            }
            btn.setEnabled( this.lineEnabled[i] );
        }

        this.totalBetText.updateText( 'TOTAL BET ' + Tools.formatAmount( game.totalBet ) );
        this.betLineText.updateText( 'BET/LINE ' + Tools.formatAmount( game.selectedBet ) );
    }

    /**
     * Установить список доступных для выбора линий.
     *
     * @param {array} lines массив номеров линий
     */
    setAllowedLines( lines ) {
        let cnt = this.lines.length;
        for ( let i = 0; i < cnt; ++i ) {
            let n = this.lines[ i ];
            this.lineEnabled[ i ] = ( lines.indexOf( n ) >= 0 );
        }
    }

    /**
     * Получить список доступных номеров линий.
     *
     * @returns {array} Возвращает массив доступных линий
     */
    allowedLines() {
        let data = [];
        let cnt = this.lines.length;
        for ( let i = 0; i < cnt; ++i ) {
            if ( this.lineEnabled[ i ] ) {
                data.push( this.lines[ i ] );
            }
        }
        return data;
    }
}
