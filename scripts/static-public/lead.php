<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

// Защита от спама: только со своего сайта, ограничение размера и частоты.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $selfHost = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
    if (!$originHost || strcasecmp($originHost, $selfHost) !== 0) {
        http_response_code(403);
        echo json_encode(['error' => 'forbidden']);
        exit;
    }
}

$MAX_BODY = 16000000; // 3 скрина по 4 МБ в base64 + поля
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > $MAX_BODY) {
    http_response_code(413);
    echo json_encode(['error' => 'too_large']);
    exit;
}

// Не больше 8 заявок за 10 минут с одного IP (файл-счётчик во временной папке).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/hdkv_lead_' . md5($ip) . '.json';
$fh = @fopen($rlFile, 'c+');
if ($fh && flock($fh, LOCK_EX)) {
    $now = time();
    $times = json_decode((string)stream_get_contents($fh), true);
    $times = array_values(array_filter(is_array($times) ? $times : [], function ($t) use ($now) {
        return $now - (int)$t < 600;
    }));
    $times[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($times));
    flock($fh, LOCK_UN);
    fclose($fh);
    if (count($times) > 8) {
        http_response_code(429);
        echo json_encode(['error' => 'rate_limited']);
        exit;
    }
}

$body = json_decode(file_get_contents('php://input', false, null, 0, $MAX_BODY + 1), true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_json']);
    exit;
}

$clean = function ($v) {
    return trim(str_replace(["\r", "\n"], ' ', (string)$v));
};

$name = mb_substr($clean($body['name'] ?? ''), 0, 200);
$phone = mb_substr($clean($body['phone'] ?? ''), 0, 100);
$email = mb_substr($clean($body['email'] ?? ''), 0, 200);
if ($name === '' || ($phone === '' && $email === '')) {
    http_response_code(400);
    echo json_encode(['error' => 'missing_fields']);
    exit;
}

$labels = [
    'call' => 'Заказать звонок',
    'consult' => 'Консультация с продюсером',
    'brief' => 'Бриф на видео',
    'brief-ai' => 'Бриф на AI-решение',
    'brief-smm' => 'Бриф на SMM',
    'brief-sites' => 'Бриф на сайт',
    'brief-hotel-video' => 'Бриф на видеосъёмку базы отдыха',
    'team' => 'Написали через карточку команды',
    'vibe' => 'Vibe-режим: клиент собрал КП',
    'vibe-order' => 'Vibe-режим: заказ тарифа из КП',
    'block-vibe' => 'Vibe-блок: клиент собрал блок под себя',
];
$type = $body['type'] ?? '';
$label = $labels[$type] ?? 'Заявка с сайта';

$lines = ["Имя: $name"];
if ($phone !== '') $lines[] = "Телефон: $phone";
if ($email !== '') $lines[] = "Email: $email";
if (isset($body['fields']) && is_array($body['fields'])) {
    foreach (array_slice($body['fields'], 0, 40, true) as $k => $v) {
        $v = is_scalar($v) ? mb_substr(trim((string)$v), 0, 4000) : '';
        $lines[] = mb_substr($clean($k), 0, 100) . ': ' . ($v === '' ? '—' : $v);
    }
}

$to = 'khudyakov.yegor@gmail.com';
$host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'hud-service.ru');
$subject = '=?UTF-8?B?' . base64_encode("$label — $name") . '?=';
$headers = "From: HUD.SERVICE <no-reply@$host>\r\n";
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $email\r\n";
}

// Скрины из окошка Vibe-блока — вложениями письма (до трёх jpeg/png).
$files = [];
if (isset($body['files']) && is_array($body['files'])) {
    foreach (array_slice($body['files'], 0, 3) as $f) {
        if (!is_array($f) || !preg_match('/^data:(image\/[a-z+]+);base64,(.+)$/', (string)($f['data'] ?? ''), $m)) continue;
        if (strlen($m[2]) > 4000000) continue;
        $fname = preg_replace('/[^\w.\-]+/u', '_', $clean($f['name'] ?? 'screen.jpg')) ?: 'screen.jpg';
        $files[] = [$fname, $m[1], $m[2]];
    }
}

$text = implode("\n", $lines);
if ($files) {
    $boundary = 'hdkv' . bin2hex(random_bytes(8));
    $headers .= "MIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
    $message = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n$text\r\n";
    foreach ($files as [$fname, $mime, $b64]) {
        $message .= "--$boundary\r\nContent-Type: $mime; name=\"$fname\"\r\n"
            . "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$fname\"\r\n\r\n"
            . chunk_split($b64) . "\r\n";
    }
    $message .= "--$boundary--";
} else {
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message = $text;
}

if (!mail($to, $subject, $message, $headers)) {
    http_response_code(502);
    echo json_encode(['error' => 'send_failed']);
    exit;
}
echo json_encode(['ok' => true]);
