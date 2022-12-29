/**
 * Базовый класс параметров и представления джекпотов.
 */

class Jackpot extends ImageItem {

    /** Статус джекпота - включен (1) или нет (0) */
    status;

    /** Текущая сумма джекпота */
    amount;

    /** Минимальная общая ставка для джекпота */
    minBet;

    /** Номер джекпота */
    number;

    /** Сумма выигрыша */
    winAmount;

    /** Функция, вызываемая после окончания показа джекпота */
    onStoppedFunc;

    constructor( parent, options ) {
        super( parent, options );

        this.status = 0;
        this.amount = 0;
        this.minBet = 0;
        this.number = 0;
        this.winAmount = 0;

        // Клик на картинке фона закрывает окно

        this.imageSprite.interactive = true;
        this.imageSprite.buttonMode = true;
        this.imageSprite.on('pointerdown', ()=>{ this.hide(); } );

        // children[0] - поздравление
        new TextItem( this, 'CONGRATULATIONS!', {
            fontFamily: 'RobotoBold',
            fontSize: this.options.text1.fontSize,
            fontWeight: 'bold',
            color: this.options.text1.color,
            y: this.options.text1.y,
            align: 'centerX'
        });

        // children[1] - номер джекпота
        new TextItem( this, '', {
            fontFamily: 'RobotoBold',
            fontSize: this.options.text2.fontSize,
            fontWeight: 'bold',
            color: this.options.text2.color,
            y: this.options.text2.y,
            align: 'centerX'
        });

        // children[2] - сумма джекпота
        new TextItem( this, '100 000 000', {
            fontFamily: 'RobotoBold',
            fontSize: this.options.text3.fontSize,
            fontWeight: 'bold',
            color: this.options.text3.color,
            y: this.options.text3.y,
            align: 'centerX'
        });

        // children[3] - валюта
        new TextItem( this, 'SATOSHI', {
            fontFamily: 'Arial',
            fontSize: this.options.text4.fontSize,
            color: this.options.text4.color,
            y: this.options.text4.y,
            align: 'centerX'
        });

        this.setVisible( false );
    }

    show( winAmount, callback ) {
        this.winAmount = winAmount;
        this.onStoppedFunc = callback;
        let game = Game.instance();
        game.setUILocked( true );
        this.setVisible( true );
    }

    hide() {
        this.setVisible( false );

        let game = Game.instance();
        game.setUILocked( false );

        this.onStoppedFunc();
    }

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

        let txt = this.children[1];
        txt.updateText( 'JACKPOT #' + this.number );

        txt = this.children[2];
        txt.updateText( Tools.formatAmount( this.winAmount ) );

        super.draw();
    }
}
