<?php

    $file = fopen("paddleState", "r+") or die ("Couldn't open file");

    while (true) {
        if (flock($file, LOCK_EX)) {
           echo file_get_contents("paddleState");
           fflush($file);
           flock($file, LOCK_UN);
           break;
        }
    }

    fclose($file);


?>
