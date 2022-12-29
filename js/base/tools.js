/**
 * Пакет вспомогательных функций.
 */

class Tools {

    /**
     * Форматирование числа - разбиение целой части на триады.
     *
     * @param value исходное число
     * @param decimal необязательное число десятичных знаков после запятой
     * в выходной строке. По умолчанию - 0.
     *
     * @return Строчное представление числа, в котором числа целой части разбиты
     * на группы по три символа.
     */

    static formatAmount( value, decimal = 0 ) {
        let outStr = '';
        let strDecimal = '';
        let strValue = value.toFixed( decimal );
        let symCount = strValue.length;
        if ( decimal > 0 ) {
            strDecimal = strValue.substring( symCount - decimal - 1 );
            strValue = strValue.substring( 0, symCount - decimal - 1 );
        }
        let firstCount = symCount % 3;
        if ( firstCount > 0 ) {
            outStr += strValue.substring( 0, firstCount );
            strValue = strValue.substring( firstCount );
        }
        while ( strValue.length > 0 ) {
            if ( outStr.length > 0 ) outStr += ' ';
            outStr += strValue.substring( 0, 3 );
            strValue = strValue.substring( 3 );
        }
        outStr += strDecimal;
        return outStr;
    }

    /**
     * Сформировать текстовое описание свойств объекта.
     *
     * @param {object} obj
     *
     * @returns {string}
     */
    static objProperties( obj ) {
        let txt = obj.constructor.name;
        for ( let prop in obj ) {
            txt += ', ' + prop + '=' + obj[ prop ];
        }
        return txt;
    }

    /**
     * Получить псевдослучайное целое число в интервале [min,max).
     *
     * @param {number} min
     * @param {number} max
     *
     * @returns {Number}
     */
    static randomInt( min, max ) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Глубокое копирование объекта.
     *
     * @param {object} obj исходный объект
     *
     * @returns {object} копию исходного объекта
     */
    static clone( obj ) {
        return JSON.parse( JSON.stringify( obj ) );
    }
}
