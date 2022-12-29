/*
 *
 */

class LinesButton extends ImageButton {

    textItem1;
    textItem2;

    constructor( parent, name ) {

        let game = Game.instance();
        super( parent, name, game.controlDef[ name ] );

        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem1 = new TextItem( this, 'LINES',{
            fontFamily : 'Arial',
            fontSize: o.text1.fontSize,
            color: o.text1.color,
            align: o.text1.align,
            y: o.text1.y
        });
        this.textItem2 = new TextItem( this, '', {
            fontFamily : 'Arial',
            fontWeight: 'bold',
            fontSize: o.text2.fontSize,
            color: o.text2.color,
            align: o.text2.align,
            y: o.text2.y
        });
    }

    draw() {
        let game = Game.instance();
        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem1.options.y = o.text1.y;
        this.textItem1.options.fontSize = o.text1.fontSize;

        this.textItem2.options.y = o.text2.y;
        this.textItem2.options.fontSize = o.text2.fontSize;
        this.textItem2.updateText( game.selectedLines.toString() );

        super.draw();
    }
}


