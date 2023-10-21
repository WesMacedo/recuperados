<?php
include __DIR__ . '/../dbcon/config.php';

// Verificar o parâmetro GET 'robos'
if (isset($_GET['robos']) && $_GET['robos'] === 'start') {
    // Consultar o status do servidor
    $statusServidorSql = "SELECT status FROM servidores WHERE nome = 'servidor'";
    $statusServidorResult = $conn->query($statusServidorSql);

    if ($statusServidorResult->num_rows > 0) {
        $statusServidor = $statusServidorResult->fetch_assoc()['status'];

        if ($statusServidor === 'ONLINE') {
            // Consultar um robô com o status "Conectar"
            $roboSql = "SELECT * FROM robos WHERE status = 'Conectar' LIMIT 1";
            $roboResult = $conn->query($roboSql);

            if ($roboResult->num_rows > 0) {
                $robo_start = $roboResult->fetch_assoc()['numero'];

                // Atualizar o status do robô para "conectando"
                $updateSql = "UPDATE robos SET status = 'Aguardando' WHERE numero = $robo_start";

                if ($conn->query($updateSql) === TRUE) {
                    echo $robo_start;
                } else {
                    echo "ERRO_CHANGE";
                }
            } else { }
        } else {
            echo "ERRO_SERV";
        }
    } else {
        echo "ERRO_NULL";
    }
}else // Verificar o parâmetro GET 'robos'
if (isset($_GET['robos']) && $_GET['robos'] === 'stop') {
    // Função para verificar o tempo restante
function verificarTempoRestante($tempoRegistro) {
    $tempoAtual = strtotime(date('Y-m-d H:i:s'));
    $tempoExpiracao = strtotime($tempoRegistro);
    $tempoRestante = $tempoExpiracao - $tempoAtual;

    if ($tempoRestante <= 0) {
        return "Expirado";
    } else {
        $horas = floor($tempoRestante / 3600);
        $minutos = floor(($tempoRestante % 3600) / 60);
        $segundos = $tempoRestante % 60;

        return sprintf("%02d:%02d:%02d", $horas, $minutos, $segundos);
    }
}
// Consultar o status do servidor
    $statusServidorSql = "SELECT status FROM servidores WHERE nome = 'servidor'";
    $statusServidorResult = $conn->query($statusServidorSql);

    if ($statusServidorResult->num_rows > 0) {
        $statusServidor = $statusServidorResult->fetch_assoc()['status'];

        if ($statusServidor === 'ONLINE') {
            // Consultar os robôs e verificar se o tempo expirou
            $tempoAtual = date('Y-m-d H:i:s');
            $roboSql = "SELECT numero, time, status FROM robos";
            $roboResult = $conn->query($roboSql);

            if ($roboResult->num_rows > 0) {
                $robosArray = array(); // Array para armazenar os resultados 

                while ($roboData = $roboResult->fetch_assoc()) {
                    $roboNumero = $roboData['numero'];
                    $roboTime = $roboData['time'];
                    $roboStatus = $roboData['status'];
                    $tempoRestante = verificarTempoRestante($roboTime);

                    if ($roboTime < $tempoAtual) {
                        // Atualizar o status do robô para "desconectado"
                        $updateSql = "UPDATE robos SET status = 'Desconectado', time = NULL WHERE numero = $roboNumero";


                        if ($conn->query($updateSql) !== TRUE) {
                            echo "ERRO_UPDATE";
                            exit;
                        }
                        $roboStatus = 'Desconectado'; // Atualizar o status no array
                    }

                    // Adicionar os resultados ao array
                    $robosArray[] = array(
                        'numero' => $roboNumero,
                        'time' => $tempoRestante,
                        'status' => $roboStatus
                    );
                }

                // Exibir o array como JSON
                echo json_encode($robosArray);
            } else {
                echo "SEM_ROBOS";
            }
        } else {
            echo "ERRO_SERV";
        }
    } else {
        echo "ERRO_NULL";
    }
} else if (isset($_GET['robo']) && isset($_GET['change'])) {
    $numeroRobo = $_GET['robo'];
    $novoStatus = $_GET['change'];
    
    // Verificar se o novo status é um dos status permitidos
    $statusPermitidos = ['Conectar', 'Conectando', 'Conectado', 'Desconectar', 'Desconectado', 'Suspenso'];
    if (in_array($novoStatus, $statusPermitidos)) {
        // Atualizar o status do robô com o novo status especificado
        $sql = "UPDATE robos SET status = '$novoStatus' WHERE numero = $numeroRobo";
        if ($novoStatus = 'Conectar'){
            $novoTime = date('Y-m-d H:i:s', strtotime('+1 minute')); 
            $sql_time = "UPDATE robos SET time = '$novoTime' WHERE numero = $numeroRobo";
            $conn->query($sql_time);
        }

 

        if ($conn->query($sql) === TRUE) {
            echo "SUCESS_CHANGE";
        } else {
            echo "ERRO_CHANGE";
        }
    } else {
        echo "ERRO_CHANGE_INVALID";
    }
}else if (isset($_GET['robo']) && isset($_GET['check']) && $_GET['check'] === 'status') {
    $numeroRobo = $_GET['robo'];

    // Consulta SQL para obter o status do robô especificado
    $sql = "SELECT status FROM robos WHERE numero = $numeroRobo";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Obter o status do robô encontrado
        $row = $result->fetch_assoc();
        $statusRobo = $row['status'];

        echo $statusRobo;
    } else {
        echo "ERRO_NULL";
    }
}else if (isset($_GET['robo']) && isset($_GET['qr'])) {
    $numeroRobo = $_GET['robo']; 
    $novoQr = $_GET['qr']; 
        // Atualizar o qr do robô 
        $sql = "UPDATE robos SET qr = '$novoQr' WHERE numero = $numeroRobo";

        if ($conn->query($sql) === TRUE) {
            echo "SUCESS_QR";
        } else {
            echo "ERRO_QR";
        }
      
}else if (isset($_GET['robo']) && isset($_GET['time'])) {
    $numeroRobo = $_GET['robo'];
    $novoTime = date('Y-m-d H:i:s', strtotime('+1 minute'));
    // Atualizar o time do robô 
    $sql = "UPDATE robos SET time = '$novoTime' WHERE numero = $numeroRobo";

    if ($conn->query($sql) === TRUE) {
        echo "SUCESS_TIME";
    } else {
        echo "ERRO_TIME";
    }
}else if (isset($_GET['robo_time'])) {
    function verificarTempoRestante($tempoRegistro) {
    $tempoAtual = strtotime(date('Y-m-d H:i:s'));
    $tempoExpiracao = strtotime($tempoRegistro);
    $tempoRestante = $tempoExpiracao - $tempoAtual;

    if ($tempoRestante <= 0) {
        return "Offline";
    } else {
        $horas = floor($tempoRestante / 3600);
        $minutos = floor(($tempoRestante % 3600) / 60);
        $segundos = $tempoRestante % 60;

        return sprintf("%02d:%02d:%02d", $horas, $minutos, $segundos);
    }
}
    $numeroRobo = $_GET['robo_time']; 
    $tempoRegistro = "2023-06-27 19:11:35";   
    $tempoRestante = verificarTempoRestante($tempoRegistro); 
    echo $tempoRestante;
} else if (isset($_GET['robo']) && isset($_GET['check']) && $_GET['check'] === 'qr') {
    $numeroRobo = $_GET['robo'];

    // Consulta SQL para obter o status do robô especificado
    $sql = "SELECT qr FROM robos WHERE numero = $numeroRobo";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Obter o status do robô encontrado
        $row = $result->fetch_assoc();
        $statusRobo = $row['qr'];

        echo $statusRobo;
    } else {
        echo "ERRO_NULL";
    }
}else {
    echo "ERRO_URL";
}

// Fechar a conexão com o banco de dados
$conn->close();
?>
