(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    _c.draw_initial_display = function(game, options) {
        $pointers.canvas_holder = $('#container');

        game.display = new ROT.Display({
//            transpose: true,
            width: game.game_options.cols,
            height: game.game_options.rows,
            fontSize: game.game_options.cell_size,
            layout: "hex"});
        var container_canvas = game.display.getContainer();

        $pointers.canvas_holder
            .append(container_canvas);

        _c.generate_battle_map(game);

        _c.drawWholeMap(game);

        _c.build_units_from_list(game, game.data.forces);

        _c.build_scheduler(game);
    };

    _c.drawWholeMap = function (game) {
        //Draw every tile
        for (var y = 0; y < game.game_options.rows; y++) {
            for (var x = y%2; x < game.game_options.cols; x+=2) {
                _c.draw_tile(game, x, y);
            }
        }
    };

    _c.draw_tile = function(game, x, y, text, color, bg_color) {
        var cell = game.cells[x][y];
        if (text === undefined) {
            text = cell.symbol || " ";
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


})(Battlebox);