/**
 * Кнопка, представляющая заданное значение.
 */

class ValueButton extends Window {

    FONT_SIZE = 26;

    textItem;

    value;

    constructor( parent, value, options ) {

        super( parent, options );

        this.selected = false;
        this.value = value;
        this.textItem = new TextItem( this, value.toString(), {
            fontFamily : 'Arial',
            fontSize: this.FONT_SIZE,
            fontWeight: 'bold',
            color: options.valueColor,
            align: 'center'
        });
        this.draw();
    }

    draw() {
        this.textItem.options.color = this.selected ? this.options.selected.valueColor : this.options.valueColor ;
        super.draw();
    }
}