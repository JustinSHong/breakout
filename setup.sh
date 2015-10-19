#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
gameStatePath="/multi/gameState"
paddleStatePath="/multi/paddleState"
touch "$DIR$gameStatePath"
touch "$DIR$paddleStatePath"
