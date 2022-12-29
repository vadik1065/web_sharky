/**
 * Элемент для вывода текста.
 */

class TextItem extends GameItem {

    static DEFAULT_FONT_SIZE = 22;
    static DEFAULT_LINE_HEIGHT = 32;

    /** Объект текста (PIXI.Text) */
    pixiText;

    /**
     * Параметры отрисовки текста:
     *
     * 'fontFamily' по умолчанию 'Arial'
     * 'fontSize' по умолчанию 22
     * 'fontWeight' по умолчанию 'normal'
     * 'color' по умолчанию 0xFFFFFF
     * 'align' по умолчанию не определено ('left', 'centerX', 'centerY', 'center', 'right' )
     * 'x' по умолчанию 0
     * 'y' по умолчанию 0
     * 'width' по умолчанию - ширина родителя
     * 'height' по умолчанию - высота родителя
     * 'rightMargin' по умолчанию 0
     * 'leftMargin' по умолчанию 0
     * 'shadow' - описание тени:
     *      'alpha' - число (по умолчанию 1) альфа
     *      'angle' - число (по умолчанию Math.PI/6) угол смещения тени
     *      'blur' - число (по умолчанию 0) радиус блюра
     *      'color' - строка или число (по умолчанию 'black') цвет тени
     *      'distance' - число (по умолчани. 5) смещение тени от позиции текста
     */
    options;

    textStyle;

    /** Массив строк */
    lines;

    constructor( parent, text, options ) {

        super( parent );

        this.options = Tools.clone( options );
        let textStyle = {
            fontFamily : ( options.fontFamily != undefined ) ? options.fontFamily : 'Arial',
            fontSize: ( options.fontSize != undefined ) ? options.fontSize : TextItem.DEFAULT_FONT_SIZE,
            fontWeight: ( options.fontWeight != undefined ) ? options.fontWeight : 'normal',
            fill: ( options.color != undefined ) ? options.color : 0xFFFFFF
        };
        if ( this.options.shadow ) {
            let sh = this.options.shadow;
            textStyle.dropShadow = true;
            textStyle.dropShadowAlpha = ( sh.alpha != undefined ) ? sh.alpha : 1;
            textStyle.dropShadowAngle = ( sh.angle != undefined ) ? sh.angle : Math.PI/6;
            textStyle.dropShadowBlur  = ( sh.blur != undefined )  ? sh.blur : 0;
            textStyle.dropShadowColor = ( sh.color != undefined ) ? sh.color : 0;
            textStyle.dropShadowDistance = ( sh.distance != undefined ) ? sh.distance : 5;
        }
        this.textStyle = textStyle;
        this.parseText( text );
    }

    parseText( text ) {
        if ( Array.isArray( text ) ) {
            this.lines = Tools.clone( text );
        }
        else {
            this.lines = text.split("\n");
        }
        let lines = this.lines;
        while ( this.pixiObj.children.length < lines.length ) {
            let pixiText = new PIXI.Text( '', this.textStyle );
            pixiText.resolution = 2; //window.devicePixelRatio || 1;
            this.pixiObj.addChild( pixiText );
        }
        while ( this.pixiObj.children.length > lines.length ) {
            this.pixiObj.removeChildAt( this.pixiObj.children.length - 1 );
        }
        for ( let i = 0; i < lines.length; ++i ) {
            let pixiText = this.pixiObj.children[ i ];
            pixiText.text = lines [ i ];
        }
    }

    updateText( text ) {
        this.parseText( text );
        this.draw();
    }

    lineCount() {
        return this.lines.length;
    }

    textLine( index ) {

        // TODO: добавить проверку индекса

        return this.pixiObj.children[index];
    }

    /**
     * Получить текущую ширину текста.
     */
    width() {
        let lines = this.lines;
        let lineCount = lines.length;
        let maxWidth = 0;
        for ( let i = 0; i < lineCount; ++i ) {
            let pixiText = this.pixiObj.children[i];
            if ( pixiText.width > maxWidth ) {
                maxWidth = pixiText.width;
            }
        }
        return maxWidth;
    }

    draw() {

        if ( ! this.visible ) return;

        let parentPos = this.parent.pos();
        let parentSize = this.parent.size();
        let scale = this.parent.scale();

        let lineHeight = ( this.options.lineHeight != undefined ) ? this.options.lineHeight : TextItem.DEFAULT_LINE_HEIGHT;

        let lines = this.lines;
        let lineCount = lines.length;

        let fontSize = ( this.options.fontSize != undefined ) ? this.options.fontSize : TextItem.DEFAULT_FONT_SIZE;
        let totalHeight = (lineCount - 1) * lineHeight + fontSize;

        for ( let i = 0; i < lineCount; ++i ) {

            let pixiText = this.pixiObj.children[i];
            pixiText.style.fontSize = Math.floor( fontSize * scale.y );
            pixiText.style.fill = ( this.options.color != undefined ) ? this.options.color : 0xFFFFFF;

            let x = parentPos.x;
            let y = parentPos.y;
            if ( this.options.align != undefined ) {

                if ( this.options.align == 'left' ) {           // выравнивание влево

                    if ( this.options.leftMargin != undefined ) {
                        x += this.options.rightMargin * scale.x;
                    }
                    y += this.options.y * scale.y;
                }
                else if ( this.options.align == 'right' ) {     // выравнивание вправо

                    if ( this.options.width ) {
                        x += this.options.width * scale.x - pixiText.width;
                    }
                    else {
                        x += parentSize.width - pixiText.width;
                    }
                    if ( this.options.rightMargin != undefined ) {
                        x -= this.options.rightMargin * scale.x;
                    }
                    y += this.options.y * scale.y;
                }
                else if ( this.options.align == 'centerX' ) {   // центрирование по горизонтали

                    if ( this.options.y ) {
                        y += this.options.y * scale.y;
                    }
                    if ( this.options.width ) {
                        x += ( scale.x * this.options.width - pixiText.width ) / 2 ;
                    }
                    else {
                        x += ( parentSize.width - pixiText.width ) / 2 ;
                    }
                    if ( this.options.x ) x += this.options.x * scale.x;
                }
                else if ( this.options.align == 'centerY' ) {   // центрирование по вертикали

                    if ( this.options.x ) {
                        x += this.options.x * scale.x;
                    }
                    if ( this.options.leftMargin != undefined ) {
                        x += this.options.rightMargin * scale.x;
                    }
                    if ( this.options.height ) {
                        y += ( this.options.height * scale.y - pixiText.height ) / 2;
                    }
                    else {
                        y += ( parentSize.height - pixiText.height ) / 2;
                    }
                }
                else {                                          // по центру

                    if ( this.options.x ) {
                        x += this.options.x * scale.x;
                    }
                    if ( this.options.width ) {
                        x += ( scale.x * this.options.width - pixiText.width ) / 2 ;
                    }
                    else {
                        x += ( parentSize.width - pixiText.width ) / 2 ;
                    }
                    if ( this.options.y ) {
                        y += this.options.y * scale.y;
                    }
                    if ( lineCount == 1 ) {
                        if ( this.options.height ) {
                            y += ( this.options.height * scale.y - pixiText.height ) / 2;
                        }
                        else {
                            y += ( parentSize.height - pixiText.height ) / 2;
                        }
                    }
                    else {
                        if ( this.options.height ) {
                            y += ( this.options.height * scale.y - totalHeight * scale.y ) / 2;
                        }
                        else {
                            y += ( parentSize.height - totalHeight * scale.y ) / 2;
                        }
                    }
                }
            }
            else {
                x += this.options.x * scale.x;
                y += this.options.y * scale.y;
            }
            pixiText.x = x;
            pixiText.y = y + lineHeight * i * scale.y;
        }
    }
}
