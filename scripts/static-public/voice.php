<?php
// Голосовой ассистент в статичной версии (hdkv-ai.ru на reg.ru): то же, что
// /api/voice на Vercel, — вопрос посетителя уходит к ИИ через Vercel AI
// Gateway, ответ — фраза для озвучки и, возможно, одно действие.
//
// Ключ шлюза лежит ВНЕ папки сайта, в ~/voice-key.txt (одна строка), чтобы
// его нельзя было скачать по ссылке. Инструкция и карта сайта — рядом,
// в voice-data.json, её собирает scripts/build-static.sh.
header('Content-Type: application/json; charset=utf-8');

function fail($code, $error) {
    http_response_code($code);
    echo json_encode(['error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'method_not_allowed');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== ($_SERVER['HTTP_HOST'] ?? '')) fail(403, 'forbidden');

// Тормоз от одного посетителя, дёргающего ИИ без остановки: 30 вопросов за 10 минут.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/hdkv-voice-' . md5($ip);
$now = time();
$hits = array_filter(explode(',', (string)@file_get_contents($bucket)), function ($t) use ($now) {
    return $t !== '' && $now - (int)$t < 600;
});
if (count($hits) >= 30) fail(429, 'rate_limited');
$hits[] = $now;
@file_put_contents($bucket, implode(',', $hits));

$key = trim((string)@file_get_contents(dirname(__DIR__, 2) . '/voice-key.txt'));
$data = json_decode((string)@file_get_contents(__DIR__ . '/voice-data.json'), true);
if ($key === '' || !is_array($data)) fail(503, 'not_configured');

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) fail(400, 'invalid_json');
$text = mb_substr(trim((string)($body['text'] ?? '')), 0, 600);
if ($text === '') fail(400, 'missing_text');
$path = mb_substr((string)($body['path'] ?? '/'), 0, 80);

$messages = [['role' => 'system', 'content' => $data['system']]];
foreach (array_slice(is_array($body['history'] ?? null) ? $body['history'] : [], -6) as $turn) {
    if (!is_array($turn) || !in_array($turn['role'] ?? '', ['user', 'assistant'], true)) continue;
    $messages[] = ['role' => $turn['role'], 'content' => mb_substr((string)($turn['text'] ?? ''), 0, 600)];
}
$messages[] = ['role' => 'user', 'content' => "[страница: $path]\n$text"];

$ch = curl_init('https://ai-gateway.vercel.sh/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $key],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => 'anthropic/claude-haiku-4.5',
        'messages' => $messages,
        'max_tokens' => 300,
    ]),
]);
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($res === false || $status !== 200) fail(502, 'ai_failed');

$raw = (string)(json_decode($res, true)['choices'][0]['message']['content'] ?? '');
$start = strpos($raw, '{');
$end = strrpos($raw, '}');
$obj = ($start !== false && $end > $start) ? json_decode(substr($raw, $start, $end - $start + 1), true) : null;
$say = is_array($obj) ? trim((string)($obj['say'] ?? '')) : trim($raw);
$say = mb_substr($say, 0, 400);
if ($say === '') fail(502, 'ai_failed');

$action = null;
$a = is_array($obj) ? ($obj['action'] ?? null) : null;
if (is_array($a) && is_string($a['type'] ?? null)) {
    if ($a['type'] === 'route' && in_array($a['href'] ?? '', $data['routes'], true)) {
        $action = ['type' => 'route', 'href' => $a['href']];
    } elseif (in_array($a['type'], ['call', 'telegram', 'whatsapp', 'vibe'], true)) {
        $action = ['type' => $a['type']];
    }
}

echo json_encode(['say' => $say, 'action' => $action], JSON_UNESCAPED_UNICODE);
