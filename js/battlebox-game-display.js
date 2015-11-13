(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    //TODO: Pass in a length of rounds before game is over

    _c.add_main_city_population = function(game, population) {
        game.data.buildings[0].population += population;
        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {
                game.cells[x][y].population = 0;
            }
        }
        _c.generate_buildings(game);
        _c.draw_whole_map(game);
        console.log("Pop now at: " + game._private_functions.population_counter(game));
    };

    _c.draw_initial_display = function (game, options) {
        $pointers.canvas_holder = $('#container');

        $pointers.message_display = $('#message_display');

        game.display = new ROT.Display({
            transpose: game.game_options.transpose,
            width: _c.cols(game),
            height: _c.rows(game),
            fontSize: game.game_options.cell_size,
            layout: "hex",
//            fontFamily: "droid sans mono",
            border: game.game_options.cell_border || 0.1,
            spacing: game.game_options.cell_spacing || .88
        });
        var container_canvas = game.display.getContainer();

        $pointers.canvas_holder
            .append(container_canvas);

        $pointers.info_box = $('<div>')
            .appendTo($pointers.canvas_holder);

        //Build the map
        ROT.RNG.setSeed(game.data.rand_seed);
        _c.generate_base_map(game);
        _c.generate_water_layers(game);
        _c.generate_buildings(game);

        //Draw the map
        _c.draw_whole_map(game);

        //Set up units
        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);
        _c.build_units_from_list(game, game.data.forces);
        _c.build_scheduler(game);
        _c.add_screen_scheduler(game);


        $pointers.logs = $("<div>")
            .css({color: 'gray'})
            .appendTo($pointers.message_display);

        game.logMessage(game.log());

        $pointers.play_pause_button = $('<button>')
            .text('Pause')
            .on('click', function () {
                if ($pointers.play_pause_button.text() == 'Pause') {
                    $pointers.play_pause_button.text('Play');
                    _c.stop_game_loop(game);
                } else {
                    $pointers.play_pause_button.text('Pause');
                    _c.start_game_loop(game);
                }
            })
            .appendTo($pointers.canvas_holder);

        $pointers.play_pause_button = $('<button>')
            .text('Add 100 people')
            .on('click', function () {
                _c.add_main_city_population(game,100);
            })
            .appendTo($pointers.canvas_holder);

        $pointers.play_pause_button = $('<button>')
            .text('Add 1000 people')
            .on('click', function () {
                _c.add_main_city_population(game,1000);
            })
            .appendTo($pointers.canvas_holder);


        return container_canvas;
    };

    _c.rows = function (game) {
        return game.game_options.transpose ? game.game_options.cols : game.game_options.rows;
    };
    _c.cols = function (game) {
        return game.game_options.transpose ? game.game_options.rows : game.game_options.cols;
    };

    _c.draw_whole_map = function (game) {
        //Draw every tile
        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {
                _c.draw_tile(game, x, y);
            }
        }
    };

    _c.draw_tile = function (game, x, y, text, color, bg_color) {
        //Cell is used to get color and symbol

        var draw_basic_cell = false;
        if (!color) {
            draw_basic_cell = true;
        }

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
        }
        if (!cell) {
//            console.error('Tried to draw invalid tile:' + x + ":" + y);
            return;
        }

        if (draw_basic_cell) {
            //No information was passed in, assume it's the default cell draw without player in it
            if (cell.type == 'city') {
                bg_color = '#DE8275';
            }
            var num_farms = _c.tile_has(cell, 'farm', true);
            if (_c.tile_has(cell, 'wall')) {
                bg_color = 'black';
                text = "X";
                color = "white";
            } else if (_c.tile_has(cell, 'mine')) {
                bg_color = '#4c362c';
            } else if (_c.tile_has(cell, 'dock')) {
                bg_color = '#86fffc';
                text = '=';
            } else if (num_farms) {
                var farm_darkness = Math.min(.4, num_farms * .03);
                bg_color = net.brehaut.Color('#CCC4B7').darkenByRatio(farm_darkness).toString();
            }

            var was_drawn = false;
            _.each(_c.entities(game), function (entity) {
                if (entity && entity.x == x && entity.y == y && entity._draw) {
                    entity._draw(entity.x, entity.y);
                    was_drawn = true;
                }
            });
            if (was_drawn) return;
        }

        var river_info = _c.tile_has(cell, 'river');
        if (draw_basic_cell && cell.name == 'lake') {
            text = cell.symbol || text;
            if (!bg_color) {
                var depth = cell.data.depth || 1;
                bg_color = net.brehaut.Color(cell.color || '#04e').darkenByRatio(depth * .2);
                //, color:['#06f','#08b','#05e']
            }
        } else if (draw_basic_cell && river_info) {
            text = text ||river_info.symbol;

            //Depth from 1-3 gets more blue
            if (!bg_color) {
                var depth = river_info.depth || 1;
                bg_color = net.brehaut.Color('#03f').darkenByRatio(depth * .2);
                //, color:['#06f','#08b','#05e']
            }
        }

        var population_darken_amount = 0;
        if (cell.population) {
            color = Helpers.blendColors('black', 'red', cell.population/300);
            if (cell.population > 1000) {
                color = 'orange';
                text = '█';
                population_darken_amount = .6;
            } else if (cell.population > 500) {
                color = 'orange';
                text = '▓';
                population_darken_amount = .5;
            } else if (cell.population > 300) {
                text = '▓';
                population_darken_amount = .4;
            } else if (cell.population > 150) {
                text = '▄';
                population_darken_amount = .3;
            } else if (cell.population > 50) {
                text = '▒';
                population_darken_amount = .2;
            } else if (cell.population > 10) {
                text = '░';
                population_darken_amount = .1;
            }
        }

        if (text === undefined) {
            text = cell ? cell.symbol || " " : " "
        }
        var bg = bg_color;
        if (!bg) {
            if (cell) {
                bg = cell.color || '#000';
            } else if (text == " ") {
                bg = ["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"].random();
            } else {
                bg = "#000";
            }
        }

        if (!color && _c.tile_has(cell, 'unit corpse')) {
            text = "x";
        }


        var bridge = false, gate=false;
        var path_info = _c.tile_has(cell, 'path');
        if (draw_basic_cell && path_info) {
            text = path_info.symbol || "";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('#A2BB9B'), .7).toString();
            if (_c.tile_has(cell, 'river') || (cell.data && cell.data.water)) bridge = true;
            if (_c.tile_has(cell, 'wall') || _c.tile_has(cell, 'tower')) gate = true;
        }
        var road_info = _c.tile_has(cell, 'road');
        if (draw_basic_cell && road_info) {
            text = road_info.symbol || ":";

            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('#DF8274'), .8).toString();
            color = "#000";
            if (_c.tile_has(cell, 'river') || (cell.data && cell.data.water)) bridge = true;
            if (_c.tile_has(cell, 'wall') || _c.tile_has(cell, 'tower')) gate = true;
        }

        if (draw_basic_cell && _c.tile_has(cell, 'storage')) {
            text = "o";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('yellow'), .1).toString();
        }
        if (draw_basic_cell && _c.tile_has(cell, 'looted')) {
            text = ".";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('black'), .8).toString();
        }
        if (draw_basic_cell && _c.tile_has(cell, 'pillaged')) {
            text = "'";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('red'), .8).toString();
        }
        if (_c.tile_has(cell, 'looted') && _c.tile_has(cell, 'pillaged')) {
            text = ";";
        }
        if (bridge) {
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('brown'), .8).toString();
            text = "=";
            color = "#fff";
        }
        if (gate) {
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('black'), .8).toString();
            text = "O";
            color = "#fff";
        }
        if (_c.tile_has(cell, 'tower')) {
            text = "╠╣";
        }
        if (_c.tile_has(cell, 'river') && _c.tile_has(cell, 'wall')) {
            text = "{}";
        }

        if (population_darken_amount) {
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('brown'), population_darken_amount).toString();
        }

        _.each(game.game_options.hex_drawing_callbacks, function (callback) {
            var results = callback(game, cell, text, color, bg);
            if (results) {
                text = results.text || text;
                color = results.color || color;
                bg = results.bg || bg;
            }
        });

        //First draw it black, then redraw it with the chosen color to help get edges proper color
        game.display.draw(x, y, text, color || "#000", bg);
    };

    _c.log_display = function (game) {
        if (!$pointers.logs) {
            $pointers.logs = $("#logs");
        }

        if ($pointers.logs) {
            var log = "<b>Battlebox: [seed:" + game.game_options.rand_seed + "]</b>";

            var head_log = _.last(game.timing_log, 5);
            _.each(head_log.reverse(), function (log_item) {
                if (log_item.name == 'exception') {
                    if (log_item.ex && log_item.ex.name) {
                        log += "<br/> -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                    } else if (log_item.msg) {
                        log += "<br/> -- EXCEPTION: " + log_item.msg;
                    } else {
                        log += "<br/> -- EXCEPTION";
                    }
                } else if (log_item.elapsed) {
                    log += "<br/> - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
                } else {
                    log += "<br/> - " + log_item.name;
                }
            });
            $pointers.logs.html(log);
        } else {
            console.log("NOTE: No Log div to write to.")
        }
    };

    var highlighted_hex = null;
    _c.highlight_position = function (game, location) {
        if (highlighted_hex && highlighted_hex.length == 2) {
            _c.draw_tile(game, highlighted_hex[0], highlighted_hex[1]);
        }

        if (location.length == 2) {
            highlighted_hex = location;
            _c.draw_tile(game, location[0], location[1], undefined, undefined, 'orange');
        } else {
            highlighted_hex = null;
        }

    };

    _c.log_message_to_user = function (game, message, importance, color) {
        if (importance < (game.game_options.log_level_to_show || 2)) return;

        var $msg = $('<div>')
            .html(message)
            .prependTo($pointers.message_display);

        if (importance == 4) {
            $msg.css({backgroundColor: color || 'red', color: 'black', border: '4px solid gold', fontSize: '1.3em'});
        }
        if (importance == 3) {
            $msg.css({backgroundColor: color || 'orange', color: 'black'});
        }
        if (importance == 2) {
            $msg.css({color: 'red'});
        }
        if (importance == 1) {
            $msg.css({color: 'orange'});
        }
    };


    _c.show_info = function (info) {
        var out;
        if (_.isString(info)) {
            out = info;
        } else {
            out = JSON.stringify(info);
        }
        $pointers.info_box
            .html(out);
    }

})(Battlebox);