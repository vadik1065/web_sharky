/**
 * Диалоговое окно.
 */

class Dialog extends Window {

    static BTN_MIN_WIDTH = 100;

    gameState;

    buttons;

    /**
     * Конструктор диалогового окна.
     *
     * Окно создается и сразу открывается поверх всего интерфейса игры, и блокирует
     * все кнопки управления ирой. После закрытия окна, восстанавливается состояние
     * игры перед открытием окна.
     *
     * @param {object} parent
     * @param {object} options настройка диалогового окна. Кроме стандартных настроек для
     * окна, содержит дополнительные свойства:
     * 'text' - свойства текста сообщения, выводимого в окне:
     *  {
     *      "color": "0xFFFFFF",
     *      "fontSize": 22,
     *  }
     * 'buttons' - свойства кнопок:
     *  {
     *      "height": 50,                   - высота кнопок
     *      "fill": "0x303030",             - цвет фона кнопки
     *      "textColor": "0xFFFFFF",        - цвет текста на кнопке
     *      "fontSize": 22,                 - размер шрифта текста на кнопке
     *      "border": {
     *          "width": 1,                 - толщина рамки кнопки
     *          "color": "0xFFFFFF",        - цвет рамки
     *          "radius": 7                 - радиус закругления
     *      }
     *  }
     *
     * @param {string} text - текст сообщения, выводимого в окне
     * @param {array} buttons - массив текстов, выводимых на кнопках
     * @param {function} onButton - функция, вызываемая при нажатии на любую заданную кнопку
     * или при закрытии окна. В функцию передается номер кнопки (от 0) или -1.
     *
     * @returns {Dialog}
     */
    constructor( parent, options, text, buttons, onButton ) {

        let game = Game.instance();

        super( parent, options );

        let opt = this.options;
        if ( game.isVertical() ) {
            if ( this.options.vertical ) opt = this.options.vertical
        }
        else {
            if ( this.options.horizontal ) opt = this.options.horizontal;
        }

        // children[0] - кнопка закрытия окна
        let closeOptions = Tools.clone( game.images.closeIcon );
        closeOptions.width = 30;
        closeOptions.height = 30;
        closeOptions.x = opt.width - closeOptions.width * 3 / 2;
        closeOptions.y = closeOptions.height / 2;
        closeOptions.interactive = true;
        let closeBtn = new ImageButton( this, 'closeDialog', closeOptions);
        closeBtn.addListener( 'click', ()=>{ onButton( -1 ) } );

        // children[1] - текст сообщения
        new TextItem( this, text, {
            fontFamily: 'Arial',
            fontSize: this.options.text.fontSize,
            fill: this.options.text.color,
            x: 20,
            y: closeOptions.height * 2,
            width: opt.width - 40,
            height: opt.height - closeOptions.height * 2 - this.options.buttons.height * 3,
            align: 'center'
        });

        // children[2] ... - кнопки выбора
        this.buttons = buttons;
        let btnOptions = Tools.clone( this.options.buttons );
        let btnCount = buttons.length;
        for ( let i = 0; i < btnCount; ++i ) {

            btnOptions.x = 0;
            btnOptions.y = opt.height - btnOptions.height * 2;
            btnOptions.width = 100;
            btnOptions.interactive = true;
            let btn = new ValueButton( this, buttons[i], btnOptions );
            btn.addListener( 'click', ()=>{ onButton( i ); } );
        }

        game.setUILocked( true );

        this.setVisible( true );
    }

    close() {
        this.setVisible( false );

        let game = Game.instance();
        game.setUILocked( false );

        delete this;
    }

    draw() {
        super.draw();

        let game = Game.instance();
        let opt = this.options;
        if ( game.isVertical() ) {
            if ( this.options.vertical ) opt = this.options.vertical
        }
        else {
            if ( this.options.horizontal ) opt = this.options.horizontal;
        }

        // Кнопка закрытия окна
        let btn = this.children[0];
        btn.options.x = opt.width - btn.options.width * 3 / 2;
        btn.options.y = btn.options.height / 2;
        btn.draw();

        // Подсчитать суммарную ширину всех кнопок без учета интервала между кнопками
        let totalBtnWidth = 0;
        let btnCount = this.buttons.length;
        for ( let i = 0; i < btnCount; ++i ) {

            let btn = this.children[ 2 + i ];
            let width = btn.textItem.width() + 100;
            if ( width < Dialog.BTN_MIN_WIDTH ) {
                width = Dialog.BTN_MIN_WIDTH;
            }
            btn.options.width = width;
            totalBtnWidth += width;
        }

        let interval = 50;  // интервал между кнопками

        // Ширина, занимаемая кнопками с учетом интервала между ними
        let btnWidth = totalBtnWidth + ( btnCount - 1 ) * interval;

        // Позиция самой левой кнопки
        let leftPos = (opt.width - btnWidth) / 2;

        // Разместить кнопки
        for ( let i = 0; i < btnCount; ++i ) {

            let btn = this.children[ 2 + i ];
            btn.options.x = leftPos;
            leftPos += btn.options.width + interval;

            btn.draw();
        }
    }
}
