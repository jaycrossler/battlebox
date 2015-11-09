(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    _c.initialize_data = function (game, data) {
        game.data = game.data || {};

        var arrays_to_data_objects = game.game_options.arrays_to_map_to_objects || [];
        _.each(arrays_to_data_objects, function (game_options_name) {
            //Add objects for each game_objects array to the game data
            game.data[game_options_name] = game.data[game_options_name] || {};
            _.each(game.game_options[game_options_name], function (item) {
                game.data[game_options_name][item.name] = game.data[game_options_name][item.name] || item.initial || 0;
            });
        });

        var arrays_to_array_objects = game.game_options.arrays_to_map_to_arrays || [];
        _.each(arrays_to_array_objects, function (game_options_name) {
            //Add an array for game_objects to the game data
            if (game.data[game_options_name] !== undefined) {
                //Already exists, don't add it
            } else {
                game.data[game_options_name] = game.data[game_options_name] || [];
                _.each(game.game_options[game_options_name], function (item) {
                    game.data[game_options_name].push(JSON.parse(JSON.stringify(item)));
                });
            }
        });

        game.data.rand_seed = game.data.rand_seed || game.game_options.rand_seed;
        game.data.fight_seed = game.data.fight_seed || game.game_options.fight_seed || game.data.rand_seed;
        game.data.tick_count = game.data.tick_count || 0;
    };
    _c.info = function (game, kind, name, sub_var, if_not_listed) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        var val = _.find(game.game_options[kind], function (item) {
            return item.name == name
        });
        if (val && sub_var) {
            val = val[sub_var];
        }
        if (!val) val = if_not_listed;

        return val;
    };
    _c.variable = function (game, var_name, set_to) {
        if (set_to === undefined) {
            return game.data.variables[var_name];
        } else {
            game.data.variables[var_name] = set_to;
        }
    };

    _c.initialize_display = function (game) {
        var canvas = _c.draw_initial_display(game, {});

        canvas.addEventListener("mousemove", function(ev){
            var loc = game.display.eventToPosition(ev);
            _c.highlight_position(game, loc);

            _c.show_info(_c.tile_info(game, loc[0], loc[1]));
        });
    };

    _c.redraw_data = function (game) {


    };

    _c.start_game_loop = function (game) {
        game.logMessage("Starting game loop");
        game.data.in_progress = true;
        game.engine.start();
    };

    _c.stop_game_loop = function (game) {
        game.logMessage("Stopping game loop");
        game.data.in_progress = false;
    };

    _c.build_scheduler = function(game) {
        var scheduler = new ROT.Scheduler.Speed();
        _.each(_c.entities(game), function(entity){
            scheduler.add(entity, true);
        });
        game.scheduler = scheduler;
        game.engine = new ROT.Engine(scheduler);
    };

    _c.entities = function(game) {
        var entities = [];
        for (var i=0; i<game.entities.length; i++) {
            if (game.entities[i]) {
                entities.push(game.entities[i]);
            }
        }
        return entities;
    };



    _c.game_over = function(game, side_wins) {
        game.engine.lock();
        _c.log_message_to_user(game, "Game Over!  " + side_wins + ' wins!', 4, side_wins);
    }


})(Battlebox);