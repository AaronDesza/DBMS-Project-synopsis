<?php
// api/admin.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../config/db.php';

$action = $_GET['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'add_destination_package') {
    $name         = trim($body['name']         ?? '');
    $location     = trim($body['location']     ?? '');
    $category     = trim($body['category']     ?? '');
    $description  = trim($body['description']  ?? '');
    $image_url    = trim($body['image_url']    ?? '');
    $package_name = trim($body['package_name'] ?? '');
    $duration     = intval($body['duration_days'] ?? 1);
    $price        = floatval($body['price']    ?? 0);

    if (!$name || !$location || !$package_name) {
        echo json_encode(['status' => 'error', 'message' => 'name, location, and package_name are required.']); exit;
    }

    $admin_id = $pdo->query('SELECT id FROM admins LIMIT 1')->fetchColumn();

    $pdo->prepare('INSERT INTO destinations (admin_id, name, location, category, description, image_url) VALUES (?,?,?,?,?,?)')
        ->execute([$admin_id, $name, $location, $category, $description, $image_url]);
    $dest_id = $pdo->lastInsertId();

    $pdo->prepare('INSERT INTO tour_packages (admin_id, package_name, duration_days, price, destination_id) VALUES (?,?,?,?,?)')
        ->execute([$admin_id, $package_name, $duration, $price, $dest_id]);

    echo json_encode(['status' => 'success', 'message' => 'Destination & Package added!']);

} elseif ($action === 'delete_review') {
    $review_id = $body['review_id'] ?? null;
    if (!$review_id) {
        echo json_encode(['status' => 'error', 'message' => 'review_id required.']); exit;
    }
    $pdo->prepare('DELETE FROM reviews WHERE id = ?')->execute([$review_id]);
    echo json_encode(['status' => 'success', 'message' => 'Review deleted.']);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Unknown action.']);
}
