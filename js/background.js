/**
 * Основной фон игры.
 */

class Background extends ImageItem {

    bonusMode;

    constructor( parent ) {
        super( parent, Game.instance().images.bkg );
        this.bonusMode = false;
    }

    /**
     * Установить режим бонус-игры.
     *
     * @param {bool} bonus флаг бонус игры
     */
    setBonusMode( bonus ) {
        this.bonusMode = bonus;
        let game = Game.instance();
        this.update( bonus ? game.bonusDef.bkg : game.images.bkg );
        this.draw();
    }

    /**
     * Изменить размеры фоновой картинки соответственно текущим размерам окна.
     */
    draw() {

        let game = Game.instance();

        this.imageSprite.texture = game.isVertical() ? this.textureV[ this.textureIndex ] : this.textureH[ this.textureIndex ];

        // Описание исходной картинки фона

        let bkg = game.isVertical() ? game.images.bkg.vertical : game.images.bkg.horizontal;

        if ( bkg.width <= game.windowWidth ) {

            // Если ширина окна равна ширине картинки или больше, выводим полную картинку и
            // масштабируем на ширину окна

            Log.out( 'Scale game background' );
            this.imageSprite.x = 0;
            this.imageSprite.width = game.windowWidth;
            this.imageSprite.height = bkg.height * game.windowWidth / bkg.width;
        }
        else if ( bkg.minWidth < game.windowWidth && game.windowWidth < bkg.width ) {

            // Если ширина окна больше минимальной ширины картинки и меньше полной ширины,
            // сдвигаем фон влево, чтобы он стал по центру окна, и показываем в нормальном размере

            Log.out( 'Shift game background' );
            this.imageSprite.x = ( game.windowWidth - bkg.width ) / 2;
            this.imageSprite.width = bkg.width;
            this.imageSprite.height = bkg.height;
        }
        else {

            // Если ширина экрана меньше минимальной ширины картинки,
            // сдвигаем фон влево, чтобы он стал по центру окна и масштабируем

            let scale = game.windowWidth / bkg.minWidth;
            this.imageSprite.x = scale * ( bkg.minWidth - bkg.width ) / 2;
            this.imageSprite.width = scale * bkg.width;
            this.imageSprite.height = scale * bkg.height;
        }

        // Если высота фона превышает высоту окна, сделать дополнительное масштабирование

        if ( game.windowHeight < this.imageSprite.height ) {    // превышает

            let scale = game.windowHeight / this.imageSprite.height;
            this.imageSprite.height = game.windowHeight;
            this.imageSprite.width = scale * this.imageSprite.width;
            this.imageSprite.x = ( game.windowWidth - this.imageSprite.width ) / 2;
        }
    }

    /**
     * Получить текущий масштаб.
     *
     * @returns Возвращает объект с двумя свойствами:
     *  x - масшаб по горизонтали
     *  y - масштаб по вертикали.
     */
    scale() {
        let game = Game.instance();

        let options = this.bonus ? game.bonusDef.bkg : game.images.bkg;
        options = game.isVertical() ? options.vertical : options.horizontal;

        let realSize = this.size();
        return {
            x: realSize.width / options.width,
            y: realSize.height / options.height
        };
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
