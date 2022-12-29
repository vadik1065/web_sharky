/**
 * Базовый класс для окон разного типа.
 */

class Window extends GameItem {

    /** Объект рамки окна - PIXI.Graphics */
    border;

    /**
     * Родительское окно.
     *
     * Если равно null, родительским окном, условно, является фоновая картинка игры.
     * Иначе - другое родительское окно.
     */
    parent;

    /**
     * Настройки окна.
     */
    options;

    x;
    y;
    width;
    height;

    /** Флаг выбора/выделения */
    selected;

    /**
     * Конструктор окна.
     *
     * Окно создается невидимым.
     *
     * @param {object} options настройка диалогового окна. Содержит свойства:
     * {
     *      "x":  70,
     *      "y": 150,
     *      "width":  340,
     *      "height":  420,
     *      "align": "center" | "centerX" | "centerY"  - необязательное
     *      "fill": "0x303030",             - цвет фона окна
     *      "interactive": true | false,    - необязательное
     *      "border": {
     *          "width": 1,                 - толщина рамки окна
     *          "color": "0xFFFFFF",        - цвет рамки окна
     *          "radius": 7                 - радиус закругления
     *      }
     * }
     *
     * @returns {Window}
     */
    constructor( parent, options ) {

        super();

        this.selected = false;
        if ( parent != null ) {
            parent.addChild( this );
        }
        this.parent = parent;
        this.children = [];
        this.options = Tools.clone( options );

        let game = Game.instance();
        let o = this.options;
        if ( game.isVertical() ) {
            if ( this.options.vertical ) o = this.options.vertical
        }
        else {
            if ( this.options.horizontal ) o = this.options.horizontal;
        }

        let border = new PIXI.Graphics;
        border.interactive = o.interactive ? o.interactive : false;
        if ( border.interactive ) {
            border.buttonMode = true;
            border.on('pointerdown', ()=>{
                if ( this.enabled && this.visible ) {
                    Log.out( 'Click on window' );
                    this.emit( 'click', { window: this } );
                }
            });
        }
        this.border = border;
        this.pixiObj.addChild( border );

        this.visible = false;
    }

    child( index ) {
        if ( index < 0 || this.children.length <= index ) {
            return null;
        }
        return this.children[ index ];
    }

    isSelected() {
        return this.selected;
    }

    setSelected( state ) {
        this.selected = state;
        this.draw();
    }

    setEnabled( state ) {
        super.setEnabled( state );
        if ( this.options.interactive ) {
            this.border.interactive = state;
            this.border.buttonMode = state;
        }
    }

    draw() {

        let game = Game.instance();
        let scale = this.parent.scale();

        let options = this.options;
        if ( game.isVertical() ) {
            if ( this.options.vertical ) options = this.options.vertical
        }
        else {
            if ( this.options.horizontal ) options = this.options.horizontal;
        }

        let border = this.border;
        border.clear();
        border.interactive = options.interactive;

        border.lineStyle({
            width: options.border.width,
            color: options.border.color
        });

        let parentPos = this.parent.pos();
        let parentSize = this.parent.size();
        this.width = options.width * scale.x;
        this.height = options.height * scale.y;
        this.x = parentPos.x + ( ( options.align == 'center' || options.align == 'centerX' ) ? ( parentSize.width - this.width ) / 2 : scale.x * options.x );
        this.y = parentPos.y + ( ( options.align == 'center' || options.align == 'centerY' ) ? ( parentSize.height - this.height ) / 2 : scale.y * options.y );

        border.beginFill( this.selected ? options.selected.fill : options.fill );
        border.drawRoundedRect(
            this.x,
            this.y,
            this.width,
            this.height,
            options.border.radius
        );
        border.endFill();

        let cnt = this.children.length;
        for ( let i = 0; i < cnt; ++i ) {
            this.children[ i ].draw();
        }
    }

    scale() {
        return this.parent.scale();
    }

    /**
     * Получить реальный размер окна.
     * @returns Возвращает объект с двумя свойствами - width и height.
     */
    size() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Получить реальную позицию (координаты левого верхнего угла) окна.
     */
    pos() {
        return {
            x: this.x,
            y: this.y
        };
    }
}

