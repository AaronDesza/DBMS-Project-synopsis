<?php
// api/auth.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

session_start();
require_once '../config/db.php';

$action = $_GET['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'register') {
    $name  = trim($body['name']  ?? '');
    $email = trim($body['email'] ?? '');
    $pass  = $body['password']   ?? '';
    $phone = trim($body['phone'] ?? '');

    if (!$name || !$email || !$pass || !$phone) {
        echo json_encode(['status' => 'error', 'message' => 'All fields required.']); exit;
    }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Email already registered.']); exit;
    }
    $hash = password_hash($pass, PASSWORD_BCRYPT);
    $pdo->prepare('INSERT INTO users (name, email, password, phone) VALUES (?,?,?,?)')->execute([$name, $email, $hash, $phone]);
    echo json_encode(['status' => 'success', 'message' => 'Registration successful!']);

} elseif ($action === 'login') {
    $email = trim($body['email'] ?? '');
    $pass  = $body['password']   ?? '';
    $role  = $body['role']       ?? 'traveller';

    if ($role === 'admin') {
        $stmt = $pdo->prepare('SELECT * FROM admins WHERE email = ?');
    } else {
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    }
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($pass, $user['password'])) {
        if ($role === 'admin') {
            $_SESSION['admin_id'] = $user['id'];
        } else {
            $_SESSION['user_id'] = $user['id'];
        }
        echo json_encode([
            'status' => 'success',
            'role'   => $role,
            'user'   => ['id' => $user['id'], 'name' => $user['name']]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials.']);
    }

} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logged out.']);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Unknown action.']);
}
