/**
 * Класс обработки сетевых запросов.
 */

class Network {

    static REQUEST_TIMEOUT = 20000;

    /** Тип ошибка */
    static ERROR_NETWORK = 1;
    static ERROR_SERVER = 2;

    /** Номера серверных ошибок */
    static REPLY_IS_NULL         = -1;
    static NO_ERROR              = 0;
    static SESSION_INVALID       = 1;    // недопустимая сессия
    static GROUP_EXPIRED         = 2;    // истекло время активности группы
    static BALANCE_EXCEEDED      = 3;    // превышен баланс пользователя
    static GAME_DISABLED         = 4;    // игра отключена
    static GAME_REQ_UPDATE       = 5;    // требуется обновление игры
    static GAME_REQ_STOP         = 6;    // требуется остановка игры
    static INVALID_EMAIL         = 7;    // неверный email
    static INVALID_PSWORD        = 8;    // неверный пароль
    static INVALID_PHONE         = 9;    // неверный номер телефона
    static EMAIL_EXISTS          = 10;   // email уже существует
    static EMAIL_NOT_FOUND       = 11;   // email не найден
    static EMAIL_NOT_SENT        = 12;   // письмо не отправлено
    static INVALID_CODE          = 13;   // неверный код подтверждения
    static INVALID_DEVHASH       = 14;   // неверный хэш устройства
    static REG_IP_PROHIBITED     = 15;   // регистрация с данного IP-адреса запрещена
    static LOGIN_IP_PROHIBITED   = 16;   // авторизация с данного IP-адреса запрещена
    static PSWORD_RECOVER_LIMIT  = 17;   // превышен лимит восстановления пароля с данного IP-адреса
    static BONUS_REQUIRED_OUTPUT = 18;   // требуется вывод с баланса в бонусном режиме
    static INVALID_FRAME_UID     = 19;   // недопустимый идентификатор фрейма игры

    /** Очередь запросов */
    static queue;

    static apiHostName = 'mdev2.kronaslot.com';

    static frameUID = '';

    static sessionId = null;

    static gameLang = 'en';

    //! Инициализация данных для взаимодействия с сервером.
    static initilize() {
        Network.queue = [];
        $.ajaxSetup({
            timeout: Network.REQUEST_TIMEOUT
        });
    }

    static setFrameUID( uid ) {
        Network.frameUID = uid;
    }

    static setSessionID( sessionId ) {
        Network.sessionId = ( sessionId == null || sessionId == undefined || sessionId == '' ) ? null : sessionId;
    }

    /**
     * Отправить асинхронный запрос на сервер.
     *
     * @param {string} proc название удаленной процедуры на сервере
     * @param {object} params ассоциативный массив параметров удаленной процедуры
     * @param {type} callback функция, которая будет вызвана при получении данных от сервера
     * @param {type} onErrorCallback функция, которая будет вызвана в случае ошибки
     *
     * @returns {boolean}
     */
    static sendRequest( proc, params, callback, onErrorCallback ) {

        // Подготовить параметры запроса

        let data = Tools.clone( params );
        data['lang'] = Network.gameLang;
        data['platform'] = 'js';
        data['frameuid'] = Network.frameUID;

        let requestURL = '/api/' + proc + '.php';
        let hostName = Network.apiHostName;
        if ( window.location.hostname == hostName ) {   // редирект не нужен
            if ( Network.sessionId ) {

                // При прямом запросе передаем идентификатор сессии в параметрах запроса

                data['sessionId'] = Network.sessionId;
            }
        }
        else {                                          // используем локальный редирект
            data['remote'] = 'https://' + hostName + requestURL;
            requestURL = './api/request.php';
            if ( Network.sessionId ) {

                // При редиректе передаем сессионную куку

                data['cookie'] = '_GCS_SID_=' + Network.sessionId;
            }
        }

        Log.out( 'Server request to [' + proc + ']: ' + JSON.stringify( data ) );

        // Отправить запрос

        $.post( requestURL, data, function( json, textStatus, xhr ) {

            if ( xhr ) {
                let headers = xhr.getAllResponseHeaders().split('\r\n');
                for ( let header of headers  ) {
                    let pair = header.split(':');
                    let name = pair[0].trim();
                    if ( name == 'current-session-id' ) {
                        Network.sessionId = pair[1].trim();
                        Log.out( 'Response session ID: ' + Network.sessionId );
                        break;
                    }
                }
            }
            else {
                Log.out( 'XHR undefined' );
            }

            // Обработать ответ сервера

            if ( json ) {
                if ( 'cookie' in json ) {   // при использовании локального редиректа
                    let a = json.cookie.split( '=' );
                    Network.sessionId = a[1].trim();
                    delete json['cookie'];
                }
                Network.replyHandler( json, callback, onErrorCallback );
            }
            else {
                Log.error( '### Server reply is NULL' );
                if ( onErrorCallback ) {
                    onErrorCallback({
                        errorType: Network.ERROR_SERVER,
                        error: Network.REPLY_IS_NULL,
                        errorText: 'Server reply is NULL'
                    });
                }
            }
        })
        .fail( function( e ) {

            // Фатальная сетевая/серверная ошибка

            Log.error( '### Fatal error: ' + e.status + ' ' + e.statusText );
            if ( onErrorCallback ) {
                onErrorCallback({
                    errorType: Network.ERROR_NETWORK,
                    error: e.status,
                    errorText: e.statusText
                });
            }
        });
    }

    /**
     * Обработать ответ сервера.
     *
     * @param {type} json объект с данными сервера
     * @param {type} callback функция, которая будет вызвана при получении данных от сервера
     * @param {type} onErrorCallback функция, которая будет вызвана в случае ошибки
     */
    static replyHandler( json, callback, onErrorCallback ) {

        Log.out( 'Server reply: ' + JSON.stringify( json ) );

        // Ошибка сессии
        if ( 'session' in json && json.session == false ) {
            Log.error( '### Session error: ' + Network.SESSION_INVALID + ( 'error' in json ? ' ' + json.error : '' ) );
            if ( onErrorCallback ) {
                onErrorCallback({
                    type: Network.ERROR_SERVER,
                    code: Network.SESSION_INVALID,
                    text: ( 'errorText' in json ? json.errorText : '' )
                });
            }
            return;
        }

        // Группа неактивна
        if ( 'groupExpired' in json && json.groupExpired == true ) {
            Log.error( '### Group expired error: ' + GROUP_EXPIRED + ( 'error' in json ? ' ' + json.error : '' ) );
            if ( onErrorCallback ) {
                onErrorCallback({
                    type: Network.ERROR_SERVER,
                    code: Network.GROUP_EXPIRED,
                    text: ( 'errorText' in json ? json.errorText : '' )
                });
            }
            return;
        }

        // Ошибка сервера
        if ( 'error' in json ) {
            Log.error( '### Server error: '+ ( 'errorCode' in json ? '(' + json.errorCode + ') ' : '' ) + json.error  );
            if ( onErrorCallback ) {
                onErrorCallback({
                    type: Network.ERROR_SERVER,
                    code: ( 'errorCode' in json ? json.errorCode : -1 ),
                    text: json.error
                });
            }
            return;
        }

        // Нормальный ответ - вызвать функцию обработки ответа
        if ( callback ) callback(json);
    }
}
