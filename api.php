<?php
header('Content-Type: application/json; charset=utf-8');

$allowedTypes = ['donations', 'volunteers', 'messages'];
$dataDir = __DIR__ . '/data';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload) || empty($payload['type']) || !in_array($payload['type'], $allowedTypes, true) || !isset($payload['data']) || !is_array($payload['data'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid request payload.']);
        exit;
    }

    $type = $payload['type'];
    $file = $dataDir . '/' . $type . '.json';

    $records = [];
    if (file_exists($file)) {
        $existing = json_decode(file_get_contents($file), true);
        if (is_array($existing)) {
            $records = $existing;
        }
    }

    $entry = $payload['data'];
    $entry['created_at'] = date('c');
    $records[] = $entry;

    if (file_put_contents($file, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to save record.']);
        exit;
    }

    echo json_encode(['ok' => true, 'type' => $type, 'count' => count($records)]);
    exit;
}

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    if ($type && in_array($type, $allowedTypes, true)) {
        $file = $dataDir . '/' . $type . '.json';
        $records = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
        echo json_encode(['ok' => true, 'type' => $type, 'data' => $records]);
        exit;
    }

    $all = [];
    foreach ($allowedTypes as $t) {
        $file = $dataDir . '/' . $t . '.json';
        $all[$t] = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
    }
    echo json_encode(['ok' => true, 'data' => $all]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
