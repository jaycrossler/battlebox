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

    _c.find_unit_status = function (game, current_unit, options) {

        var targets = _c.entities(game);

        if (options.location) {
            targets = _.filter(targets, function (t) {
                return (t._x == options.location.x && t._y == options.location.y);
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
                    var path_a = _c.path_from_to(game, current_unit._x, current_unit._y, a._x, a._y);
                    var path_b = _c.path_from_to(game, current_unit._x, current_unit._y, b._x, b._y);
                    var a_len = path_a ? path_a.length : 100;
                    var b_len = path_b ? path_b.length : 100;

                    return a_len > b_len;
                });
            }
        }

        var target, range, closest_path, x, y;
        if (options.return_multiple) {
            if (targets.length) {
                closest_path = _c.path_from_to(game, current_unit._x, current_unit._y, targets[0]._x, targets[0]._y);
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
            target = targets[0] || _c.entities(game)[0];
            closest_path = _c.path_from_to(game, current_unit._x, current_unit._y, target._x, target._y);
            range = closest_path.length || 0;

            if (target.getX) x = target.getX();
            if (target.getY) y = target.getY();
        }

        return {target: target, x: x, y: y, range: range};
    };

    _c.is_valid_location = function (game, x, y, move_through_impassibles) {
        var valid_num = (x >= 0) && (y >= 0) && (x < _c.cols(game)) && (y < _c.rows(game));
        if (valid_num) {
            var cell = game.cells[x];
            if (cell !== undefined && cell[y] !== undefined) {
                cell = cell[y];
                if (!move_through_impassibles && cell.impassible) {
                    valid_num = false;
                }
            } else {
                valid_num = false;
            }

        }
        return valid_num
    };

    _c.movement_strategies = _c.movement_strategies || {};

    _c.movement_strategies.wander = function (game, unit) {
        var code = Helpers.randOption([0, 1, 2, 3, 4, 5]);
        var dir = ROT.DIRS[6][code];
        var y = unit._y + dir[1];
        var x = unit._x + dir[0];

        _c.try_to_move_to_and_draw(game, unit, x, y);
    };

    _c.movement_strategies.seek = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;
        if (!_c.is_valid_location(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        //TODO: Only if in likely range
        var path = _c.path_from_to(game, unit._x, unit._y, x, y);

        //If too far, then just wander
        if (options.range && path && path.length > options.range) {
            if (options.backup_strategy == 'vigilant') {
                return;
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        path.shift();
        if (path.length <= 1) {
            _c.entity_attacks_entity(game, unit, target_status.target, _c.log_message_to_user);

        } else if (path.length > 1) {
            //Walk towards the enemy
            x = path[0][0];
            y = path[0][1];
            _c.try_to_move_to_and_draw(game, unit, x, y);
        }
    };

    _c.movement_strategies.avoid = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;
        if (!_c.is_valid_location(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit, options);
                return;
            }
        }

        var path = _c.path_from_to(game, unit._x, unit._y, x, y);

        //If too far, then just wander
        if (options.range && path && path.length <= options.range) {
            path.shift();
            if (path.length > 0) {

                //Walk away from the enemy
                x = path[0][0];
                y = path[0][1];

                x = unit._x - x;
                y = unit._y - y;

                x = unit._x + x;
                y = unit._y + y;

                //TODO: Pick alternate paths if can't move any more
                var could_move = _c.try_to_move_to_and_draw(game, unit, x, y);
                if (!could_move) {
                    _c.movement_strategies.wander(game, unit);
                }

            }

        } else {
            if (options.backup_strategy == 'vigilant') {
                return;
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }
    };


})(Battlebox);