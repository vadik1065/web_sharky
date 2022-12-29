/**
 * Класс отображения выигрышного символа.
 *
 * Отрисовывает анимацию символа, рамку вокруг символа и, если задано,
 * рамку с суммой выигрыша.
 */

class WinBox extends GameItem {

    /**
     * Параметры:
     *
     * reel - индекс барабана от 0 до 4
     * pos - позиция символа на барабане от 0 (вверху) до 2 (внизу)
     * color - цвет рамки
     * amount - сумма выигрыша. Если > 0, выводится рамка с суммой
     */
    options;

    textures;       // массив текстур для анимации символа

    winSymbol;      // объект выигрышного символа

    border;         // рамка вокруг символа

    amountBox;      // рамка для суммы выигрыша

    amountText;     // объект отрисовки суммы выигрыша

    constructor( parent, options ) {
        super( parent );

        this.options = options;
        let reelIndex = this.options.reel;  // индекс барабана
        let pos = this.options.pos;         // позиция символа на барабане

        let game = Game.instance();
        let reelBox = game.reelBox;
        let reel = reelBox.reel( reelIndex );

        // Объект анимации символа

        this.winSymbol = new WinSymbol( this, {
            symbol: options.symbol ? options.symbol : reel.stoppedSymbol( pos ),
            reelIndex: reelIndex,
            symbolPos: pos
        });

        // Объект рамки вокруг символа

        this.border = new PIXI.Graphics;
        this.pixiObj.addChild( this.border );

        // Рамка с суммой выигрыша

        this.amountBox = null;
        this.amountText = null;
        if ( this.options.amount > 0 ) {
            this.amountBox = new PIXI.Graphics;
            this.pixiObj.addChild( this.amountBox );
            let textStyle = {
                fontFamily: 'Arial',
                fontSize: TextItem.DEFAULT_FONT_SIZE,
                fontWeight: 'bold',
                fill: this.options.color
            };
            this.amountText = new PIXI.Text( Tools.formatAmount( this.options.amount ), textStyle );
            this.pixiObj.addChild( this.amountText );
        }
    }

    destroy() {

        this.winSymbol.destroy();
        this.winSymbol = null;

        this.pixiObj.removeChild( this.border );
        this.border.destroy();
        this.border = null;

        if ( this.amountBox ) {
            this.pixiObj.removeChild( this.amountBox );
            this.amountBox.destroy();
            this.amountBox = null;
        }
        if ( this.amountText ) {
            this.pixiObj.removeChild( this.amountText );
            this.amountText.destroy();
            this.amountText = null;
        }
    }

    draw() {
        let game = Game.instance();

        let reelIndex = this.options.reel;
        let pos = this.options.pos;
        let color = this.options.color;

        let reelBox = game.reelBox;
        let reel = reelBox.reel( reelIndex );
        let symPos = reel.symbolPos( pos );
        let symSize = reel.symbolSize( pos );

        // Отрисовать выигрышный символ

        if ( this.winSymbol ) {
            this.winSymbol.draw();
        }

        // Нарисовать рамку поверх символа

        let border = this.border;
        if ( border ) {
            border.clear();
            border.lineStyle({
                width: 3,
                color: color
            });
            border.drawRoundedRect(
                symPos.x,
                symPos.y,
                symSize.width,
                symSize.height,
                3
            );
        }

        // Нарисовать рамку с выигрышем поверх рамки вокруг символа
        if ( this.amountBox && this.amountText ) {

            let scale = this.scale();

            let text = this.amountText;
            text.style.fontSize = TextItem.DEFAULT_FONT_SIZE * scale.y;
            text.style.fontWeight = 'bold';
            let textWidth = text.width;
            let textHeight = text.height;

            let box = this.amountBox;
            box.clear();
            box.lineStyle({
                width: 3,
                color: color
            });
            let boxX = symPos.x + 20 * scale.x;
            let boxY = symPos.y - 20 * scale.y;
            let boxWidth = textWidth + 20 * scale.x;
            let boxHeight = 40 * scale.y;
            box.beginFill( 0 );
            box.drawRoundedRect( boxX, boxY, boxWidth, boxHeight, 3 );
            box.endFill();

            text.x = boxX + ( boxWidth - textWidth ) / 2;
            text.y = boxY + ( boxHeight - textHeight ) / 2;
        }
    }

    scale() {
        return this.parent.scale();
    }
}
