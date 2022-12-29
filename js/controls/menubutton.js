/*
 * Кнопка меню.
 */

class MenuButton extends ImageButton {

    textItem;

    constructor( parent, name ) {
        let game = Game.instance();

        super( parent, name, game.controlDef[ name ] );

        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem = new TextItem( this, 'MENU',{
            fontFamily : 'Arial',
            fontSize: o.text.fontSize,
            color: o.text.color,
            align: o.text.align,
            y: o.text.y
        });
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

