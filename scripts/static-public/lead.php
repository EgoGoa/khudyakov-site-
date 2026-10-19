<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

// Заявки только с самого сайта и не чаще 8 за 10 минут с одного адреса:
// иначе бот может завалить почту письмами.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== ($_SERVER['HTTP_HOST'] ?? '')) {
    http_response_code(403);
    echo json_encode(['error' => 'forbidden']);
    exit;
}
$bucket = sys_get_temp_dir() . '/hdkv-lead-' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$now = time();
$hits = array_filter(explode(',', (string)@file_get_contents($bucket)), function ($t) use ($now) {
    return $t !== '' && $now - (int)$t < 600;
});
if (count($hits) >= 8) {
    http_response_code(429);
    echo json_encode(['error' => 'rate_limited']);
    exit;
}
$hits[] = $now;
@file_put_contents($bucket, implode(',', $hits));

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 13000000) {
    http_response_code(413);
    echo json_encode(['error' => 'too_large']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_json']);
    exit;
}

$clean = function ($v) {
    return trim(str_replace(["\r", "\n"], ' ', (string)$v));
};

$name = $clean($body['name'] ?? '');
$phone = $clean($body['phone'] ?? '');
$email = $clean($body['email'] ?? '');
if ($name === '' || ($phone === '' && $email === '')) {
    http_response_code(400);
    echo json_encode(['error' => 'missing_fields']);
    exit;
}

$labels = [
    'call' => 'Заказать звонок',
    'consult' => 'Консультация с продюсером',
    'brief-content' => 'Бриф: создание контента',
    'brief-general' => 'Общий бриф',
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

// Английская версия сайта (заголовок ставит клиентский код): письмо приходит
// по-русски, но с пометкой языка — отвечать клиенту нужно по-английски.
$isEn = ($_SERVER['HTTP_X_SITE_LOCALE'] ?? '') === 'en';
$lines = [];
if ($isEn) $lines[] = 'Язык сайта: EN — ответьте клиенту по-английски';
$lines[] = "Имя: $name";
if ($phone !== '') $lines[] = "Телефон: $phone";
if ($email !== '') $lines[] = "Email: $email";
if (isset($body['fields']) && is_array($body['fields'])) {
    foreach ($body['fields'] as $k => $v) {
        $v = trim((string)$v);
        $lines[] = $clean($k) . ': ' . ($v === '' ? '—' : $v);
    }
}

$to = 'khudyakov.yegor@gmail.com';
$host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'hud-service.ru');
$subject = '=?UTF-8?B?' . base64_encode(($isEn ? '[EN] ' : '') . "$label — $name") . '?=';
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
