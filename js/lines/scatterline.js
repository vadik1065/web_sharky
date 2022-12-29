/**
 * Выигрышная линия из скаттер-символов.
 */

class ScatterLine extends GameItem {

    /**
     * Параметры:
     *
     * scatter - идентификатор (номер) скаттер-символа
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

            let scatter = this.options.symbolId;

            let game = Game.instance();
            let reelBox = game.reelBox;

            // Цикл по барабанам, слева направо

            let idx = 0;    // порядковый номер найденного скаттер-символа
            for ( let r = 0; r < 5; ++r ) {

                // Найти позицию скаттер-символа на текущем барабане

                let reel = reelBox.reel( r );
                for ( let p = 0; p < 3; ++p ) {

                    let sym = reel.stoppedSymbol( p );
                    if ( sym == scatter ) {

                        let box = new WinBox( this, {
                            reel: r,
                            pos: p,
                            color: this.options.color,
                            amount: ( this.winObjects.length == 0 ) ? this.winAmount : 0
                        });
                        this.winObjects.push( box );
                        ++idx;
                    }
                }
            }
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
