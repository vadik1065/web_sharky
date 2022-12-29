/**
 * Класс для сохранение и восстановления локальных параметров игры.
 */

class Options {

    static SOUND_MUTED = 'soundMuted';

    /**
     * Получить (прочитать) значение произвольного параметра.
     *
     * @param {string} name название параметра
     * @param {any} defaultVal значение по умолчанию
     *
     * @returns {any} значение параметра
     */
    static value( name, defaultVal ) {
        try {
            let storage = window.localStorage;
            let value = storage.getItem( name );
            Log.warn( 'Get from storage "' + name + '" = ' + value + ' (' + JSON.stringify( value ) + ')' );
            if ( value !== null && value !== '' ) {
                return value;
            }
        }
        catch ( e ) {
            Log.error( e.message || e );
        }
        Log.warn( 'Get from storage "' + name + '" default value = ' + defaultVal + ' (' + JSON.stringify( defaultVal ) + ')' );
        return defaultVal;
    }

    /**
     * Установить (сохранить) значение произвольного параметра.
     *
     * @param {string} name название параметра
     * @param {any} value значение параметра
     */
    static setValue( name, value ) {
        try {
            let storage = window.localStorage;
            storage.setItem( name, value );
            Log.warn( 'Set to storage "' + name + '" = ' + value + ' (' + JSON.stringify( value ) + ')' );
        }
        catch ( e ) {
            Log.error( e.message || e );
        }
    };

    /**
     * Получить значение выключения звука.
     *
     * @returns {boolean}
     */
    static soundMuted() {
        let muted = Options.value( Options.SOUND_MUTED, 'no' );
        return ( muted === 'yes' );
    }

    /**
     * Установить значение выключения звука.
     *
     * @param {boolean} value флаг выключения звука
     */
    static setSoundMuted( value ) {
        Options.setValue( Options.SOUND_MUTED, value ? 'yes' : 'no' );
    }
}
