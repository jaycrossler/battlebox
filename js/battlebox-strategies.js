(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    //TODO: Have a queue of plans, then when one can't complete, move to next
    //TODO: Have units on nearby fortifications and defenders to go to fortifications if possible

    var terrain_weights = {
        plains: 4,
        desert: 6,
        hills: 8,
        dunes: 8,
        mountains: 12,
        forest: 6,
        lake: 10,
        sea: 20
    };

    _c.tile_traversability_weight = function (game, x, y) {
        var cell = _c.tile(game, x, y);
        var weight = 0;

        weight += terrain_weights[cell.name] || 0;

        if (cell.density == 'medium') weight += 4;
        if (cell.density == 'large') weight += 8;
        if (_c.tile_has(cell, 'river')) weight += 4;
        if (_c.tile_has(cell, 'path')) weight -= 2;
        if (_c.tile_has(cell, 'road')) weight -= 4;
        if (_c.tile_has(cell, 'rail')) weight -= 8;

        return Math.max(0, weight);
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


        var ranged_unit_range = unit.ranged_fighting_range();
        var has_ranged_ability = (ranged_unit_range > 1);
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
            unit._game = null;  //Hide so functions can't access game object
            var x = unit.x; //Make sure functions don't overwrite x,y
            var y = unit.y;
            var result = unit.strategy_plan_callback(resources);
            unit._game = game;
            unit.x = x;
            unit.y = y;
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

                //If there's a strong enemy in this cell, don't attack it
                var stronger_here = false;
                var weaker_here = false;
                _.each(enemies_here, function (enemy_here) {
                    if (enemy_here.base_strength > unit.base_defense) stronger_here = true;
                    if (enemy_here.base_strength < unit.base_defense) weaker_here = true;

                });
                if (enemies_here.length > 0) {
                    if (unit._data.goals.strong_enemies !== undefined && stronger_here) {
                        points += unit._data.goals.strong_enemies;
                    } else if (unit._data.goals.weak_enemies !== undefined && weaker_here) {
                        points += unit._data.goals.weak_enemies;
                    } else {
                        points += unit._data.goals.all_enemies;
                    }
                }
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
            if (unit.waypoint && unit.waypoint_weight && unit.waypoint.x == neighbor.x && unit.waypoint.y == neighbor.y) {
                unit.waypoint_weight = Math.floor((unit.waypoint_weight + unit.waypoint_weight + points) / 3);
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

        //If there's a strong enemy in this cell, don't attack it
        if (unit._data.run_if_ranged_and_overpowered && has_ranged_ability) {
            if (enemy_here.base_strength > unit.base_defense) {
                enemy_here = null;
            }
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
            unit._game = null;  //Hide so functions can't access game object
            x = unit.x; //Make sure functions don't overwrite x,y
            y = unit.y;
            var result = unit.strategy_post_plan_callback(result, resources);
            unit._game = game;
            unit.x = x;
            unit.y = y;
            return result;
        }
        return result;  //NOTE: If enemy is specified (on same tile, will attack that), then Ranged Enemy, then move to tile
    };


    _c.path_from_to = function (game, from_x, from_y, to_x, to_y, weighting_callback) {

        var passableCallback = function (x, y) {
            var cell = game.cells[x];
            cell = (cell !== undefined) ? cell[y] : null;

            return (cell && !cell.impassable);
        };
        var astar = new ROT.Path.AStar(to_x, to_y, passableCallback, {topology: 6});
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        var weightingCallback = weighting_callback || function (x, y) {
                return _c.tile_traversability_weight(game, x, y);
            };
        astar.compute(from_x, from_y, pathCallback, weightingCallback);
//        astar.compute(from_x, from_y, pathCallback);

        return path;
    };

    _c.find_unit_by_filters = function (game, current_unit, options) {

        var targets = _c.entities(game);
        targets = _.without(targets, current_unit);

        if (options.range) {
            targets = _.filter(targets, function (t) {
                return (Helpers.distanceXY(current_unit, t) < options.range);
            });
        }
        if (options.only_count_forces) {
            targets = _.filter(targets, function (t) {
                return (!t._data.not_part_of_victory);
            });
        }
        if (options.location) {
            targets = _.filter(targets, function (t) {
                return (t.x == options.location.x && t.y == options.location.y);
            });
        }
        if (options.side) {
            targets = _.filter(targets, function (t) {
                return (options.side == 'enemy' ? (current_unit._data.side != t._data.side) : current_unit._data.side == t._data.side);
            });
        }
        if (options.filter) {
            if (options.filter == 'closest') {
                //TODO: Performance: First filter they are within a certain range. If too slow with many units, consider using a Dijkstra cached search each turn

                targets = targets.sort(function (a, b) {
                    var path_a = _c.path_from_to(game, current_unit.x, current_unit.y, a.x, a.y);
                    var path_b = _c.path_from_to(game, current_unit.x, current_unit.y, b.x, b.y);
                    var a_len = path_a ? path_a.length : 100;
                    var b_len = path_b ? path_b.length : 100;

                    return a_len > b_len;
                });
            }
        }

        var target, range, closest_path, x, y;
        if (options.return_multiple) {
            if (targets.length) {
                closest_path = _c.path_from_to(game, current_unit.x, current_unit.y, targets[0].x, targets[0].y);
                range = closest_path.length || 0;

                if (targets[0].getX) x = targets[0].getX();
                if (targets[0].getY) y = targets[0].getY();
                target = targets;
            } else {
                target = [];
                x = 0;
                y = 0;
                range = 0;
            }

        } else {
            target = targets[0];
            if (target) {
                closest_path = _c.path_from_to(game, current_unit.x, current_unit.y, target.x, target.y);
                range = closest_path.length || 0;

                if (target.getX) x = target.getX();
                if (target.getY) y = target.getY();
            }
        }

        return {target: target, x: x, y: y, range: range};
    };

    //--------------------------------------------
    _c.movement_strategies = _c.movement_strategies || {};
    _c.movement_strategies.vigilant = function (game, unit) {
        _c.log_message_to_user(game, unit.describe() + ' ' + "stays vigilant and doesn't move", 1);
    };

    _c.movement_strategies.wander = function (game, unit) {
        var code = Helpers.randOption([0, 1, 2, 3, 4, 5]);
        var dir = ROT.DIRS[6][code];
        var y = unit.y + dir[1];
        var x = unit.x + dir[0];

        unit.strategy = 'Wander';

        var msg = unit.describe() + ' ';
        var moves = unit.try_to_move_to_and_draw(x, y);
        if (moves) {
            _c.log_message_to_user(game, msg + "wanders a space", 1);
        } else {
            _c.movement_strategies.wait(game, unit);
        }
    };

    _c.movement_strategies.wait = function (game, unit) {
        unit.strategy = "Wait for enemy to be near";

        _c.log_message_to_user(game, unit.describe() + " stays vigilant and doesn't move", 0);
    };

    function backup_strategies(game, unit, options) {
        if (options.backup_strategy == 'vigilant') {
            return _c.movement_strategies.vigilant(game, unit);
        } else if (options.backup_strategy == 'wait') {
            return _c.movement_strategies.wait(game, unit);
        } else { //wander
            return _c.movement_strategies.wander(game, unit);
        }
    }

    _c.movement_strategies.seek = function (game, unit, target_status, options) {
        var x = (target_status.x !== undefined) ? target_status.x : target_status.target ? target_status.target.getX() : -1;
        var y = (target_status.y !== undefined) ? target_status.y : target_status.target ? target_status.target.getY() : -1;

        var target_message = "";
        if (target_status.target) {
            target_message = target_status.target.describe();
        } else {
            target_message = x + ", " + y;
        }

        unit.strategy = "Seek target";

        if (!_c.tile_is_traversable(game, x, y)) {
            return backup_strategies(game, unit, options);
        }

        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
        if (options.range && (path && path.length > options.range) || !path || (path && path.length == 0)) {
            return backup_strategies(game, unit, options)
        }

        path.shift();
        if ((path.length <= 1) && target_status.target) {
            //_c.log_message_to_user(game, unit.describe() + " attacks nearby target: " + target_message, 1);
            var moves = _c.entity_attacks_entity(game, unit, target_status.target, _c.log_message_to_user);
            if (moves) {
                unit.try_to_move_to_and_draw(target_status.target.x, target_status.target.y);
            }

        } else if (path.length) {
            //Walk towards the enemy
            x = path[0][0];
            y = path[0][1];
            var moves = unit.try_to_move_to_and_draw(x, y);
            if (moves) {
                _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + target_message, 1);
            } else {
                return backup_strategies(game, unit, options);
            }
        } else {
            return backup_strategies(game, unit, options);
        }
    };

    _c.movement_strategies.head_towards_2 = function (game, unit, location, options) {
        var path;

        unit.strategy = "Head to " + location.location.x + ", " + location.location.y;

        var stop_here = false;
        if (options.stop_if_cell_has) {
            var cell = _c.tile(game, unit.x, unit.y);
            if (!cell) {
                console.error ("unit " + unit._data.name + " is at invalid loc: " + unit.x + ", " + unit.y);
            } else {
                _.each(options.stop_if_cell_has, function (condition) {
                    if (_c.tile_has(cell, condition)) {
                        stop_here = true;
                    }
                });
                if (stop_here) {
                    return backup_strategies(game, unit, options);
                }
            }
        }

        var to_loc = location && (location.location) && (location.location.x !== undefined) && (location.location.y !== undefined);

        var options_scan = {
            side: 'enemy',
            filter: 'closest',
            range: unit.vision_range(),
            plan: 'seek closest',
            backup_strategy: unit._data.backup_strategy
        };
        var target_status = _c.find_unit_by_filters(game, unit, options_scan);
        if (!to_loc || target_status && target_status.target) {
            //unit.waypoint = null;
            //unit.waypoint_weight = null;
            return _c.movement_strategies.seek(game, unit, target_status, options);
        }

        //No enemies near, so continue along path
        path = _c.path_from_to(game, unit.x, unit.y, location.location.x, location.location.y);
        path.shift();

        var moves = false;
        if (path.length) {
            //Walk towards the enemy
            var x = path[0][0];
            var y = path[0][1];
            moves = unit.try_to_move_to_and_draw(x, y);

            //Arrived at waypoint
            if (moves && unit.waypoint && unit.waypoint.x == x && unit.waypoint.y == y) {
                unit.waypoint = null;
                unit.waypoint_weight = null;
            }

        } else if (options.when_arrive) {
            //TODO: Skips one turn, fix. maybe call unit.execute_plan();
            unit._data.plan = options.when_arrive;
            moves = true;
        }
        if (moves) {
            _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + (location.title || location.name), 1);
        } else {
            return backup_strategies(game, unit, options);
        }
    };

    _c.movement_strategies.head_towards = function (game, unit, location, options) {
        var path;

        unit.strategy = "Head to " + location.location.x + ", " + location.location.y;

        var stop_here = false;
        if (options.stop_if_cell_has) {
            var cell = _c.tile(game, unit.x, unit.y);
            if (!cell) {
                console.error ("unit " + unit._data.name + " is at invalid loc: " + unit.x + ", " + unit.y);
            } else {
                _.each(options.stop_if_cell_has, function (condition) {
                    if (_c.tile_has(cell, condition)) {
                        stop_here = true;
                    }
                });
                if (stop_here) {
                    return backup_strategies(game, unit, options);
                }

            }
        }

        var to_loc = location && (location.location) && (location.location.x !== undefined) && (location.location.y !== undefined);
        if (!to_loc) {
            options = {
                side: 'enemy',
                filter: 'closest',
                range: unit.vision_range(),
                plan: options.when_arrive || 'seek closest',
                backup_strategy: unit._data.backup_strategy
            };
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options);
            return;

        } else {
            path = _c.path_from_to(game, unit.x, unit.y, location.location.x, location.location.y);
            path.shift();
        }

        var moves = false;
        if (path.length <= unit.vision_range()) {
            if (options.when_arrive) {
                //TODO: Skips one turn, fix. maybe call unit.execute_plan();
                unit._data.plan = options.when_arrive;
                moves = true;
            } else {
                options = {
                    side: 'enemy',
                    filter: 'closest',
                    range: unit.vision_range(),
                    plan: options.when_arrive || 'seek closest',
                    backup_strategy: unit._data.backup_strategy
                };
                var target_status = _c.find_unit_by_filters(game, unit, options);
                if (target_status && target_status.target) {
                    return _c.movement_strategies.seek(game, unit, target_status, options);
                } else {
                    return backup_strategies(game, unit, options);
                }
            }

        } else if (path.length) {
            //Walk towards the enemy
            var x = path[0][0];
            var y = path[0][1];
            moves = unit.try_to_move_to_and_draw(x, y);
        }
        if (moves) {
            _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + (location.title || location.name), 1);
        } else {
            return backup_strategies(game, unit, options);
        }
    };

    _c.movement_strategies.avoid = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;
        unit.strategy = "Avoiding enemy";

        if (!_c.tile_is_traversable(game, x, y)) {
            return backup_strategies(game, unit, options);
        }

        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
        var moves = false;
        if (options.range && path && path.length <= options.range) {
            path.shift();
            if (path.length > 0) {

                //Walk away from the enemy
                x = path[0][0];
                y = path[0][1];

                x = unit.x - x;
                y = unit.y - y;

                x = unit.x + x;
                y = unit.y + y;

                //TODO: Pick alternate paths if can't move any more
                moves = unit.try_to_move_to_and_draw(x, y);
            }
        }
        if (!moves) {
            return backup_strategies(game, unit, options);
        }
    };


})(Battlebox);