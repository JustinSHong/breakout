/*jslint node: true, browser: true */
"use strict";

/**
 * Created by iain on 3/8/15.
 */

function Model(isCoop, isHost) {

    var WIDTH = 20,
        HEIGHT = 35,
        portrait = true,
        makeBrick = function (setx, sety, setw, seth, setc) { return {x: setx, y: sety, w: setw, h: seth, c: setc}; },
        makeBricks = function () {
            var result = [],
                size = 1,
                gap = 0.5,
                rows = 4,
                yOffset = isCoop || isHost ? HEIGHT/2 - ((rows*(size + gap)-gap))/2 : size + gap;

            for (var x = gap; x < WIDTH; x += size + gap) {
                for (var y = 0; y < (rows*(gap+size)); y += size + gap) {
                    result.push(makeBrick(x, y+yOffset, size, size, '#FF6600'));
                }
            }
            return result;
        },
        makeBall = function (setPlayer) {
            var setx = WIDTH/ 2,
                sety = setPlayer === '2' ? 2.5 : HEIGHT - 2.5,
                setXVel = 0,
                setYVel = setPlayer === '2' ? 0.2 : -0.2;
            return {x: setx, y: sety, xVel: setXVel, yVel: setYVel, player: setPlayer};
        },
        makeParticle = function (setx, sety, setXVel, setYVel, timeToLive, gravDirection) { return {x: setx, y: sety, t: timeToLive, xVel: setXVel, yVel: setYVel, grav: gravDirection}; },
        makeExplosion = function (x, y, numParticles, player) {
            var result = [];
            for (var i = 0; i < numParticles; i++) {
                result.push(makeParticle(x, y, Math.random()/2-0.25, (player === '2' ? Math.random() : -Math.random())/2, 2000, player === '2' ? -1 : 1));
            }
            return result;
        },
        explosions = [],
        playerPaddle = {x: WIDTH/2, y: HEIGHT-2, l: 6, h: 1, color: '#66FF99'},
        paddles = [],
        bricks = makeBricks(),
        balls = [makeBall('1')],
        updateCallback = function () { return true; },
        eventCallback = function () { return true;},
        updatePlayerPaddle = function (newPaddle) {
            paddles[0] = JSON.parse(newPaddle);
        },
        getPlayerPaddle = function () {
            var getPaddleReq = new XMLHttpRequest();
            getPaddleReq.open('GET', 'multi/getPlayerPaddle.php', true);
            getPaddleReq.onload = function (e) {
                if (getPaddleReq.readyState === 4) {
                    if (getPaddleReq.status === 200) {
                        updatePlayerPaddle(getPaddleReq.responseText);
                        getPlayerPaddle();
                    }
                }
            };
            getPaddleReq.send();
        },
        updateState = function () {
            var httpReq = new XMLHttpRequest();
            httpReq = new XMLHttpRequest();
            httpReq.open('POST', 'multi/setGameData.php', true);
            httpReq.onload = function (e) {
                if (httpReq.readyState === 4) {
                    if (httpReq.status === 200) {
                        updateState();
                    }
                }
            };
            httpReq.send(getStateJson());
        },
        getStateJson = function () {
            return JSON.stringify({
                paddle: playerPaddle,
                paddles: paddles,
                balls: balls,
                bricks: bricks,
                explosions: explosions
            });
        };

    if (isCoop || isHost) {
        paddles.push({x: WIDTH/2, y: 1, l: 6, h: 1, color: '#66FF99', xVel: 0});
        balls.push(makeBall('2'));
    }

    if (isHost) {
        updateState();
        getPlayerPaddle();
    }

    this.setUpdateCallback = function (newCallback) {
        updateCallback = newCallback;
    };

    this.setEventCallback = function (newCallback) {
        eventCallback = newCallback;
    };

    this.getBricks = function () {
        return bricks;
    };

    this.setPlayerPaddleX = function (newPaddleX) {
        playerPaddle.x = newPaddleX;
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

    this.setPortrait = function (isPortait) {
        portrait = isPortait;
    };

    this.tick = function() {
        var newX,
            newY;

        // Stuff to do when the game is over
        if (bricks.length <= 0) {
            for (var i = 0; i < balls.length; i++) {
                explosions.push(makeExplosion(balls[i].x, balls[i].y, 25));
            }
            balls = [];
            paddles = [];
        }

        if (isCoop) {
            // Moving non player paddles
            for (var i = 0; i < paddles.length; i++) {
                var current = paddles[i],
                    closest = balls[0];

                for (u = 1; u < balls.length; u++) {
                    if (balls[u].y < closest.y)
                        closest = balls[u];
                }

                if (current.x + current.l / 2 < closest.x) {
                    current.xVel += current.xVel < 0.8 ? 0.2 : 0;
                } else if (current.x - current.l / 2 > closest.x) {
                    current.xVel -= current.xVel > -0.8 ? 0.2 : 0;
                } else {
                    current.xVel -= current.xVel != 0 ? current.xVel : 0;
                }

                if (current.x + current.xVel - current.l / 2 < 0) {
                    current.x = current.l / 2;
                } else if (current.x + current.xVel + current.l / 2 > WIDTH) {
                    current.x = WIDTH - current.l / 2;
                } else {
                    current.x += current.xVel;
                }
            }
        }

        // Collision checks for all the balls
        for (var i = 0 ; i < balls.length; i++) {
            newX = balls[i].x + balls[i].xVel;
            newY = balls[i].y + balls[i].yVel;
            // Check collision on player paddle
            if (newX - 0.5 < playerPaddle.x + (playerPaddle.l / 2) && newX + 0.5 > playerPaddle.x - (playerPaddle.l / 2) && newY + 0.5 > playerPaddle.y && newY - 0.5 < playerPaddle.y + playerPaddle.h) {
                eventCallback('bounce');
                var dif = balls[i].x - playerPaddle.x;
                if (balls[i].x + 0.5 <= playerPaddle.x - (playerPaddle.l / 2)) {
                    balls[i].xVel = -balls[i].xVel;
                    newX = balls[i].x + (balls[i].x + 0.5 - (playerPaddle.x - (playerPaddle.l / 2)));
                } else if (balls[i].x - 0.5 >= playerPaddle.x + (playerPaddle.l / 2)) {
                    balls[i].xVel = -balls[i].xVel;
                    newX = balls[i].x - ((balls[i].x - 0.5) - (playerPaddle.x + (playerPaddle.l / 2)));
                } else if (balls[i].y + 0.5 <= playerPaddle.y) {
                    balls[i].xVel += dif * 0.1;
                    balls[i].yVel = -balls[i].yVel;
                    newY = balls[i].y + (balls[i].y + 0.5 - playerPaddle.y);
                } else if (balls[i].y - 0.5 >= playerPaddle.y+playerPaddle.h) {
                    balls[i].xVel += dif * 0.1;
                    balls[i].yVel = -balls[i].yVel;
                    newY = balls[i].y - ((balls[i].y - 0.5) - (playerPaddle.y + playerPaddle.h));
                }
            } else {
                // Check collision on non player paddles
                for (var p = 0; p < paddles.length; p++) {
                    var current = paddles[p];
                    if (newX - 0.5 < current.x + (current.l / 2) && newX + 0.5 > current.x - (current.l / 2) && newY + 0.5 > current.y && newY - 0.5 < current.y + current.h) {
                        eventCallback('bounce');
                        var dif = balls[i].x - current.x;
                        if (balls[i].x + 0.5 <= current.x - (current.l / 2)) {
                            balls[i].xVel = -balls[i].xVel;
                            newX = balls[i].x + (balls[i].x + 0.5 - (current.x - (current.l / 2)));
                        } else if (balls[i].x - 0.5 >= current.x + (current.l / 2)) {
                            balls[i].xVel = -balls[i].xVel;
                            newX = balls[i].x - ((balls[i].x - 0.5) - (current.x + (current.l / 2)));
                        } else if (balls[i].y + 0.5 <= current.y) {
                            balls[i].xVel += dif * 0.1;
                            balls[i].yVel = -balls[i].yVel;
                            newY = balls[i].y + (balls[i].y + 0.5 - current.y);
                        } else if (balls[i].y - 0.5 >= current.y+current.h) {
                            balls[i].xVel += dif * 0.1;
                            balls[i].yVel = -balls[i].yVel;
                            newY = balls[i].y - ((balls[i].y - 0.5) - (current.y + current.h));
                        }
                    }
                }
                var bounced = false,
                    destroy = [];

                // Check collision on bricks
                for (var u = 0; u < bricks.length; u++) {
                    if (!bounced && newX + 0.5 > bricks[u].x && newX - 0.5 < bricks[u].x + bricks[u].w && newY +0.5 > bricks[u].y && newY - 0.5 < bricks[u].y+bricks[u].h) {
                        bounced = true;
                        if (balls[i].x + 0.5 <= bricks[u].x) {
                            balls[i].xVel = -balls[i].xVel;
                            newX = balls[i].x + (balls[i].x + 0.5 - bricks[u].x);
                        } else if (balls[i].x - 0.5 >= bricks[u].x+bricks[u].w) {
                            balls[i].xVel = -balls[i].xVel;
                            newX = balls[i].x - ((balls[i].x - 0.5) - (bricks[u].x + bricks[u].w));
                        } else if (balls[i].y + 0.5 <= bricks[u].y) {
                            balls[i].yVel = -balls[i].yVel;
                            newY = balls[i].y + (balls[i].y + 0.5 - bricks[u].y);
                        } else if (balls[i].y - 0.5 >= bricks[u].y+bricks[u].h) {
                            balls[i].yVel = -balls[i].yVel;
                            newY = balls[i].y - ((balls[i].y - 0.5) - (bricks[u].y + bricks[u].h));
                        }
                        destroy.push(u);
                        explosions.push(makeExplosion(bricks[u].x+bricks[u].w/2, bricks[u].y+bricks[u].h/2, 20, balls[i].player));
                        eventCallback('break');
                    }
                }

                // Remove bricks that where hit
                for (var z = 0; z < destroy.length; z++) {
                    bricks.splice(destroy[z], 1);
                }

                // Side wall collisions
                if (newX + 0.5 >= WIDTH) {
                    eventCallback('bounce');
                    balls[i].xVel = -balls[i].xVel;
                    newX = WIDTH - 0.5;
                } else if (newX - 0.5<= 0) {
                        eventCallback('bounce');
                        balls[i].xVel = -balls[i].xVel;
                        newX = 0.5;

                }

                // Top and bottom collisions/ball respawn
                if (newY + 0.5 >= HEIGHT) {
                    balls[i] = makeBall(balls[i].player);
                    continue;
                } else if (newY - 0.5 <= 0) {
                    if (isCoop || isHost) {
                        balls[i] = makeBall(balls[i].player);
                        continue;
                    } else {
                        eventCallback('bounce');
                        balls[i].yVel = -balls[i].yVel;
                        newY = 0.5;
                    }
                }
            }
            balls[i].x = newX;
            balls[i].y = newY;
        }

        // Update explosion particles
        for (var i = 0; i < explosions.length; i++) {
            if (explosions[i].length <= 0) {
                explosions.splice(i, 1);
                i--;
                continue;
            }
            for (var u = 0; u < explosions[i].length; u++) {
                explosions[i][u].t -= 30;
                if (explosions[i][u].t < 0) {
                    explosions[i].splice(u, 1);
                    u--;
                    continue;
                }
                explosions[i][u].x += explosions[i][u].xVel;
                explosions[i][u].y += explosions[i][u].yVel;
                explosions[i][u].yVel += 0.025 * explosions[i][u].grav;
                explosions[i][u].xVel -= explosions[i][u].xVel * 0.075;
            }
        }

        // Notify view of update
        updateCallback();
    };
};
