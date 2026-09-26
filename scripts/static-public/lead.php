<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
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
    'brief' => 'Бриф на видео',
    'brief-ai' => 'Бриф на AI-решение',
    'brief-smm' => 'Бриф на SMM',
    'brief-sites' => 'Бриф на сайт',
    'brief-hotel-video' => 'Бриф на видеосъёмку базы отдыха',
    'team' => 'Написали через карточку команды',
    'vibe' => 'Vibe-режим: клиент собрал КП',
    'vibe-order' => 'Vibe-режим: заказ тарифа из КП',
];
$type = $body['type'] ?? '';
$label = $labels[$type] ?? 'Заявка с сайта';

$lines = ["Имя: $name"];
if ($phone !== '') $lines[] = "Телефон: $phone";
if ($email !== '') $lines[] = "Email: $email";
if (isset($body['fields']) && is_array($body['fields'])) {
    foreach ($body['fields'] as $k => $v) {
        $v = trim((string)$v);
        $lines[] = $clean($k) . ': ' . ($v === '' ? '—' : $v);
    }
}

$to = 'khudyakov.yegor@gmail.com';
$host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'hdkv-ai.ru');
$subject = '=?UTF-8?B?' . base64_encode("$label — $name") . '?=';
$headers = "From: HUD.SERVICE <no-reply@$host>\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $email\r\n";
}

if (!mail($to, $subject, implode("\n", $lines), $headers)) {
    http_response_code(502);
    echo json_encode(['error' => 'send_failed']);
    exit;
}
echo json_encode(['ok' => true]);
