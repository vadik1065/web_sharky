/*
 * Кнопка управления вращением.
 */

class StartButton extends ImageButton {

    static State = {
        START:      'start',
        TAKE_WIN:   'takeWin'
    };

    state;

    textItem;

    constructor( parent, name ) {

        let game = Game.instance();
        super( parent, name, game.controlDef[ name ] );

        this.state = StartButton.State.START;

        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;
        let textOptions = {
            fontFamily: 'Arial',
            fontSize: o.text.fontSize,
            x: o.text.x,
            align: o.text.align,
            color: o.text.color
        };
        this.textItem = new TextItem( this, '', textOptions );
    }

    /**
     * Установить текущее состояние кнопки.
     *
     * @param {string} state имя состояния (см. StartButton.State)
     */
    setState( state ) {
        this.state = state;
        this.draw();
    }

    draw() {
        let game = Game.instance();

        this.textItem.updateText( this.state == StartButton.State.TAKE_WIN ? 'TAKE' : 'START' );

        let options = game.isVertical() ? this.options.vertical : this.options.horizontal;
        this.textItem.options.fontSize = options.text.fontSize;
        this.textItem.options.x = options.text.x;
        this.textItem.options.align = options.text.align;

        super.draw();
    }
}
