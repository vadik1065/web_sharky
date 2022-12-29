<?php

const CONNECT_TIMEOUT = 10;

function outln( $arg1 ) {
    $file = './debug-'.date('Y-m-d').'.log';
    if ( ! file_exists( $file ) || is_writable( $file ) ) {
        $dt = new DateTime('now');
        $prefix = $dt->format('H:i:s.v ');
        error_log( $prefix.$arg1."\n", 3, $file);
    }
}

$postData = urldecode( file_get_contents('php://input') );
$data = explode( '&', $postData );
$params = [];
$apiUrl = '';
$cookie = null;
foreach ( $data as $str ) {
    $pos = strpos( $str, '=' );
    $key = trim( substr( $str, 0, $pos ) );
    $value = trim( substr( $str, $pos + 1 ) );
    outln( 'Parse param: key=' . $key . ', value=' . $value );
    if ( $key == 'remote' ) {
        $apiUrl = $value;
    }
    elseif ( $key == 'cookie' ) {
        $cookie = $value;
    }
    else {
        $params[] = $key . '=' . urlencode( $value );
    }
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl );
//curl_setopt($ch, CURLOPT_PORT, $port);
//curl_setopt($ch, CURLOPT_USERPWD, $user.':'.$psword );
$headers = [
    'Content-Type: application/x-www-form-urlencoded'
];
if ( $cookie ) {
    outln( 'Send cookie: ' . $cookie );
    $headers[] = 'cookie: ' . $cookie;
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers );
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, CONNECT_TIMEOUT );
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, implode('&', $params ) );
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYSTATUS, false);
$reply = curl_exec($ch);
$info = curl_getinfo( $ch );
curl_close($ch);

outln( 'Request info: ' . json_encode( $info, JSON_PRETTY_PRINT ) );
$httpCode = intval( $info['http_code'] );
if ( $httpCode == 0 ) { // нет соединения?
    $httpCode = 503;
}
if ( 400 <= $httpCode  ) {

    $httpCodes = [
        400 => 'Bad Request',
        401	=> 'Unauthorized',
        403	=> 'Forbidden',
        404	=> 'Not Found',
        405	=> 'Method Not Allowed',
        406	=> 'Not Acceptable',
        407	=> 'Proxy Authentication Required',
        408	=> 'Request Timeout',
        500	=> 'Internal Server Error',
        501	=> 'Not Implemented',
        502	=> 'Bad Gateway',
        503	=> 'Service Unavailable',
        504	=> 'Gateway Timeout',
        505	=> 'HTTP Version Not Supported'
    ];

    if ( isset( $httpCodes[ $httpCode ] ) ) {
        header( 'HTTP/1.1 ' . $httpCode .  ' ' . $httpCodes[ $httpCode ] );
    }
    else {
        header( 'HTTP/1.1 ' . $httpCode .  ' Unknown Error' );
    }
    exit();
}

// Сделать разбор ответа удаленного сервера

$lines = explode("\r\n", $reply);
$reply = '';
$cookie = null;
$header = true;
foreach ( $lines as $line ) {
    // Заголовок закончился - это ответ на запрос
    if ( ! $header ) {
        $reply = $line;
        break;
    }
    // Пустая строка - конец строк заголовка
    if ( strlen( $line ) == 0 ) {
        $header = false;
        continue;
    }
    // Разобрать строку заголовка
    $pair = explode( ':', $line );
    if (strtolower( $pair[0] ) == 'set-cookie') {
        $arr = explode( ';', trim( $pair[1] ) );
        $cookie = trim( $arr[0] );
        outln( 'Get cookie: ' . $cookie );
    }
}

outln( 'Reply: ' . $reply );

$reply = json_decode( $reply, true );
if ( $cookie ) {
    $reply['cookie'] = $cookie;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode( $reply );
?>
