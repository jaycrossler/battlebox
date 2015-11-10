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

    _c.initialize_ui_display = function (game) {
        var canvas = _c.draw_initial_display(game, {});

        canvas.addEventListener("mousemove", function (ev) {
            var loc = game.display.eventToPosition(ev);
            _c.highlight_position(game, loc);

            _c.show_info(_c.tile_info(game, loc[0], loc[1]));
        });
    };

    _c.update_ui_display = function (game) {


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

    _c.build_scheduler = function (game) {
        var scheduler = new ROT.Scheduler.Speed();
        _.each(_c.entities(game), function (entity) {
            scheduler.add(entity, true);
        });
        game.scheduler = scheduler;
        game.engine = new ROT.Engine(scheduler);
    };

    _c.entities = function (game) {
        var entities = [];
        for (var i = 0; i < game.entities.length; i++) {
            if (game.entities[i]) {
                entities.push(game.entities[i]);
            }
        }
        return entities;
    };


    _c.game_over = function (game, side_wins) {
        game.engine.lock();
        if (!side_wins) {
            //TODO: Find the winning side based on amount of city destroyed and number of troops
            side_wins = "No one";
        }

        var msg = "Game Over!  " + side_wins + ' wins!';

        msg+= " ("+ game.data.tick_count + " rounds)";

        //Find ending loot retrieved via living armies
        var loot = {};
        _.each(game.entities, function(unit){
            if (unit && unit._data && unit._data.player) {
                if (unit.loot) {
                    for (var key in unit.loot) {
                        loot[key] = loot[key] || 0;
                        loot[key] += unit.loot[key];
                    }
                }
            }
        });
        var loot_msg = [];
        for (var key in loot) {
            loot_msg.push(loot[key] + " " + Helpers.pluralize(key))
        }


        //Calculate % of cities left
        var city_msg = [];
        var tiles_total = 0;
        var tiles_ruined = 0;
        _.each(game.data.buildings, function(city){
            if (city.type == 'city') {
                _.each(city.tiles || [], function (tile) {
                    tiles_total++;
                    if (_c.tile_has(tile, 'pillaged') || _c.tile_has(tile, 'looted')) {
                        tiles_ruined++;
                    }
                });
                var pct = Math.round((tiles_ruined/tiles_total) * 100);
                var msg_c = pct+"% of "+(city.title || city.name) +" destroyed";
                city_msg.push(msg_c);
            }
        });

        if (city_msg.length) {
            msg += "<hr/><b>Cities:</b><br/> " + city_msg.join("<br/>");
        }
        if (loot_msg.length) {
            msg += "<hr/><b>Loot:</b><br/>" + loot_msg.join("<br/>");
        }

        _c.log_message_to_user(game, msg, 4, (side_wins == "No one" ? 'gray' : side_wins));

        if (game.game_options.game_over_function) {
            game.game_options.game_over_function(game);
        }
    }


})(Battlebox);