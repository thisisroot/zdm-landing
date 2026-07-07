<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function loadEnv(string $path): array {
    if (!is_readable($path)) {
        return [];
    }
    $env = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
    return $env;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method not allowed']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
if (!is_array($input)) {
    respond(400, ['ok' => false, 'error' => 'invalid request body']);
}

$name = trim((string)($input['name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$message = trim((string)($input['message'] ?? ''));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'missing or invalid fields']);
}
if (mb_strlen($name) > 150 || mb_strlen($email) > 150 || mb_strlen($message) > 5000) {
    respond(422, ['ok' => false, 'error' => 'field too long']);
}

$env = loadEnv(__DIR__ . '/.env');
$smtpHost = $env['SMTP_HOST'] ?? '';
$smtpPort = (int)($env['SMTP_PORT'] ?? 465);
$smtpUser = $env['SMTP_USER'] ?? '';
$smtpPass = $env['SMTP_PASS'] ?? '';
$contactTo = $env['CONTACT_TO'] ?? $smtpUser;

if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
    error_log('ZDM contact form: missing SMTP configuration in api/.env');
    respond(500, ['ok' => false, 'error' => 'server not configured']);
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->Port = $smtpPort;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = $smtpPort === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($smtpUser, 'ZDM website');
    $mail->addAddress($contactTo);
    $mail->addReplyTo($email, $name);

    $mail->Subject = "ZDM contact form — message from {$name}";
    $mail->Body = "{$message}\n\n—\n{$name}\n{$email}";

    $mail->send();
    respond(200, ['ok' => true]);
} catch (PHPMailerException $e) {
    error_log('ZDM contact form send failed: ' . $mail->ErrorInfo);
    respond(502, ['ok' => false, 'error' => 'could not send']);
}
