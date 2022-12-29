/**
 * Окно вывода информационных сообщений.
 */

class InfoBox extends ImageItem {

    id;

    /** Объект текста для вывода сообщений */
    textAboveItem;
    textBelowItem;

    textAbove = '';
    textBelow = '';

    /** Флаг выделения верхней строки текста */
    aboveHighlite;

    /** Флаг показа джекпотов */
    showJackInfo;

    constructor( parent, name ) {

        let game = Game.instance();

        super( parent, game.controlDef[ name ] );

        this.id = name;

        this.textAboveItem = new TextItem( this, '', {} );
        this.textBelowItem = new TextItem( this, '', {} );

        this.showJackInfo = false;
    }

    /**
     * Показать текст в верхней строке.
     *
     * @param {string} text
     */
    showAbove( text, highlite = false ) {
        this.textAbove = text;
        this.aboveHighlite = highlite;
        this.draw();
    }

    /**
     * Показать текст в нижней строке.
     *
     * @param {string} text
     */
    showBelow( text ) {
        this.textBelow = text;
        this.textBelowItem.updateText( text );
        this.draw();
    }

    /**
     * Показать информацио о джекпотах.
     */
    showJackpots() {
        this.showJackInfo = true;
        this.draw();
    }

    /**
     * Скрыть информацию о джекпотах.
     */
    hideJackpots() {
        this.showJackInfo = false;
        this.draw();
    }

    /**
     * Отрисовка состояния.
     */
    draw() {
        let game = Game.instance();
        let options = game.isVertical() ? this.options.vertical : this.options.horizontal;

        if ( this.showJackInfo ) {  // показать джекпоты

            let jackpots = Game.instance().jackpots;
            let jack1 = jackpots[0];
            let jack2 = jackpots[1];


            if ( game.isDemoActive() || ( jack1.status == 0 && jack2.status == 0 ) ) {

                // Если демо-режим или оба джекпота отключены - показать текущий баланс

                let textItem = this.textAboveItem;
                textItem.options = Tools.clone( options.above );
                textItem.options.color = options.above.color;
                textItem.options.x = 0;
                textItem.options.y = 0;
                textItem.options.width = options.width;
                textItem.options.height = options.height;
                textItem.options.align = 'center';
                let balance = game.balance() - game.totalBet;
                this.textAboveItem.updateText( ( game.isDemoActive() ? 'DEMO BALANCE: ' : 'BALANCE: ' ) + Tools.formatAmount( balance ) );
                textItem.setVisible( true );

                this.textBelowItem.setVisible( false );

            }
            else {

                let jackText1 = ( jack1.status == 0 ) ? '' : 'JACKPOT 1: ' + Tools.formatAmount( jack1.amount ) + ' / MIN BET: ' + Tools.formatAmount( jack1.minBet );
                let jackText2 = ( jack2.status == 0 ) ? '' : 'JACKPOT 2: ' + Tools.formatAmount( jack2.amount ) + ' / MIN BET: ' + Tools.formatAmount( jack2.minBet );

                // Показать 1-ый джекпот

                let textItem = this.textAboveItem;
                if ( jackText1 == '' ) {
                    textItem.setVisible( false );
                }
                else {
                    textItem.options = Tools.clone( options.above );
                    textItem.options.color = jack1.isEnabled() ? options.jackpot.color : options.jackpot.disabled;
                    textItem.options.x = 0;
                    textItem.options.y = 0;
                    textItem.options.width = options.width;
                    textItem.options.height = ( jackText2 == '' ) ? options.height : options.height * 2 / 3;
                    textItem.options.align = 'center';
                    textItem.updateText( jackText1 );
                    textItem.setVisible( true );
                }

                // Показать 2-ой джекпот

                textItem = this.textBelowItem;
                if ( jackText2 == '' ) {
                    textItem.setVisible( false );
                }
                else {
                    textItem.options = Tools.clone( options.above );
                    textItem.options.color = jack2.isEnabled() ? options.jackpot.color : options.jackpot.disabled;
                    textItem.options.x = 0;
                    textItem.options.y = ( jackText1 == '' ) ? 0 : options.height / 3;
                    textItem.options.width = options.width;
                    textItem.options.align = 'center';
                    textItem.options.height = ( jackText1 == '' ) ? options.height : options.height * 2 / 3;
                    if ( jackText1 == '' ) {
                        textItem.options.height = options.height;
                    }
                    textItem.options.align = 'center';
                    textItem.updateText( jackText2 );
                    textItem.setVisible( true );
                }
            }
        }
        else {

            // Вывести основной текст

            let textItem = this.textAboveItem;
            textItem.options = Tools.clone( options.above );
            if ( this.aboveHighlite ) {
                textItem.options.color = options.above.highlite;
            }
            if ( this.textBelow == '' ) {
                textItem.options.height = options.height;
            }
            textItem.updateText( this.textAbove );
            textItem.setVisible( true );

            textItem = this.textBelowItem;
            textItem.options = Tools.clone( options.below );
            textItem.options.y = ( this.textAboveItem.lineCount() == 1 ) ? options.below.y1 : options.below.y2;
            textItem.updateText( this.textBelow );
            textItem.setVisible( true );
        }

        super.draw();
    }
}

