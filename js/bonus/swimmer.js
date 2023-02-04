/**
 * Пловец за сундуками.
 */

class Swimmer extends AnimatedItem {

    static MOVE_TIME = 200;

    /**
     * Параметры пловца:
     *
     * boatIndex - индекс движущейся лодки
     * reelIndex - индекс барабана
     * slotIndex - индекс символа на барабане
     * direction - направление сундука с выигрышем относительно позиции лодки
     * amount - сумма выигрыша в сундуке
     */
    params;

    /**
     * Полное описание движения пловца во всех направлениях.
     */
    swimmerOptions;

    /**
     * Объект отображения суммы выигрыша.
     */
    bonusWin;

    textOptions;

    state;

    static MOVE_TO_CHEST = 0;
    static OPEN_CHEST = 1;
    static MOVE_BACK = 2;

    constructor( parent, options, params ) {

        let spriteInfo = Tools.clone( options[ params.direction ] );

        let game = Game.instance();
        let reelPos = game.reelDef.pos;
        let symbolSize = game.symbols.size;

        let opt = {
            vertical: options.vertical,
            horizontal: options.horizontal,
            sprite: spriteInfo,
            speed: 0.2
        };
        opt.vertical.x = reelPos.vertical[ params.reelIndex ].x - ( options.vertical.width - symbolSize.vertical.width ) / 2;
        opt.vertical.y = reelPos.vertical[ params.reelIndex ].y + symbolSize.vertical.height * params.slotIndex
                        - ( spriteInfo.height * options.vertical.width / spriteInfo.width - symbolSize.vertical.height ) / 2;

        opt.horizontal.x = reelPos.horizontal[ params.reelIndex ].x - ( options.horizontal.width - symbolSize.horizontal.width ) / 2;
        opt.horizontal.y = reelPos.horizontal[ params.reelIndex ].y + symbolSize.horizontal.height * params.slotIndex
                        - ( spriteInfo.height * options.horizontal.width / spriteInfo.width - symbolSize.horizontal.height ) / 2;

        super( parent, opt );

        this.swimmerOptions = Tools.clone( options );
        this.params = Tools.clone( params );

        this.setVisible( false );
    }

    targetV;
    targetH;
    moveStepV;
    moveStepH;

    /**
     * Начать анимацию движения из исходного положения.
     */
    start() {

        this.state = Swimmer.MOVE_TO_CHEST;

        let distanceV = {
            x: this.options.sprite.reel * this.swimmerOptions.vertical.reelOffset,
            y: this.options.sprite.slot * this.swimmerOptions.vertical.slotOffset
        };
        let distanceH = {
            x: this.options.sprite.reel * this.swimmerOptions.horizontal.reelOffset,
            y: this.options.sprite.slot * this.swimmerOptions.horizontal.slotOffset
        };
        this.targetV = {
            x: this.options.vertical.x + distanceV.x,
            y: this.options.vertical.y + distanceV.y
        };
        this.targetH = {
            x: this.options.horizontal.x + distanceH.x,
            y: this.options.horizontal.y + distanceH.y
        };
        this.moveStepV = {
            x: distanceV.x / Swimmer.MOVE_TIME,
            y: distanceV.y / Swimmer.MOVE_TIME
        };
        this.moveStepH = {
            x: distanceH.x / Swimmer.MOVE_TIME,
            y: distanceH.y / Swimmer.MOVE_TIME
        };

        super.start();
        let game = Game.instance();
        game.playLoop( 'origin/event_swimmer' );

        let moveTimer = setInterval( ()=>{
            this.options.vertical.x += this.moveStepV.x;
            this.options.vertical.y += this.moveStepV.y;
            this.options.horizontal.x += this.moveStepH.x;
            this.options.horizontal.y += this.moveStepH.y;
            if ( game.isVertical() ) {
                let targetX = ( this.moveStepV.x < 0 ) ? ( this.options.vertical.x <= this.targetV.x ) : ( this.options.vertical.x >= this.targetV.x );
                let targetY = ( this.moveStepV.y < 0 ) ? ( this.options.vertical.y <= this.targetV.y ) : ( this.options.vertical.y >= this.targetV.y );
                if ( targetX && targetY ) { // пловец достиг позиции сундука
                    this.onMovingTarget( moveTimer );
                    return;
                }
            }
            else {
                let targetX = ( this.moveStepH.x < 0 ) ? ( this.options.horizontal.x <= this.targetH.x ) : ( this.options.horizontal.x >= this.targetH.x );
                let targetY = ( this.moveStepH.y < 0 ) ? ( this.options.horizontal.y <= this.targetH.y ) : ( this.options.horizontal.y >= this.targetH.y );
                if ( targetX && targetY ) { // пловец достиг позиции сундука
                    this.onMovingTarget( moveTimer );
                    return;
                }
            }
            this.draw();
        }, 2 );
    }

    /**
     * Обработка по достижении позиции сундука.
     */
    onMovingTarget( timer ) {

        // Остановить анимацию и спрятать пловца
        clearInterval( timer );
        this.stop();
        this.setVisible( false );

        let game = Game.instance();
        game.stopPlay( 'origin/event_swimmer' );

        // Запустить анимацию сундука с выигрышем
        this.animateChest();
    }

    /**
     * Запустить анимацию сундука с выигрышем.
     */
    animateChest() {

        this.state = Swimmer.OPEN_CHEST;

        this.onFrameChanged = ( currentFrame ) => {
            if ( currentFrame == 5 ) {         // показать сумму выигрыша
                this.bonusWin.setVisible( true );
                this.emit( 'bonusReceived', { 'amount': this.params.amount } );
            }
            else if ( currentFrame == 35 ) {    // спрятать сумму выигрыша
                this.bonusWin.setVisible( false );
            }
            else if ( currentFrame == 39 ) {    // закончилась анимация сундука
                this.stop();
                this.onFrameChanged = null;
                this.moveBack();
            }
        };
        let game = Game.instance();
        let symSize = game.symbols.size;
        let reelPos = game.reelDef.pos;
        let reelIndex = this.params.reelIndex + this.swimmerOptions[ this.params.direction ].reel;
        let slotIndex = this.params.slotIndex + this.swimmerOptions[ this.params.direction ].slot;
        this.options = {
            vertical: {
                x: reelPos.vertical[ reelIndex ].x,
                y: reelPos.vertical[ reelIndex ].y + symSize.vertical.height * slotIndex,
                width: symSize.vertical.width,
                height: symSize.vertical.height
            },
            horizontal: {
                x: reelPos.horizontal[ reelIndex ].x,
                y: reelPos.horizontal[ reelIndex ].y + symSize.horizontal.height * slotIndex,
                width: symSize.horizontal.width,
                height: symSize.horizontal.height
            },
            sprite: this.swimmerOptions.chest.sprite,
            speed: 0.4
        };
        this.update();

        super.start();
        game.startPlay( 'origin/event_chestopen' );

        // Сумма выигрыша

        let textOptions = {
            x: 0,
            y: 0,
            width: game.isVertical() ? symSize.vertical.width : symSize.horizontal.width,
            height: game.isVertical() ? symSize.vertical.height : symSize.horizontal.height,
            color: this.swimmerOptions.chest.text.color,
            fontSize: this.swimmerOptions.chest.text.fontSize,
            align: 'center',
            shadow: {
                blur: 10
            }
        };
//        Log.out( 'Bonus win ' + Tools.formatAmount( this.params.amount ) + ' options: ' + JSON.stringify( textOptions ) );
        this.bonusWin = new TextItem( this, Tools.formatAmount( this.params.amount ), textOptions );
        this.bonusWin.setVisible( false );
    }

    /**
     * Начать анимацию возвращения пловца в исходное положение.
     */
    moveBack() {

        this.setVisible( false );

        this.state = Swimmer.MOVE_BACK;

        let direction = this.params.direction;              // предыдущее направление
        let reelIndex = this.params.reelIndex + this.swimmerOptions[ direction ].reel;  // барабан с сундуком
        let slotIndex = this.params.slotIndex + this.swimmerOptions[ direction ].slot;  // текущая позиция на барабане с сундуком

        // Описание обратного направления для возвращения на исходную позицию
        let spriteInfo = this.swimmerOptions[ this.swimmerOptions[ direction ].back ];

        let game = Game.instance();
        let reelPos = game.reelDef.pos;
        let symbolSize = game.symbols.size;

        this.options = {
            vertical: this.swimmerOptions.vertical,
            horizontal: this.swimmerOptions.horizontal,
            sprite: spriteInfo,
            speed: 0.2
        };

        this.options.vertical.x = reelPos.vertical[ reelIndex ].x - ( this.options.vertical.width - symbolSize.vertical.width ) / 2;
        this.options.vertical.y = reelPos.vertical[ reelIndex ].y + symbolSize.vertical.height * slotIndex
                        - ( spriteInfo.height * this.options.vertical.width / spriteInfo.width - symbolSize.vertical.height ) / 2;

        this.options.horizontal.x = reelPos.horizontal[ reelIndex ].x - ( this.options.horizontal.width - symbolSize.horizontal.width ) / 2;
        this.options.horizontal.y = reelPos.horizontal[ reelIndex ].y + symbolSize.horizontal.height * slotIndex
                        - ( spriteInfo.height * this.options.horizontal.width / spriteInfo.width - symbolSize.horizontal.height ) / 2;

        this.update();

        let distanceV = {
            x: this.options.sprite.reel * this.swimmerOptions.vertical.reelOffset,
            y: this.options.sprite.slot * this.swimmerOptions.vertical.slotOffset
        };
        let distanceH = {
            x: this.options.sprite.reel * this.swimmerOptions.horizontal.reelOffset,
            y: this.options.sprite.slot * this.swimmerOptions.horizontal.slotOffset
        };
        this.targetV = {
            x: this.options.vertical.x + distanceV.x,
            y: this.options.vertical.y + distanceV.y
        };
        this.targetH = {
            x: this.options.horizontal.x + distanceH.x,
            y: this.options.horizontal.y + distanceH.y
        };
        this.moveStepV = {
            x: distanceV.x / Swimmer.MOVE_TIME,
            y: distanceV.y / Swimmer.MOVE_TIME
        };
        this.moveStepH = {
            x: distanceH.x / Swimmer.MOVE_TIME,
            y: distanceH.y / Swimmer.MOVE_TIME
        };

        super.start();
        this.bonusWin.setVisible( false );
        game.playLoop( 'origin/event_swimmer' );

        let moveTimer = setInterval( ()=>{
            this.options.vertical.x += this.moveStepV.x;
            this.options.vertical.y += this.moveStepV.y;
            this.options.horizontal.x += this.moveStepH.x;
            this.options.horizontal.y += this.moveStepH.y;
            if ( game.isVertical() ) {
                let targetX = ( this.moveStepV.x < 0 ) ? ( this.options.vertical.x <= this.targetV.x ) : ( this.options.vertical.x >= this.targetV.x );
                let targetY = ( this.moveStepV.y < 0 ) ? ( this.options.vertical.y <= this.targetV.y ) : ( this.options.vertical.y >= this.targetV.y );
                if ( targetX && targetY ) { // пловец достиг позиции сундука
                    this.onSwimmerStopped( moveTimer );
                    return;
                }
            }
            else {
                let targetX = ( this.moveStepH.x < 0 ) ? ( this.options.horizontal.x <= this.targetH.x ) : ( this.options.horizontal.x >= this.targetH.x );
                let targetY = ( this.moveStepH.y < 0 ) ? ( this.options.horizontal.y <= this.targetH.y ) : ( this.options.horizontal.y >= this.targetH.y );
                if ( targetX && targetY ) { // пловец достиг позиции сундука
                    this.onSwimmerStopped( moveTimer );
                    return;
                }
            }
            this.draw();
        }, 2 );
    }

    /**
     * Обработка по окончании возвращения пловца.
     */
    onSwimmerStopped( timer ) {

        // Остановить анимацию и спрятать пловца
        clearInterval( timer );
        this.stop();
        this.setVisible( false );

        let game = Game.instance();
        game.stopPlay( 'origin/event_swimmer' );

        // Запустить событие об окончании движения
        this.emit( 'swimmerStopped' );
    }
}
