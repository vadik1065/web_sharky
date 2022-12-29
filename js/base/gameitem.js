/**
 * Базовый класс игрового элемента.
 *
 * Содержит контейнер для дочерних pixi-объектов и массив дочерних элементов.
 * Генерирует произвольные события.
 * Имеет свойства доступности и видимости.
 */

class GameItem {

    /**
     * Контейнер дочерних pixi-объектов (PIXI.Container).
     */
    pixiObj;

    /**
     * Массив дочерних элементов игры.
     *
     * Каждый объект должен иметь:
     *
     * свойство pixiObj - pixi-объект элемента
     * метод setVisible(state) для включения/выключения видимости
     *
     */
    children;

    parent;

    /**
     * Массив слушателей событий.
     *
     * Структура массива:
     *  {
     *      'eventName1': [ callback1, ..., callbackN ],
     *      'eventName2': [ callback1, ..., callbackN ],
     *  }
     */
    listeners;

    /** Флаг доступности элемента */
    enabled;

    /** Флаг видимости элемента */
    visible;

    /**
     * Конструктор.
     *
     * @param {object} parent объект-родитель (владелец)
     * @param {null|int} layer номер слоя (z-order)
     *
     * @returns {GameItem}
     */
    constructor( parent, layer = null ) {
        this.pixiObj = new PIXI.Container();
        this.listeners = {};
        this.children = [];
        this.enabled = true;
        this.visible = true;
        this.parent = parent;
        if ( parent != null ) {
            parent.addChild( this, layer );
        }
    }

    addChild( item, layer ) {
        this.children.push( item );
        if ( layer != null ) {
            this.pixiObj.addChildAt( item.pixiObj, layer );
        }
        else {
            this.pixiObj.addChild( item.pixiObj );
        }
    }

    /**
     * Получить состояние доступности элемента.
     *
     * @returns {bool}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Установить доступность элемента.
     *
     * @param {bool} state состояние доступности
     *
     * @returns {undefined}
     */
    setEnabled( state ) {
        this.enabled = state;
        if ( state ) {
            this.pixiObj.filters = null;
        }
        else {
            let colorMatrix = new PIXI.filters.ColorMatrixFilter();
            colorMatrix.resolution = window.devicePixelRatio || 1;
            colorMatrix.desaturate();
            this.pixiObj.filters = [colorMatrix];
        }
/*
        let cnt = this.children.length;
        for ( let i = 0; i < cnt; ++i ) {
            if ( this.children[ i ].setEnabled != undefined ) {
                this.children[ i ].setEnabled( state );
            }
        }
*/
    }

    /**
     * Получить состояние видимости элемента.
     *
     * @returns {bool}
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Установить состояние видимости элемента.
     *
     * @param {bool} state состояние видимости
     *
     * @returns {undefined}
     */
    setVisible( state ) {
        this.visible = state;
        this.pixiObj.visible = state;
        let cnt = this.children.length;
        for ( let i = 0; i < cnt; ++i ) {
            this.children[ i ].setVisible( state );
        }
        if ( state ) {
            this.draw();
        }
    }

    draw() {
        let cnt = this.children.length;
        for ( let i = 0; i < cnt; ++i ) {
            if ( this.children[ i ].visible ) {
                this.children[ i ].draw();
            }
        }
    }

    /**
     * Добавить слушателя события.
     *
     * @param {string} event тип/название события
     * @param {type} callback функция, вызываемая при возбуждении заданного события
     *
     * @returns GameItem
     */
    addListener( event, callback ) {

        if ( this.listeners[ event ] == undefined ) {
            this.listeners[ event ] = [];
        }
        this.listeners[ event ].push( callback );
        return this;
    }

    /**
     * Проверить наличие слушателя события.
     *
     * @param {string} event тип/название события
     *
     * @returns {boolean} Возвращает true, если есть хотя бы один слушатель
     * заданного события. Иначе возвращает false.
     */
    hasListener( event ) {
        return ( this.listeners[ event ] == undefined )
            ? false
            : ( this.listeners[ event ].length > 0 );
    }

    /**
     * Удалить слушателя события.
     *
     * @param {string} event тип/название события
     * @param {type} callback функция, вызываемая при возбуждении заданного события.
     *
     * @returns GameItem
     */
    removeListener( event, callback ) {
        if ( this.listeners[ event ] != undefined ) {
            let index = this.listeners[ event ].indexOf( callback );
            if ( index >= 0 ) {
                this.listeners[ event ].splice( index, 1 );
            }
        }
        return this;
    }

    /**
     * Возбудить событие.
     *
     * @param {string} event тип/название события
     * @param {object} params параметры, передаваемые слушателям события
     *
     * @returns {undefined}
     */
    emit( event, params = null ) {
        if ( this.listeners[ event ] != undefined ) {

            let list = this.listeners[ event ];
            let cnt = list.length;

            Log.out( 'Emit event "' + event + '". Callback count: ' + cnt );

            for ( let i = 0; i < cnt; ++i ) {
                list[ i ]( params );
            }
        }
    }
}
