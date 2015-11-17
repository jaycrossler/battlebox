(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    //---------------
    // Combat Rules:
    //---------------
    // Units attack in order of speed, even when multiple forces are in the same unit
    // Each unit can be comprised of many forces (200 soldiers, 50 cavalry, etc)
    // Units pull metadata from a 'dictionary' that looks up what that side's values are
    // Each person in unit attacks, with chance of hitting a single foe being attacker.strength/defender.defense
    // If defender is killed, they have a 20% chance of hitting back at an attacker (defender.strength/attacker.defense)
    // When killed, units drop loot on the square - next unit by picks it up
    // When pillaging, burns and displaces population, but much more loot
    // When moving into a tile with an enemy, automatically attack them
    // Multiple walls/towers have additional defense on home units, wall += .5 of att, tower += .2 of attack
    // Only defenders benefit from being on a wall (increase defense .5) or tower (increase defense .2)
    // Units can be entered as an array in addition to an object - to keep complex hero or unit details
    // Units move based on the speed of the slowest living unit in their force
    // Units have a goal-oriented AI that uses the information they know about

    // TODO: Units have a carrying capacity for the amount of loot they can carry
    // TODO: Units consume food over time, and replenish food by pillaging, looting, or foraging
    // TODO: Towers increase defender's vision * 1.5, range +1 if range > 1
    // TODO: Attackers with range > 1 can attack enemies in nearby squares by using some action points
    // TODO: When looting or pillaging land, small chance of new defenders spawning a defense force
    // TODO: Have units communicate with each other, sending enemy positions or storage locations, or what else?
    // TODO: Move faster over roads, and slower over water - have an action point amount to spend, and a buffer towards moving into a terrain
    // TODO: When defeating all enemies, give n extra turns to finish pillaging
    // TODO: Each unit type and side can have face_options that combine to create avatars
    // TODO: Each unit has commanders in it that learn and grow, and keep array items
    // TODO: Specify a number of copies of a certain unit
    // TODO: Specify details like 'brutality' that define how to treat pillaging and prisoners
    // TODO: Have attacker starting side be random
    // TODO: Have unit morale based on skill of commander - every losing fight might decrease morale, every lopsided victory, pillaging, finding treasure

    //TODO: Have icons for different units
    //TODO: SetCenter to have large map and redraw every movement
    //TODO: When placing troops, make sure there is a path from starting site to city. If not, make a path

    _c.build_units_from_list = function (game, list) {
        _.each(list || [], function (unit_info, id) {
            var unit = _c.create_unit(game, unit_info, id);
            game.entities.push(unit);
            _c.add_unit_ui_to_main_ui(game, unit);
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

        var side = unit_info.side || 'Neutral';
        var side_data = _.find(game.game_options.sides, function (tt) {
                return (tt.side == side)
            }) || {};
        var unit_data = $.extend({}, side_data, unit_info);

        //Generate the unit
        var unit = new EntityType(game, location.x, location.y, id, unit_data);

        //Add metadata from game_options.troop_types to each troop
        if (!unit.data_expanded) {
            unit.forces = [];
            if (_.isArray(unit._data.troops)) {
                _.each(unit._data.troops, function (troops) {
                    var force = _c.hydrate_troop_metadata(game, troops, troops.count, unit._data.side);
                    unit.forces.push(force);
                });
            } else if (_.isObject(unit._data.troops)) {
                for (var key in unit._data.troops || []) {
                    var force = _c.hydrate_troop_metadata(game, key, unit._data.troops[key], unit._data.side);
                    unit.forces.push(force);
                }
            }

            //Vision is from the unit with the highest vision
            //Speed is from teh unit with the lowest speed
            var lowest_speed = 100;
            var highest_vision = 0;
            _.each(unit.forces, function (force) {
                if (force.speed < lowest_speed) lowest_speed = force.speed;

                var sight = force.vision || force.range;
                if (sight > highest_vision) highest_vision = sight;
            });
            unit.speed = lowest_speed;
            unit.vision = highest_vision;

            unit.data_expanded = true;
        }

        return unit;
    };
    _c.hydrate_troop_metadata = function (game, troop, count, side) {
        var forces_data = game.game_options.forces_data || [];
        var troop_previous_data = {};

        var troop_name = troop;
        if (_.isObject(troop)) {
            troop_name = troop.name;
            troop_previous_data = troop;
        }

        var troop_type_data = _.find(forces_data, function (tt) {
                return tt.side == 'all' && tt.name == troop_name
            }) || {};
        var troop_detail_data = _.find(forces_data, function (tt) {
                return tt.side == side && tt.name == troop_name
            }) || {};
        var troop_object = $.extend({}, troop_type_data, troop_detail_data, troop_previous_data);

        if (!troop_object) {
            console.error("troop_data not found for: " + troop_name);
            troop_object = {name: troop, count: count, side: side};
        } else {
            troop_object.count = count || 1;
        }
        return troop_object;
    };


    _c.raze_or_loot = function (game, unit, cell) {
        cell.additions = cell.additions || [];
        unit.loot = unit.loot || {};

        var num_farms = _c.tile_has(cell, 'farm', true);

        if (unit._data.try_to_pillage) {
            //TODO: Unit gains health or morale?
            //TODO: consumes action points

            if (num_farms && !_c.tile_has(cell, 'pillaged')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.herbs = unit.loot.herbs || 0;
                unit.loot.food += (100 * num_farms);  //TODO: Random benefits based on technology and population
                unit.loot.herbs += (20 * num_farms);
                cell.additions.push('pillaged');

            } else if (cell.type == 'city' && !_c.tile_has(cell, 'pillaged')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.wood = unit.loot.wood || 0;
                unit.loot.metal = unit.loot.metal || 0;
                unit.loot.skins = unit.loot.skins || 0;
                unit.loot.food += 10;
                unit.loot.wood += 10;
                unit.loot.metal += 10;
                unit.loot.skins += 10;
                cell.additions.push('pillaged');

                if ((cell.population > 3000) && (_c.random() > .8)) {
                    unit.loot.gold = unit.loot.gold || 0;
                    unit.loot.gold += 1;
                }
            }

        }
        if (unit._data.try_to_loot && (_c.tile_has(cell, 'storage') || cell.loot)) {
            unit.loot = unit.loot || {};
            for (var key in cell.loot) {
                unit.loot[key] = unit.loot[key] || 0;
                unit.loot[key] += cell.loot[key];
                cell.loot[key] = 0;
                //TODO: Only take as much loot as can carry
            }

            if (num_farms && !_c.tile_has(cell, 'pillaged') && !_c.tile_has(cell, 'looted')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.herbs = unit.loot.herbs || 0;
                unit.loot.food += (25 * num_farms);
                unit.loot.herbs += (6 * num_farms);

            } else if (cell.type == 'city' && !_c.tile_has(cell, 'looted')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.wood = unit.loot.wood || 0;
                unit.loot.metal = unit.loot.metal || 0;
                unit.loot.skins = unit.loot.skins || 0;
                unit.loot.food += 5;
                unit.loot.wood += 5;
                unit.loot.metal += 5;
                unit.loot.skins += 5;

                if ((cell.population > 3000) && (_c.random() > .9)) {
                    unit.loot.gold = unit.loot.gold || 0;
                    unit.loot.gold += 1;
                }
            }
            if (!_c.tile_has(cell, 'looted')) {
                cell.additions.push('looted');
            }
        }

    };



    _c.remove_entity = function (game, unit) {
        var entity_id = _.indexOf(game.entities, unit);
        if (entity_id > -1) {
            var x = unit.x;
            var y = unit.y;

            var cell = _c.tile(game, x, y);
            if (cell) {
                cell.additions = cell.additions || [];
                cell.additions.push({name: 'unit corpse', unit: unit._data});
            }
            if (unit.loot) {
                cell.loot = cell.loot || {};
                for (var key in unit.loot) {
                    cell.loot[key] = cell.loot[key] || 0;
                    cell.loot[key] += unit.loot[key];
                }
            }

            game.scheduler.remove(game.entities[entity_id]);
            game.entities = _.reject(game.entities, unit);

            _c.draw_tile(game, x, y);
        }
    };

    /**
     * Find tile that best meets goal values of unit
     * @param {object} game class data
     * @param {object} unit unit that is looking for cells to move to
     * @returns {object} tile hex cell that best matches goals
     */
    _c.find_tile_by_unit_goals = function (game, unit) {
        var range = unit.vision || unit.range || 3;
        unit._data.goals = unit._data.goals || {};

        //TODO: Add in knowledge - where is a town or storage area or friendly unit
        //TODO: Consider current cell if need to stay here for tower/wall

        var current_cell = _c.tile(game, unit.x, unit.y);

        if (unit._data.goals.weak_enemies || unit._data.goals.all_enemies) {
            var options = {
                side: 'enemy',
                range: range,
                return_multiple: true
            };
            var close_enemies = _c.find_unit_by_filters(game, unit, options);
        }

        var neighbors = _c.surrounding_tiles(game, unit.x, unit.y, range);
        var weighted_neighbors = [];
        _.each(neighbors, function (neighbor) {
            var points = 0;

            var is_pillaged_or_looted = _c.tile_has(neighbor, 'pillaged') || _c.tile_has(neighbor, 'looted');
            var num_towers = (_c.tile_has(neighbor, 'tower')) ? 1 : 0;
            var num_walls = Math.max(2, _c.tile_has(neighbor, 'tower', true));
            var loot = (_.isObject(neighbor.loot) && !is_pillaged_or_looted) ? 1 : 0;
            var is_city = (neighbor.type == 'city' && !is_pillaged_or_looted) ? 1 : 0;
            var is_farm = (_c.tile_has(neighbor, 'farm') && !is_pillaged_or_looted) ? 1 : 0;

            points += (num_towers * (unit._data.goals.towers || 0));
            points += (num_walls * (unit._data.goals.walls || 0));
            points += (loot * (unit._data.goals.loot || 0));
            points += (is_city * (unit._data.goals.city || 0));
            points += (is_farm * (unit._data.goals.farm || 0));

            //TODO - friendly_units, weak_enemies

            if (close_enemies.target.length && (unit._data.goals.weak_enemies || unit._data.goals.all_enemies)) {
                var enemies_here = _.filter(close_enemies.target, function (enemy) {
                    return (enemy.x == neighbor.x) && (enemy.y == neighbor.y) && !enemy.is_dead;
                });
                points += (enemies_here.length * Math.max(unit._data.goals.all_enemies, 2));
                //TODO: How to incorporate weakness of enemy? Have a running power total?
            }

            if (points > 0) {
                points -= unit.times_moved_to_tile(neighbor.x, neighbor.y);
            }

            var point_target = unit.waypoint_weight || 0;
            if (points > point_target) {
                weighted_neighbors.push({x: neighbor.x, y: neighbor.y, weight: points});
            }
        });

        var best_cell = false;

        if (weighted_neighbors.length == 0 && unit.waypoint) {
            best_cell = unit.waypoint;
        } else if (weighted_neighbors.length > 0) {
            //Sort to find highest points
            //TODO: Randomly pick one if highest is a tie
            weighted_neighbors.sort(function (a, b) {
                //TODO: Incorporate distance
                return a.weight - b.weight;
            });
        }

        //TODO: Send message to others that there are important points or that a point is being taken care of?

        if (weighted_neighbors && weighted_neighbors.length) {
            best_cell = _.last(weighted_neighbors);
            if (!best_cell.weight) {
                best_cell = false;
            }
            if ((best_cell.x == current_cell.x) && (best_cell.y == current_cell.y)) {
                best_cell = false;
            }
        }

        var enemy_here = _.find(close_enemies.target, function (enemy) {
            //TODO: Either find by weakest or strongest by options
            return (enemy.x == unit.x) && (enemy.y == unit.y);
        });

        //Closest cell with most points
        return {tile: best_cell, enemy: enemy_here};
    };

    //--------------------
    var TimeKeeper = function (game) {
        this._game = game;
    };
    TimeKeeper.prototype.describe = function () {
        return "Screen";
    };
    TimeKeeper.prototype.getSpeed = function () {
        return 80;
    };
    TimeKeeper.prototype.act = function () {
        var time_keeper = this;
        var game = time_keeper._game;

        game.data.tick_count++;

        _c.update_ui_display(game);

        if ((game.game_options.game_over_time !== undefined) && (game.data.tick_count >= game.game_options.game_over_time)) {
            _c.game_over(game);
        }

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
        this.x = x;
        this.y = y;
        this._game = game;
        this._id = id;
        this._symbol = unit.symbol || "@";
        this._data = unit;
        this._draw();
        this.strategy = '';
        this.previous_tiles_visited = [];
    };

    Entity.prototype.describe = function () {
        return this._data.name + " (<span style='color:" + this._data.side + "'>" + this._symbol + "</span>)";
    };

    Entity.prototype.getSpeed = function () {
        return this.speed || this._data.speed || 40;
    };

    Entity.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    Entity.prototype.getPosition = function () {
        return {x: this.x, y: this.y};
    };

    Entity.prototype.act = function () {
    };

    Entity.prototype.track_move = function (tile) {
        this.previous_tiles_visited.push(tile);
        //Only track last 40 moves;
        this.previous_tiles_visited = _.last(this.previous_tiles_visited, 40);
    };
    Entity.prototype.times_moved_to_tile = function (x, y) {
        var visited = _.filter(this.previous_tiles_visited, function (tile) {
            return (tile.x == x) && (tile.y == y);
        });
        return visited.length;
    };
    Entity.prototype.try_to_move_to_and_draw = function (x, y) {
        var game = this._game;
        var unit = this;

        var can_move_to = _c.tile_is_traversable(game, x, y, unit._data.move_through_impassable);
        if (can_move_to) {
            var is_unit_there = _c.find_unit_by_filters(game, unit, {location: {x: x, y: y}});
            if (is_unit_there && is_unit_there.target && is_unit_there.target.data && is_unit_there.target.data.side) {
                if (is_unit_there.target.data.side != unit.data.side) {
                    can_move_to = _c.entity_attacks_entity(game, unit, is_unit_there.target, _c.log_message_to_user);
                } else {
                    //TODO: What to do if on same sides? Exchange information?  Give loot to stronger?
                }
            }

            if (can_move_to) {
                var previous_x = unit.x;
                var previous_y = unit.y;
                unit.x = x;
                unit.y = y;

                var cell = _c.tile(game, x, y);
                if (unit._data.try_to_loot || unit._data.try_to_pillage) {
                    if (cell.type == 'city' || _c.tile_has(cell, 'dock') || _c.tile_has(cell, 'farm') || _c.tile_has(cell, 'storage') || cell.loot) {
                        _c.raze_or_loot(game, unit, cell);
                    }
                }

                var num_walls = 0, num_towers = 0;
                if (unit._side == cell.side) {
                    //The unit is on home territory
                    num_walls = _c.tile_has(cell, 'wall', true);
                    num_towers = _c.tile_has(cell, 'tower', true);
                }
                unit.protected_by_walls = num_walls;
                unit.in_towers = num_towers;

                _c.draw_tile(game, previous_x, previous_y);
                unit._draw();
                unit.track_move(cell);
            }
        }
        return can_move_to;
    };



    /* Other unit bumps into */
    Entity.prototype.bump = function (who, power) {
    };

    Entity.prototype._draw = function (x, y) {
        var use_x, use_y;
        if (x === undefined) {
            use_x = this.x;
        } else {
            use_x = x;
        }
        if (y === undefined) {
            use_y = this.y;
        } else {
            use_y = y;
        }
        _c.draw_tile(this._game, use_x, use_y, this._symbol || "@", this._data.color || "#000", this._data.side);
    };
    Entity.prototype.getX = function () {
        return this.x;
    };
    Entity.prototype.getY = function () {
        return this.y;
    };
    Entity.prototype.try_move = function (game, x, y) {
        var result = false;

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
            if (cell && !cell.impassable) {
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
            options = {
                side: 'enemy',
                filter: 'closest',
                range: 20,
                plan: plan,
                backup_strategy: unit._data.backup_strategy
            };
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options);

        } else if (plan == 'goal based') {
            var best_location = _c.find_tile_by_unit_goals(game, unit);

            if (best_location.enemy) {
                _c.entity_attacks_entity(game, unit, best_location.enemy, _c.log_message_to_user);
            } else if (best_location.tile) {
                //options = {plan: plan, backup_strategy: unit._data.backup_strategy};
                //_c.movement_strategies.seek(game, unit, best_location.tile, options);

                if (unit.waypoint && unit.waypoint.x == unit.x && unit.waypoint.y == unit.y) {
                    unit.waypoint = null;
                    unit.waypoint_weight = null;
                } else {
                    unit.waypoint = best_location.tile;
                    unit.waypoint_weight = best_location.tile.weight;
                }

                options = {
                    side: 'enemy',
                    filter: 'closest',
                    when_arrive: 'goal based',
                    plan: plan,
                    backup_strategy: unit._data.backup_strategy
                };
                _c.movement_strategies.head_towards_2(game, unit, {location: best_location.tile}, options);
            }

        } else if (plan == 'vigilant') {
            options = {
                side: 'enemy',
                filter: 'closest',
                range: 3,
                plan: plan,
                backup_strategy: unit._data.backup_strategy
            };
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options);

        } else if (plan == 'seek weakest') {
            options = {
                side: 'enemy',
                filter: 'weakest',
                range: 20,
                plan: plan,
                backup_strategy: unit._data.backup_strategy
            };
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options);

        } else if (plan == 'run away') {
            options = {side: 'enemy', filter: 'closest', range: 12, plan: plan, backup_strategy: 'vigilant'};
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.avoid(game, unit, target_status, options);

        } else if (plan == 'invade city') {
            //TODO: If no enemies and close to city, then try to loot and pillage
            var location = _.find(game.data.buildings, function (b) {
                return b.type == 'city' || b.type == 'city2'
            });
            options = {
                side: 'enemy',
                filter: 'closest',
                range: 12,
                when_arrive: 'goal based',
                plan: plan,
                backup_strategy: unit._data.backup_strategy
            };
            _c.movement_strategies.head_towards(game, unit, location, options);

        } else if (plan == 'defend city') {
            var location = _.find(game.data.buildings, function (b) {
                return b.type == 'city' || b.type == 'city2'
            });
            options = {
                side: 'enemy',
                filter: 'closest',
                range: 8,
                stop_if_cell_has: ['tower', 'wall'],
                plan: plan,
                backup_strategy: unit._data.backup_strategy
            };
            _c.movement_strategies.head_towards(game, unit, location, options);


        } else if (plan == 'wait') {
            _c.movement_strategies.wait(game, unit);


        } else { //if (plan == 'wander') {
            _c.movement_strategies.wander(game, unit);
        }

        //Redraw the data of the unit
        _c.update_unit_ui(game, unit);
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
            var x = unit.x + command.movement[0];
            var y = unit.y + command.movement[1];

            var can_move = unit.try_move(game, x, y);
            if (can_move) {
                unit.try_to_move_to_and_draw(x, y);
            }

            window.removeEventListener("keydown", this);
//            game.engine.unlock();
        }

    };

    Player.prototype.execute_action = function (game, unit) {
        var cell = game.cells[unit.x][unit.y];
        console.log("Player at x: " + unit.x + ", y: " + unit.y);
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