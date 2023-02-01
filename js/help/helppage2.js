/**
 * 2-я страница помощи.
 */

class HelpPage2 extends ImageItem {

    static shadowOptions  = {
        shadow: {
            color: 0,
            angle: 0,
            blur: 10,
            distance: 0
        }
    };

    awardText;

    constructor( parent, options ) {
        super( parent, options );

        this.textureIndex = 1;
        this.update( options );

        let textOptions = {
            color: options.text2.color,
            fontFamily: options.text2.fontName,
            fontSize: options.text2.fontSize,
            fontWeight: 'bold',
            shadow: {
                color: 0,
                angle: 0,
                blur: 10,
                distance: 0
            }
        };
        new TextItem( this, i18next.t('10 Free GAMES at current bet.\nFree Games can be RE-TRIGGERED.'), {
            x: 560, y: 100, width: 655, height: 80, ... textOptions
        });
        new TextItem( this, 'during Free Games lowers new', {
            x: 170, y: 243, width: 425, height: 50, ... textOptions
        });
        new TextItem( this, 'on reel 1.', {
            x: 700, y: 243, width: 150, height: 80, ... textOptions
        });
        new TextItem( this, 'substitutes for all symbols except', {
            x: 170, y: 345, width: 455, height: 50, ... textOptions
        });
        new TextItem( this, i18next.t('and .'), {
            x: 830, y: 345, width: 455, height: 50, ... textOptions
        });
        new TextItem( this, 'adjacent in all directions to', {
            x: 170, y: 458, width: 333, height: 50, ... textOptions
        });
        new TextItem( this, 'or on it awards a random prize', {
            x: 630, y: 458, width: 420, height: 50, ... textOptions
        });

        // Сумма выигрыша по сундукам - от game.totalBet * 2 до game.totalBet * 5
        let game = Game.instance();
        let minAward = game.totalBet * 2;
        let maxAward = game.totalBet * 5;
        this.awardText = new TextItem( this, i18next.t('between v1 and v2.' ,{val1 : Tools.formatAmount( minAward ) , val2: Tools.formatAmount( maxAward ) }) , {
            x: 75, y: 510, width: 470, height: 50, ... textOptions
        });

        // new TextItem( this,'moves across the reels from left to right each', {
        //     x: 200, y: 570, width: 650, height: 50, ... textOptions
        // });
        // new TextItem( this, 'free game and is sopped and does not substitute if attacked by             .', {
        //     x: 120, y: 620, width: 850, height: 50, ... textOptions
        // });
        new TextItem( this,i18next.t(' moves across the reels from left to right each \n free game and is sopped and does not substitute if attacked by .'), {
            x: 120, y: 570, width: 850, height: 50, ... textOptions, lineHeight:50
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

    draw() {
        let game = Game.instance();
        let minAward = game.totalBet * 2;
        let maxAward = game.totalBet * 5;
        this.awardText.updateText( i18next.t('between v1 and v2.' ,{val1 : Tools.formatAmount( minAward ) , val2: Tools.formatAmount( maxAward ) }));
        super.draw();
    }
}
