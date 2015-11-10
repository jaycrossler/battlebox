(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    //TODO: Have difficulty of travel tied to color

    _c.tile = function (game, x, y) {
        var cell;
        if (y === undefined) {
            //Assume that x is an array
            cell = game.cells[x[0]];
            if (cell) cell = cell[x[1]];
        } else {
            cell = game.cells[x];
            if (cell) cell = cell[y];
        }
        return cell;
    };
    _c.tile_info = function (game, x, y) {
        var info = {};

        var cell = _c.tile(game, x, y);
        if (cell) {
            info = _.clone(cell);
        }

        _.each(_c.entities(game), function (entity, id) {
            if (entity._x == x && entity._y == y && entity._draw) {
                info.forces = info.forces || [];
                info.forces.push({id: id, data: entity._data});
            }
        });
        return info;
    };

    _c.surrounding_tiles = function (game, x, y) {
        var cells = [];

        var cell = _c.tile(game, x, y);
        if (!cell) {
            return cells;
        }
        _.each(ROT.DIRS[6], function (mods) {
            var new_x = x + mods[0];
            var new_y = y + mods[1];
            var new_cell = _c.tile(game, new_x, new_y);
            if (new_cell) {
                if (new_cell) cells.push(new_cell);
            }
        });

        return cells;
    };

    _c.tile_is_traversable = function (game, x, y, move_through_impassibles, only_impassible) {
        var valid_num = (x >= 0) && (y >= 0) && (x < _c.cols(game)) && (y < _c.rows(game));
        if (valid_num) {
            var cell = _c.tile(game, x, y);
            if (cell) {
                if (!move_through_impassibles && cell.impassible) {
                    valid_num = false;
                }
                if (only_impassible && cell.impassible) {
                    valid_num = true;
                }
            } else {
                valid_num = false;
            }

        }
        return valid_num
    };


    _c.find_a_matching_tile = function (game, options) {

        var x, y, i, tries = 50, index = 0, key;
        if (options.location == 'center') {
            for (i = 0; i < tries; i++) {
                x = (_c.cols(game) / 2) + _c.randInt(_c.cols(game) / 6) - (_c.cols(game) / 12) - 1;
                y = (_c.rows(game) / 2) + _c.randInt(_c.rows(game) / 6) - (_c.rows(game) / 12) - 1;

                x = Math.floor(x);
                y = Math.floor(y);
                if (_c.tile_is_traversable(game, x, y, false)) {
                    break;
                }
            }

        } else if (options.location == 'left') {
            for (i = 0; i < tries; i++) {
                x = _c.randOption([0, 1, 2]);
                y = _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, false)) {
                    break;
                }
            }

        } else if (options.location == 'right') {
            var right = _c.cols(game);
            for (i = 0; i < tries; i++) {
                x = _c.randOption([right - 1, right - 2, right - 3]);
                y = _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, false)) {
                    break;
                }
            }

        } else if (options.location == 'top') {
            for (i = 0; i < tries; i++) {
                x = _c.randInt(_c.cols(game));
                y = _c.randOption([0, 1]);

                if (_c.tile_is_traversable(game, x, y, false)) {
                    break;
                }
            }

        } else if (options.location == 'bottom') {
            var bottom = _c.rows(game);
            for (i = 0; i < tries; i++) {
                x = _c.randInt(_c.cols(game));
                y = _c.randOption([bottom - 1, bottom - 2, bottom - 3]);

                if (_c.tile_is_traversable(game, x, y, false)) {
                    break;
                }
            }

        } else if (options.location == 'impassible') {
            for (i = 0; i < tries; i++) {
                x = (_c.randInt(_c.cols(game)));
                y = (_c.randInt(_c.rows(game)));

                var loc = _c.tile_is_traversable(game, x, y, true, true);
                if (loc) {
                    break;
                }
            }

        } else { //if (options.location == 'random') {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        //Do a last final check for valid
        if (!_c.tile_is_traversable(game, x, y, true)) {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        if (!game.open_space.length || x === undefined || y === undefined) {
            console.error("No open spaces, can't draw units");
            x = 0;
            y = game.randInt(_c.rows(gmae), game.game_options);
        }

        return {x: x, y: y};
    };

    _c.tile_has = function (cell, feature) {
        var has = false;

        if (cell.additions && _.indexOf(cell.additions, feature) > -1) {
            has = true;
        }
        return has;

    };

    //-------------------------------------------------
    _c.generate_buildings = function (game) {

        _.each(game.data.buildings, function (building_layer) {
            var location = _c.find_a_matching_tile(game, building_layer);

            if (building_layer.type == 'city') {
                _c.generators.city(game, location, building_layer);

            } else if (building_layer.type == 'storage') {
                _c.generators.storage(game, location, building_layer);

            } else if (building_layer.type == 'dungeon') {
//    {name:'Cave Entrance', type:'dungeon', requires:{mountains:true}, location:'impassible'}

            }
        });
    };


    _c.generate_battle_map = function (game) {
        game.data.terrain_options = game.data.terrain_options || [];
        if (game.data.terrain_options.length == 0) {
            game.data.terrain_options = [
                {name: 'plains', layer: 'ground'}
            ];
        }

        var cells = [];
        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {
                cells[x] = cells[x] || [];
                cells[x][y] = {};
            }
        }

        //Build each map layer
        _.each(game.data.terrain_options, function (terrain_layer) {
            var map_layer;
            if (terrain_layer.draw_type == 'digger') {
                map_layer = new ROT.Map.Digger(_c.cols(game), _c.rows(game));

            } else if (terrain_layer.draw_type != 'flat') {
                //Use Cellular generation style
                var born = [5, 6, 7];
                var survive = [3, 4, 5];

                //TODO: Add some more levels and drawing types
                if (terrain_layer.density == 'small') {
                    born = [4];
                    survive = [3];
                } else if (terrain_layer.density == 'sparse') {
                    born = [4, 5];
                    survive = [3, 4];
                } else if (terrain_layer.density == 'medium') {
                    born = [5, 6, 7];
                    survive = [3, 4, 5];
                } else if (terrain_layer.density == 'high') {
                    born = [4, 5, 6, 7];
                    survive = [3, 4, 5, 6];
                }

                map_layer = new ROT.Map.Cellular(_c.cols(game), _c.rows(game), {
                    //connected: true,
                    topology: 6,
                    born: born,
                    survive: survive
                });


                // initialize with irregularly random values with less in middle
                if (terrain_layer.not_center) {
                    for (var i = 0; i < _c.cols(game); i++) {
                        for (var j = 0; j < _c.rows(game); j++) {
                            var dx = i / _c.cols(game) - 0.5;
                            var dy = j / _c.rows(game) - 0.5;
                            var dist = Math.pow(dx * dx + dy * dy, 0.3);
                            if (ROT.RNG.getUniform() < dist) {
                                map_layer.set(i, j, 1);
                            }
                        }
                    }
                } else {
                    map_layer.randomize(terrain_layer.thickness || 0.5);
                }

                // generate a few smoothing iterations
                var iterations = terrain_layer.smoothness || 3;
                for (var i = iterations - 1; i >= 0; i--) {
                    map_layer.create(i ? null : game.display.DEBUG);
                }
            }

            //For all cells not matched, add to a list
            if (map_layer && map_layer.create) {
                var digCallback = function (x, y, value) {
                    if (value) {
                        cells[x] = cells[x] || [];
                        cells[x][y] = _.clone(terrain_layer);
                        cells[x][y].color = cells[x][y].color.random();

                        //TODO: Have cell be a mix of multiple layers
                    }
                };
                map_layer.create(digCallback.bind(game));
            }
        });


        //Look for all free cells, and draw the map to be blank there
        var freeCells = [];
        var ground_layer = _.find(game.data.terrain_options, function (l) {
            return l.ground
        }) || game.data.terrain_options[0];

        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {

                if (cells[x][y] && cells[x][y].impassible) {
                    //Something in this cell that makes it not able to move upon
                } else {
                    freeCells.push([x, y]);
                    if (!cells[x][y].name) {
                        cells[x][y] = _.clone(ground_layer);
                        cells[x][y].color = cells[x][y].color.random();
                    }
                }
            }
        }
        game.open_space = freeCells;
        game.cells = cells;

    };

    //¬-----------------------------------------------------
    _c.generators = {};
    _c.generators.storage = function (game, location, storage_info) {
        var size = 2;
        var loot_per = {};

        storage_info.resources = storage_info.resources || {};
        for (key in storage_info.resources) {
            loot_per[key] = Math.round(storage_info.resources[key] / (size * size));
        }


        //TODO: How to make a hex rectange?
        for (var x = location.x; x <= location.x + size; x++) {
            for (var y = location.y; y < location.y + size; y++) {
                var tile = _c.tile(game, x, y);
                if (tile) {
                    tile.loot = tile.loot || {};
                    for (key in loot_per) {
                        tile.loot[key] = tile.loot[key] || 0;
                        tile.loot[key] += loot_per[key];
                    }
                    tile.additions = tile.additions || [];
                    tile.additions.push('storage');
                }
            }
        }

    };
    _c.generators.city = function (game, location, city_info) {

        var building_tile_tries = Math.sqrt(city_info.population);
        var building_tile_radius = Math.pow(city_info.population, 1 / 3.2);
        var number_of_roads = Math.pow(city_info.population / 100, 1 / 4);

        var city_cells = [];

        //Generate roads
        var tries = 10;
        var last_side = '';
        for (var i = 0; i < number_of_roads; i++) {
            var side = _c.randOption(['left', 'right', 'top', 'bottom'], {}, last_side);
            last_side = side;
            for (var t = 0; t < tries; t++) {
                var starting = _c.find_a_matching_tile(game, {location: side});
                var path = _c.path_from_to(game, location.x, location.y, starting.x, starting.y);
                if (path && path.length) {
                    path.shift();
                    for (var step = 0; step < path.length; step++) {
                        var cell = _c.tile(game, path[step]);
                        if (cell) {
                            cell.additions = cell.additions || [];
                            cell.additions.push('road');
                        }
                    }
                    break;
                }
            }
        }

        //Generate city tiles & surrounding tiles
        for (var i = 0; i < building_tile_tries; i++) {
            var x, y;
            x = location.x + _c.randInt(building_tile_radius) - (building_tile_radius / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius) - (building_tile_radius / 2) - 1;

            x = Math.floor(x);
            y = Math.floor(y);
            if (_c.tile_is_traversable(game, x, y, false)) {
                game.cells[x][y] = _.clone(city_info);
                city_cells.push(game.cells[x][y]);

                var neighbors = _c.surrounding_tiles(game, x, y);
                _.each(neighbors, function (neighbor) {
                    neighbor.additions = neighbor.additions || [];
                    if (neighbor.type != 'city') {
                        if (neighbor.name == 'mountains') {
                            neighbor.additions.push('mine');
                        } else if (neighbor.name == 'lake') {
                            neighbor.additions.push('dock');
                        } else {
                            neighbor.additions.push('farm');
                        }
                        city_cells.push(neighbor);
                    }
                })
            }
        }

        //TODO: Add city walls

        return city_cells;
    };


})(Battlebox);