# Breakout
A simple breakout game, created for a university class in early 2015.

The goal of this project was to get to grips with drawing to the [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element via vanilla JavaScript.

The collision detection is not perfect, and multiplayer is a bit of a hack consisting of the "host" sending their game state as JSON to some php file, 
which is then written to disk, allowing the other "client" player to read said game state and update. As a result, the multiplayer supports no more than two concurrent players.

As I said, the main emphasis of this project was to learn about drawing with the canvas API, not best practises for multiplayer real time gaming.
That said, the multiplayer does work supprisingly well despite it's major flaws.

[Play it here.](https://devweb2014.cis.strath.ac.uk/~prb12148/breakout/)

Consists of the following three game modes:
* Single player
* AI co-op
* Multi player co-op (as stated above, she ain't pretty)

# Setup
If only single player modes are required, setup is as simple as cloning the repo and opening index.html in a browser.

For multiplayer, the repository should be put in a place where the PHP can be executed (e.g htdocs for Apache with PHP setup).
Two files must then be created in the "multi" folder, "gameState" and "paddleState".
These can be created either manually, or by executing the bash script [setup.sh](https://github.com/iain-logan/breakout/blob/master/setup.sh).

# License
See the [LICENSE](https://github.com/iain-logan/breakout/blob/master/LICENSE) file.
