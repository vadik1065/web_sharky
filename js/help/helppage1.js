/**
 * 1-я страница помощи.
 */

class HelpPage1 extends ImageItem {

    static data = {
        vertical: {
            pirat: {
                id: 1,
                options: {
                    x: 620, y: 30, width: 185, height: 123,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 24
                }
            },
            parrot: {
                id: 2,
                options: {
                    x: 178, y: 190, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            compas: {
                id: 3,
                options: {
                    x: 1038, y: 547, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            chest: {
                id: 4,
                options: {
                    x: 656, y: 218, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            sabers: {
                id: 5,
                options: {
                    x: 912, y: 189, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            k_q: {
                id: 6,
                options: {
                    x: 241, y: 322, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            j_10: {
                id: 8,
                options: {
                    x: 639, y: 375, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            _9: {
                id: 9,
                options: {
                    x: 940, y: 322, width: 155, height: 115,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            boat: {
                id: 11,
                options: {
                    x: 315, y: 468, width: 120, height: 42,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            }
        },
        horizontal: {
            pirat: {
                id: 1,
                options: {
                    x: 620, y: 25, width: 185, height: 123,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 25
                }
            },
            parrot: {
                id: 2,
                options: {
                    x: 178, y: 190, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            compas: {
                id: 3,
                options: {
                    x: 1038, y: 547, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            chest: {
                id: 4,
                options: {
                    x: 656, y: 218, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            sabers: {
                id: 5,
                options: {
                    x: 912, y: 189, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            k_q: {
                id: 6,
                options: {
                    x: 241, y: 322, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            j_10: {
                id: 8,
                options: {
                    x: 639, y: 375, width: 155, height: 84,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            _9: {
                id: 9,
                options: {
                    x: 940, y: 322, width: 155, height: 115,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            },
            boat: {
                id: 11,
                options: {
                    x: 315, y: 468, width: 120, height: 42,
                    color: 0xFFFFFF, align: 'centerX', fontName: 'Times New Roman', fontSize: 24, fontWeight: 'bold', lineHeight: 29
                }
            }
        }
    };

    shadowOptions  = {
        shadow: {
            color: 0,
            angle: 0,
            blur: 10,
            distance: 0
        }
    };

    textItems;

    constructor( parent, options ) {

        super( parent, options );

        this.textItems = [];

        let game = Game.instance();
        let symbols = game.symbols.info;
        let data = game.isVertical() ? HelpPage1.data.vertical : HelpPage1.data.horizontal;
        let names = Object.keys( data );
        for ( let i = 0; i < names.length; ++i ) {
            let name = names[ i ];
            let id = data[ name ].id;
            let lineCount = symbols[ id ].values.length;
            let str = '\n'.repeat( lineCount - 1 );

            let textOptions = {
                ... data[ name ].options,
                ...this.shadowOptions
            };
            let item = new TextItem( this, str, textOptions );
            this.textItems.push( item );
        }

        new TextItem( this, 'SUBSTITUTES\nfor  ALL symbols except', {
            x: 825, y: 40, width: 250, height: 70,
            align: 'centerX',
            color: options.text1_1.color,
            fontFamily: options.text1_1.fontName,
            fontSize: options.text1_1.fontSize,
            lineHeight: options.text1_1.lineHeight,
            fontWeight: 'bold',
            ...this.shadowOptions
        });

        new TextItem( this, 'Free Games', {
            x: 525, y: 535, width: 205, height: 36,
            align: 'center',
            color: options.text1_2.color,
            fontFamily: options.text1_2.fontName,
            fontSize: options.text1_2.fontSize,
            fontWeight: 'bold',
            ...this.shadowOptions
        });
    }

    /**
     * Текущий масштаб отображения.
     */
    scale() {
        let game = Game.instance();
        let scale = Tools.clone( this.parent.scale() );
        if ( game.isVertical() ) {
            scale.x *= this.options.vertical.width / this.options.horizontal.width,
            scale.y *= this.options.vertical.height / this.options.horizontal.height
        }
        return scale;
    }

    draw() {
        let game = Game.instance();
        let lineBet = game.selectedBet; // ставка на линию
        let totalBet = game.totalBet;   // полная ставка
        let symbols = game.symbols.info;

        let data = game.isVertical() ? HelpPage1.data.vertical : HelpPage1.data.horizontal;
        let names = Object.keys( data );
        for ( let i = 0; i < names.length; ++i ) {
            let name = names[ i ];
            let id = data[ name ].id;
            let lineCount = symbols[ id ].values.length;
            let bet = symbols[ id ].totalBet ? totalBet : lineBet;
            let item = this.textItems[i];
            for ( let j = 0; j < lineCount; ++j ) {
                item.textLine( j ).text = Tools.formatAmount( bet * symbols[ id ].values[ j ] );
            }
        }

        super.draw();
    }
}
