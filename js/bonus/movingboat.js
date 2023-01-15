/**
 * Движущаяся лодка.
 */

class MovingBoat extends AnimatedItem {

    static MOVE_TIME = 100;

    currentReel;        // номер текущего барабана (от 0 до 4)
    symbolIndex;        // индекс символа на барабане (от 0 до 2)

    constructor( parent, options, index ) {

        super( parent, options );

        this.currentReel = 0;
        this.symbolIndex = index;
        this.savedDistance = 0;
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
        this.options.sprite.count = 4;
        this.update();
        this.setVisible( true );
    }

    targetPosV;
    targetPosH;
    moveStepV;  // щаг движения для вертикальной ориентации окна
    moveStepH;  // щаг движения для горизонтальной ориентации окна
    moveTimer;

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
                    clearInterval( moveTimer );
                    this.stop();
                    this.emit( 'movingStopped' );
                    return;
                }
            }
            else {
                if ( this.options.horizontal.x >= this.targetPosH ) {
                    clearInterval( moveTimer );
                    this.stop();
                    this.emit( 'movingStopped' );
                    return;
                }
            }
            this.draw();
        }, 2 );
    }
}
