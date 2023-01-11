/**
 * Анимированное изображение.
 *
 */

class AnimatedItem extends GameItem {

    /** Спрайт для отрисовки изображения */
    imageSprite;

    /** Массив текстур для анимации изображения */
    textures;

    /**
     * Параметры анимации:
     * sprite {
     *    columns - число колонок в картинке анимации
     *    count - общее число кадров анимации
     *    width - ширина кадра
     *    height - высота кадра
     *    url - адрес картинки для анимации
     * }
     */
    options;

    constructor( parent, options ) {

        super( parent );

        this.options = Tools.clone( options );
        this.update();
    }

    destroy() {
        if ( this.imageSprite ) {
            this.stop();
            this.setVisible( false );
            this.pixiObj.removeChild( this.imageSprite );
            this.imageSprite.destroy();
            this.imageSprite = null;
            delete this.textures;
            this.textures = null;
        }
    }

    update() {

        Log.out( 'AnimationItem: update 1' );
        if ( this.imageSprite ) {
            this.pixiObj.removeChild( this.imageSprite );
        }

        Log.out( 'AnimationItem: update 2' );
        let spriteDef = this.options.sprite;
        let sprite = PIXI.Texture.from( spriteDef.url );
        let pageTextures = [];
        let colCount = spriteDef.columns;
        for ( let i = 0; i < spriteDef.count; ++i ) {
            let col = i % colCount;
            let row = Math.floor( i / colCount );
            let rect = new PIXI.Rectangle( col * spriteDef.width, row * spriteDef.height, spriteDef.width, spriteDef.height );
            let texture = new PIXI.Texture( sprite.baseTexture, rect );
            pageTextures.push( texture );
        }
        this.textures = pageTextures;

        Log.out( 'AnimationItem: update 3' );
        this.imageSprite = new PIXI.AnimatedSprite( this.textures );
        this.pixiObj.addChild( this.imageSprite );
        this.imageSprite.visible = false;

        Log.out( 'Total book frames: ' + this.imageSprite.totalFrames );

        this.imageSprite.animationSpeed = ( this.options.speed ) ? this.options.speed : 0.2;
        this.imageSprite.loop = spriteDef.loop;
        this.imageSprite.onComplete = ()=>{
            this.emit( 'animationStopped' );
        };
    }

    setVisible( state ) {
        super.setVisible( state );
        this.imageSprite.visible = state;
    }

    start() {
        this.setVisible( true );
        this.imageSprite.gotoAndPlay( 0 );
    }

    stop() {
        this.imageSprite.stop();
    }

    scale() {
        return this.parent.scale();
    }

    pos() {
        return {
            x: this.imageSprite.x,
            y: this.imageSprite.y
        }
    }

    size() {
        return {
            x: this.imageSprite.width,
            y: this.imageSprite.height
        }
    }

    draw() {
        let game = Game.instance();
        let scale = this.parent.scale();
        let parentPos = this.parent.pos();

        let options = ( this.options.vertical != undefined )
            ? ( game.isVertical() ? this.options.vertical : this.options.horizontal )
            : this.options;

        let img = this.imageSprite;
        img.x = parentPos.x + options.x * scale.x;
        img.y = parentPos.y + options.y * scale.y;
        img.width = options.width * scale.x;
        img.height = options.height * scale.y;
        super.draw();
    }
}
