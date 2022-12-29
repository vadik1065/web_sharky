/**
 * Базовый класс для объектов изображений.
 *
 * Содержит спрайт для отрисовки изображения и два набора текстур - для вертикальной
 * и горизонтальной ориентации окна.
 */

class ImageItem extends GameItem {

    /** Спрайт для отрисовки изображения */
    imageSprite;

    /** Массив текстур изображения для горизонтальной ориентации окна */
    textureH;

    /** Массив текстур изображения для вертикальной ориентации окна */
    textureV;

    /** Индекс текущей текстуры при отрисовке элемента */
    textureIndex;

    /**
     * Параметры изображения:
     *
     * x
     * y
     * width
     * height
     *
     * адреса загрузки картинок:
     *      vertical: urls
     *      horizontal: urls
     * или
     *      urls
     */
    options;

    /**
     * Конструктор.
     *
     * @returns {ImageItem}
     */
    constructor( parent, options ) {

        super( parent );
        this.textureIndex = 0;
        this.imageSprite = new PIXI.Sprite();
        this.pixiObj.addChild( this.imageSprite );
        this.update( options );
    }

    /**
     * Обновить картинку элемента.
     *
     * @param {object} options
     */
    update( options ) {
        this.options = Tools.clone( options );

        if ( options.urls != undefined ) {
            let urls = options.urls;
            this.textureH = [];
            this.textureV = [];
            for ( let i = 0; i < urls.length; ++i ) {
                if ( urls[i] != '' ) {
                    this.textureH.push( PIXI.Texture.from( urls[i] ) );
                    this.textureV.push( PIXI.Texture.from( urls[i] ) );
                }
                else {
                    this.textureH.push( null );
                    this.textureV.push( null );
                }
            }
        }
        else {
            let urls = options.horizontal.urls;
            this.textureH = [];
            for ( let i = 0; i < urls.length; ++i ) {
                this.textureH.push( ( urls[i] != '' ) ? PIXI.Texture.from( urls[i] ) : null );
            }
            urls = options.vertical.urls;
            this.textureV = [];
            for ( let i = 0; i < urls.length; ++i ) {
                this.textureV.push( ( urls[i] != '' ) ? PIXI.Texture.from( urls[i] ) : null );
            }
        }

        let game = Game.instance();
        this.imageSprite.texture = game.isVertical() ? this.textureV[ this.textureIndex ] : this.textureH[ this.textureIndex ];
    }

    /**
     * Отрисовка.
     */
    draw() {
        let game = Game.instance();
        let scale = this.parent.scale();
        let parentPos = this.parent.pos();

        let options = ( this.options.vertical != undefined )
            ? ( game.isVertical() ? this.options.vertical : this.options.horizontal )
            : this.options;

        let img = this.imageSprite;
        img.texture = Game.instance().isVertical() ? this.textureV[ this.textureIndex ] : this.textureH[ this.textureIndex ];
        img.x = parentPos.x + options.x * scale.x;
        img.y = parentPos.y + options.y * scale.y;
        img.width = options.width * scale.x;
        img.height = options.height * scale.y;
        super.draw();
    }

    scale() {
        return this.parent.scale();
    }

    /**
     * Получить реальный размер фоновой картинки.
     * @returns Возвращает объект с двумя свойствами - width и height.
     */
    size() {
        return {
            width: this.imageSprite.width,
            height: this.imageSprite.height
        };
    }

    /**
     * Получить реальную позицию (координаты левого верхнего угла) фоновой
     * картинки на сцене.
     */
    pos() {
        return {
            x: this.imageSprite.x,
            y: this.imageSprite.y
        };
    }
}
