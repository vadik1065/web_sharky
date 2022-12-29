/*
 * Кнопка автоматического режима игры.
 */

class AutoPlayButton extends ImageButton {

    textItem;

    activeState;

    constructor( parent, name ) {
        let game = Game.instance();
        super( parent, 'autoPlay', game.controlDef[ name ] );

        this.activeState = false;

        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem = new TextItem( this, 'AUTO',{
            fontFamily : 'Arial',
            fontSize: o.text.fontSize,
            color: o.text.color,
            align: o.text.align,
            y: o.text.y
        });
    }

    isActive() {
        return this.activeState;
    }

    setActive( state ) {
        Log.out( 'Set auto play state to ' + ( state ? 'true' : 'false' ) );
        this.activeState = state;
        this.textureIndex = ( state ) ? 1 : 0;
        this.draw();
    }

    draw() {
        let game = Game.instance();
        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem.options.y = o.text.y;
        this.textItem.options.align = o.text.align;
        this.textItem.options.fontSize = o.text.fontSize;

        super.draw();
    }
}

