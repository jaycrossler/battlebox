(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    _c.draw_initial_display = function (game, options) {
        $pointers.canvas_holder = $('#container')
            .css({width:'1567px'})
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

        _c.generate_battle_map(game);

        _c.draw_whole_map(game);

        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);
        _c.build_units_from_list(game, game.data.forces);

        _c.build_scheduler(game);

        _c.add_screen_scheduler(game);

        $pointers.logs = $("<div>")
            .css({color:'gray'})
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

        return container_canvas;
    };

    _c.rows = function (game) {
        return game.game_options.transpose ? game.game_options.cols: game.game_options.rows;
    };
    _c.cols = function (game) {
        return game.game_options.transpose ? game.game_options.rows: game.game_options.cols;
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
        //TODO: Draw complex cells based on composition

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
        }

        if (!color) {
            //No information was passed in, assume it's the default cell draw without player in it
            var was_drawn = false;
            _.each(_c.entities(game), function (entity) {
                if (entity && entity._x == x && entity._y == y && entity._draw) {
                    entity._draw(entity._x, entity._y);
                    was_drawn = true;
                }
            });
            if (was_drawn) return;
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
        var $msg = $('<div>')
            .html(message)
            .prependTo($pointers.message_display);

        if (importance == 4) {
            $msg.css({backgroundColor:color || 'red', color:'black', border:'1px solid white'});
        }
        if (importance == 3) {
            $msg.css({backgroundColor:color || 'orange', color:'black'});
        }
        if (importance == 2) {
            $msg.css({color:'red'});
        }
        if (importance == 1) {
            $msg.css({color:'orange'});
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