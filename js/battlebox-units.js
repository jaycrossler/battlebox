(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    var food_eat_ratio = .01;
    var turns_before_dying = 2;
    var amount_dying_when_hungry = .02;
    var eat_each_number_of_turns = 24;

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

    // TODO: When looting or pillaging land, small chance of new defenders spawning a defense force

    // TODO: Also communicate storage locations, or what else?  Make sure defenders respond properly
    // TODO: Move faster over roads, and slower over water - have an action point amount to spend, and a buffer towards moving into a terrain

    // TODO: Each unit type and side can have face_options that combine to create avatars
    // TODO: Each unit has commanders in it that learn and grow, and keep array items
    // TODO: Have unit morale based on skill of commander - every losing fight might decrease morale, every lopsided victory, pillaging, finding treasure
    // TODO: Specify a number of copies of a certain unit
    // TODO: Specify details like 'brutality' that define how to treat pillaging and prisoners

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
                unit.pickup_loot({food: (100 * num_farms), herbs: (20 * num_farms)})
                cell.additions.push('pillaged');

            } else if (cell.type == 'city' && !is_pillaged) {
                if ((cell.population > 3000) && (_c.random() > .8)) {
                    unit.pickup_loot({gold: 1});
                }
                unit.pickup_loot({food: 10, wood: 10, metal: 10, skins: 10});
                cell.additions.push('pillaged');

            } else if (cell.population) {
                unit.pickup_loot({food: 3});
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
                if ((cell.population > 3000) && (_c.random() > .9)) {
                    unit.pickup_loot({gold: 1});
                }
                unit.pickup_loot({food: 5, wood: 5, metal: 5, skins: 5});
            }
            if (!is_looted) {
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

    /**
     * Find tile that best meets goal values of unit
     * @param {object} game class data
     * @param {object} unit unit that is looking for cells to move to
     * @returns {object} tile hex cell that best matches goals, and also enemy on tile and nearest enemy in range if ranged attacks are possible
     */
    _c.find_tile_by_unit_goals = function (game, unit) {
        var range = unit.vision_range();

        //TODO: Add in knowledge - where is a town or storage area or friendly unit

        var current_cell = _c.tile(game, unit.x, unit.y);

        var options = {
            range: range,
            return_multiple: true
        };
        var close_entities = _c.find_unit_by_filters(game, unit, options);


        var has_ranged_ability = false;
        var ranged_unit_range = 0;
        _.each(unit.forces, function (force) {
            if (force.ranged_strength || force.range > 1) {
                has_ranged_ability = true;
                if (force.range > ranged_unit_range) {
                    ranged_unit_range = force.range;
                }
            }

        });
        var ranged_enemy = [];

        //Find the neighboring cells
        var neighbors = _c.surrounding_tiles(game, unit.x, unit.y, range, true);

        if (unit.strategy_plan_callback) {
            var resources = {
                current_cell: current_cell,
                neighbors: neighbors,
                close_entities: close_entities,
                ranged_range: ranged_unit_range
            };
            unit._game = null;
            var result = unit.strategy_plan_callback(resources);
            unit._game = game;
            return result;
        }

        unit._data.goals = unit._data.goals || {};

        //Add in the current cell, then search through all to find out point values for the current strategy
        neighbors = [current_cell].concat(neighbors);
        var weighted_neighbors = [];
        var current_cell_weight = 0;
        _.each(neighbors, function (neighbor) {
            var points = 0;

            var is_pillaged_or_looted = _c.tile_has(neighbor, 'pillaged') || _c.tile_has(neighbor, 'looted');
            var num_towers = (_c.tile_has(neighbor, 'tower')) ? 1 : 0;
            var num_walls = Math.min(2, _c.tile_has(neighbor, 'wall', true));
            var loot = (_.isObject(neighbor.loot) && !is_pillaged_or_looted) ? 1 : 0;
            var is_city = (neighbor.type == 'city' && !is_pillaged_or_looted) ? 1 : 0;
            var is_farm = (_c.tile_has(neighbor, 'farm') && !is_pillaged_or_looted) ? 1 : 0;
            var is_populated = (neighbor.population && !is_pillaged_or_looted) ? 1 : 0;

            points += (num_towers * (unit._data.goals.towers || 0));
            points += (num_walls * (unit._data.goals.walls || 0));
            points += (loot * (unit._data.goals.loot || 0));
            points += (is_city * (unit._data.goals.city || 0));
            points += (is_farm * (unit._data.goals.farm || 0));
            points += (is_populated * (unit._data.goals.population || 0));

            //TODO: How to incorporate weakness of enemy? Have a running power total?

            //Modify for enemies if that matters
            if (close_entities.target.length && (unit._data.goals.weak_enemies || unit._data.goals.all_enemies)) {
                var enemies_here = _.filter(close_entities.target, function (enemy) {
                    return (unit._data.side != enemy._data.side) && (enemy.x == neighbor.x) && (enemy.y == neighbor.y) && !enemy.is_dead;
                });
                points += (enemies_here.length * Math.min(unit._data.goals.all_enemies, 2));
            }

            //See if any enemies are within attack range
            if (has_ranged_ability && close_entities.target.length) {
                var enemies_ranged_here = _.filter(close_entities.target, function (enemy) {
                    return neighbor.ring && (neighbor.ring < ranged_unit_range) && (unit._data.side != enemy._data.side) && (enemy.x == neighbor.x) && (enemy.y == neighbor.y) && !enemy.is_dead;
                });
                if (enemies_ranged_here && enemies_ranged_here.length) {
                    ranged_enemy = ranged_enemy.concat({target: enemies_ranged_here, ring: neighbor.ring});
                }
            }

            //Modify for friends if that matters (negative to stay away from friends, positive to follow)
            if (close_entities.target.length && unit._data.goals.friendly_units) {
                var friendly_units = _.filter(close_entities.target, function (friend) {
                    return (unit._data.side == friend._data.side) && (friend.x == neighbor.x) && (friend.y == neighbor.y) && !friend.is_dead;
                });
                points += (friendly_units.length * Math.min(unit._data.goals.friendly_units, 2));
            }

            //Modify for exploration - will move away from cells
            if (unit._data.goals.explore && points > 0) {
                points -= (unit.times_moved_to_tile(neighbor.x, neighbor.y) * unit._data.goals.explore);
            }

            //Reduce points by distance
            points -= 2 * Math.max(0, (neighbor.ring || 0) - (unit._data.goals.explore || 0));

            //Update the waypoint value to be closer to up to date (if you can see it)
            if (unit.waypoint && unit.waypoint.x == neighbor.x && unit.waypoint.y == neighbor.y) {
                unit.waypoint_weight = Math.round((unit.waypoint_weight + unit.waypoint_weight + points) / 3);
            }
            if (unit.x == neighbor.x && unit.y == neighbor.y) {
                current_cell_weight = points;
            }

            //Only consider cells that are better than current mission
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
            weighted_neighbors.sort(function (a, b) {
                return a.weight - b.weight;
            });

            best_cell = _.last(weighted_neighbors);

            //Randomly pick one if highest is a tie.  NOTE: Sometimes this is better, sometimes not
            weighted_neighbors = _.filter(weighted_neighbors, function (neighbor) {
                return neighbor.weight == best_cell.weight;
            });
            best_cell = weighted_neighbors.random();
        }

        //TODO: Send message to others that there are important points or that a point is being taken care of?

        //Find the last weighted cell, and move there if it has more points than current cell
        if (weighted_neighbors && weighted_neighbors.length) {
            if (!best_cell.weight) {
                best_cell = false;
            } else if (best_cell.weight <= current_cell_weight) {
                best_cell = false;
            } else if ((best_cell.x == current_cell.x) && (best_cell.y == current_cell.y)) {
                best_cell = false;
            }
        }

        //Find any targets on the current square for convenience
        var enemy_here = _.find(close_entities.target, function (enemy) {
            //TODO: Either find by weakest or strongest by options
            return (unit._data.side != enemy._data.side) && (enemy.x == unit.x) && (enemy.y == unit.y);
        });

        //If any ranged attacks are permissible, find the closest
        if (ranged_enemy && ranged_enemy.length) {
            ranged_enemy.sort(function (a, b) {
                return a.target.ring - b.target.ring;
            });
            ranged_enemy = _.first(ranged_enemy);
            ranged_enemy = (ranged_enemy && ranged_enemy.target && ranged_enemy.target[0]) ? ranged_enemy.target[0] : null;
        } else {
            ranged_enemy = null;
        }

        //Closest cell with most points, and the first enemies within range
        var result = {tile: best_cell, enemy: enemy_here, ranged_enemy: ranged_enemy};

        //If the unit has a post-ai function, run it
        if (unit.strategy_post_plan_callback) {
            var resources = {
                current_cell: current_cell,
                neighbors: neighbors,
                close_entities: close_entities,
                ranged_range: ranged_unit_range
            };
            unit._game = null;
            var result = unit.strategy_post_plan_callback(result, resources);
            unit._game = game;
            return result;
        }
        return result;
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
    Entity.prototype.attack_range = function (force_name) {
        //TODO: This should look at forces, not the overall unit
        var unit = this;
        var range = unit.range || 1;

        var is_ranged = (unit.ranged_strength) || (unit.range > 1);

        if (is_ranged) {
            var tile = unit.tile_on();
            if (_c.tile_has(tile, 'tower')) range++;
        }
        return range;
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

        if (this._game.tick_count % eat_each_number_of_turns) return; //Eats only once every 24 turns

        unit.loot = unit.loot || {};

        var total_eaters = unit.count_forces();

        unit.loot.food -= (total_eaters * food_eat_ratio);
        if (unit.loot.food < 0) {
            //Didn't have enough food.
            unit.loot.food = 0;
            unit.hungry = unit.hungry || 0;
            unit.hungry++;

            if (unit.hungry > turns_before_dying) {
                //Starving, start dying off
                _.each(unit.forces, function (force) {
                    var starved = Math.floor(force.count * amount_dying_when_hungry);
                    force.count -= starved;
                    if (unit.eat_the_dead) {
                        unit.pickup_loot({food: starved})
                    }
                });
            }
        }
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
                if (unit._side == cell.side) {
                    //The unit is on home territory
                    num_walls = _c.tile_has(cell, 'wall', true);
                    num_towers = _c.tile_has(cell, 'tower', true);
                    unit.pickup_loot({food: unit.count_forces() * food_eat_ratio * (1 / eat_each_number_of_turns)});
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


        unit.eat();

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