<?php
// Живой голос ассистента в статичной версии (hdkv-ai.ru) — то же, что
// /api/tts на Vercel: фраза → mp3 от Yandex SpeechKit.
//
// Ключ лежит ВНЕ папки сайта, в ~/speechkit-key.txt (одна строка). Готовые
// фразы кешируются в ~/tts-cache — повторная «Открываю Vibe сайты» не
// синтезируется и не оплачивается заново.

function fail($code, $error) {
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    echo $error;
    exit;
}

$home = dirname(__DIR__, 2);
$key = trim((string)@file_get_contents($home . '/speechkit-key.txt'));
if ($key === '') fail(503, 'not_configured');

$text = mb_substr(trim((string)($_GET['text'] ?? '')), 0, 500);
if ($text === '') fail(400, 'missing_text');

$cacheDir = $home . '/tts-cache';
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
$cacheFile = $cacheDir . '/' . md5($text) . '.mp3';

if (!is_file($cacheFile)) {
    // Тормоз от одного посетителя: 60 новых фраз за 10 минут.
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $bucket = sys_get_temp_dir() . '/hdkv-tts-' . md5($ip);
    $now = time();
    $hits = array_filter(explode(',', (string)@file_get_contents($bucket)), function ($t) use ($now) {
        return $t !== '' && $now - (int)$t < 600;
    });
    if (count($hits) >= 60) fail(429, 'rate_limited');
    $hits[] = $now;
    @file_put_contents($bucket, implode(',', $hits));

    $ch = curl_init('https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ['Authorization: Api-Key ' . $key],
        CURLOPT_POSTFIELDS => http_build_query([
            'text' => $text,
            'lang' => 'ru-RU',
            'voice' => 'alena',
            'emotion' => 'good',
            'speed' => '0.95',
            'format' => 'mp3',
        ]),
    ]);
    $audio = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($audio === false || $status !== 200) fail(502, 'tts_failed');
    @file_put_contents($cacheFile, $audio);
    header('Content-Type: audio/mpeg');
    header('Cache-Control: public, max-age=86400');
    echo $audio;
    exit;
}

header('Content-Type: audio/mpeg');
header('Cache-Control: public, max-age=86400');
readfile($cacheFile);
