/**
 * Анимированный выигрышный символ.
 */

class WinSymbol extends GameItem {

    /**
     * Параметры отображения символа:
     *
     * symbol - идентификатор символа (может отличаться от символа на барабане)
     * reelIndex - индекс барабана
     * symbolPos - позиция заданного символа на барабане
     */
    options;

    /** Текстуры для анимации */
    textures;

    /** Анимированный спрайт */
    anime;

    constructor( parent, options, layer = null ) {
        super( parent, layer );

        this.options = Tools.clone( options );

        let game = Game.instance();
        let reelBox = game.reelBox;
        let symbol = options.symbol;

        let speed = 0;
        let textures = [];
        let info = game.symbols.info[ symbol ];
        if ( ! info ) {
            Log.error( 'Undefined symbol information: ' + symbol );
        }
        let def = reelBox.bonusSymbols ? info.bonus : info.normal;
        if ( def.sprite || def.bonus ) {    // задан спрайт
            let spriteData = ( game.isBonusStarted() && def.bonus ) ? def.bonus : def.sprite;
            let cnt = spriteData.count;
            let colCount = spriteData.columns;
            let symbolSize = ( game.isBonusStarted() && def.bonus ) ? def.bonus : game.symbols.size.horizontal;
            if ( spriteData.width && spriteData.height ) {
                symbolSize = spriteData;
            }
            let sprite = PIXI.Texture.from( spriteData.url );
            for ( let i = 0; i < cnt; ++i ) {
                let x = ( i % colCount ) * symbolSize.width;
                let y = Math.floor( i / colCount ) * symbolSize.height;
                let rect = new PIXI.Rectangle( x, y, symbolSize.width, symbolSize.height );
                let texture = new PIXI.Texture( sprite.baseTexture, rect );
                textures.push( texture );
            }
            speed = cnt * 0.01;
        }
        else if ( def.animate ) {     // анимация одиночного символа
            textures.push( PIXI.Texture.from( def.animate ) );
            textures.push( PIXI.Texture.from( def.url ) );
            speed = 0.05;
        }
        else {
            Log.warn( '### Line: not found animation style for symbol ' + symbol );
        }

        if ( speed == 0 ) {
            this.anime = null;
        }
        else {
            this.textures = textures;
            this.anime = new PIXI.AnimatedSprite( textures );
            this.anime.animationSpeed = speed;
            this.anime.loop = true;
            this.anime.play();
            this.pixiObj.addChild( this.anime );
        }
    }

    destroy() {
        if ( this.anime ) {
            this.pixiObj.removeChild( this.anime );
            this.anime.destroy();
            this.anime = null;
        }
    }

    show() {
        this.anime.gotoAndStop( 0 );
        this.draw();
    }

    play() {
        this.anime.gotoAndPlay( 0 );
        this.draw();
    }

    draw() {
        let anime = this.anime;
        if ( anime ) {
            let reelBox = Game.instance().reelBox;
            let reel = reelBox.reel( this.options.reelIndex );

            let pos = this.options.symbolPos;
            let symPos = reel.symbolPos( pos );
            let symSize = reel.symbolSize( pos );

            anime.x = symPos.x;
            anime.y = symPos.y;
            anime.width = symSize.width;
            anime.height = symSize.height;
        }
    }

    scale() {
        return this.parent.scale();
    }
}
