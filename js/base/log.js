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
            extendLog( console.log, Log.time() + text );
        }
    }

    static info( text ) {
        if ( Log.enabled ) {
            console.info( Log.time() + text );
        }
    }

    static warn( text ) {
        if ( Log.enabled ) {
            console.warn( Log.time() + text );
        }
    }

    static error( text ) {
        if ( Log.enabled ) {
            console.error( Log.time() + text );
        }
    }

    static time() {
        let d = new Date();
        let h = d.getHours();
        let m = d.getMinutes();
        let s = d.getSeconds();
        return ( h < 10 ? '0'+h : ''+h ) + ':' +
               ( m < 10 ? '0'+m : ''+m ) + ':' +
               ( s < 10 ? '0'+s : ''+s ) + '.' +
               d.getMilliseconds() + ' ';
    }
}
