<?php
// api/book_trip.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

session_start();
require_once '../config/db.php';

$body = json_decode(file_get_contents('php://input'), true) ?? [];

$user_id      = $_SESSION['user_id'] ?? ($body['user_id'] ?? null);
$package_id   = $body['package_id']   ?? null;
$hotel_id     = $body['hotel_id']     ?? null;
$transport_id = $body['transport_id'] ?? null;
$travel_date  = $body['travel_date']  ?? null;
$payment_mode = $body['payment_mode'] ?? 'UPI';

if (!$user_id) {
    $user_id = $pdo->query('SELECT id FROM users LIMIT 1')->fetchColumn();
}

if (!$package_id || !$hotel_id || !$transport_id || !$travel_date) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']); exit;
}

$pkg       = $pdo->prepare('SELECT * FROM tour_packages WHERE id = ?');
$pkg->execute([$package_id]);
$pkg       = $pkg->fetch();

$hotel     = $pdo->prepare('SELECT * FROM hotels WHERE id = ?');
$hotel->execute([$hotel_id]);
$hotel     = $hotel->fetch();

$transport = $pdo->prepare('SELECT * FROM transport WHERE id = ?');
$transport->execute([$transport_id]);
$transport = $transport->fetch();

if (!$pkg || !$hotel || !$transport) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid selections.']); exit;
}

$total = $pkg['price'] + ($hotel['price_per_night'] * $pkg['duration_days']) + $transport['price'];

$pdo->prepare('INSERT INTO bookings (user_id, package_id, hotel_id, transport_id, travel_date, total_amount, status) VALUES (?,?,?,?,?,?,?)')
    ->execute([$user_id, $package_id, $hotel_id, $transport_id, $travel_date, $total, 'Confirmed']);
$booking_id = $pdo->lastInsertId();

$pdo->prepare('INSERT INTO payments (booking_id, amount, payment_mode) VALUES (?,?,?)')
    ->execute([$booking_id, $total, $payment_mode]);
$payment_id = $pdo->lastInsertId();

echo json_encode([
    'status'  => 'success',
    'message' => 'Booking Confirmed!',
    'receipt' => ['booking_id' => $booking_id, 'payment_id' => $payment_id, 'total_amount' => $total]
]);
