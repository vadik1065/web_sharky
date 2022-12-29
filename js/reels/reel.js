/**
 * Одиночный барабан.
 *
 * Формирует события:
 *
 * 'stateChanged' - при измененити состояния барабана
 */

class Reel extends GameItem {

    static State = {
        ROTATION:       'rotation',     // процесс вращения
        SLOWDOWN:       'slowdown',     // торможение - начальная фаза останова
        BUMPING:        'bumping',      // бампинг - движение барабана ниже нижней границы
        RETURN:         'return',       // возвращение в нормальное положение
        STOPPED:        'stopped'       // вращение остановлено
    };

    index;              // индекс данного барабана в группе барабанов

    symbols;            // массив спрайтов символов

    blur;

    rotateState;        // текущее состояние вращения барабана

    rotateStep;         // текущий шаг сдвига при вращении

    rotateContext;      // контекст для метода rotate()

    stepDelta;          // шаг замедления

    realSymbolCount;    // количество реальных подставленных символов

    stateCallback;      // слушатель изменения состояния

    stoppedSymbols;     // массив символов останова

    constructor( parent, index ) {

        super( parent );

        this.index = index;
        this.rotateState = Reel.State.STOPPED;
        this.rotateContext = { reel: this };

        let game = Game.instance();
        let symbolSize = game.isVertical() ? game.symbols.size.vertical : game.symbols.size.horizontal;
        let scale = game.scale();
        let reelPos = game.isVertical() ? game.reelDef.pos.vertical : game.reelDef.pos.horizontal;
        let bkgPos = game.background.pos();

        // Маска для обрезания 3-х нижних символов

        const rect = new PIXI.Graphics();
        rect.beginFill(0);
        rect.drawRect(
            bkgPos.x + reelPos[ index ].x * scale.x,
            bkgPos.y + reelPos[ index ].y * scale.y,
            symbolSize.width * scale.x,
            3 * symbolSize.height * scale.y
        );
        rect.endFill();

        // Контейнер символов барабана

        const rc = this.pixiObj;
        rc.x = bkgPos.x + reelPos[ index ].x * scale.x;
        rc.y = bkgPos.y + reelPos[ index ].y * scale.y;
        rc.width = symbolSize.width * scale.x;
        rc.height = 3 * symbolSize.height * scale.y;
        rc.mask = rect;

        // Символы барабана.
        // В контейнере находятся 4-е символа:
        // - один, самый верхний, расположен за пределами области отображения
        // - три символа видимы
        // Сейчас расположены случайным образом.
        //
        // TODO: заменить на расположение, полученное от сервера

        this.symbols = [];
        for ( let j = -1; j < 3; j++ ) {

            // Спрайт символа

            let symbolIndex = Math.floor( Math.random() * parent.symbolCount );
            let symbol = new PIXI.Sprite( parent.symbols[ symbolIndex ] );
            this.symbols.push( symbol );

            // Рассчитать расположение и размер символа

            symbol.x = 0;
            symbol.y = symbolSize.height * j * scale.y;
            symbol.width = symbolSize.width * scale.x;
            symbol.height = symbolSize.height * scale.y;

            rc.addChild( symbol );
        }
    }

    /**
     * Обновить текстуры символов.
     */
    update() {
        let reelBox = this.parent;
        let rc = this.pixiObj;
        for ( let j = 0; j < 4; j++ ) {
            const symbol = rc.children[ j ];
            let symbolIndex = 0;
            if ( j == 0 || this.stoppedSymbols == null ) {
                symbolIndex = Math.floor( Math.random() * reelBox.symbolCount );
            }
            else {  // j >= 1
                // Подставить символы останова
                symbolIndex = this.stoppedSymbols[ 3 - j ];
            }
            symbol.texture = reelBox.symbols[ symbolIndex ];
        }
    }

    /**
     * Обновить положение и размеры барабана.
     */
    draw() {
        let game = Game.instance();
        let symbolSize = game.isVertical() ? game.symbols.size.vertical : game.symbols.size.horizontal;
        let scale = game.scale();
        let bkgPos = game.background.pos();
        let reelPos = game.isVertical() ? game.reelDef.pos.vertical : game.reelDef.pos.horizontal;

        let rc = this.pixiObj;
        rc.mask.destroy();

        const rect = new PIXI.Graphics();
        rect.beginFill(0);
        rect.drawRect(
            bkgPos.x + reelPos[ this.index ].x * scale.x,
            bkgPos.y + reelPos[ this.index ].y * scale.y,
            symbolSize.width * scale.x,
            3 * symbolSize.height * scale.y
        );
        rect.endFill();
        rc.mask = rect;
        rc.x = bkgPos.x + reelPos[ this.index ].x * scale.x;
        rc.y = bkgPos.y + reelPos[ this.index ].y * scale.y;

        for ( let j = 0; j < 4; j++ ) {

            // Обновить положение и размер символа

            const symbol = rc.children[ j ];
            symbol.x = 0;
            symbol.y = symbolSize.height * (j - 1) * scale.y;
            symbol.width = symbolSize.width * scale.x;
            symbol.height = symbolSize.height * scale.y;
        }
    }

    pos() {
        return {
            x: this.pixiObj.x,
            y: this.pixiObj.y,
        }
    }

    size() {
        let game = Game.instance();
        let symbolSize = game.isVertical() ? game.symbols.size.vertical : game.symbols.size.horizontal;
        let scale = game.scale();
        return {
            width: symbolSize.width * scale.x,
            height: 3 * symbolSize.height * scale.y,
        }
    }

    symbolPos( index ) {
        return {
            x: this.pixiObj.x,
            y: this.pixiObj.y + this.pixiObj.width * index,
        }
    }

    symbolSize() {
        return {
            width: this.pixiObj.width,
            height: this.pixiObj.width,
        }
    }

    /**
     * Установить заданные символы на барабанах.
     */
    setSymbols( symbols ) {
        for ( let i = 0; i < 3; ++i ) {
            this.symbols[ i + 1 ].texture = this.parent.symbols[ symbols[i] - 1 ];
        }
    }

    /**
     * Начать вращение барабана.
     */
    startRotate() {
        let game = Game.instance();
        this.rotateStep = 1.0 * game.reelDef.rotateStep;
        this.rotateState = Reel.State.ROTATION;
        this.stepDelta = this.rotateStep / 100.0;
        this.realSymbolCount = 0;
        this.stoppedSymbols = null;
        Log.out( 'Start rotate reel ' + this.index );
        Game.instance().addTiker( this.rotate, this.rotateContext );
        this.emit( 'stateChanged', { 'index': this.index, 'state': this.rotateState } );
    }

    /**
     * Установить символы останова.
     */
    setStoppedSymbols( symbols ) {
        this.stoppedSymbols = symbols;
        Log.out( 'Reel ' + this.index + ' set stopped symbols ' + JSON.stringify( symbols ) );
    }

    stoppedSymbol( pos ) {
        return this.stoppedSymbols[ pos ];
    }

    /**
     * Остановить вращение барабанов.
     */
    stopRotate() {
        Log.out( 'Stop rotate reel ' + this.index );
        this.rotateState = Reel.State.SLOWDOWN;
        this.emit( 'stateChanged', { 'index': this.index, 'state': this.rotateState } );
    }

    /**
     * Метод отрисовки вращения барабана.
     * Вызывается по тикеру приложения.
     *
     * @param {int} delta интервал в миллисекундах от предыдущего вызова
     */
    rotate( delta ) {
        let game = Game.instance();
        let symbolSize = game.isVertical() ? game.symbols.size.vertical : game.symbols.size.horizontal;
        let scale = game.scale();
        let reelBox = game.reelBox;
        let reel = this.reel;   // текущий объект барабана типа Reel
//        Log.out( 'Rotate reel ' + reel.index + ' by step. Time ' + delta );

        let rc = reel.pixiObj;

        // Проверить позицию 0-го символа

        let symbol = rc.children[ 0 ];
        if ( symbol.y >= 0 ) {   // 0-й символ уже в позиции 1-го символа

            // Символы со 2-го по 0-ой опустить вниз на 1 символ

            for ( let j = 3; j > 0; --j ) {
                let sym = rc.children[ j ];
                sym.texture = rc.children[ j - 1 ].texture;
                sym.y = symbolSize.height * (j - 1) * scale.y;
            }

            // Обновить 0-й символ

            symbol.y = -symbolSize.height * scale.y;
            if ( reel.rotateState == Reel.State.SLOWDOWN && reel.realSymbolCount < 3 ) {
                reel.realSymbolCount += 1;
                let symbolIndex = 0;
                if ( reel.stoppedSymbols ) {
                    // Подставить символ останова
                    symbolIndex = reel.stoppedSymbols[ 3 - reel.realSymbolCount ] - 1
                }
                else {
                    symbolIndex = Math.floor( Math.random() * reelBox.symbolCount );
                }
                symbol.texture = reelBox.symbols[ symbolIndex ];
            }
            else {
                symbol.texture = reelBox.symbols[ Math.floor( Math.random() * reelBox.symbolCount ) ];
                if ( reel.rotateState != Reel.State.BUMPING ) {
                    reel.rotateState = Reel.State.BUMPING;
                    reel.emit( 'stateChanged', { 'index': reel.index, 'state': reel.rotateState } );
                }
            }
        }
        else if ( reel.rotateState == Reel.State.BUMPING && reel.realSymbolCount == 3 && symbol.y >= -( symbolSize.height - reel.rotateStep ) * scale.y ) {
            reel.rotateState = Reel.State.RETURN;
            reel.emit( 'stateChanged', { 'index': reel.index, 'state': reel.rotateState } );
        }
        else if ( reel.rotateState == Reel.State.RETURN && symbol.y <= -symbolSize.height * scale.y ) {
            Log.out( 'Reel ' + reel.index + ' stopped' );
            reel.rotateState = Reel.State.STOPPED;
            reel.emit( 'stateChanged', { 'index': reel.index, 'state': reel.rotateState } );
            game.removeTiker( reel.rotate, reel.rotateContext );
            return;
        }

        let step = -1;
        if ( reel.rotateState != Reel.State.RETURN ) {

            // Сдвинуть все символы вниз на заданный шаг

            step = reel.rotateStep * scale.y;
            if ( step < 1 ) {
                step = 1;
            }
        }
        for ( let j = 0; j < 4; j++ ) {
            const symbol = rc.children[ j ];
            symbol.y += step;
        }
    }
}
