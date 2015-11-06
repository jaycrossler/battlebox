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

        _c.build_scheduler(game);
    };

    _c.drawWholeMap = function (game) {
        //Make everything black
        for (var i = 0; i < game.game_options.cols; i++) {
            for (var j = 0; j < game.game_options.rows; j++) {
                _c.draw_tile(game, i, j, " ", "#000", "#000");
            }
        }

        //Have open cells be colored
        for (var key in game.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);

            _c.draw_tile(game, x, y, game.map[key]);
        }
    };

    _c.draw_tile = function(game, x, y, text, color, bg_color) {
        var bg = "#fff";
        if (text === undefined) {
            text = game.map[x + "," + y] || " ";
        }

        if (text == " ") {
            bg = ["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"].random();
        }
        game.display.draw(x, y, text, color || "#000", bg_color || bg);
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