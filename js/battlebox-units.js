(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    //TODO: Have icons for different units
    //TODO: SetCenter to have large map and redraw every movement
    //TODO: Have movement be based on values
    //TODO: Move faster over roads, and slower over water
    //TODO: Have A*Star use the terrain movement variables
    //TODO: Have enemy searching only look if within a likely radius

    _c.build_units_from_list = function (game, list) {
        _.each(list || [], function (unit_info, id) {
            game.entities.push(_c.create_unit(game, unit_info, id))
        });
        return _c.entities(game);
    };
    _c.add_screen_scheduler = function (game) {
        game.scheduler.add(new TimeKeeper(game), true);
    };

    _c.create_unit = function (game, unit_info, id) {

        var location = _c.find_a_matching_tile(game, unit_info);

        var EntityType;
        if (unit_info.player) {
            EntityType = Player;
        } else {
            EntityType = OpForce;
        }
        return new EntityType(game, location.x, location.y, id, unit_info);
    };

    _c.try_to_move_to_and_draw = function (game, unit, x, y, move_through_impassibles) {
        var valid = _c.tile_is_traversable(game, x, y, move_through_impassibles);
        if (valid) {
            var is_unit_there = _c.find_unit_status(game, unit, {location: {x: x, y: y}});
            if (is_unit_there) {
                if (is_unit_there.side != unit.side) {
                    valid = _c.entity_attacks_entity(game, unit, is_unit_there, _c.log_message_to_user);
                } else {
                    //TODO: What to do if on same sides?
                }
            }

            if (valid) {
                var previous_x = unit._x;
                var previous_y = unit._y;
                unit._x = x;
                unit._y = y;
                _c.draw_tile(game, previous_x, previous_y);
                unit._draw();
            }
        }
        return valid;
    };

    _c.remove_entity = function (game, unit) {
        var entity_id = _.indexOf(game.entities, unit);
        if (entity_id > -1) {
            var x = unit._x;
            var y = unit._y;
            game.scheduler.remove(game.entities[entity_id]);
            delete game.entities[entity_id];
            //TODO: Collapse entities
            _c.draw_tile(game, x, y);
        }
    };

    //--------------------
    var TimeKeeper = function (game) {
        this._game = game;
    };
    TimeKeeper.prototype.describe = function () {
        return "Screen";
    };
    TimeKeeper.prototype.getSpeed = function () {
        return 100;
    };
    TimeKeeper.prototype.act = function () {
        var time_keeper = this;
        var game = time_keeper._game;

        game.data.tick_count++;
//        console.log('Game Tick: ' + game.data.tick_count);

        var done = null;
        var promise = {
            then: function (cb) {
                done = cb;
            }
        };

        //Allow game to be paused
        //TODO: Needs to be reengineered, as it resumes the clock twice - and doubles game speed
        var next_tick = function (done) {
            if (game.data.in_progress) {
                done();
            } else {
                setTimeout(function () {
                    next_tick(done)
                }, game.game_options.delay_between_ticks || 500);
            }
        };

        setTimeout(function () {
            next_tick(done)
        }, game.game_options.delay_between_ticks || 500);

        return promise;
    };
    //--------------------
    var Entity = function (game, x, y, id, unit) {
        this._x = x;
        this._y = y;
        this._game = game;
        this._id = id;
        this._symbol = unit.symbol || "@";
        this._data = unit;
        this._draw();
    };

    Entity.prototype.describe = function () {
        return this._data.name + " (<span style='color:" + this._data.side + "'>" + this._symbol + "</span>)";
    };

    Entity.prototype.getSpeed = function () {
        return this._data.speed || 40;
    };

    Entity.prototype.setPosition = function (x, y) {
        this._x = x;
        this._y = y;
        return this;
    };

    Entity.prototype.getPosition = function () {
        return {x: this._x, y: this._y};
    };

    Entity.prototype.act = function () {
    };

    /* Other unit bumps into */
    Entity.prototype.bump = function (who, power) {
    };

    Entity.prototype._draw = function (x, y) {
        var use_x, use_y;
        if (x === undefined) {
            use_x = this._x;
        } else {
            use_x = x;
        }
        if (y === undefined) {
            use_y = this._y;
        } else {
            use_y = y;
        }
        _c.draw_tile(this._game, use_x, use_y, this._symbol || "@", "#000", this._data.color || this._data.side);
    };
    Entity.prototype.getX = function () {
        return this._x;
    };
    Entity.prototype.getY = function () {
        return this._y;
    };
    Entity.prototype.try_move = function (game, x, y) {
        var result = false;

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
            if (cell && !cell.impassible) {
                result = true;
            }
        }
        return result;
    };
    Entity.prototype.execute_plan = function () {
        var unit = this;
        var game = unit._game;


        var plan = unit._data.plan || 'seek closest';
        var options, target_status;

        if (plan == 'seek closest') {
            options = {side: 'enemy', filter: 'closest', range: 20, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'vigilant') {
            options = {side: 'enemy', filter: 'closest', range: 3, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'seek weakest') {
            options = {side: 'enemy', filter: 'weakest', range: 20, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'run away') {
            options = {side: 'enemy', filter: 'closest', range: 12, plan: plan, backup_strategy: 'vigilant'};
            target_status = _c.find_unit_status(game, unit, options);
            _c.movement_strategies.avoid(game, unit, target_status, options)

        } else if (plan == 'wait') {
            _c.movement_strategies.wait(game, unit)


        } else { //if (plan == 'wander') {
            _c.movement_strategies.wander(game, unit);
        }

    };


    //--------------------
    var Player = function (game, x, y, id, unit) {
        Entity.call(this, game, x, y, id, unit)
    };
    Player.extend(Entity);

    Player.prototype.act = function () {
        var unit = this;

        /* wait for user input; do stuff when user hits a key */
        if (unit._id == controlled_entity_id) {
//            unit._game.engine.lock();
            window.addEventListener("keydown", this);
        }
        if (!unit.is_dead && unit._data.plan) {
            unit.execute_plan();
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
//            game.engine.unlock();
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

        if (!unit.is_dead && unit._data.plan) {
            unit.execute_plan()
        }

    };


})(Battlebox);