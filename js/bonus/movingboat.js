/**
 * Движущаяся лодка.
 */

class MovingBoat extends AnimatedItem {

    static MOVE_TIME = 100; // интервал между кадрами перемещения

    currentReel;            // индекс текущего барабана (от 0 до 4)
    symbolIndex;            // индекс символа на барабане (от 0 до 2)

    moveFrameCount;         // число кадров движения

    constructor( parent, options, reelIndex, slotIndex ) {

        Log.out( 'Create new moving boat at reel ' + reelIndex + ', slot ' + slotIndex );

        super( parent, options );

        this.currentReel = reelIndex;
        this.symbolIndex = slotIndex;
        this.moveFrameCount = this.options.sprite.count;
        this.options.sprite.loop = true;
//        this.options.speed = 0.4;

        this.setVisible( false );
    }

    showEmptyBoat() {
        this.options.sprite.url = this.options.emptyBoat;
        this.options.sprite.count = 1;
        this.update();
        this.setVisible( true );
    }

    showManInBoat() {
        this.options.sprite.url = this.options.manInBoat;
        this.options.sprite.count = this.moveFrameCount;
        this.update();
        this.setVisible( true );
    }

    targetPosV; // позиция цели для вертикальной ориентации окна
    targetPosH; // позиция цели для горизонтальной ориентации окна
    moveStepV;  // щаг движения для вертикальной ориентации окна
    moveStepH;  // щаг движения для горизонтальной ориентации окна

    moveTimer;  // таймер движения

    startMoving() {
        this.start();
        this.targetPosV = this.options.vertical.x + this.options.vertical.distance;
        this.targetPosH = this.options.horizontal.x + this.options.horizontal.distance;
        this.moveStepV = this.options.vertical.distance / MovingBoat.MOVE_TIME;
        this.moveStepH = this.options.horizontal.distance / MovingBoat.MOVE_TIME;
        let moveTimer = setInterval( ()=>{
            this.options.vertical.x += this.moveStepV;
            this.options.horizontal.x += this.moveStepH;
            if ( Game.instance().isVertical() ) {
                if ( this.options.vertical.x >= this.targetPosV ) {
                    this.onMovingStopped( moveTimer );
                    return;
                }
            }
            else {
                if ( this.options.horizontal.x >= this.targetPosH ) {
                    this.onMovingStopped( moveTimer );
                    return;
                }
            }
            this.draw();
        }, 2 );
    }

    onMovingStopped( timer ) {
        clearInterval( timer );
        this.stop();
        this.emit( 'movingStopped' );
    }
}
