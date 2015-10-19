<?php
    $file = fopen("paddleState", "r+") or die ("Couldn't open file");

    while (true) {
        if (flock($file, LOCK_EX)) {
           ftruncate($file, 0);
           fwrite($file, file_get_contents('php://input'));
           fflush($file);
           flock($file, LOCK_UN);
           break;
        }
    }

    fclose($file);
?>
