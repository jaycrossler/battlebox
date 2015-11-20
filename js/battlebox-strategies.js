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
                plan: 'seek closest',
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
                    plan: 'invade city',
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