<?php
$mysqli = new mysqli(DATABASE_CONFIG['host'], DATABASE_CONFIG['user'], DATABASE_CONFIG['pass'], DATABASE_CONFIG['dbname']);
if ($mysqli->connect_errno) {
    die('ERROR: ' . $mysqli->connect_error);
}
?>