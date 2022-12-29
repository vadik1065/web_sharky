/**
 * Проигрывание звуковых файлов.
 */

class SoundPlayer extends GameItem {

    static sounds = {
        "origin/event_chestopen.mp3":   { time: 2520 },
        "origin/event_rowboat.mp3":     { time: 2160 },
        "origin/event_sharkattack.mp3": { time: 7668 },
        "origin/event_shipnewboat.mp3": { time: 7416 },
        "origin/event_swimmer.mp3":     { time: 1332 },
        "origin/feature_background.mp3":{ time: 7884 },
        "origin/feature_end_long.mp3":  { time: 9756 },
        "origin/teaser1.mp3":        { time: 900 },
        "origin/teaser2.mp3":        { time: 972 },
        "origin/win_chest.mp3":      { time: 8532 },
        "origin/win_chest2.mp3":     { time: 3744 },
        "origin/win_compass.mp3":    { time: 7452 },
        "origin/win_compass2.mp3":   { time: 4320 },
        "origin/win_jt9.mp3":        { time: 3204 },
        "origin/win_kq.mp3":         { time: 4680 },
        "origin/win_parrot.mp3":     { time: 7200 },
        "origin/win_parrot2.mp3":    { time: 4356 },
        "origin/win_pirate.mp3":     { time: 21996 },
        "origin/win_sword.mp3":      { time: 7668 },
        "origin/win_sword2.mp3":     { time: 4896 },
        "22_btd_card_open_same.mp3": { time: 1008 },
        "23_btd_card_open.mp3":      { time: 252 },
        "autoplaystart.mp3":         { time: 1548 },
        "autoplaystop.mp3":          { time: 1584 },
        "button.mp3":                { time: 252 },
        "buttons_bet.mp3":           { time: 360 },
        "changebet.mp3":             { time: 540 },
        "changemaxbet.mp3":          { time: 432 },
        "creditincrease.mp3":        { time: 9864 },
        "decidegamble.mp3":          { time: 4068 },
        "gamblewin.mp3":             { time: 1656 },
        "overlayclose.mp3":          { time: 540 },
        "overlayopen.mp3":           { time: 612 },
        "reelrun.mp3":               { time: 4896 },
        "reelsilent.mp3":            { time: 3960 },
        "reelstop.mp3":              { time: 540 },
        "win10.mp3":                 { time: 1188 },
        "win2.mp3":                  { time: 936 },
        "win20.mp3":                 { time: 1224 },
        "win25.mp3":                 { time: 2520 },
        "win5.mp3":                  { time: 1008 },
        "wincountstop.mp3":          { time: 612 }
    };

    static suffix = '.mp3';
    static folder = './sounds/';

    static #_inst;

    static instance() {
        return SoundPlayer.#_inst;
    }

    downloadCount;

    muteState;

    constructor( parent ) {
        super( parent );
        SoundPlayer.#_inst = this;
        this.downloadCount = 0;
        this.muteState = false;
        Log.out( 'Create sound player' );
    }

    duration( name ) {
        let tm = this.SoundPlayer[ name + SoundPlayer.suffix ].time;
        if ( tm == undefined ) tm = 0;
        return tm;
    }

    fileName( name ) {
        return ( name === '' ) ? '' : (SoundPlayer.folder + name + SoundPlayer.suffix);
    }

    /**
     * Запустить проигрывание звукового файла.
     *
     * @param {string} name название звукового файла
     * @param {callable} onEndFunc функция, вызываемая по завершении проигрывания файла
     * @param {object} funcParams параметры, передаваемые функции завершения
     */
    startPlay( name, onEndFunc = null, funcParams = null ) {
        let sound = SoundPlayer.sounds[ name + SoundPlayer.suffix ].sound;
        if ( sound == undefined ) {
            Log.out( 'Not found audio item for ' + name );
            return;
        }
        let soundName = name;
        sound.once( 'end', function(){
            Log.out( 'End play sound "' + soundName + '"' );
            if ( onEndFunc ) onEndFunc( funcParams );
        });
        sound.loop( false );
        sound.mute( this.muteState );
        Log.out( 'Start play sound "' + name + '". Mute is ' + ( this.muteState ? 'true' : 'false' ) );
        sound.play();
    }

    /**
     * Запустить проигрывание звукового файла в цикле.
     *
     * @param {string} name название звукового файла
     */
    playLoop( name ) {
        let sound = SoundPlayer.sounds[ name + SoundPlayer.suffix ].sound;
        if ( sound == undefined ) {
            Log.out( 'Not found audio item for ' + name );
            return;
        }
        sound.loop( true );
        sound.mute( this.muteState );
        Log.out( 'Start loop play "' + name + '". Mute is ' + ( this.muteState ? 'true' : 'false' ) );
        sound.play();
    }

    /**
     * Остановить проигрывание звукового файла.
     *
     * @param {string} name название звукового файла
     */
    stopPlay( name ) {
        let sound = SoundPlayer.sounds[ name + SoundPlayer.suffix ].sound;
        if ( sound == undefined ) {
            Log.out( 'Not found audio item for ' + name );
            return;
        }
        Log.out( 'Stop play ' + name );
        sound.stop();
    }

    /**
     * Получить состояние молчания.
     *
     * @returns {boolean} Возвращает текущее состояние молчания.
     */
    isMuted() {
        Log.out( 'Sound mute is ' + ( this.muteState ? 'true' : 'false' ) );
        return this.muteState;
    }

    /**
     * Установить состояние молчания для всех звуков.
     *
     * @param {boolean} state новое состояние
     */
    setMute( state ) {
        this.muteState = state;
        Log.out( 'Set sound mute to ' + ( this.muteState ? 'true' : 'false' ) );
        let names = Object.keys( SoundPlayer.sounds );
        for ( let i = 0; i < names.length; ++i ) {
            let sound = SoundPlayer.sounds[ names[ i ] ].sound;
            if ( sound != undefined ) {
                sound.mute( state )
            }
        }
    }

    /**
     * Загрузить все звуковые файлы.
     *
     * Загрузка происходит асинхронно. По завершении загрузки возбуждается событие
     * 'downloadFinished'. При ошибке загрузки возбуждается событие 'downloadError'.
     */
    download() {

        let files = Object.keys( SoundPlayer.sounds );
        Log.out( 'Start download sound files: ' + files.length );
        for ( let i = 0; i < files.length; ++i ) {

            let name = files[ i ];

            Log.out( 'Start download sound: ' + name );
            let sound = new Howl({
                src: SoundPlayer.folder + name,
                autoplay: false
            });
            SoundPlayer.sounds[ name ].sound = sound;
            sound.once( 'load', () => {
                let player = SoundPlayer.instance();
                player.downloadCount += 1;
                Log.out( 'Download sound ' + player.downloadCount + ': ' + name );
                if ( player.downloadCount === files.length )
                    player.emit( 'downloadFinished' );
                this.parent.emit('music.progress', player.downloadCount * 100 / files.length);
            });
            sound.once( 'loaderror', ( id, error ) => {
                let player = SoundPlayer.instance();
                player.emit( 'downloadError', {
                    name: name,
                    error: error
                });
            });
            sound.load();
        }
    }
}
