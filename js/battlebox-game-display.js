(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    _c.add_main_city_population = function (game, population) {
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

    _c.initialize_ui_display = function (game) {
        var canvas = _c.draw_initial_display(game, {});

        canvas.addEventListener("mousemove", function (ev) {
            var loc = game.display.eventToPosition(ev);
            _c.highlight_position(game, loc);
            _c.show_info(game, loc);
        });
    };

    _c.update_ui_display = function (game) {
        $pointers.turn_counter.text("Turn: " + game.data.tick_count);
    };

    _c.draw_initial_display = function (game, options) {
        $pointers.canvas_holder = $('#container');

        $pointers.message_display = $('#message_display')
            .appendTo($pointers.canvas_holder);

        game.data.initial_display_functions_run = false;


        //Initialize some avatar settings to not show decorations/names over face and not use content packs
        _.each(Avatar.getRaces(), function (race_name, i) {
            //Pull a pointer to the current avatar template for that race
            var AvatarRace = new Avatar('get_linked_template', race_name);
            //Remove any existing decorations
            AvatarRace.rendering_order = _.filter(AvatarRace.rendering_order, function (dec) {
                return !dec.decoration
            });
            AvatarRace.use_content_packs = [];
        });

        game.display = new ROT.Display({
            transpose: game.game_options.transpose,
            width: _c.cols(game),
            height: _c.rows(game),
            fontSize: game.game_options.cell_size,
            layout: "hex",
//            fontFamily: "droid sans mono",
            border: (game.game_options.cell_border !== undefined) ? game.game_options.cell_border : null,
            spacing: game.game_options.cell_spacing || .88
        });
        var container_canvas = game.display.getContainer();

        $pointers.canvas_holder
            .append(container_canvas);


        $pointers.info_box = $('<div>')
            .appendTo($pointers.canvas_holder);

        var $unit_list = $('#unit_list')
            .appendTo($pointers.canvas_holder);
        $pointers.unit_holder = $('<div>')
            .appendTo($unit_list);
        $pointers.unit_dead_holder = $('#unit_dead_list');
        //.appendTo($unit_list);
        $pointers.unit_dead_holder_title = $("<div>")
            .text("Dead Units:")
            .hide()
            .appendTo($pointers.unit_dead_holder);


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

        _.each([2000, 1000, 500, 200, 50], function (speed, i) {
            $('<button>')
                .text(_.str.repeat('>', (i + 1)))
                .on('click', function () {
                    game.game_options.delay_between_ticks = speed;
                })
                .appendTo($pointers.canvas_holder);
        });


        $('<button>')
            .text('Add 100 people')
            .on('click', function () {
                _c.add_main_city_population(game, 100);
            })
            .appendTo($pointers.canvas_holder);

        $('<button>')
            .text('Add 1000 people')
            .on('click', function () {
                _c.add_main_city_population(game, 1000);
            })
            .appendTo($pointers.canvas_holder);

        $pointers.turn_counter = $('<span>')
            .text('Turn: 0')
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

    _c.draw_tile = function (game, x, y, text, color, bg_color, draw_callback) {
        //Cell is used to get color and symbol

        var draw_basic_cell = false;
        if (!color && !bg_color) {
            draw_basic_cell = true;
        }

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
        }
        if (!cell) {
            //console.error('Tried to draw invalid tile:' + x + ":" + y);
            return;
        }

        if (!draw_basic_cell) {
            bg = bg_color;
        } else {
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

            var river_info = _c.tile_has(cell, 'river');
            if (cell.name == 'lake' || cell.name == 'sea') {
                text = cell.symbol || text;
                if (!bg_color) {
                    var depth = cell.data.depth || 1;
                    bg_color = net.brehaut.Color(cell.color || '#04e').darkenByRatio(depth * .2);
                    //, color:['#06f','#08b','#05e']
                }
            } else if (river_info) {
                text = text || river_info.symbol;

                //Depth from 1-3 gets more blue
                if (!bg_color) {
                    var depth = river_info.depth || 1;
                    bg_color = net.brehaut.Color('#03f').darkenByRatio(depth * .2);
                    //, color:['#06f','#08b','#05e']
                }
            }

            var population_darken_amount = 0;
            if (cell.population) {
                color = Helpers.blendColors('black', 'gray', cell.population / 300);
                if (cell.population > 1000) {
                    color = 'black';
                    text = '█';
                    population_darken_amount = .6;
                } else if (cell.population > 500) {
                    color = 'gray';
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


            var bridge = false, gate = false;
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
            if (bg.toString) bg = bg.toString();
        }
        color = color || "#000";

        _.each(game.game_options.hex_drawing_callbacks, function (callback) {
            var results = callback(game, cell, text, color, bg);
            if (results) {
                text = results.text || text;
                color = results.color || color;
                bg = results.bg || bg;
            }
        });

        //First draw it black, then redraw it with the chosen color to help get edges proper color
        if (draw_callback) {
            draw_callback(x, y, text, color, bg);
        } else {
            game.display.draw(x, y, text, color, bg);
        }
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

    _c.game_over_loot_report = function (game) {
        var msg = "";

        var side_wins = game.data.game_over_winner;

        //Find ending loot retrieved via living armies
        var loot = {};
        _.each(game.entities, function (unit) {
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
            loot_msg.push(Helpers.abbreviateNumber(loot[key]) + " " + Helpers.pluralize(key))
        }


        //Calculate % of cities left
        var city_msg = [];
        var tiles_total = 0;
        var tiles_ruined = 0;
        var population_displaced = 0;

        _.each(game.data.buildings, function (city) {
            if (city.type == 'city' || city.type == 'city2') {
                _.each(city.tiles || [], function (tile) {
                    tiles_total++;

                    var tile_orig = game.cells[tile.x][tile.y]
                    if (_c.tile_has(tile_orig, 'pillaged') || _c.tile_has(tile_orig, 'looted')) {
                        tiles_ruined++;
                        population_displaced += tile_orig.population;
                    }
                });
                var pct = Math.round((tiles_ruined / tiles_total) * 100);
                var msg_c = pct + "% of " + (city.title || city.name) + " destroyed, ";
                msg_c += Helpers.abbreviateNumber(population_displaced) + " population displaced";
                city_msg.push(msg_c);
            }
        });

        if (city_msg.length) {
            msg += "<b>Cities:</b><br/> " + city_msg.join("<br/>");
        }
        if (loot_msg.length) {
            msg += "<hr/><b>Surviving invaders looted:</b><br/>" + loot_msg.join(", ");
        }
        _c.log_message_to_user(game, msg, 4, (side_wins == "No one" ? 'gray' : side_wins));
    };

    _c.game_over = function (game, side_wins) {
        //Tell timekeeper to end game in 50
        var delay_to_pillage = game.game_options.delay_to_pillage || 50;
        game.data.game_over_at_tick = game.data.tick_count + delay_to_pillage;
        game.data.game_over_winner = side_wins;

        if (!side_wins) {
            //TODO: Find the winning side based on amount of city destroyed and number of troops
            side_wins = "No one";
        }

        var msg = "Game Over!  " + side_wins + ' wins by defeating all enemies!';

        msg += " (" + game.data.tick_count + " rounds)";
        msg += "<br/><i>" + delay_to_pillage + " more rounds to gather final pillage</i>";

        _c.log_message_to_user(game, msg, 4, (side_wins == "No one" ? 'gray' : side_wins));

        if (side_wins == "No one") {
            game.engine.lock();
        }

        if (game.game_options.game_over_function) {
            game.game_options.game_over_function(game);
        }
    };

    _c.show_info = function (game, loc) {
        var x = loc[0];
        var y = loc[1];

        var info = {};

        var cell = _c.tile(game, x, y);
        if (cell) {
            info = _.clone(cell);
        } else {
            return;
        }

        var title = JSON.stringify(info);
        $pointers.info_box.empty();

        $("<span>")
            .addClass('tile_info')
            .text("X: " + x + " Y:" + y)
            .appendTo($pointers.info_box);


        var $tile = $("<span>")
            .addClass('tile_info')
            .text(_.str.titleize(info.name))
            .attr('title', title)
            .appendTo($pointers.info_box);
        //TODO: On click of canvas, lock title info of cell for a while

        var additions = [];
        var has_farms = _c.tile_has(cell, 'farm', true);
        var has_river = _c.tile_has(cell, 'river');
        var has_roads = _c.tile_has(cell, 'road', true);
        var has_dock = _c.tile_has(cell, 'dock');
        var has_walls = _c.tile_has(cell, 'wall', true);
        var has_towers = _c.tile_has(cell, 'tower', true);
        var is_pillaged = _c.tile_has(cell, 'pillaged');
        var is_looted = _c.tile_has(cell, 'looted');
        var has_loot = _.isObject(cell.loot);
        var has_people = Math.round(cell.population);
        var has_food = Math.round(cell.food);

        if (has_river) additions.push("River");
        if (has_farms) additions.push("Farms:" + has_farms);
        if (has_dock) additions.push("Dock");
        if (has_walls) additions.push("Walls:" + has_walls);
        if (has_towers) additions.push("Towers" + has_towers);
        if (has_roads) additions.push("Road");
        if (has_loot) additions.push("Loot");
        if (has_people) additions.push("People: " + has_people);
        if (has_food) additions.push("Food: " + has_food);
        if (is_pillaged) additions.push("Pillaged");
        if (is_looted) additions.push("Looted");


        if (cell.data && cell.data.depth) additions.push("Depth: " + cell.data.depth);

        function draw_callback(x, y, text, color, bg) {
            var text_add = _.str.titleize(info.name);
            if (additions.length) {
                text_add += ", " + additions.join(", ");
            }
            if (text) {
                text_add += " [" + text + "]";
            }

            var new_color = bg ? Helpers.bw(bg) : null;
            if (new_color == 'rgb(255,255,255)') {
                color = new_color;
            }

            $tile
                .css({backgroundColor: bg, color: color})
                .text(text_add);
        }

        _c.draw_tile(game, x, y, null, null, null, draw_callback);


        _.each(_c.entities(game), function (entity, id) {
            if (entity.x == x && entity.y == y && entity._draw) {
                var color = entity._data.side;
                var name = entity._data.title || entity._data.name || "Unit";
                name += " [" + (entity._symbol || "@") + "]"
                $("<span>")
                    .addClass('tile_unit_info')
                    .css({backgroundColor: color})
                    .text(name)
                    .appendTo($pointers.info_box);

                entity.$trump.css({borderWidth: '3px'});
            } else {
                entity.$trump.css({borderWidth: '1px'});

            }
        });
    };


    //This function runs on first clock tick so as to add a bit of delay
    _c.initial_display_functions = function (game) {

        _.each(Avatar.getRaces(), function (race_name, i) {
            //Pull a pointer to the current avatar template for that race
            var AvatarRace = new Avatar('get_linked_template', race_name);
            //Remove any existing decorations
            AvatarRace.rendering_order = _.filter(AvatarRace.rendering_order, function (dec) {
                return !dec.decoration
            });
            AvatarRace.use_content_packs = [];
        });


        //Draw each avatar in turn
        if (game.entities && game.entities.length) {
            var make_avatar_callback = function (entity_id) {

                var unit = game.entities[entity_id];
                if (unit && unit.forces && unit.leader_face_options && unit.$trump_leader_canvas) {

                    var canvas = unit.$trump_leader_canvas[0];

                    var face_options = unit.leader_face_options;
                    face_options.callback_after_building = function () {
                        setTimeout(function () {
                            var next_entity = entity_id += 1;
                            make_avatar_callback(next_entity);
                        }, 1);
                    };

                    unit.avatar = new Avatar(face_options, {$canvas: unit.$trump_leader_canvas}, canvas);

                }
            };
            make_avatar_callback(0);
        }

    };

    _c.add_unit_ui_to_main_ui = function (game, unit) {
        var unit_name = _.str.titleize(unit._data.title || unit._data.name);

        unit.$trump_holder = $('<div>')
            .css({display: 'inline-block'})
            .addClass('unit_trump_holder')
            .css({backgroundColor: unit._data.side})
            .appendTo($pointers.unit_holder);

        unit.$trump = $('<div>')
            .text(unit_name)
            .addClass('unit_trump')
            .appendTo(unit.$trump_holder);

        //Build the leader face
        var name, width, height, face_options, class_type;
        if (unit._data.leader) {
            name = unit._data.leader.name || 'Leader';
            class_type = 'unit_leader_trump';
            face_options = unit._data.leader.face_options;
        } else {
            name = 'Unit';
            class_type = 'unit_troops_trump';
            face_options = unit._data.face_options || {};
        }

        unit.$trump_leader = $('<div>')
            .attr('title', name)
            .addClass(class_type)
            .appendTo(unit.$trump_holder);

        width = unit.$trump_leader.width();
        height = unit.$trump_leader.height();
        unit.$trump_leader_canvas = $("<canvas>")
            .attr({width: width, height: height, id: 'avatar_leader_' + unit._id})
            .css({width: width, height: height})
            .appendTo(unit.$trump_leader);

        //Merge in any side_data face_options with leader-specific ones
        var side_data = _.find(game.game_options.sides, function (tt) {
                return (tt.side == unit._data.side);
            }) || {};

        unit.leader_face_options = $.extend({}, side_data.face_options || {}, face_options);
        if (!unit.leader_face_options.rand_seed) {
            var seed = game.getSeed();
            if (seed && seed.rand_seed) {
                unit.leader_face_options.rand_seed = parseInt(game.getSeed().rand_seed) + unit._id;
            }
        }

    };

    _c.update_unit_ui = function (game, unit) {
        var unit_name = _.str.titleize(unit._data.title || unit._data.name);
        var text = "<b>" + unit_name + "</b><hr/>";
        text += unit.strategy + "<hr/>";

        if (unit.is_dead) {
            text += "<span style='color:red'>Dead on " + battlebox.data.tick_count + "</span><br/>";
        }
        //text += "At: " + unit.x + ", " + unit.y + " <br/>";
        text += "Fatigue: " + Math.round(unit.fatigue) + "<br/>";

        //Show troop data
        var unit_count = 0;
        _.each(unit._data.troops, function (force) {
            var force_now = _.find(unit.forces, function (f) {
                    return f.name == force.name
                }) || {};
            var count = force_now.count || 0;
            unit_count += count;
            var orig = force.count;
            var name = _.str.titleize(Helpers.pluralize(force.title || force.name));
            if (orig && (count < orig)) {
                count = "<span style='color:red'>" + count + "</span>/" + orig;
            }
            text += "<li>" + count + " " + name + "</li>";
        });


        if (unit_count) {
            var fight_text = [];
            if (unit.fights_won) {
                fight_text.push(unit.fights_won + (unit.fights_won > 1 ? " wins" : " win"));
            }
            if (unit.fights_lost) {
                fight_text.push(unit.fights_lost + (unit.fights_lost > 1 ? " losses" : " loss"));
            }
            if (fight_text.length) {
                text += fight_text.join(", ") + ", ";
            }

            var food = Math.round(unit.loot ? unit.loot.food || 0 : 0);
            text += "<span style='color:" + ((food < unit_count * .1) ? "red" : "green") + "'>Food: " + food + "</span><br/>";
        }

        if (unit.protected_by_walls) {
            text += "<b style='color:green'>Protected by wall</b><br/>";
        }
        if (unit.in_towers) {
            text += "<b style='color:green'>In tower</b><br/>";
        }

        var loot_arr = [];
        for (var key in unit.loot) {
            if (key != 'food' && unit.loot[key]) {
                var msg = Math.round(unit.loot[key]) + ' ' + Helpers.pluralize(key, Math.round(unit.loot[key]));
                loot_arr.push (msg);
            }
        }
        if (unit.loot && loot_arr.length == 0 && unit.is_dead) {
            text += "<b>Loot Dropped on death</b>";
        } else if (loot_arr.length) {
            text += "<b>Loot [" + unit.can_carry(true) + "]: " + loot_arr.join(", ") + "</b>";
        }

        unit.$trump
            .html(text);

        if (unit.is_dead) {
            if (unit.$trump_holder.parent() != $pointers.unit_dead_holder) {
                $pointers.unit_dead_holder_title.show();
                unit.$trump_holder
                    .appendTo($pointers.unit_dead_holder);
                unit.$trump
                    .css({backgroundColor: 'lightgray', color: 'red'});
                if (unit.$trump_leader) {
                    unit.$trump_leader.hide();
                }
            }
        }
    };


})(Battlebox);