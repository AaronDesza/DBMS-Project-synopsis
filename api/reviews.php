<?php
// api/reviews.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

session_start();
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $dest_id = $_GET['destination_id'] ?? '';
    if ($dest_id) {
        $stmt = $pdo->prepare('
            SELECT r.id AS review_id, u.name AS traveller_name, d.name AS destination_name,
                   r.rating, r.comment
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            JOIN destinations d ON d.id = r.destination_id
            WHERE r.destination_id = ?
            ORDER BY r.review_date DESC
        ');
        $stmt->execute([$dest_id]);
    } else {
        $stmt = $pdo->query('
            SELECT r.id AS review_id, u.name AS traveller_name, d.name AS destination_name,
                   r.rating, r.comment
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            JOIN destinations d ON d.id = r.destination_id
            ORDER BY r.review_date DESC
        ');
    }
    echo json_encode(['status' => 'success', 'reviews' => $stmt->fetchAll()]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $user_id = $_SESSION['user_id'] ?? ($body['user_id'] ?? null);
    if (!$user_id) {
        $user_id = $pdo->query('SELECT id FROM users LIMIT 1')->fetchColumn();
    }
    $dest_id = $body['destination_id'] ?? null;
    $rating  = intval($body['rating']  ?? 5);
    $comment = trim($body['comment']   ?? '');

    if (!$dest_id || !$comment) {
        echo json_encode(['status' => 'error', 'message' => 'destination_id and comment are required.']); exit;
    }
    $pdo->prepare('INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?,?,?,?)')
        ->execute([$user_id, $dest_id, $rating, $comment]);
    echo json_encode(['status' => 'success', 'message' => 'Review published!']);
}
