/**
 * Контейнер игровых линий.
 */

class LineBox extends GameItem {

    /**
     * Интервал перехода к следующей выигрышной линии.
     * Время задается в миллисекундах.
     */
    static NEXT_LINE_INTERVAL = 990;

    /** Интервал выкладывания следующего символа расширения */
    static NEXT_SYMBOL_INTERVAL = 200;

    /** Интервал показа следующей линии по символу расширения */
    static EXTRA_LINE_INTERVAL = 500;

    scatterLine;        // объект линии по скаттер-символам

    bonusLine;          // объект линии из скаттер-символов бонус-игры

    winLines;           // описание выигрышных линий
    winLineNums;        // массив номеров линий (в формате строк)
    winLineIndex;       // индекс текущей выигрышной линии в массиве номеров

    firstWinCycle;      // флаг первого цикла показа выигрышных линий

    netxLineTimer;      // идентификатор таймера показа следующей выигрышной линии

    lineShowStopped;    // флаг останова показа линий

    constructor( parent ) {
        super( parent );

        this.winLines = null;
        this.winLineNums = [];
        this.winLineIndex = 0;
        this.firstWinCycle = false;
        this.nextLineTimer = 0;
        this.animatedSymbols = [];
        this.lineShowStopped = true;

        let game = Game.instance();

        let lineKeys = Object.keys( game.lines );
        for ( let i = 0; i < lineKeys.length; ++i ) {
            new Line( this, game.lines[ lineKeys[i] ] );
        }

        this.scatterLine = new ScatterLine( this, {
            symbolId: game.symbols.scatter.id,
            color: game.symbols.scatter.color,
        });

        this.bonusLine = new BonusLine( this, {
            first: game.symbols.scatter.first,
            last: game.symbols.scatter.last,
            color: game.symbols.scatter.color,
        });
    }

    scale() {
        return this.parent.scale();
    }

    /**
     * Выбрать заданное число линий.
     */
    selectLines( count ) {

        let lineKeys = Object.keys( Game.instance().lines );
        for ( let i = 0; i < lineKeys.length; ++i ) {
            this.children[i].setVisible( i < count );
        }
    }

    /**
     * Показать выбранное число линий.
     */
    showLines() {
        let lineKeys = Object.keys( Game.instance().lines );
        for ( let i = 0; i < lineKeys.length; ++i ) {
            let line = this.children[i];
            if ( line.visible ) {
                line.setLineVisible( true );
            }
        }
    }

    /**
     * Скрыть линии.
     */
    hideLines() {
        let lineKeys = Object.keys( Game.instance().lines );
        for ( let i = 0; i < lineKeys.length; ++i ) {
            let line = this.children[i];
            if ( line.visible ) {
//                line.setLineVisible( false );
                line.startFaiding();
            }
        }
    }

    //==========================================================================
    //  Обработка выигрышных линий
    //==========================================================================

    /**
     * Начать показ выигрышных линий.
     *
     * @param {object} winLines описание выигрышных линий
     * Пример:
     *  {
     *      "1": [ 4, 25000 ],
     *      "6": [ 3, 5000 ],
     *      "7": [ 3, 5000 ]
     *  }
     *  Ключ - номер линии в символьном виде. Значение "100" - выигрыш по
     *  скаттер-символам и начало бонус-игры.
     *  Значение - массив [<число символов>, <сумма выигрыша>]
     */

    startShowWinLines( winLines ) {
        this.winLines = winLines;
        this.winLineNums = Object.keys( this.winLines );
        this.firstWinCycle = true;
        this.winLineIndex = 0;
        this.lineShowStopped = false;
        this.showWinLine();
    }

    /**
     * Продолжить показ выигрышных линий после останова.
     */
    continueShowWinLines() {
        this.firstWinCycle = false;
        this.winLineIndex = 0;
        this.lineShowStopped = false;
        this.showWinLine();
    }

    /**
     * Покзать текущую выигрышную линию.
     */
    showWinLine() {

        if ( this.winLineIndex == this.winLineNums.length ) {   // показали все линии
            this.winLineIndex = 0;
            if ( this.firstWinCycle ) {    // закончился первый цикл показа линий
                this.firstWinCycle = false;
                this.emit( 'firstWinCycleFinished' );
                return;
            }
        }

        // Показать выигрыш по текущей линии

        let num = this.winLineNums[ this.winLineIndex ];    // номер линии от 1 в виде строки
        if ( num == '100' ) {       // выпали обычные скаттер-символы
            this.scatterLine.showWin( this.winLines[ num ] );
        }
        else if ( num == '101' ) {  // выпали скаттер-символы бонус-игры
            this.bonusLine.showWin( this.winLines[ num ] );
        }
        else {                      // выигрыш по линии
            let index =this.animatedSymbols.length + parseInt( num ) - 1;
            this.children[ index ].showWin( this.winLines[ num ] );
        }

        if ( this.firstWinCycle ) {    // в первом цикле показа линий

            // Возбудить событие "Показана выигрышная линия".
            // Обработчик события должен через нужное время вызвать метод onNextLine().

            this.emit( 'winLineIsShown', {
                'line': num,                    // номер линии
                'win':  this.winLines[ num ]    // сумма выигрыша
            });
        }
        else {                      // второй и последующий циклы

            // Запустить таймер перехода к следующей линии

            this.nextLineTimer = setTimeout( this.onNextLine, LineBox.NEXT_LINE_INTERVAL, { self: this } );
        }
    }

    /**
     * Перейти к следующей выигрышной линии.
     *
     * @param {object} params параметры вызова:
     * 'lineBox' - ссылка на объект LineBox
     */
    onNextLine( params ) {
        let self = params.self;

        // Спрятать текущую линию

        let num = self.winLineNums[ self.winLineIndex ];    // номер линии от 1 в виде строки
        if ( num == '100' ) {       // выпали скаттер-символы
            self.scatterLine.hideWin();
        }
        else if ( num == '101' ) {  // выпали скаттер-символы
            self.bonusLine.hideWin();
        }
        else {                      // выигрыш по линии
            self.children[ parseInt( num ) - 1 ].hideWin();
        }

        // Перейти к следующей линии

        if ( ! self.lineShowStopped ) {
            ++self.winLineIndex;
            self.showWinLine();
        }
    }

    /**
     * Остановить показ выигрышных линий.
     */
    stopShowWinLines() {
        this.lineShowStopped = true;
        if ( this.nextLineTimer != 0 ) {
            clearTimeout( this.nextLineTimer );
            this.nextLineTimer = 0;
        }
        for ( let i = 0; i < this.winLineNums.length; ++i ) {
            let num = this.winLineNums[ i ];
            if ( num == '100' ) {
                this.scatterLine.clearWin();
            }
            else if ( num == '101' ) {
                this.bonusLine.clearWin();
            }
            else {
                this.children[ parseInt( num ) - 1 ].clearWin();
            }
        }
    }

    //==========================================================================
    //  Обработка выигрышных линий по символу расширения
    //==========================================================================

    extraSymbol;
    extraReels;

    animatedSymbols;    // массив анимированных символов расширения
    currentReelIndex;   // индекс текущего барабана в массиве extraReels
    surrentSymbolPos;   // индекс текущей позиции на текущем барабане

    /**
     * Начать показ линий по символу расширения.
     *
     * @param {type} extraSymbol номер (идентификатор) смивола рсширения
     * @param {type} extraReels массив номеров барабанов (от 1 до 5)
     * @param {type} extraLines список выигрышных линий
     */
    startShowExtraLines( params ) {

        this.extraSymbol = params.symbol;
        this.extraReels = Tools.clone( params.reels );
        this.extraReels.sort();

        this.winLines = params.winLines;

        // Начать выкладывание символов расширения на барабаны
        this.animatedSymbols = [];
        this.currentReelIndex = 0;
        this.surrentSymbolPos = 0;
        this.showNextExtraSymbol();
    }

    /**
     * Выложить анимированный символ расширения на барабан.
     */
    showNextExtraSymbol() {
        let game = Game.instance();
        let self = game.lineBox;
        let anime = new WinSymbol( self, {
            symbol: self.extraSymbol,
            reelIndex: self.extraReels[ self.currentReelIndex ] - 1,
            symbolPos: self.surrentSymbolPos,
        }, self.animatedSymbols.length );
        self.animatedSymbols.push( anime );

        // Показать символ и сыграть музыку
        anime.draw();
        game.startPlay( "ching" );

        if ( ++self.surrentSymbolPos > 2 ) {

            self.surrentSymbolPos = 0;
            if ( ++self.currentReelIndex >= self.extraReels.length ) {

                // Закончить выкладывание символов расширения на барабанах и
                // запустить показ линий по символу расширения
                self.winLineNums = Object.keys( self.winLines );
                self.firstWinCycle = true;
                self.winLineIndex = 0;
                self.showNextExtraLine();

                // Возбудить событие о начале показа линий
                this.emit( 'extraLinesShowStarted' );
                return;
            }
        }
        setTimeout( ()=>{ self.showNextExtraSymbol() }, LineBox.NEXT_SYMBOL_INTERVAL );
    }

    /**
     * Показать следующую линию по смиволу расширения.
     */
    showNextExtraLine() {

        if ( this.winLineIndex == this.winLineNums.length ) {   // показали все линии

            // Возбудить событие о завершении показа
            this.emit( 'extraLinesShowFinished' );
            return;
        }

        // Показать выигрыш по текущей линии

        let num = this.winLineNums[ this.winLineIndex ];    // номер линии от 1 в виде строки
        this.children[ parseInt( num ) - 1 ].showExtraWin( {
            symbol: this.extraSymbol,
            reels: this.extraReels,
            win: this.winLines[ num ][ 1 ],
        });

        // Возбудить событие "Показана выигрышная линия".
        // Обработчик события должен через нужное время вызвать метод onNextLine().

        this.emit( 'extraLineIsShown', {
            'line': num,                    // номер линии
            'win':  this.winLines[ num ]    // сумма выигрыша
        });

        // Запустить таймер перехода к следующей линии

//        this.nextLineTimer = setTimeout( this.onNextExtraLine, LineBox.EXTRA_LINE_INTERVAL, { self: this } );
    }

    /**
     * Перейти к следующей выигрышной линии по символу расширения.
     *
     * @param {object} params параметры вызова:
     * 'lineBox' - ссылка на объект LineBox
     */
    onNextExtraLine( params ) {

        Log.out( 'LineBox.onNextExtraLine()' );

        let self = params.self;

        // Спрятать текущую линию

        let num = self.winLineNums[ self.winLineIndex ];    // номер линии от 1 в виде строки
        self.children[ parseInt( num ) - 1 ].hideWin();

        // Перейти к следующей линии

        ++self.winLineIndex;
        self.showNextExtraLine();
    }

    /**
     * Остановить показ линий по символу расширения.
     */
    stopShowExtraLines() {
        this.stopShowWinLines();
        for ( let i = 0; i < this.animatedSymbols.length; ++i ) {
            let obj = this.animatedSymbols[ i ];
            this.pixiObj.removeChild( obj );
            obj.destroy();
        }
        this.animatedSymbols = [];
    }
}

