<?php

require_once __DIR__ . '/../../app/config.php';

 
 
$data       = '28/06/2023';
$message    = htmlspecialchars('teste' ?? null);
$valueToPay = str_replace(',', '.', '0.01');

if (!filter_var($email = 'wesley.wsm97@gmail.com', FILTER_VALIDATE_EMAIL)) {
    return responseToJson("error", "Informe um email válido.");
}

if (!preg_match('/^[a-zA-Z0-9_.\s]{2,}$/', $nickname = 'nome_do_cliente')) {
    return responseToJson("error", "Informe um apelido válido.");
}

if (!filter_var($valueToPay, FILTER_VALIDATE_FLOAT) || $valueToPay <= 0) {
    return responseToJson("error", "Informe um valor válido.");
}

$paymentReferenceId = password_hash(uniqid(), PASSWORD_DEFAULT);

// Criar uma nova instância do objeto mysqli
$mysqli = new mysqli(DATABASE_CONFIG['host'], DATABASE_CONFIG['user'], DATABASE_CONFIG['pass'], DATABASE_CONFIG['dbname']);

// Verifica se ocorreu algum erro na conexão
if ($mysqli->connect_errno) {
    die('ERROR: Failed to connect to MySQL: ' . $mysqli->connect_error);
}

$query = "INSERT INTO pagamentos (id_reference, nickname, email, message, status, value) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $mysqli->prepare($query);

$status = "pending";
$stmt->bind_param('sssssd', $paymentReferenceId, $nickname, $email, $message, $status, $valueToPay);

$stmt->execute();
$donationId = $stmt->insert_id;

$stmt->close();
$mysqli->close();

if (!$donationId) {
    return responseToJson("error", "Ops! Ocorreu um erro inesperado.");
}

$payer = [
    "first_name" => $nickname,
    "email"      => $email
];

$informations = [
    "notification_url"   => MERCADO_PAGO_CONFIG['notification_url'],
    "description"        => "Robô de vendas - Cliente: {$nickname}",
    "external_reference" => $paymentReferenceId,
    "payment_method_id"  => "pix",
    "transaction_amount" => (double)$valueToPay
];

$payment = array_merge(["payer" => $payer], $informations);
$payment = json_encode($payment);

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL            => "https://api.mercadopago.com/v1/payments",
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POSTFIELDS     => $payment,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . MERCADO_PAGO_CONFIG['access_token'],
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($curl);
curl_close($curl);

$response = json_decode($response, true);

$response = $response["point_of_interaction"]["transaction_data"];

header('Content-Type: application/json');

echo json_encode([
    "qr_code"        => $response['qr_code'],
    "qr_code_base64" => $response['qr_code_base64'] 
    
]);

?>
