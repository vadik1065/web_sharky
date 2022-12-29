/**
 * Блок управления страницами помощи.
 */

class HelpBox extends GameItem {

    currentPage;

    constructor( parent, options ) {
        super( parent );

        let page = new HelpPage1( this, options );
        page.setVisible( false );

        page = new HelpPage2( this, options );
        page.setVisible( false );

        page = new HelpPage3( this, options );
        page.setVisible( false );

        this.currentPage = 0;
    }

    scale() {
        return this.parent.scale();
    }

    pos() {
        return Game.instance().background.pos();
    }

    size() {
        return Game.instance().background.size();
    }

    open() {
        // Показ всегда начинаем с первой страницы
        this.currentPage = 0;
        this.children[ this.currentPage ].setVisible( true );
    }

    close() {
        this.children[ this.currentPage ].setVisible( false );
    }

    isOpened() {
        for ( let i = 0; i < this.children.length; ++i ) {
            if ( this.children[ i ].isVisible() ) {
                return true;
            }
        }
        return false;
    }

    update() {
        if ( this.isOpened() ) {
            this.draw();
        }
    }

    prevPage() {
        this.children[ this.currentPage ].setVisible( false );
        if ( --this.currentPage < 0 ) {
            this.currentPage = this.children.length - 1;
        }
        this.children[ this.currentPage ].setVisible( true );
    }

    nextPage() {
        this.children[ this.currentPage ].setVisible( false );
        if ( ++this.currentPage >= this.children.length ) {
            this.currentPage = 0;
        }
        this.children[ this.currentPage ].setVisible( true );
    }
}
