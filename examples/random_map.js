$(function () {
    Game.init();
});

var Game = {
    display: null,
    engine: null,

    player: null,

    ananas: null,

    map: {},

    w: 100,
    h: 40,

    init: function () {
        this.display = new ROT.Display({width: this.w, height: this.h, fontSize: 14, layout: "hex"});
        document.body.appendChild(this.display.getContainer());
        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.pedro, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    setCenter: function () {
        var pos = this.player.getPosition();
        var opts = this._display.getOptions();
        this._offset[0] = pos[0] - Math.floor(opts.width / 2);
        this._offset[1] = pos[1] - Math.floor(opts.height / 2);
        if ((this._offset[0] + this._offset[1]) % 2) {
            this._offset[0]--;
        }

        /* redraw all */
        this._display.clear();

        for (var j = 0 - 1; j < opts.height + 1; j++) {
            for (var i = j % 2 - 2; i < opts.width + 2; i += 2) {
                this._draw(i + this._offset[0], j + this._offset[1]);
            }
        }
    }
};

Game._generateMap = function () {
//     var digger = new ROT.Map.Digger(this.w, this.h);

    var digger = new ROT.Map.Cellular(this.w, this.h, {
        topology: 6,
        born: [4, 5, 6],
        survive: [3, 4, 5, 6]
    });

    digger.randomize(0.5);

    // initialize with irregularly random values
// 	for (var i=0; i<this.w; i++) {
// 		for (var j=0; j<this.h; j++) {
// 			var dx = i/this.w - 0.5;
// 			var dy = j/this.h - 0.5;
// 			var dist = Math.pow(dx*dx+dy*dy, 0.3);
// 			if (ROT.RNG.getUniform() < dist) {
// 				digger.set(i, j, 1);
// 			}
// 		}
// 	}

    // generate four iterations, show the last one
    for (var i = 3; i >= 0; i--) {
        digger.create(i ? null : this.display.DEBUG);
    }


    var freeCells = [];
    var digCallback = function (x, y, value) {
        if (value) {
            return;
        }
        /* do not store walls */

        var key = x + "," + y;
        freeCells.push(key);
        this.map[key] = " ";
    }
    digger.create(digCallback.bind(this));

    this._generateBoxes(freeCells);

    this._drawWholeMap();

    this.player = this._createBeing(Player, freeCells);
    this.pedro = this._createBeing(Pedro, freeCells);
};

Game._generateBoxes = function (freeCells) {
    for (var i = 0; i < 10; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = "O";

        if (!i) {
            this.ananas = key;
        }
    }
};

Game._drawWholeMap = function () {
    //Make everything black
    for (var i = 0; i < this.w; i++) {
        for (var j = 0; j < this.h; j++) {
            this.display.draw(i, j, " ", "#000", "#000");
        }
    }

    //Have open cells be colored
    for (var key in this.map) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        var bg = ["#ccc", "#ddd", "#eee", "#fff"].random();
        this.display.draw(x, y, this.map[key], "#000", bg);
    }
}


//-------------------------------

var Player = function (x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype._draw = function () {
    Game.display.draw(this._x, this._y, "@", "#000", "#ff0");
}

Player.prototype.act = function () {
    /* wait for user input; do stuff when user hits a key */
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function (e) {
    var keyMap = {};
//     keyMap[38] = 0;
//     keyMap[33] = 1;
//     keyMap[39] = 2;
//     keyMap[34] = 3;
//     keyMap[40] = 4;
//     keyMap[35] = 5;
//     keyMap[37] = 6;
//     keyMap[36] = 7;
//

    keyMap[ROT.VK_Y] = 0;
    keyMap[ROT.VK_NUMPAD7] = 0;
    keyMap[ROT.VK_U] = 1;
    keyMap[ROT.VK_NUMPAD9] = 1;
    keyMap[ROT.VK_L] = 2;
    keyMap[ROT.VK_RIGHT] = 2;
    keyMap[ROT.VK_NUMPAD6] = 2;
    keyMap[ROT.VK_N] = 3;
    keyMap[ROT.VK_NUMPAD3] = 3;
    keyMap[ROT.VK_B] = 4;
    keyMap[ROT.VK_NUMPAD1] = 4;
    keyMap[ROT.VK_H] = 5;
    keyMap[ROT.VK_LEFT] = 5;
    keyMap[ROT.VK_NUMPAD4] = 5;
    keyMap[ROT.VK_K] = 0;
    keyMap[ROT.VK_UP] = 0;
    keyMap[ROT.VK_NUMPAD8] = 0;
    keyMap[ROT.VK_J] = 3;
    keyMap[ROT.VK_DOWN] = 3;
    keyMap[ROT.VK_NUMPAD2] = 3;
    keyMap[ROT.VK_PERIOD] = -1;
    keyMap[ROT.VK_CLEAR] = -1;
    keyMap[ROT.VK_NUMPAD5] = -1;

    var code = e.keyCode;

    if (code == 13 || code == 32) {
        this._checkBox();
        return;
    }
    if (!(code in keyMap)) {
        return;
    }
    code = keyMap[code];

    if (code == -1) { /* noop */
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
        this.adjustEnergy(-1);
        return;
    }

    var dir = ROT.DIRS[6][code];
    var x = this._x + dir[0];
    var y = this._y + dir[1];
    var played = true;//this._tryMove(x, y);

    if (played) {
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }

//     Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = x;
    this._y = y;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype._checkBox = function () {
    var key = this._x + "," + this._y;
    if (Game.map[key] != "*") {
        alert("There is no box here!");
    } else if (key == Game.ananas) {
        alert("Hooray! You found an ananas and won this game.");
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        alert("This box is empty :-(");
    }
}
Player.prototype.getX = function () {
    return this._x;
}
Player.prototype.getY = function () {
    return this._y;
}

Player.prototype._tryMove = function (x, y) {
    var key = x + "," + y;


    var newPositions = [
        [x, y]
    ];
    for (var i = 0; i < this._parts.length; i++) {
        var part = this._parts[i]
        newPositions.push(part.getPosition().slice());
    }

    for (var i = 0; i < this._parts.length; i++) {
        var part = this._parts[i];
        var pos = newPositions[i];
        Game.setEntity(part, pos[0], pos[1]);
    }

    Game.setCenter();
    return true;
}

//-------------------------------

var Pedro = function (x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Pedro.prototype._draw = function () {
    Game.display.draw(this._x, this._y, "P", "#000", "red");

}

Pedro.prototype.act = function () {
    var x = Game.player.getX();
    var y = Game.player.getY();
    var passableCallback = function (x, y) {
        return (x + "," + y in Game.map);
    }
    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology: 4});

    var path = [];
    var pathCallback = function (x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    /* remove Pedro's position */
    if (path.length == 1) {
        Game.engine.lock();
        alert("Game over - you were captured by Pedro!");
    } else {
//         x = path[0][0];
//         y = path[0][1];
//         Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
//         this._x = x;
//         this._y = y;
//         this._draw();
    }
}

//-------------------------------

Game._createBeing = function (what, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new what(x, y);
}

//-------------------------------