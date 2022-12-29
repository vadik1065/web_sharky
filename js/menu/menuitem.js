/**
 * Элемент/пункт меню.
 */

class MenuItem extends Window {

    FONT_SIZE = 24;

    itemOptions;

    textItem;

    /**
     * Индекс состояния пункта меню.
     *
     * Может принимать значение 0 или 1. Для каждого состояния может быть задана
     * отдельная иконка и текст пункта меню.
     */
    stateIndex = 0;

    constructor( parent, options ) {

        super( parent, {
            border: {
                width: 1,
                color: 0xFFCC00,
                radius: 5
            },
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            fill: 0,
            interactive: true
        } );

        this.itemOptions = Tools.clone( options );
        this.selected = false;

        // TODO: установить начальное состояние пункта меню в зависимости
        // от сохраненного ранее состояния игры
        this.stateIndex = 0;

        this.imageItem = new ImageItem( this, this.itemOptions.icon );

        this.textItem = new TextItem( this, this.itemOptions.labels[ this.stateIndex ], {
            fontFamily : 'Arial',
            fontSize: this.FONT_SIZE,
            color: 0xFFCC00,
            x: 60,
            align: 'centerY'
        });
    }

    /**
     * Получить текущее состояние пункта меню.
     *
     * @returns {Number|int}
     */
    state() {
        return this.stateIndex;
    }

    /**
     * Установить новое состояние пункта меню.
     *
     * @param {int} state новое состояние (0 или 1)
     */
    setState( state ) {
        this.stateIndex = state;

        // Изменить, если возможно, иконку пункта
        this.children[0].textureIndex = ( this.itemOptions.icon.urls.length <= state + 1 ) ? state : 0;

        // Изменить, если возможно, текст пункта
        this.children[1].updateText( this.itemOptions.labels[ ( this.itemOptions.labels.length <= state + 1 ) ? state : 0 ] );

        this.draw();
    }
}

