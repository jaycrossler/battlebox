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
        _c.draw_initial_display(game, {});
    };

    _c.redraw_data = function (game) {


    };

    _c.start_game_loop = function (game) {
        game.engine.start();
    };

    _c.stop_game_loop = function (game) {

    };

    _c.generate_battle_map = function (game) {
        var map;
        if (game.data.terrain_options) {
            var ground = _.find(game.data.terrain_options, function (layer) {
                return layer.ground
            }) || {name: 'plains', layer: 'ground'};

            if (ground.name == 'plains') {
                map = new ROT.Map.Cellular(game.game_options.cols, game.game_options.rows, {
                    //connected: true,
                    topology: 6,
                    born: [5, 6, 7],
                    survive: [3, 4, 5]
                });

                //        map.randomize(0.5);

                // initialize with irregularly random values with less in middle
                for (var i = 0; i < game.game_options.cols; i++) {
                    for (var j = 0; j < game.game_options.rows; j++) {
                        var dx = i / game.game_options.cols - 0.5;
                        var dy = j / game.game_options.rows - 0.5;
                        var dist = Math.pow(dx * dx + dy * dy, 0.3);
                        if (ROT.RNG.getUniform() < dist) {
                            map.set(i, j, 1);
                        }
                    }
                }

                // generate four iterations, show the last one
                var iterations = ground.smoothness || 3;
                for (var i = iterations-1; i >= 0; i--) {
                    map.create(i ? null : game.display.DEBUG);
                }

            } else if (ground.name == 'digger') {
                map = new ROT.Map.Digger(game.game_options.cols, game.game_options.rows);
            }
        }


        //For all cells not matched, add to a list
        var freeCells = [];
        var digCallback = function (x, y, value) {
            if (value) {
                return;
            }
            /* do not store walls */

            var key = x + "," + y;
            freeCells.push(key);
            game.map[key] = " ";
        };
        map.create(digCallback.bind(game));

        game.open_space = freeCells;
//        this._generateBoxes(game.open_space);

        _c.drawWholeMap(game);

        _c.build_units_from_list(game, game.data.forces);

    };

    _c.build_scheduler = function(game) {
        var scheduler = new ROT.Scheduler.Simple();
        _.each(game.entities, function(entity){
            scheduler.add(entity, true);
        });
        game.engine = new ROT.Engine(scheduler);

    };



})(Battlebox);