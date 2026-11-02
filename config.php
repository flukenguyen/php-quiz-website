<?php
// Sửa thông tin kết nối theo máy chủ của anh.
define('DB_HOST', 'localhost');
define('DB_NAME', 'php_quiz');
define('DB_USER', 'root');
define('DB_PASS', '');

if (session_status() === PHP_SESSION_NONE) session_start();
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
function json_out($data, int $status=200): void {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE); exit;
}
function questions_bank(): array {
    static $bank = null;
    if ($bank === null) $bank = json_decode(file_get_contents(__DIR__.'/questions.json'), true) ?: [];
    return $bank;
}
