/*
 *
 */

class TotalBetButton extends ImageButton {

    static State = {
        TOTAL_BET:      'totalBet',
        GAMBLE:         'gamble'
    };

    state;

    textItem1;
    textItem2;
    textItem3;

    constructor( parent, name ) {

        let game = Game.instance();
        super( parent, name, game.controlDef[ name ] );

        let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

        this.textItem1 = new TextItem( this, 'TOTAL BET',{
            fontFamily : 'Arial',
            fontSize: o.text1.fontSize,
            color: o.text1.color,
            align: o.text1.align,
            y: o.text1.y
        });
        this.textItem2 = new TextItem( this, '',{
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: o.text2.fontSize,
            color: o.text2.color,
            align: o.text2.align,
            y: o.text2.y
        });
        this.textItem3 = new TextItem( this, 'GAMBLE',{
            fontFamily: 'Arial',
            fontSize: o.text3.fontSize,
            color: o.text3.color,
            align: o.text3.align,
        });
        this.state = TotalBetButton.State.TOTAL_BET;
    }

    setState( state ) {
        this.state = state;
        this.draw();
    }

    draw() {
        let game = Game.instance();

        if ( this.state == TotalBetButton.State.GAMBLE ) {

            this.textItem1.setVisible( false );
            this.textItem2.setVisible( false );
            this.textItem3.setVisible( true );
        }
        else {

            let o = game.isVertical() ? this.options.vertical : this.options.horizontal;

            this.textItem1.setVisible( true );
            this.textItem1.options.y = o.text1.y;
            this.textItem1.options.fontSize = o.text1.fontSize;

            this.textItem2.setVisible( true );
            this.textItem2.options.y = o.text2.y;
            this.textItem2.options.fontSize = o.text2.fontSize;
            this.textItem2.updateText( Tools.formatAmount( game.totalBet ) );

            this.textItem3.setVisible( false );
        }

        super.draw();
    }
}
