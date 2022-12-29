/**
 * Отображение баннера бонус-игры с текстом.
 */

class TextBanner extends ImageItem {

    /** Флаг завершения анимации книги */
    animationFinished;

    constructor( parent, options ) {

        super( parent, options.banner );

        let textOptions = {
            fontFamily: options.banner.text.fontName,
            fontSize: options.banner.text.fontSize,
            fontWeight: 'bold',
            color: options.banner.text.color,
            x: 0,
            y: 0,
            align: 'center',
            lineHeight: options.banner.text.lineHeight,
            shadow: {
                color: 0,
                angle: 0,
                blur: 10,
                alpha: 10,
                distance: 0
            }
        };

        new TextItem( this, '', textOptions );

        this.setVisible( false );
    }

    /**
     * Показать баннер с текстом.
     *
     * @param {string} text заданный текст
     */
    show( text ) {
        this.setVisible( true );
        let textItem = this.children[0];
        textItem.updateText( text );
    }

    /**
     * Скрыть баннер.
     */
    hide() {
        this.setVisible( false );
    }

    /**
     * Текущий масштаб отображения.
     */
    scale() {
        let game = Game.instance();
        let scale = Tools.clone( this.parent.scale() );
        if ( game.isVertical() ) {
            scale.x *= this.options.vertical.width / this.options.horizontal.width,
            scale.y *= this.options.vertical.height / this.options.horizontal.height
        }
        return scale;
    }
}
