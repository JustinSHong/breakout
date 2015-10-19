/*jslint node: true, browser: true */
"use strict";

function Controller() {
    var vars = location.search.split('&'),
        getBoolVar = function (value) {
            for (var i = 0; i < vars.length; i++) {
                var variable = vars[i].split('=');
                if (variable[0] === value)
                    return variable[1] === 'true' ? true : false;
            }
            return false;
        },
        isCoop = getBoolVar('?isCoop'),
        isHost = getBoolVar('isHost'),
        isClient = getBoolVar('isClient'),
        model = !isClient ? new Model(isCoop, isHost) : new ClientModel(),
        view = new View(model, isClient),
        portrait = true,
        whichY = 1,
        updateInputs = function(event) {
            var playerPaddle = model.getPlayerPaddle();
            if ('ontouchstart' in window) {
                // We have a mobile device
                var xOrY = 'x';
                if (portrait) {
                    xOrY = 'x';
                } else {
                    xOrY = 'y';
                }
                var motion = event.accelerationIncludingGravity[xOrY],
                    device = navigator.platform,
                    move;
                
                if (device === 'iPod' || device === 'iPhone' || device === 'iPad') {
                    motion = -motion;
                }
                
                move = -((motion / 9.80665) * 2) * whichY;
                
                if (Math.abs(move) < 0.2)
                    return;
                
                if (playerPaddle.x + move < playerPaddle.l / 2) {
                    model.setPlayerPaddleX(playerPaddle.l/2);
                } else if (playerPaddle.x + move > model.getWidth() - playerPaddle.l/2) {
                    model.setPlayerPaddleX(model.getWidth() - playerPaddle.l/2);
                } else {
                    model.setPlayerPaddleX(playerPaddle.x + move);
                }                
            } else {
                // We don't have a mobile device
                var newX = (event.clientX || event.pageX) / (window.innerHeight / model.getWidth());
                if (newX - playerPaddle.l / 2 < 0) {
                    model.setPlayerPaddleX(playerPaddle.l / 2);
                } else if (newX + playerPaddle.l / 2 > model.getWidth()) {
                    model.setPlayerPaddleX(model.getWidth() - playerPaddle.l/2);
                } else {
                    model.setPlayerPaddleX(newX);
                }
            }
        };

    this.init = function () {
        if(window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', updateInputs);
        }
        document.addEventListener('mousemove', updateInputs);

        window.addEventListener('orientationchange', function () {
           if (Math.abs(window.orientation)===90) {
               whichY = window.orientation === -90 ? 1  : -1 ;
               portrait = false;
           } else {
               whichY = 1;
               portrait = true;
           }
        });

        // Set callback for use after model updates
        model.setUpdateCallback(view.repaint);

        // Setting callback for model events
        model.setEventCallback(function (type) {
            if (type === 'bounce') {
                document.getElementById('loAudio').play();
            } else if (type === 'break') {
                document.getElementById('hiAudio').play();
            }
        });
        if (!isClient) {
            setInterval(model.tick, 30);
        }
    };
};

var controller = new Controller();
controller.init();
