<?php

require_once __DIR__ . '/../../app/config.php';

if (empty($_GET['id'])) {
    header("location: ../index.php");
    exit;
}

$paymentId = $_GET['id'];

// Captura as informações do pagamento com base na ID recebida.
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL            => "https://api.mercadopago.com/v1/payments/{$paymentId}?access_token=" . MERCADO_PAGO_CONFIG['access_token'],
    CURLOPT_RETURNTRANSFER => true,
));
$response = curl_exec($curl);
curl_close($curl);

$paymentInfoMercadoPago = json_decode($response, true);
$referenceId            = $paymentInfoMercadoPago['external_reference'];

if (!isset($referenceId)) {
    header("location: ../index.php");
    exit;
}

// Criar uma nova instância do objeto mysqli
$mysqli = new mysqli(DATABASE_CONFIG['host'], DATABASE_CONFIG['user'], DATABASE_CONFIG['pass'], DATABASE_CONFIG['dbname']);

// Verifica se ocorreu algum erro na conexão
if ($mysqli->connect_errno) {
    die('ERROR: Failed to connect to MySQL: ' . $mysqli->connect_error);
}

// Seleciona o registro de pagamento do banco de dados de acordo com o "ReferenceId" que foi recebido pela API do Mercado Pago.
$query = "SELECT id, value FROM pagamentos WHERE id_reference = ? AND status != 'approved'";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('s', $referenceId);

$stmt->execute();
$result = $stmt->get_result();
$paymentDatabase = $result->fetch_assoc() ?? false;

$stmt->close();
$mysqli->close();

if (!$paymentDatabase['id']) {
    header("location: ../index.php");
    exit;
}

$statusPayment = $paymentInfoMercadoPago['status'];   // Status do pagamento ("approved", "pending", "recused").
$valuePayment  = $paymentInfoMercadoPago['transaction_amount']; // Valor do pagamento.


/**
 * Verifica se de fato o pagamento foi aprovado e se o valor do pagamento corresponde ao valor que está salvo no banco de dados.
 */
if ($statusPayment === "approved" && $valuePayment == $paymentDatabase['value']) {

    // Atualiza o status do pagamento para "approved".
    $mysqli = new mysqli(DATABASE_CONFIG['host'], DATABASE_CONFIG['user'], DATABASE_CONFIG['pass'], DATABASE_CONFIG['dbname']);

    // Verifica se ocorreu algum erro na conexão
    if ($mysqli->connect_errno) {
        die('ERROR: Failed to connect to MySQL: ' . $mysqli->connect_error);
    }

    $sql = "UPDATE pagamentos SET status = 'approved', updated_at = ? WHERE id = ? LIMIT 1";
    $stmt = $mysqli->prepare($sql);

    $stmt->bind_param('si', date('Y-m-d H:i:s'), $paymentDatabase['id']);

    $update = $stmt->execute();

    $stmt->close();
    $mysqli->close();

    if (!$update) {
        return responseToJson('error', "Não foi possível atualizar o status do pagamento.");
    }
}

header("location: ../index.php");
