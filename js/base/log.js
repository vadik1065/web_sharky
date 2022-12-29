/**
 * Инструмент ведения протокола игры.
 */

const _DEBUG = false;

const extendLog = (f, message) => {
    if ( _DEBUG ) {
        try {
            throw new Error();
        }
        catch (e) {
            const backtrace = [...e.stack.matchAll(/[\w\.\\\/:_\-]+?:\d+:\d+/g)];
            backtrace.length > 3 ? f(backtrace[2][0], message) : f(message);
        }
    }
    else {
        f(message);
    }
};

class Log {

    static enabled = false;

    static out( text ) {
        if ( Log.enabled ) {
            extendLog( console.log, text );
        }
    }

    static info( text ) {
        if ( Log.enabled ) {
            console.info( text );
        }
    }

    static warn( text ) {
        if ( Log.enabled ) {
            console.warn( text );
        }
    }

    static error( text ) {
        if ( Log.enabled ) {
            console.error( text );
        }
    }
}
