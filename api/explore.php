<?php
// api/explore.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../config/db.php';

$category = $_GET['category'] ?? '';
$search   = $_GET['search']   ?? '';

// Build destinations query
$where = [];
$params = [];
if ($category && $category !== 'All') {
    $where[] = 'd.category = ?';
    $params[] = $category;
}
if ($search) {
    $where[] = '(d.name LIKE ? OR d.location LIKE ?)';
    $params[] = "%$search%";
    $params[] = "%$search%";
}
$whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$sql = "
    SELECT
        d.id AS destination_id, d.name, d.location, d.category, d.description, d.image_url,
        tp.id AS package_id, tp.package_name, tp.duration_days, tp.price AS package_price,
        COALESCE(ROUND(AVG(r.rating),1), 0) AS avg_rating,
        COUNT(r.id) AS review_count
    FROM destinations d
    LEFT JOIN tour_packages tp ON tp.destination_id = d.id
    LEFT JOIN reviews r ON r.destination_id = d.id
    $whereSQL
    GROUP BY d.id, tp.id
    ORDER BY d.created_at DESC
";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$destinations = $stmt->fetchAll();

$hotels = $pdo->query('SELECT * FROM hotels ORDER BY rating DESC')->fetchAll();
$transports = $pdo->query('SELECT * FROM transport ORDER BY price ASC')->fetchAll();

echo json_encode([
    'status'       => 'success',
    'destinations' => $destinations,
    'hotels'       => $hotels,
    'transports'   => $transports
]);
