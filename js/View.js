/*jslint node: true, browser: true */
"use strict";

function View(newModel, isClient) {

    var model = newModel,
        canvas = document.getElementById('canvas'),
        canvasContext = canvas.getContext('2d'),
        xOff,
        yOff,
        drawPaddle = function (paddle) {
            canvasContext.fillStyle = paddle.color;
            canvasContext.fillRect(xOff+lToP(paddle.x-(paddle.l/2)), lToP(paddle.y), lToP(paddle.l), lToP(paddle.h));
            canvasContext.fill();
        },
        drawBall = function (ball) {
            canvasContext.beginPath();
            if (ball.player === '1') {
                canvasContext.fillStyle = 'red';
            } else {
                canvasContext.fillStyle = 'blue';
            }
            canvasContext.arc(xOff+lToP(ball.x), lToP(ball.y), lToP(0.5), 0, 2*Math.PI, false);
            canvasContext.closePath();
            canvasContext.fill();
        },
        drawBrick = function (brick) {
            canvasContext.fillStyle = brick.c;
            canvasContext.fillRect(xOff+lToP(brick.x), lToP(brick.y), lToP(brick.w), lToP(brick.h));
            canvasContext.fill();
        },
        drawExplosion = function (explosion) {
            for (var i = 0; i < explosion.length; i++) {
                canvasContext.fillStyle = 'rgb(' + Math.floor(Math.random()*256) + ',' + Math.floor(Math.random()*256) + ',' + Math.floor(Math.random()*256)+')';
                canvasContext.fillRect(xOff+lToP(explosion[i].x), lToP(explosion[i].y), lToP(0.2), lToP(0.2));
                canvasContext.fill();
            }
        },
        lToP = function (l, isHoz) {
            var ws = canvas.width/model.getWidth(),
                hs = canvas.height/model.getHeight();
            return l * ( ws < hs ? ws : hs );
        };

    this.repaint = function () {
        var balls = model.getBalls(),
            paddles = model.getPaddles(),
            bricks = model.getBricks(),
            explosions = model.getExplosions();

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        xOff = (window.innerWidth-lToP(model.getWidth()))/2;

        // Clear screen
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        if (isClient) {
            canvasContext.translate(0, canvas.height);
            canvasContext.scale(1, -1);
        }
        
        // Do drawings
        drawPaddle(model.getPlayerPaddle());
        for (var i = 0; i < paddles.length; i++) {
            drawPaddle(paddles[i]);
        }
        for (var i = 0; i < bricks.length; i++) {
            drawBrick(bricks[i]);
        }
        for (var i = 0; i < explosions.length; i++) {
            drawExplosion(explosions[i]);
        }
        for (var i = 0; i < balls.length; i++) {
            drawBall(balls[i]);
        }

        // Draw Game borders
        canvasContext.beginPath();
        canvasContext.moveTo(xOff, 0);
        canvasContext.lineTo(xOff, lToP(model.getHeight()));
        canvasContext.moveTo(xOff+lToP(model.getWidth()), 0);
        canvasContext.lineTo(xOff+lToP(model.getWidth()), lToP(model.getHeight()));
        canvasContext.closePath();
        canvasContext.stroke();
    };

};
