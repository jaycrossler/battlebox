(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    //TODO: Path finding in hex
    //TODO: Multiple terrain types
    //TODO: Move from string to array for positions
    //TODO: Have icons for different units
    //TODO: Mouseover for unit info
    //TODO: SetCenter to have large map and only show partial

    _c.build_units_from_list = function (game, list) {
        _.each(list || [], function (unit_info, id) {
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
            EntityType = OpForce;
        }
        return new EntityType(game, x, y, id, unit_info.symbol);
    };


    ///------------------
    var Player = function (game, x, y, id, symbol) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._id = id;
        this._symbol = symbol || "@";
        this._draw();
    };

    Player.prototype._draw = function () {
        _c.draw_tile(this._game, this._x, this._y, this._symbol, "#000", "#ff0");
    };

    Player.prototype.act = function () {
        /* wait for user input; do stuff when user hits a key */
        if (this._id == 0) {
            this._game.engine.lock();
            window.addEventListener("keydown", this);
        }
    };

    Player.prototype.handleEvent = function (e) {
        var unit = this;
        var game = this._game;
        var command = _c.interpret_command_from_keycode(e.keyCode, unit);


        if (command.ignore) {
            window.removeEventListener("keydown", unit);
            return;
        }

        if (command.func) {
            command.func(game, unit);
        }

        if (command.movement) {
            var x = unit._x + command.movement[0];
            var y = unit._y + command.movement[1];

            var played = unit.try_move(game, x, y);
            if (played) {
                _c.draw_tile(game, unit._x, unit._y);
                unit._x = x;
                unit._y = y;
                unit._draw();
            }
            window.removeEventListener("keydown", unit);
            game.engine.unlock();
        }

    };

    Player.prototype.execute_action = function (game, unit) {
        var key = unit._x + "," + unit._y;

        var map_val = game.map[key];
        console.log("Player at x: " + unit._x + ", y: " + unit._y);
        console.log("Map value here is: [" + map_val + "]");

    };
    Player.prototype.getX = function () {
        return this._x;
    };
    Player.prototype.getY = function () {
        return this._y;
    };

    Player.prototype.try_move = function (game, x, y) {
        var key = x + "," + y;
        var result = false;

        if (game.map[key] !== undefined) {
            result = true;
        }

        return result;
    };

    //----------------------------------
    var OpForce = function (game, x, y) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._draw();
    };

    OpForce.prototype._draw = function () {
        _c.draw_tile(this._game, this._x, this._y, "P", "#000", "red");
    };

    OpForce.prototype.act = function () {
        var unit = this;
        var game = this._game;

        //TODO: Make a get nearest enemy function
        var x = game.entities[0].getX();
        var y = game.entities[0].getY();

        var passableCallback = function (x, y) {
            return (x + "," + y in game.map);
        };
        var astar = new ROT.Path.AStar(x, y, passableCallback, {topology: 6});
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(this._x, this._y, pathCallback);

        path.shift();

        if (path.length == 1) {
            this._game.engine.lock();
            alert("Game over - you were captured by OpForce!");

        } else if (path.length > 1) {
            //Walk towards the enemy
            x = path[0][0];
            y = path[0][1];

            _c.draw_tile(game, unit._x, unit._y);
            this._x = x;
            this._y = y;
            this._draw();
        }
    };


})(Battlebox);