<?php
include __DIR__ . '/../dbcon/config.php';

// Verificar se o parâmetro GET 'status' está presente
if (isset($_GET['status'])) {
    $nomeServidor = $_GET['status'];

    // Verificar se o parâmetro GET 'change' está presente
    if (isset($_GET['change'])) {
        $novoStatus = $_GET['change'];

        // Verificar se o novo status está entre os status permitidos
        $statusPermitidos = ['OFFLINE', 'ONLINE', 'MANUTENÇÃO'];
        if (in_array($novoStatus, $statusPermitidos)) {
            // Atualizar o status do servidor com o novo status especificado
            $sql = "UPDATE servidores SET status = '$novoStatus' WHERE nome = '$nomeServidor'";
            if ($conn->query($sql) === TRUE) {
                echo "SUCESS_CHANGE";
            } else {
                echo "ERRO_CHANGE";
            }
        } else {
            echo "ERRO_CHANGE_INVALID";
        }
    } else {
        // Consulta SQL para obter o status do servidor com o nome especificado
        $sql = "SELECT status FROM servidores WHERE nome = '$nomeServidor'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            // Obter o status do servidor encontrado
            $row = $result->fetch_assoc();
            $statusServidor = $row['status'];
            // Imprimir o status do servidor
            echo "$statusServidor";
        } else {
            echo "ERRO_NULL";
        }
    }
} else {
    echo "ERRO_URL";
}

// Fechar a conexão com o banco de dados
$conn->close();
?>
