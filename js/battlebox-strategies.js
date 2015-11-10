(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    //TODO: Have a queue of plans, then when one can't complete, move to next

    _c.path_from_to = function (game, from_x, from_y, to_x, to_y) {

        var passableCallback = function (x, y) {
            var cell = game.cells[x];
            cell = (cell !== undefined) ? cell[y] : null;

            return (cell && !cell.impassible);
        };
        var astar = new ROT.Path.AStar(to_x, to_y, passableCallback, {topology: 6});
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        astar.compute(from_x, from_y, pathCallback);

        return path;
    };

    _c.find_unit_by_filters = function (game, current_unit, options) {

        var targets = _c.entities(game);

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

    _c.movement_strategies = _c.movement_strategies || {};


    _c.movement_strategies.vigilant = function (game, unit) {
        _c.log_message_to_user(game, unit.describe() + ' ' + "stays vigilant and doesn't move", 1);
    };

    _c.movement_strategies.wander = function (game, unit) {
        var code = Helpers.randOption([0, 1, 2, 3, 4, 5]);
        var dir = ROT.DIRS[6][code];
        var y = unit.y + dir[1];
        var x = unit.x + dir[0];

        var msg = unit.describe() + ' ';

        var moves = _c.try_to_move_to_and_draw(game, unit, x, y);
        if (moves) {
            _c.log_message_to_user(game, msg + "wanders a space", 1);
        } else {
            _c.movement_strategies.wait(game, unit);
        }
    };

    _c.movement_strategies.wait = function (game, unit) {
        _c.log_message_to_user(game, unit.describe() + " stays vigilant and doesn't move", 0);
    };

    _c.movement_strategies.seek = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;

        if (!_c.tile_is_traversable(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        //TODO: Only if in likely range
        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
        if (options.range && (path && path.length > options.range) || !path || (path && path.length == 0)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        path.shift();
        if (path.length <= 1) {
            _c.log_message_to_user(game, unit.describe() + " attacks nearby target: " + target_status.target.describe(), 1);
            _c.entity_attacks_entity(game, unit, target_status.target, _c.log_message_to_user);

        } else if (path.length > 1) {
            //Walk towards the enemy
            x = path[0][0];
            y = path[0][1];
            _c.try_to_move_to_and_draw(game, unit, x, y);
            _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + target_status.target.describe(), 1);
        }
    };

    _c.movement_strategies.head_towards = function (game, unit, location, options) {

        //TODO: Only if in likely range
        var path = _c.path_from_to(game, unit.x, unit.y, location.location.x, location.location.y);

        path.shift();

        if (path.length <= 10) {
            options = {side: 'enemy', filter: 'closest', range: 6, plan: 'invade city', backup_strategy: unit._data.backup_strategy};
            var target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (path.length > 10) {
            //Walk towards the enemy
            var x = path[0][0];
            var y = path[0][1];
            _c.try_to_move_to_and_draw(game, unit, x, y);
            _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + (location.title || location.name), 1);
        } else {

            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
            } else { //wander
                _c.movement_strategies.wander(game, unit, options);
            }
        }


    };

    _c.movement_strategies.avoid = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;
        if (!_c.tile_is_traversable(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit, options);
                return;
            }
        }

        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
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
                var could_move = _c.try_to_move_to_and_draw(game, unit, x, y);
                if (!could_move) {
                    _c.movement_strategies.wander(game, unit);
                }
            }

        } else {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
            }
        }
    };


})(Battlebox);