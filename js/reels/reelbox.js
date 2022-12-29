/**
 * Группа барабанов.
 *
 * Формирует события:
 *
 * 'rotationStarted' - при начале вращения барабанов
 * 'rotationStopped' - при полной остановке вращения барабанов
 *
 */

class ReelBox extends GameItem {

    symbolCount;        // общее число символов

    symbols;            // массив текстур символов

    reels;              // массив описаний барабанов

    rotateStep;         // шаг сдвига смиволов при вращении

    rotated;            // флаг вращения

    stoppedTime;        // массив времени останова барабанов

    bonusSymbols;       // флаг бонусного набора символов

    /**
     * Инициализация барабанов.
     */
    constructor( parent, rotateStep ) {

        super( parent );

        this.rotateStep = rotateStep;
        this.rotated = false;

        // Создать нормальные текстуры всех символов

        this.setBonusMode( false );

        // Массив объектов барабанов

        for ( let i = 0; i < 5; i++ ) {

            let reel = new Reel( this, i );
            reel.addListener( 'stateChanged', this.onReelStateChanged )
        }
    };

    /**
     * Установить режим бонус-игры.
     *
     * @param {bool} bonus флаг бонус игры
     */
    setBonusMode( bonus ) {
        this.bonusSymbols = bonus;

        // Обновить текстуры символов для заданного режима

        this.symbols = [];
        let game = Game.instance();
        let symbols = game.symbols.info;
        let symbolIds = Object.keys( symbols );
        this.symbolCount = symbolIds.length;
        for ( let i = 0; i < this.symbolCount; ++i ) {
            let id = symbolIds[ i ];
            let url = bonus ? symbols[ id ].bonus.url : symbols[ id ].normal.url;
            this.symbols.push( PIXI.Texture.from( url ) );
        }
    }

    /**
     * Получить объект барабана.
     *
     * @param {int} index индекс барабана (от 0 до 4)
     * @returns {ReelBox.children}
     */
    reel( index ) {
        if ( index < 0 || 5 <= index ) {
            Log.error( '### ReelBox: invalid reel index' );
            return null;
        }
        return this.children[ index ];
    }

    /**
     * Обновить положение и размеры барабанов.
     */
    draw() {
        for ( let i = 0; i < 5; i++ ) {
            this.children[ i ].draw();
        }
    };

    /**
     * Установить заданные символы на барабанах.
     */
    setSymbols( symbols ) {
        for ( let i = 0; i < this.children.length; ++i ) {
            this.children[ i ].setSymbols( symbols[i] );
        }
    }

    setStoppedSymbols( symbols ) {
        for ( let i = 0; i < 5; i++ ) {
            this.children[ i ].setStoppedSymbols( symbols[ i ] );
        }
    }

    /**
     * Начать вращение барабанов.
     */
    startRotate() {
        if ( ! this.rotated ) {
            Log.out( 'Start rotate' );
            this.rotated = true;
            for ( let i = 0; i < 5; i++ ) {
                this.children[ i ].startRotate();
            }
            this.emit( 'rotationStarted' );
        }
    }

    /**
     * Остановить вращение барабанов.
     *
     * @param {array} sumbols массив символов, которые должны быть на барабанах
     * после останова
     */
    stopRotate( symbols = null ) {
        if ( this.rotated ) {

            Log.out( 'Stop rotate' );

            // Установить символы останова
            if ( symbols ) {
                this.setStoppedSymbols( symbols );
            }

            this.stoppedTime = [
                Date.now(), 0, 0, 0, 0
            ];

            // Остановить 0-ой барабан

            this.children[ 0 ].stopRotate();
        }
    }

    findScatter( reelIndex, scatter ) {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel = reelBox.children[ reelIndex ];
        for ( let i = 0; i < 3; ++i ) {
            let symbol = reel.stoppedSymbol( i );
            if ( symbol === scatter ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Обработка изменения состояния барабанов.
     *
     * @param {int} index индекс барабана
     * @param {Reel.State} state новое состояние. См. Reel.State.
     */
    onReelStateChanged( params ) {

        let index = params.index;
        let state = params.state;

        Log.out( 'Reel ' + index + ' state changed to ' + state );

        let game = Game.instance();
        let reelBox = game.reelBox;

        if ( state === Reel.State.SLOWDOWN ) {

            // Проиграть мелодию для скаттер-символа
            if ( index == 0 && reelBox.findScatter( 0, game.symbols.scatter.first ) ) {
                game.startPlay( "origin/teaser1" );
            }
            else if ( index == 4 && reelBox.findScatter( 4, game.symbols.scatter.last ) ) {
                if ( reelBox.findScatter( 0, game.symbols.scatter.first ) ) {
                    game.startPlay( "origin/teaser2" );
                }
            }
        }

        if ( state === Reel.State.RETURN ) {

            // после бампинга проиграть звук останова
            game.startPlay( 'reelstop' );
        }

        if ( index < 4 ) {  // для барабанов с 1-го по 4-ый

            if ( state == Reel.State.SLOWDOWN ) {   // началось замедление барабана
                if ( index == 0 ) {
                    game.addTiker( reelBox.slowdownHandler );
                }
            }
        }
        else {              // для 5-го барабана

            if ( state == Reel.State.STOPPED ) {

                // Полный останов последнего барабана

                Log.out( 'All reels are stopped' );
                game.removeTiker( reelBox.slowdownHandler );
                reelBox.rotated = false;
                reelBox.emit( 'rotationStopped' );
            }
        }
    }

    /**
     * Обработчик замедления барабанов.
     */
    slowdownHandler() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        for ( let i = 0; i < 4; ++i ) {

            let stoppedTime = reelBox.stoppedTime[ i ];
            if ( stoppedTime != 0 ) {  // задано время начала замедления
                let now = Date.now();
                if ( now - stoppedTime >= 300 ) {

                    // Остановить следующий барабан

                    reelBox.stoppedTime[ i ] = 0;
                    reelBox.stoppedTime[ i + 1 ] = now;
                    reelBox.children[ i + 1 ].stopRotate();
                }
            }
        }
    }
}

