(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var keyMap = {};
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


    //TODO: Draw correct terrain on move
    //TODO: Path finding in hex
    //TODO: Multiple terrain types
    //TODO: Move from string to array for positions
    //TODO: fix tryMove

    _c.build_units_from_list = function(game, list) {
        _.each(list || [], function(unit_info, id){
            game.entities.push(_c.create_unit(game, unit_info, id))
        });
        return game.entities;
    };

    _c.create_unit = function (game, unit_info, id) {

        var index = 0;
        if (unit_info.location == 'center') {
            index = Math.floor(.5 * game.open_space.length);

        } else if (unit_info.location == 'random') {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
        }

        var key = game.open_space.splice(index, 1)[0];
        var parts = key.split(",");

        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);

        var EntityType;
        if (unit_info.side == 'Red') {
            EntityType = Player;
        } else {
            EntityType = Enemy;
        }
        return new EntityType(game, x, y, id);
    };


    ///------------------
    var Player = function (game, x, y, id) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._id = id;
        this._draw();
    };

    Player.prototype._draw = function () {
        this._game.display.draw(this._x, this._y, "@", "#000", "#ff0");
    };

    Player.prototype.act = function () {
        /* wait for user input; do stuff when user hits a key */
        if (this._id == 0) {
            this._game.engine.lock();
            window.addEventListener("keydown", this);
        }
    };

    Player.prototype.handleEvent = function (e) {
        var code = e.keyCode;
        if (code == 13 || code == 32) {
            this._checkBox();
            return;
        }
        if (!(code in keyMap)) {
            return;
        } else {
            code = keyMap[code];
        }

        if (code == -1) { /* noop */
            window.removeEventListener("keydown", this);
            this._game.engine.unlock();
            return;
        }

        var dir = ROT.DIRS[6][code];
        var x = this._x + dir[0];
        var y = this._y + dir[1];
        var played = true;//this._tryMove(x, y);

        if (played) {
            window.removeEventListener("keydown", this);
            this._game.engine.unlock();
        }

        this._game.display.draw(this._x, this._y, this._game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
        window.removeEventListener("keydown", this);
        this._game.engine.unlock();
    };

    Player.prototype._checkBox = function () {
        var key = this._x + "," + this._y;
        if (this._game.map[key] != "*") {
            alert("There is no box here!");
        } else if (key == this._game.ananas) {
            alert("Hooray! You found an ananas and won this game.");
            this._game.engine.lock();
            window.removeEventListener("keydown", this);
        } else {
            alert("This box is empty :-(");
        }
    };
    Player.prototype.getX = function () {
        return this._x;
    };
    Player.prototype.getY = function () {
        return this._y;
    };

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
            this._game.setEntity(part, pos[0], pos[1]);
        }

        return true;
    };

    //----------------------------------
    var Enemy = function (game, x, y) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._draw();
    };

    Enemy.prototype._draw = function () {
        this._game.display.draw(this._x, this._y, "P", "#000", "red");

    };

    Enemy.prototype.act = function () {
        var unit = this;
        var x = this._game.entities[0].getX();
        var y = this._game.entities[0].getY();

        var passableCallback = function (x, y) {
            return (x + "," + y in unit._game.map);
        };
        var astar = new ROT.Path.AStar(x, y, passableCallback, {topology: 4});

        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this._x, this._y, pathCallback);

        path.shift();
        /* remove Enemy's position */
        if (path.length == 1) {
            this._game.engine.lock();
            alert("Game over - you were captured by Enemy!");
        } else if (path.length > 1){
             x = path[0][0];
             y = path[0][1];
             this._game.display.draw(this._x, this._y, this._game.map[this._x+","+this._y]);
             this._x = x;
             this._y = y;
             this._draw();
        }
    };


})(Battlebox);