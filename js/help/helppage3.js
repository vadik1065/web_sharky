/**
 * 3-я страница помощи.
 */

class HelpPage3 extends ImageItem {

    constructor( parent, options ) {
        super( parent, options );

        this.textureIndex = 2;
        this.update( options );

        new TextItem( this, 'RULES', {
            x: 0, y: 50,
            color: options.title.color,
            align: 'centerX',
            fontFamily: options.title.fontName,
            fontSize: options.title.fontSize,
            fontWeight: 'bold',
        });

        let text2 = [
            'All prizes are for combinations of a kind. All prizes are for combinations',
            'left to right, except scatters. All prizes are on selected lines, except scatters.',
            'Scatter symbols pay at any position on screen. Highest win only paid on each',
            'selected line and per scatter combination. Scatter wins and line wins are added.',
            'The paytable always shows the prizes for the currently selected bet and number',
            'of lines. Ship can only appear on reel 1, Island only on reel 5.'
        ];
        new TextItem( this, text2, {
            x: 0, y: 170,
            color: options.text3.color,
            align: 'centerX',
            fontFamily: options.text3.fontName,
            fontSize: options.text3.fontSize,
            fontWeight: 'bold',
            lineHeight: options.text3.lineHeight
        });
    }

    /**
     * Дополнительное масштабирование для вертикального режима.
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
