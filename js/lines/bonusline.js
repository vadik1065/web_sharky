/**
 * Выигрышная линий из скаттер-символов, начинающих бонус-игру.
 */

class BonusLine extends GameItem {

    /**
     * Параметры:
     *
     * first - идентификатор (номер) скаттер-символа в 1-ом барабане
     * last - идентификатор (номер) скаттер-символа в 5-ом барабане
     * color - цвет рамки
     */
    options;

    winSymbolCount;     // число выигравших символов в линии
    winAmount;          // сумма выигрыша
    winObjects;         // массив объектов выигрышных символов

    constructor( parent, options ) {
        super( parent );

        this.options = options;

        this.winSymbolCount = 0;
        this.winAmount = 0;
        this.winObjects = [];
    }

    draw() {

        // Отрисовать выигрышные символы и рамки

        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.draw();
        }
    }

    scale() {
        return this.parent.scale();
    }

    scatterPos( reelIndex, scatter ) {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel = reelBox.reel( reelIndex );
        for ( let i = 0; i < 3; ++i ) {
            let symbol = reel.stoppedSymbol( i );
            if ( symbol === scatter ) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Показать выигрыш по линии.
     *
     * @param {array} winData массив [<число символов>, <сумма выигрыша>]
     */

    showWin( winData ) {
        if ( this.winObjects.length == 0 ) {

            this.winSymbolCount = winData[ 0 ];
            this.winAmount = winData[ 1 ];
            this.winObjects = [];

            let box = new WinBox( this, {
                reel: 0,
                pos: this.scatterPos( 0, this.options.first ),
                color: this.options.color,
                amount: this.winAmount
            });
            this.winObjects.push( box );

            box = new WinBox( this, {
                reel: 4,
                pos: this.scatterPos( 4, this.options.last ),
                color: this.options.color,
                amount: 0
            });
            this.winObjects.push( box );
        }
        else {
            for ( let i = 0; i < this.winObjects.length; ++i ) {
                let object = this.winObjects[ i ];
                object.setVisible( true );
            }
        }
        this.setVisible( true );
    }

    /**
     * Скрыть выигрыш по линии.
     */
    hideWin() {
        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.setVisible( false );
        }
        this.setVisible( false );
    }

    /**
     * Скрыть выигрыш по линии.
     */
    clearWin() {
        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.destroy();
        }
        this.winObjects = [];
        this.winSymbolCount = 0;
        this.winAmount = 0;
        this.setVisible( false );
    }
}
