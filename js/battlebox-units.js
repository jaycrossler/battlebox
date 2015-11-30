(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    var CONSTS = {
        food_eat_ratio: .01,
        turns_before_dying: 2,
        amount_dying_when_hungry: .02,
        eat_each_number_of_turns: 24,
        fatigue_replenished_each_turn: .25,
        past_cells_to_remember: 40,
        population_to_make_city_tile: 3000,
        fatigue_replenished_from_pillaging: .15,
        fatigue_replenished_from_looting: .5
    };

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
    // Units have a carrying capacity for the amount of loot they can carry
    // Units consume food over time, and replenish food by pillaging, looting, or foraging
    // Units start dying off and losing morale if they don't have food
    // Towers increase defender's vision +2, range +1 if range > 1
    // Attackers with range > 1 can attack enemies in nearby squares by using some action points
    // Have units communicate with each other, sending enemy positions
    // Units can have their own strategy functions that replace or augment the built-in ones
    // Units have a fatigue variable that improves every turn

    // TODO: Have a strategy system for picking what to do when (big force don't move in until archers killed for def, attackers wait for vanguard
    // TODO: Have archers move back from attacks if possible

    // TODO: When looting or pillaging land, small chance of new defenders spawning a defense force

    // TODO: Also communicate storage locations, or what else?  Make sure defenders respond properly
    // TODO: Move faster over roads, and slower over water - have an action point amount to spend, and a buffer towards moving into a terrain

    // TODO: Each unit type and side can have face_options that combine to create avatars
    // TODO: Each unit has commanders in it that learn and grow, and keep array items
    // TODO: Have unit morale based on skill of commander - every losing fight might decrease morale, every lopsided victory, pillaging, finding treasure
    // TODO: Specify a number of copies of a certain unit
    // TODO: Specify details like 'brutality' that define how to treat pillaging and prisoners

    // TODO: Units should have a max size (480?) that a commander can change
    // TODO: Each force in a unit should have a power rating (maybe the strength+defense?) that pushes up to a max of the number that can attack per turn
    // TODO: Have something like 480 max troops, 120 melee can fight and 120 ranged can fight, then rest as "support lines" that provide bonuses
    // TODO: Should allow 3 trolls, 1 dragon, or 12000 rats or 48000 ants (or something), again with only a portion attackable
    // TODO: if 3 trolls attack 12000 rats, how should that play out?
    // TODO: Have morale rolls for breaking and running away (back to starting point)?
    // TODO: Forces should rarely fight past 60% unit deaths

    // TODO: Have attacker starting side be random
    // TODO: When placing troops, make sure there is a path from starting site to city. If not, make a path

    // TODO: Have icons for different units
    // TODO: SetCenter to have large map and redraw every movement

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

        game.game_options.original_clock_time = game.game_options.delay_between_ticks;
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
            _.each(unit.forces, function (force) {
                force.side = unit._data.side;
            });
            unit._data.troops = JSON.parse(JSON.stringify(unit.forces));


            //Vision is from the unit with the highest vision
            //Speed is from teh unit with the lowest speed
            unit.reset_bonuses();

            unit.pickup_loot({food: unit.unit_count * (unit.starting_food || 1)});
        }

        unit.loot = unit.loot || {};
        unit.knowledge = [];

        //Add unit's strategy functions
        unit.strategy_plan_callback = unit_info.strategy_plan_callback || null;
        unit.strategy_post_plan_callback = unit_info.strategy_post_plan_callback || null;

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
        var is_pillaged = _c.tile_has(cell, 'pillaged');
        var is_looted = _c.tile_has(cell, 'looted');

        if (unit._data.try_to_pillage) {
            //TODO: Unit gains health or morale?
            //TODO: consumes action points

            if (num_farms && !is_pillaged) {
                unit.pickup_loot({food: (100 * num_farms), herbs: (20 * num_farms)});
                unit.fatigue *= (1 - CONSTS.fatigue_replenished_from_pillaging);
                cell.additions.push('pillaged');

            } else if (cell.type == 'city' && !is_pillaged) {
                if ((cell.population > CONSTS.population_to_make_city_tile) && (_c.random() > .8)) {
                    unit.pickup_loot({gold: 1});
                }
                unit.pickup_loot({food: 10, wood: 10, metal: 10, skins: 10});
                unit.fatigue *= (1 - CONSTS.fatigue_replenished_from_pillaging);
                cell.additions.push('pillaged');

            } else if (cell.population) {
                unit.pickup_loot({food: 3});
                unit.fatigue *= (1 - CONSTS.fatigue_replenished_from_pillaging);
                cell.additions.push('pillaged');
            }

        }
        if (unit._data.try_to_loot && (_c.tile_has(cell, 'storage') || cell.loot || num_farms || cell.type == 'city')) {
            if (cell.loot) {
                cell.loot = unit.pickup_loot(cell.loot);
            }

            if (num_farms && !is_pillaged && !is_looted) {
                unit.pickup_loot({food: (25 * num_farms), herbs: (6 * num_farms)})

            } else if (cell.type == 'city' && !is_looted) {
                if ((cell.population > CONSTS.population_to_make_city_tile) && (_c.random() > .9)) {
                    unit.pickup_loot({gold: 1});
                }
                unit.pickup_loot({food: 5, wood: 5, metal: 5, skins: 5});
            }
            if (!is_looted) {
                cell.additions.push('looted');
                unit.fatigue *= (1 - CONSTS.fatigue_replenished_from_looting);
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
                game.cells[x][y].additions = cell.additions || [];
                game.cells[x][y].additions.push({name: 'unit corpse', unit: unit._data});
            }
            if (unit.loot) {
                game.cells[x][y].loot = game.cells[x][y].loot || {};
                for (var key in unit.loot) {
                    game.cells[x][y].loot[key] = game.cells[x][y].loot[key] || 0;
                    game.cells[x][y].loot[key] += unit.loot[key];
                }
            }

            _c.update_unit_ui(game, unit);

            game.scheduler.remove(game.entities[entity_id]);
            game.entities = _.reject(game.entities, unit);

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
        return 80;
    };
    TimeKeeper.prototype.act = function () {
        var time_keeper = this;
        var game = time_keeper._game;

        if ((game.data.tick_count == 0) && (_c.entities(game).length == 0)) {
            //No entities, don't start clock
            game.engine.lock();
            return;
        }

        game.data.tick_count++;

        if (game.game_options.original_clock_time && (game.game_options.reset_clock_to_default_at < game.data.tick_count)) {
            game.game_options.reset_clock_to_default_at = null;
            game.game_options.delay_between_ticks = game.game_options.original_clock_time;
        }

        _c.update_ui_display(game);

        if (!game.data.game_over_at_tick && (game.game_options.game_over_time !== undefined) && (game.data.tick_count >= game.game_options.game_over_time)) {
            _c.game_over(game);
        }

        if ((game.data.game_over_at_tick !== undefined) && (game.data.tick_count >= game.data.game_over_at_tick)) {
            game.engine.lock();
            _c.game_over_loot_report(game);
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
            if (!game.data.initial_display_functions_run) {
                _c.initial_display_functions(game);
                game.data.initial_display_functions_run = true;
            }
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
        this.fatigue = 0;
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
    Entity.prototype.morale = function () {
        //TODO: Incorporate commander skill, number of wins/losses, how hungry, brutality?

    };


    Entity.prototype.act = function () {
        //NOTE: This should always be overloaded with entity-specific actions
    };

    Entity.prototype.vision_range = function () {
        var unit = this;
        var range = unit.vision || unit.range || 3;

        var tile = unit.tile_on();
        if (_c.tile_has(tile, 'tower')) range += 2;

        return range;
    };
    Entity.prototype.ranged_fighting_range = function () {
        var unit = this;

        var ranged_unit_range = 0;
        _.each(unit.forces, function (force) {
            if (force.ranged_strength || force.range > 1) {
                if (force.range > ranged_unit_range) {
                    ranged_unit_range = force.range;
                }
            }
        });

        var tile = unit.tile_on();
        if (_c.tile_has(tile, 'tower')) ranged_unit_range += 1;
        return ranged_unit_range;
    };
    Entity.prototype.tile_on = function () {
        var unit = this;
        if (unit.is_dead) {
            return false;
        } else {
            return _c.tile(unit._game, unit.x, unit.y);
        }
    };
    Entity.prototype.count_forces = function () {
        var unit = this;

        var total = 0;
        _.each(unit.forces, function (force) {
            total += force.count;
        });
        return total;
    };
    Entity.prototype.can_carry = function (show_total) {
        var unit = this;

        var total = 0;
        _.each(unit.forces, function (force) {
            total += (force.count * force.carrying);
        });

        return show_total ? total : Math.max(0, total -= this.is_carrying());
    };
    Entity.prototype.is_carrying = function () {
        var unit = this;

        var total = 0;
        for (var key in unit.loot) {
            total += unit.loot[key];
        }
        return total;
    };
    Entity.prototype.pickup_loot = function (loot) {
        var unit = this;
        unit.loot = unit.loot || {};

        var can_carry = unit.can_carry();
        for (var key in (loot || {})) {
            unit.loot[key] = unit.loot[key] || 0;

            var picked_up = maths.clamp(loot[key], 0, can_carry);
            can_carry -= picked_up;
            loot[key] -= picked_up;
            unit.loot[key] += picked_up;
        }
        return loot;
    };
    Entity.prototype.eat = function () {
        var unit = this;

        //Reduce Fatigue by 10%
        unit.fatigue *= (1 - CONSTS.fatigue_replenished_each_turn);

        var on_units_side = false;
        if (unit._data.side == unit.tile_on().side) {
            on_units_side = true;

            //Unit fatigue further reduced
            unit.fatigue *= (1 - CONSTS.fatigue_replenished_each_turn);
        }

        //Eats only once every 24 turns
        if (this._game.tick_count % CONSTS.eat_each_number_of_turns) return;

        unit.loot = unit.loot || {};

        var total_eaters = unit.count_forces();

        if (!on_units_side) {
            //Unit only eats food they are carrying if not on their own tiles
            unit.loot.food -= (total_eaters * CONSTS.food_eat_ratio);
        }

        if (unit.loot.food < 0) {
            //Didn't have enough food.
            unit.loot.food = 0;
            unit.hungry = unit.hungry || 0;
            unit.hungry++;
            unit.fatigue *= unit.hungry;

            if (unit.hungry > CONSTS.turns_before_dying) {
                //Starving, start dying off
                _.each(unit.forces, function (force) {
                    var starved = Math.floor(force.count * CONSTS.amount_dying_when_hungry);
                    force.count -= starved;
                    if (unit.eat_the_dead) {
                        unit.pickup_loot({food: starved})
                    }
                });
            }
        }

        unit.fatigue = Math.floor(unit.fatigue);
    };


    Entity.prototype.track_move = function (tile) {
        this.previous_tiles_visited.push(tile);
        //Only track last 40 moves;
        this.previous_tiles_visited = _.last(this.previous_tiles_visited, CONSTS.past_cells_to_remember);
    };
    Entity.prototype.times_moved_to_tile = function (x, y) {
        var visited = _.filter(this.previous_tiles_visited, function (tile) {
            return (tile.x == x) && (tile.y == y);
        });
        return visited.length;
    };
    Entity.prototype.reset_bonuses = function () {
        var unit = this;

        var lowest_speed = 100;
        var highest_vision = 0;
        var unit_count = 0;
        var attacker_strength = 0;
        var attacker_defense = 0;

        _.each(unit.forces, function (force) {
            if (force.speed < lowest_speed) lowest_speed = force.speed;

            var sight = force.vision || force.range;
            if (sight > highest_vision) highest_vision = sight;

            unit_count += force.count || 1;

            attacker_strength += unit_count * (force.strength || 1);
            attacker_defense += unit_count * (force.defense || 1);
        });
        unit.speed = lowest_speed;
        unit.vision = highest_vision;
        unit.unit_count = unit_count;
        unit.base_strength = attacker_strength;
        unit.base_defense = attacker_defense;
    };
    Entity.prototype.tell_friends_about = function (message) {
        var unit = this;
        var friends_in_range = _c.find_unit_by_filters(unit._game, unit, {
            side: 'friend',
            range: unit.communication_range,
            return_multiple: true
        });

        _.each(friends_in_range.target, function (friend) {
            friend.learn_about(message, unit);
        })
    };
    Entity.prototype.learn_about = function (message, sender) {
        var unit = this;
        unit.knowledge.push({message: message, sender: sender, time: unit._game.data.tick_count});
        //console.log(unit._symbol + " learned about " + JSON.stringify(message) + " from " + sender._symbol);
        //TODO: Apply some time filters to delay learning

        if (message.message == 'Strong Enemy Attacking' || message.message == 'Strong Enemy Defending') {
            unit.waypoint = _c.tile(unit._game, message.location.x, message.location.y);
            unit.waypoint_weight = 1000;
        }

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
                    if (cell.food) {
                        var left = unit.pickup_loot({food: cell.food});
                        cell.food = left.food || 0;
                    }
                }

                var num_walls = 0, num_towers = 0;
                if (unit._data.side == cell.side) {
                    //The unit is on home territory
                    num_walls = _c.tile_has(cell, 'wall', true);
                    num_towers = _c.tile_has(cell, 'tower', true);
                    unit.pickup_loot({food: unit.count_forces() * CONSTS.food_eat_ratio * (1 / CONSTS.eat_each_number_of_turns)});
                }
                unit.protected_by_walls = num_walls;
                unit.in_towers = num_towers;

                unit.track_move(cell);
            }
        }
        _c.draw_tile(game, previous_x, previous_y);
        if (!unit.is_dead) {
            unit._draw();
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


        unit.eat();  //Consume food and replenish fatigue

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
            } else if (best_location.ranged_enemy) {
                _c.entity_attacks_entity(game, unit, best_location.ranged_enemy, _c.log_message_to_user, true);
            } else if (best_location.tile) {
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
                //stop_if_cell_has: ['tower', 'wall'],
                when_arrive: 'goal based',
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