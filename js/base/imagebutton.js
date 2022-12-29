/*
 * Базовый класс для кнопок с фоновым изображением.
 *
 * Генерирует события:
 *
 * 'click' - при тапе или нажатии на кнопку левой кнопкой мышки.
 */

class ImageButton extends ImageItem {

    id;             // символьный идентификатор кнопки

    /**
     * Конструктор.
     *
     * @param {string} id
     *
     * @returns {ImageButton}
     */
    constructor( parent, id, options ) {

        super( parent, options );

        Log.out( 'Create button [' + id + ']' );

        this.id = id;
        this.imageSprite.interactive = true;
        this.imageSprite.buttonMode = true;

        this.imageSprite.on('pointerdown', ()=>{
            if ( this.enabled && this.visible ) {
                Log.out( 'Click on button [' + this.id + ']' );
                this.emit( 'click', { 'button': this } );
            }
        });
    }

    setEnabled( state ) {
        Log.out( 'Set button [' + this.id + '] ' + ( state ? 'enabled' : 'disabled' ) );
        super.setEnabled( state );
        this.imageSprite.interactive = state;
        this.imageSprite.buttonMode = state;
    }
}
