/*jslint node: true, browser: true */
"use strict";

function ClientModel() {

    var WIDTH = 20,
        HEIGHT = 35,
        portrait = true,
        explosions = [],
        playerPaddle = {x: WIDTH/2, y: 1, l: 6, h: 1, color: '#66FF99'},
        paddles = [],
        bricks = [],
        balls = [],
        updateCallback = function () { return true; },
        eventCallback = function () { return true;},
        getGameState = function () {
            var httpReq = new XMLHttpRequest();
            httpReq.open('GET', 'multi/getGameData.php', true);
            httpReq.onload = function (e) {
                if (httpReq.readyState === 4) {
                    if (httpReq.status === 200) {
                        updateStateFromJson(httpReq.responseText);
                        getGameState();
                    }
                }
            };
            httpReq.send();            
        },
        updatePaddle = function () {
            var paddleHttpReq = new XMLHttpRequest();
            paddleHttpReq = new XMLHttpRequest();
            paddleHttpReq.open('POST', 'multi/setPlayerPaddle.php', true);
            paddleHttpReq.onload = function () {
                if (paddleHttpReq.readyState === 4) {
                    if (paddleHttpReq.status === 200) {
                        updatePaddle();
                    }
                }
            };
            paddleHttpReq.send(JSON.stringify(playerPaddle));
            
        },
        updateStateFromJson = function (gameState) {
            var state = JSON.parse(gameState);
            paddles[0] = state.paddle;
            bricks = state.bricks;
            balls = state.balls;
            explosions = state.explosions;
            updateCallback();
       };

    // Start the recursive AJAX request going!
    updatePaddle();
    getGameState();

    this.setUpdateCallback = function (newCallback) {
        updateCallback = newCallback;
    };

    this.setEventCallback = function (newCallback) {
        eventCallback = newCallback;
    };

    this.getBricks = function () {
        return bricks;
    };

    this.getWidth = function () {
        return WIDTH;
    };

    this.getHeight = function () {
        return HEIGHT;
    };

    this.getPlayerPaddle = function () {
        return playerPaddle;
    };

    this.getPaddles = function () {
        return paddles;
    };

    this.getBalls = function () {
        return balls;
    };

    this.getExplosions = function () {
        return explosions;
    };

    this.setPlayerPaddleX = function (newPaddleX) {
        playerPaddle.x = newPaddleX;
    };

};
