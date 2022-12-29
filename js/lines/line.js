/**
 * Игровая линия.
 */

class Line extends GameItem {

    /**
     * Тип линии 1
     *
     * Форма:   ----------------------
     */
    static TYPE_1 = 1;

    /**
     * Тип линии 2
     *
     * Форма:   ---+    +---
     *              \  /
     *               \/
     */
    static TYPE_2 = 2;

    /**
     * Тип линии 3
     *
     * Форма:        /\
     *              /  \
     *          ---+    +---
     */
    static TYPE_3 = 3;

    /**
     * Тип линии 4
     *
     * Форма:   ---+        +---
     *              \      /
     *               +----+
     */
    static TYPE_4 = 4;

    /**
     * Тип линии 5
     *
     * Форма:        +----+
     *              /      \
     *          ---+        +---
     */
    static TYPE_5 = 5;

    /**
     * Тип линии 6
     *
     * Форма:          +-----
     *                /
     *          -----+
     */
    static TYPE_6 = 6;

    /**
     * Тип линии 7
     *
     * Форма:   -----+
     *                \
     *                 +-----
     */
    static TYPE_7 = 7;

    /**
     * Тип линии 6
     *
     * Форма:                  +-----
     *                        /
     *                 +-----+
     *                /
     *          -----+
     */
    static TYPE_8 = 8;

    options;

    /** Объект PIXI для отрисовки игровой линии */
    pixiGraphics;

    /** Флаг видимости игровой линии */
    lineVisible;

    /** Уровень прозрачности: 1 - полностью видна, 0 - полностью не видна */
    lineAlpha = 1;

    winSymbolCount;     // число выигравших символов в линии
    winAmount;          // сумма выигрыша
    winObjects;         // массив объектов выигрышных символов

    constructor( parent, options ) {
        super( parent );
        this.options = options;

        // 0-ый элемент - номер линии слева
        let imgOptions = Tools.clone( options.left );
        imgOptions.urls = options.urls;
        new ImageItem( this, imgOptions );

        // 1-ый элемент - номер линии справа
        imgOptions = Tools.clone( options.right );
        imgOptions.urls = options.urls;
        new ImageItem( this, imgOptions );

        // 2-ой элемент - графическая форма линии
        this.pixiGraphics = new PIXI.Graphics();
        this.pixiObj.addChild( this.pixiGraphics );

        this.lineVisible = false;
        this.winSymbolCount = 0;
        this.winAmount = 0;
        this.winObjects = [];
    }

    scale() {
        return this.parent.scale();
    }

    pos() {
        return Game.instance().background.pos();
    }

    size() {
        return Game.instance().background.size();
    }

    setLineVisible( state ) {
        this.lineVisible = state;
        if ( state ) this.lineAlpha = 1.0;
        this.draw();
    }

    /**
     * Скрыть линию с затуханием.
     *
     * @param {type} msec время затухания в миллисекундах
     */
    startFaiding( msec = 2000 ) {
        if ( msec <= 0 ) msec = 1000;
        this.lineAlpha = 1.0;
        let timerId = setInterval( ( line )=>{
            line.lineAlpha -= 1.0 / 100;
            if ( line.lineAlpha < 0 ) {
                clearInterval( timerId );
                line.setLineVisible( false );
                return;
            }
            line.draw();
        }, msec / 100, this );
    }

    /**
     * Показать выигрыш по линии.
     *
     * @param {array} winData массив [<число символов>, <сумма выигрыша>]
     */

    showWin( winData ) {
        let form = this.options.form;   // форма линии в позициях символов (от 0 до 2)
        if ( this.winObjects.length == 0 ) {

            Log.out( 'Create symbols for win line' );

            this.winSymbolCount = winData[ 0 ];
            this.winAmount = winData[ 1 ];
            this.winObjects = [];

            // Цикл по символам, слева направо

            for ( let r = 0; r < this.winSymbolCount; ++r ) {

                // Создать рамку с анимированным символом

                let box = new WinBox( this, {
                    reel: r,
                    pos: form[ r ],
                    color: this.options.color,
                    amount: ( r == 0 ) ? this.winAmount : 0
                });
                this.winObjects.push( box );
            }
        }
        else {

            Log.out( 'Update symbols for win line' );

            // Восстановить параметры выигрышных символов

            for ( let i = 0; i < this.winObjects.length; ++i ) {
                let winBox = this.winObjects[ i ];
                winBox.options.reel = i;
                winBox.options.pos = form[ i ];
                winBox.amount = ( i == 0 ) ? this.winAmount : 0;
                winBox.setVisible( true );
            }
        }
        this.setLineVisible( true );
    }

    /**
     * Скрыть выигрыш по линии.
     */
    hideWin() {
        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.setVisible( false );
        }
        this.setLineVisible( false );
    }

    clearWin() {
        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.destroy();
        }
        this.winObjects = [];
        this.winSymbolCount = 0;
        this.winAmount = 0;
        this.setLineVisible( false );
    }

    /**
     * Показать выигрыш по линии с символом расширения.
     *
     * @param {object} params параметры отрисовки:
     * reels - массив номеров барабанов (от 1 до 5)
     * win - сумма выигрыша
     */

    showExtraWin( params ) {

        this.clearWin();

        let form = this.options.form;   // форма линии в позициях символов (от 0 до 2)

        this.winSymbolCount = params.reels.length;
        this.winAmount = params.win;

        for ( let i = 0; i < this.winSymbolCount; ++i ) {

            let r = params.reels[ i ] - 1;

            // Создать рамку с анимированным символом

            let box = new WinBox( this, {
                symbol: ( params.symbol ) ? params.symbol : null,
                reel: r,
                pos: form[ r ],
                color: this.options.color,
                amount: ( i == 0 ) ? this.winAmount : 0
            });
            this.winObjects.push( box );
        }

        this.setLineVisible( true );
    }

    /**
     * Отрисовка линии.
     */
    draw() {
        let game = Game.instance();

        let imageItem = this.children[0];
        imageItem.options.x = game.isVertical() ? this.options.left.vertical.x : this.options.left.horizontal.x;
        imageItem.options.y = game.isVertical() ? this.options.left.vertical.y : this.options.left.horizontal.y;
        imageItem.draw();

        imageItem = this.children[1];
        imageItem.options.x = game.isVertical() ? this.options.right.vertical.x : this.options.right.horizontal.x;
        imageItem.options.y = game.isVertical() ? this.options.right.vertical.y : this.options.right.horizontal.y;
        imageItem.draw();

        // Отрисовать форму линии

        switch ( this.options.type ) {
            case Line.TYPE_1:
                this.drawLineType1();
                break;
            case Line.TYPE_2:
                this.drawLineType2();
                break;
            case Line.TYPE_3:
                this.drawLineType3();
                break;
            case Line.TYPE_4:
                this.drawLineType4();
                break;
            case Line.TYPE_5:
                this.drawLineType5();
                break;
            case Line.TYPE_6:
                this.drawLineType6();
                break;
            case Line.TYPE_7:
                this.drawLineType7();
                break;
            case Line.TYPE_8:
                this.drawLineType8();
                break;
        }

        // Отрисовать выигрышные символы и рамки

        for ( let i = 0; i < this.winObjects.length; ++i ) {
            let object = this.winObjects[ i ];
            object.draw();
        }
    }

    //==========================================================================

    drawLineType1() {
        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;
        this.drawLine([
            { x: leftImage.x + leftImage.width - 1, y: leftImage.y + leftImage.height / 2 },
            { x: rightImage.x,                      y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLineType2() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel0 = reelBox.children[0];
        let reel2 = reelBox.children[2];
        let reel4 = reelBox.children[4];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,      y: leftImage.y + leftImage.height / 2 },
            { x: reel0.pos().x + reel0.size().width / 2, y: leftImage.y + leftImage.height / 2 },
            { x: reel2.pos().x + reel2.size().width / 2, y: reel2.pos().y + reel2.size().height * 5 /6 },
            { x: reel4.pos().x + reel4.size().width / 2, y: leftImage.y + leftImage.height / 2 },
            { x: rightImage.x,                           y: leftImage.y + leftImage.height / 2 }
        ]);
    }

    drawLineType3() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel0 = reelBox.children[0];
        let reel2 = reelBox.children[2];
        let reel4 = reelBox.children[4];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,      y: leftImage.y + leftImage.height / 2 },
            { x: reel0.pos().x + reel0.size().width / 2, y: leftImage.y + leftImage.height / 2 },
            { x: reel2.pos().x + reel2.size().width / 2, y: reel2.pos().y + reel2.size().width / 2 },
            { x: reel4.pos().x + reel4.size().width / 2, y: leftImage.y + leftImage.height / 2 },
            { x: rightImage.x,                           y: leftImage.y + leftImage.height / 2 }
        ]);
    }

    drawLineType4() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel0 = reelBox.children[0];
        let reel1 = reelBox.children[1];
        let reel3 = reelBox.children[3];
        let reel4 = reelBox.children[4];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,        y: leftImage.y + leftImage.height / 2 },
            { x: reel0.pos().x + reel0.size().width / 5,   y: leftImage.y + leftImage.height / 2 },
            { x: reel1.pos().x + reel1.size().width / 2,   y: reel1.pos().y + reel1.size().height * 0.82 },
            { x: reel3.pos().x + reel3.size().width / 2,   y: reel3.pos().y + reel3.size().height * 0.82 },
            { x: reel4.pos().x + reel4.size().width * 0.8, y: rightImage.y + rightImage.height / 2 },
            { x: rightImage.x,                             y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLineType5() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel0 = reelBox.children[0];
        let reel1 = reelBox.children[1];
        let reel3 = reelBox.children[3];
        let reel4 = reelBox.children[4];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,        y: leftImage.y + leftImage.height / 2 },
            { x: reel0.pos().x + reel0.size().width / 5,   y: leftImage.y + leftImage.height / 2 },
            { x: reel1.pos().x + reel1.size().width / 2,   y: reel1.pos().y + reel1.size().height * 0.18 },
            { x: reel3.pos().x + reel3.size().width / 2,   y: reel3.pos().y + reel3.size().height * 0.18 },
            { x: reel4.pos().x + reel4.size().width * 0.8, y: rightImage.y + rightImage.height / 2 },
            { x: rightImage.x,                             y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLineType6() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel1 = reelBox.children[1];
        let reel3 = reelBox.children[3];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,  y: leftImage.y + leftImage.height / 2 },
            { x: reel1.pos().x + reel1.size().width, y: leftImage.y + leftImage.height / 2 },
            { x: reel3.pos().x,                      y: rightImage.y + rightImage.height / 2 },
            { x: rightImage.x,                       y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLineType7() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel1 = reelBox.children[1];
        let reel3 = reelBox.children[3];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,  y: leftImage.y + leftImage.height / 2 },
            { x: reel1.pos().x + reel1.size().width, y: leftImage.y + leftImage.height / 2 },
            { x: reel3.pos().x,                      y: rightImage.y + rightImage.height / 2 },
            { x: rightImage.x,                       y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLineType8() {
        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel0 = reelBox.children[0];
        let reel1 = reelBox.children[1];
        let reel3 = reelBox.children[3];
        let reel4 = reelBox.children[4];

        let leftImage = this.children[0].imageSprite;
        let rightImage = this.children[1].imageSprite;

        this.drawLine([
            { x: leftImage.x + leftImage.width - 1,             y: leftImage.y + leftImage.height / 2 },
            { x: reel0.pos().x + reel0.size().width * 0.95 / 3, y: leftImage.y + leftImage.height / 2 },
            { x: reel1.pos().x + reel1.size().width * 1.9 / 3,  y: reel1.pos().y + reel1.size().height * 5.2 / 10 },
            { x: reel3.pos().x + reel3.size().width * 1.5 / 6,  y: reel3.pos().y + reel3.size().height * 5.2 / 10 },
            { x: reel4.pos().x + reel4.size().width * 2.1 / 3,  y: rightImage.y + rightImage.height / 2 },
            { x: rightImage.x,                                  y: rightImage.y + rightImage.height / 2 }
        ]);
    }

    drawLine( points ) {
        this.pixiGraphics.clear();
        if ( this.lineVisible ) {
            let game = Game.instance();
            let color = this.options.color;
            this.pixiGraphics
                .lineStyle({
                    width: game.isVertical() ? 3 : 4,
                    color: color,
                    alpha: this.lineAlpha
                })
                .moveTo( points[0].x, points[0].y );
            for ( let i = 1; i < points.length; ++i ) {
                this.pixiGraphics.lineTo( points[i].x, points[i].y );
            }
        }
    }
}
