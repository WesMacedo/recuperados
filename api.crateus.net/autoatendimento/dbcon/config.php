<?php
$servername = "localhost";
$username = "evolute1_root";
$password = "1324.!#@$";
$database = "evolute1_autoatendimento"; 
$conn = new mysqli($servername, $username, $password, $database); 
if ($conn->connect_error) {
    die("Falha na conexão com o banco de dados: " . $conn->connect_error);
} 
$conn->set_charset("utf8mb4");
 

?>
