(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    //TODO: Have icons for different units
    //TODO: SetCenter to have large map and redraw every movement

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

        if (!game.open_space.length) {
            console.error("No open spaces, can't draw units");
        } else {
            var key = game.open_space[index];
            var x = parseInt(key[0]);
            var y = parseInt(key[1]);

            var EntityType;
            if (unit_info.side == 'Yellow') {
                EntityType = Player;
            } else {
                EntityType = OpForce;
            }
            return new EntityType(game, x, y, id, unit_info);
        }
    };

    _c.try_to_move_to_and_draw = function (game, unit, x, y) {
        var valid = _c.is_valid_location(game, x, y);
        if (valid) {
            var previous_x = unit._x;
            var previous_y = unit._y;
            unit._x = x;
            unit._y = y;
            _c.draw_tile(game, previous_x, previous_y);
            unit._draw();
        }
        return valid;
    };

    //--------------------
    var Entity = function(game, x, y, id, unit) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._id = id;
        this._symbol = unit.symbol || "@";
        this._data = unit;
        this._draw();
    };

    Entity.prototype.describe = function() {
    	return this._data.name + " (<span style='color:" + this._data.side + "'>" + this._symbol  +"</span>)";
    };

    Entity.prototype.getSpeed = function() {
    	return this._data.speed || 100;
    };

    Entity.prototype.setPosition = function(x, y) {
    	this._x = x;
        this._y = y;
    	return this;
    };

    Entity.prototype.getPosition = function() {
    	return {x: this._x, y: this._y};
    };

    Entity.prototype.act = function() {
    };

    /* Other unit bumps into */
    Entity.prototype.bump = function(who, power) {
    };

    Entity.prototype._draw = function (x, y) {
        //TODO: Handle x = 0
        _c.draw_tile(this._game, x || this._x, y || this._y, this._symbol || "@", "#000", this._data.color || this._data.side);
    };
    Entity.prototype.getX = function () {
        return this._x;
    };
    Entity.prototype.getY = function () {
        return this._y;
    };
    Entity.prototype.try_move = function (game, x, y) {
        var result = false;

        var cell = game.cells[x][y];
        if (cell && !cell.impassible) {
            result = true;
        }

        return result;
    };


    //--------------------
    var Player = function (game, x, y, id, unit) {
        Entity.call(this, game, x, y, id, unit)
    };
    Player.extend(Entity);

    Player.prototype.act = function () {
        /* wait for user input; do stuff when user hits a key */
        if (this._id == controlled_entity_id) {
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

        //TODO: If tab, then switch controlled_entity_id

        if (command.func) {
            command.func(game, unit);
        }

        if (command.movement) {
            var x = unit._x + command.movement[0];
            var y = unit._y + command.movement[1];

            var can_move = unit.try_move(game, x, y);
            if (can_move) {
                _c.try_to_move_to_and_draw(game, unit, x, y);
            }

            window.removeEventListener("keydown", this);
            game.engine.unlock();
        }

    };

    Player.prototype.execute_action = function (game, unit) {
        var cell = game.cells[unit._x][unit._y];
        console.log("Player at x: " + unit._x + ", y: " + unit._y);
        console.log("Cell value here is: [" + JSON.stringify(cell) + "]");
    };



    //----------------------------------
    var OpForce = function (game, x, y, id, unit) {
        Entity.call(this, game, x, y, id, unit);
    };
    OpForce.extend(Entity);


    OpForce.prototype.act = function () {
        var unit = this;
        var game = this._game;


        var plan = unit._data.plan || 'seek closest';
        var options, target_status;

        if (plan == 'seek closest') {
            options = {side:'enemy', filter:'closest', range:20, plan:plan};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'vigilant') {
            options = {side:'enemy', filter:'closest', range:12, plan:plan, backup_strategy:'wait'};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'wander') {
            _c.movement_strategies.wander(game, unit);

        } else if (plan == 'seek weakest') {
            options = {side:'enemy', filter:'weakest', range:20, plan:plan};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)
        }

    };


})(Battlebox);