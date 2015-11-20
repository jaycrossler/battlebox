//var test = [];

(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    var overlay_lines = []; //Lines for testing or showing information after canvas is drawn
    //TODO: Update rot.js to have a draw_after_dirty function

    //TODO: Pass in a color set to try out different images/rendering techniques
    //TODO: Use hex images for terrain
    //TODO: Use colored large circle characters for forces, not full hex colors
    //TODO: Find out why pre-rolling placement numbers isn't turning out almost exactly the same between builds. Fixed now?
    //TODO: Adding population doesn't add new roads if they should
    //TODO: If city is close to river or sea, grow towards that and add docks (and fishing boats/zones?)

    //TODO: Add sand if between water and mountain

    _c.tile = function (game, x, y) {
        var cell;
        if (!game.cells) {
            throw "Game Cells don't seem to exist, something went wrong with generating the map."
        }
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

    /**
     * Returns an object that has tile basic info along with any entities or objects on tile
     * @param {object} game class data
     * @param {int} x
     * @param {int} y
     * @returns {object} cell and entity data
     */
    _c.tile_info = function (game, x, y) {
        var info = {};

        var cell = _c.tile(game, x, y);
        if (cell) {
            info = _.clone(cell);

            _.each(_c.entities(game), function (entity, id) {
                if (entity.x == x && entity.y == y && entity._draw) {
                    info.forces = info.forces || [];
                    info.forces.push({id: id, data: entity.forces});
                }
            });
        }
        return info;
    };

    /**
     * Returns the 6 surrounding hexes around a tile (or more if bigger rings)
     * @param {object} game class data
     * @param {int} x_start
     * @param {int} y_start
     * @param {int} [rings=1] number of rings away from x,y that should be included
     * @param {boolean} add_ring_number Should a clone of the tile be made with the ring number added?
     * @returns {Array.<Object>} cells and entity data
     */
    _c.surrounding_tiles = function (game, x_start, y_start, rings, add_ring_number) {
        var cells = [];
        rings = rings || 1;

        function add(x_offset, y_offset, ring) {
            var new_cell = _c.tile(game, x_offset, y_offset);
            if (new_cell) {
                if (add_ring_number) {
                    var cloned_cell = JSON.parse(JSON.stringify(new_cell));
                    cloned_cell.ring = ring;
                    cells.push(cloned_cell);
                } else {
                    cells.push(new_cell);
                }
            }
        }

        var x = x_start;
        var y = y_start;

        //Hexagon spiral algorithm, modified from
        for (var n = 1; n <= rings; ++n) {
            x += 2;
            add(x, y, n);
            for (var i = 0; i < n - 1; ++i) add(++x, ++y, n); // move down right. Note N-1
            for (var i = 0; i < n; ++i) add(--x, ++y, n); // move down left
            for (var i = 0; i < n; ++i) {
                x -= 2;
                add(x, y, n);
            } // move left
            for (var i = 0; i < n; ++i) add(--x, --y, n); // move up left
            for (var i = 0; i < n; ++i) add(++x, --y, n); // move up right
            for (var i = 0; i < n; ++i) {
                x += 2;
                add(x, y, n);
            }  // move right
        }
        return cells;

        //    [-1, -1] up left
        //    [ 1, -1] up right
        //    [ 2,  0] right
        //    [ 1,  1] down right
        //    [-1,  1] down left
        //    [-2,  0] left
    };

    /**
     * Returns whether a tile is a valid cell, and if it is passable
     * @param {object} game class data
     * @param {int} x
     * @param {int} y
     * @param {boolean} [move_through_impassable] return true even if the sell is impassable
     * @param {boolean} [only_impassable] return true only if the cell is impassable
     * @returns {boolean} valid if cell is valid and passable
     */
    _c.tile_is_traversable = function (game, x, y, move_through_impassable, only_impassable) {
        var valid_num = (x >= 0) && (y >= 0) && (x < _c.cols(game)) && (y < _c.rows(game));
        if (valid_num) {
            var cell = _c.tile(game, x, y);
            if (cell) {
                if (!move_through_impassable && cell.impassable) {
                    valid_num = false;
                }
                if (only_impassable) {
                    valid_num = (cell.impassable);
                }
            } else {
                valid_num = false;
            }

        }
        return valid_num
    };

    /**
     * Find a tile that matches location parameters
     * @param {object} game class data
     * @param {object} options {location:'center'} or 'e' or 'impassable' or 'right' or 'top', etc...
     * @returns {object} tile hex cell that matches location result, or random if one wasn't found
     */
    _c.find_a_matching_tile = function (game, options) {
        var mid_left = Math.round(_c.cols(game) * .25);
        var mid_right = Math.round(_c.cols(game) * .75);
        var center_left_right = Math.round(_c.cols(game) * .5);

        var mid_top = Math.round(_c.rows(game) * .25);
        var mid_bottom = Math.round(_c.rows(game) * .75);
        var center_top_bottom = Math.round(_c.rows(game) * .5);

        var mid_left_range = [mid_left - 4, mid_left - 3, mid_left - 2, mid_left - 1, mid_left, mid_left + 1, mid_left + 2, mid_left + 3, mid_left + 4];
        var center_left_right_range = [center_left_right - 4, center_left_right - 3, center_left_right - 2, center_left_right - 1, center_left_right, center_left_right + 1, center_left_right + 2, center_left_right + 3, center_left_right + 4];
        var mid_right_range = [mid_right - 4, mid_right - 3, mid_right - 2, mid_right - 1, mid_right, mid_right + 1, mid_right + 2, mid_right + 3, mid_right + 4];

        var mid_bottom_range = [mid_bottom - 4, mid_bottom - 3, mid_bottom - 2, mid_bottom - 1, mid_bottom, mid_bottom + 1, mid_bottom + 2, mid_bottom + 3, mid_bottom + 4];
        var center_top_bottom_range = [center_top_bottom - 4, center_top_bottom - 3, center_top_bottom - 2, center_top_bottom - 1, center_top_bottom, center_top_bottom + 1, center_top_bottom + 2, center_top_bottom + 3, center_top_bottom + 4];
        var mid_top_range = [mid_top - 4, mid_top - 3, mid_top - 2, mid_top - 1, mid_top, mid_top + 1, mid_top + 2, mid_top + 3, mid_top + 4];

        var x, y, i, tries = 50, index = 0, key;
        if (options.location == 'center') {
            for (i = 0; i < tries; i++) {
                x = options.x || (_c.cols(game) / 2) + _c.randInt(_c.cols(game) / 6) - (_c.cols(game) / 12) - 1;
                y = options.y || (_c.rows(game) / 2) + _c.randInt(_c.rows(game) / 6) - (_c.rows(game) / 12) - 1;

                x = Math.floor(x);
                y = Math.floor(y);
                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }
        } else if (_.isObject(options.location)) {
            return options.location;

        } else if (options.location == 'city') {
            var cities = _.filter(game.data.buildings, function (b) {
                return (b.type == 'city' || b.type == 'city2')
            });
            var city = _c.randOption(cities);

            if (city && city.tiles) {
                var tile = _c.randOption(city.tiles);
                x = tile.x;
                y = tile.y;
            }

        } else if (options.location == 'left') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([0, 1, 2]);
                if (options.y) {
                    y = _c.randOption([options.y - 1, options.x - 2, options.x - 3]);
                } else {
                    y = _c.randInt(_c.rows(game));
                }

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'right') {
            var right = _c.cols(game);
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([right - 1, right - 2, right - 3]);
                if (options.y) {
                    y = _c.randOption([options.y - 1, options.x - 2, options.x - 3]);
                } else {
                    y = _c.randInt(_c.rows(game));
                }

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'mid left') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_left_range);
                y = options.y || _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'mid right') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_right_range);
                y = options.y || _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'mid top') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randInt(_c.cols(game));
                y = options.y || _c.randOption(mid_top_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'mid bottom') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randInt(_c.cols(game));
                y = options.y || _c.randOption(mid_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'w') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_left_range);
                y = options.y || _c.randOption(center_top_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 's') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(center_left_right_range);
                y = options.y || _c.randOption(mid_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'n') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(center_left_right_range);
                y = options.y || _c.randOption(mid_top_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'e') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_right_range);
                y = options.y || _c.randOption(center_top_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'sw') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_left_range);
                y = options.y || _c.randOption(mid_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'se') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_right_range);
                y = options.y || _c.randOption(mid_bottom_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'nw') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_left_range);
                y = options.y || _c.randOption(mid_top_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'ne') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption(mid_right_range);
                y = options.y || _c.randOption(mid_top_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'top') {
            var y_range = options.locked ? [0] : [0, 1];
            for (i = 0; i < tries; i++) {
                if (options.x) {
                    x = _c.randOption([options.x - 2, options.x - 1, options.x, options.x + 1, options.x + 2]);
                } else {
                    x = _c.randInt(_c.cols(game));
                }

                y = _c.randOption(y_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'bottom') {
            var bottom = _c.rows(game);
            var y_range = options.locked ? [bottom - 1] : [bottom - 1, bottom - 2];

            for (i = 0; i < tries; i++) {
                if (options.x) {
                    x = _c.randOption([options.x - 2, options.x - 1, options.x, options.x + 1, options.x + 2]);
                } else {
                    x = _c.randInt(_c.cols(game));
                }
                y = _c.randOption(y_range);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassable)) {
                    break;
                }
            }

        } else if (options.location == 'impassable') {
            for (i = 0; i < tries; i++) {
                y = options.x || (_c.randInt(_c.rows(game)));
                x = options.y || (y % 2) + (_c.randInt(_c.cols(game) / 2) * 2);

                if (_c.tile_is_traversable(game, x, y, true, true)) {
                    break;
                }
            }

        } else if (options.location) {
            for (i = 0; i < tries; i++) {
                y = options.x || (_c.randInt(_c.rows(game)));
                x = options.y || (y % 2) + (_c.randInt(_c.cols(game) / 2) * 2);

                if (_c.tile_is_traversable(game, x, y) && _c.tile_has(_c.tile(game, x, y), options.location)) {
                    break;
                }
            }

        } else { //if (options.location == 'random') {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        //Do a last final check for valid, and try an open cell if not found
        if (!_c.tile_is_traversable(game, x, y, true)) {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        if (!game.open_space.length || x === undefined || y === undefined) {
            console.error("No open spaces, can't find valid cell");
            x = 0;
            y = game.randInt(_c.rows(gmae), game.game_options);
        }

        return {x: x, y: y};
    };

    /**
     * Returns whether a tile has a specific addition (either a simple text feature like 'field', or a complex object feature like {name:'road', symbol:'-'}
     * @param {object} cell - tile to look at
     * @param {string} feature - a feature class, like 'field', or 'road'
     * @param {boolean} [return_count=false] - return just a count of features instead of feature details
     * @returns {object} null if no object, or the first feature info (string or object) if it was found, or count of objects if return_count specified
     */
    _c.tile_has = function (cell, feature, return_count) {
        var has = 0;

        if (cell && cell.additions) {
            for (var i = 0; i < cell.additions.length; i++) {
                var a = cell.additions[i];
                if (a == feature || (a && a.name && a.name == feature)) {
                    if (return_count) {
                        has++;
                    } else {
                        has = a;
                        break;
                    }
                }
            }
        }
        return has;

    };

    var hex_angle_lookups = [
        {angle: 330, rot_number: 0, road_symbol: '╲', description: 'North West', abbr: 'NW'},
        {angle: 30, rot_number: 1, road_symbol: '╱', description: 'North East', abbr: 'NE'},
        {angle: 90, rot_number: 2, road_symbol: '━', description: 'East', abbr: 'E'},
        {angle: 150, rot_number: 3, road_symbol: '╲', description: 'South East', abbr: 'SE'},
        {angle: 210, rot_number: 4, road_symbol: '╱', description: 'South West', abbr: 'SW'},
        {angle: 270, rot_number: 5, road_symbol: '━', description: 'West', abbr: 'W'}
    ];
    /**
     * Returns a cardinal direction from one tile to an another hex tile
     * @param {object} tile_from
     * @param {object} tile_to
     * @returns {object} cell_info {angle, hex_dir_change_array, road_symbol, description, abbr}
     */
    _c.direction_from_tile_to_tile = function (tile_from, tile_to) {
        var angle = Math.atan2(tile_to.y - tile_from.y, tile_to.x - tile_from.x);
        angle += (Math.PI * .5); //Orient it to map
        angle = (angle + (Math.PI * 2)) % (Math.PI * 2);  //Constrain it to 0 - 2*PI

        var slice = angle / ( (Math.PI * 2) / 6);
        var dir_num = Math.ceil(slice) % 6;
        var dir = hex_angle_lookups[dir_num];
        dir.hex_dir_change_array = ROT.DIRS[6][dir.rot_number];

        return dir;
    };
    /**
     * Returns the opposite neighboring tiles to (tile_to) from the perspective of (tile_from)
     * @param {object} game
     * @param {object} tile_from
     * @param {object} tile_to (returns 3 neighbors of this tile)
     * @returns {Array.<object>} neighbor_cells
     */
    _c.opposite_tiles_from_tile_to_tile = function (game, tile_from, tile_to) {
        var neighbor_cells = [];

        var angle = Math.atan2(tile_to.y - tile_from.y, tile_to.x - tile_from.x);
        angle += (Math.PI * .5); //Orient it to map
        angle = (angle + (Math.PI * 2)) % (Math.PI * 2);  //Constrain it to 0 - 2*PI

        var slice = angle / ( (Math.PI * 2) / 6);
        var dir_num_1 = Math.ceil(slice + 5) % 6;
        var dir_num_2 = Math.ceil(slice) % 6;
        var dir_num_3 = Math.ceil(slice + 1) % 6;

        for (var i = 0; i < 6; i++) {
            if ((dir_num_1 != i) && (dir_num_2 != i) && (dir_num_3 != i)) {
                var moves = ROT.DIRS[6][i];

                var cell = _c.tile(game, tile_to.x + moves[0], tile_to.y + moves[1]);
                neighbor_cells.push(cell);
            }
        }

        return neighbor_cells;
    };
    //-------------------------------------------------
    /**
     * Builds all the tiles for the base game map from the game data settings passed in. Constructs game.cells for use in game
     * @param {object} game Overall game information
     */
    _c.generate_base_map = function (game) {
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

        //Build each terrain layer using cellular algorithms
        _.each(game.data.terrain_options, function (terrain_layer) {
            cells = _c.generators.terrain_layer(game, terrain_layer, cells)
        });


        //Look for all free cells, and draw the map to be blank there
        var freeCells = [];
        var ground_layer = _.find(game.data.terrain_options, function (l) {
                return l.ground
            }) || game.data.terrain_options[0];

        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {

                if (cells[x][y] && cells[x][y].impassable) {
                    //Something in this cell that makes it not able to move upon
                } else {
                    freeCells.push([x, y]);
                    if (!cells[x][y].name) {
                        cells[x][y] = _.clone(ground_layer);
                        set_obj_color_and_food(cells[x][y]);
                        cells[x][y].x = x;
                        cells[x][y].y = y;
                    }
                }
            }
        }
        game.open_space = freeCells;
        game.cells = cells;
    };
    _c.generate_water_layers = function (game) {
        //Build each water layer
        _.each(game.data.water_options, function (water_layer) {
            var location = _c.find_a_matching_tile(game, water_layer);
            if (water_layer.name == 'river') {
                _c.generators.river(game, water_layer, location);
            } else if (water_layer.name == 'lake') {   //More spidery lakes
                _c.generators.lake(game, water_layer, location);
            } else if (water_layer.name == 'lake2') {  //More circular lakes
                _c.generators.lake2(game, water_layer, location);
            } else if (water_layer.name == 'sea') {
                _c.generators.sea(game, water_layer, location);
            }
            water_layer.location = location;
        });

    };
    _c.generate_buildings = function (game) {
        _.each(game.data.buildings, function (building_layer, i) {
            resetSeed(game, i);
            var location = _c.find_a_matching_tile(game, building_layer);
            if (building_layer.type == 'city') {
                building_layer.tiles = _c.generators.city(game, location, building_layer);
            } else if (building_layer.type == 'city2') {
                building_layer.tiles = _c.generators.city2(game, location, building_layer);
            } else if (building_layer.type == 'storage') {
                _c.generators.storage(game, location, building_layer);
            } else if (building_layer.type == 'dungeon') {
                //TODO: Add    {name:'Cave Entrance', type:'dungeon', requires:{mountains:true}, location:'impassable'}
            }
            building_layer.location = location;


            //Add walls around structure
            if (building_layer.fortifications) {
                var fortifications = building_layer.fortifications;
                if (!_.isArray(fortifications)) fortifications = [fortifications];
                _.each(fortifications, function (fort) {
                    var title = _.str.titleize(building_layer.title || building_layer.name) + 's walls';
                    var wall_info = {
                        count: fort.count || ((building_layer.population || 0) / 10000),
                        title: fort.title || title,
                        shape: fort.shape,
                        radius: fort.radius,
                        towers: fort.towers,
                        side: building_layer.side,
                        starting_angle: fort.starting_angle
                    };
                    _c.generators.walls(game, location, wall_info);
                });
            }

        });
    };
    _c.population_counter = function (game, city_cells) {
        var count = 0;
        if (city_cells && city_cells.length) {
            _.each(city_cells, function (cell) {
                if (cell) {
                    count += game.cells[cell.x][cell.y].population || 0;
                }
            })
        } else {
            _.each(game.cells, function (x) {
                _.each(x, function (cell) {
                    if (cell) count += cell.population || 0;
                })
            });
        }
        return count;
    };
    //¬-----------------------------------------------------
    function screen_xy_from_tile_xy(game, x, y) {
        var be = game.display._backend;
        return {
            x: (x + 1) * be._spacingX,
            y: y * be._spacingY + be._hexSize
        };
    }

    //From: ROT.Display.Hex.prototype.eventToPosition
    function tile_xy_from_screen_xy(game, x, y) {
        var be = game.display._backend;

        //TODO: This wont work if zoomed in
        var size = be._context.canvas.height / be._options.height;
        y = Math.floor(y / size);

        if (y.mod(2)) { /* odd row */
            x -= be._spacingX;
            x = 1 + 2 * Math.floor(x / (2 * be._spacingX));
        } else {
            x = 2 * Math.floor(x / (2 * be._spacingX));
        }
        return {x: x, y: y}

    }

    function checkLineIntersection(line1Start, line1End, line2Start, line2End, crossedName) {
        //From: http://jsfiddle.net/justin_c_rounds/Gd2S2/
        // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite)
        // and booleans for whether line segment 1 or line segment 2 contain the point

        var denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) - ((line2End.x - line2Start.x) * (line1End.y - line1Start.y));
        if (denominator == 0) {
            return result;
        }
        a = line1Start.y - line2Start.y;
        b = line1Start.x - line2Start.x;
        numerator1 = ((line2End.x - line2Start.x) * a) - ((line2End.y - line2Start.y) * b);
        numerator2 = ((line1End.x - line1Start.x) * a) - ((line1End.y - line1Start.y) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = line1Start.x + (a * (line1End.x - line1Start.x));
        result.y = line1Start.y + (a * (line1End.y - line1Start.y));

        // it is worth noting that this should be the same as:
        // x = line2Start.x + (b * (line2End.x - line2Start.x));
        // y = line2Start.x + (b * (line2End.y - line2Start.y));

        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        if (crossedName) {
            result.crossed = crossedName;
        }
        // if line1 and line2 are segments, they intersect if both of the above are true
        return result;
    }

    function polygon_intersections(game, sides, points, starting_angle, center, center_px, radius_px) {
        var corners = [];
        var tiles = [];

        for (var i = 0; i < sides; i++) {
            var a = ((i / (sides)) + (starting_angle || 0)) % 1;
            a *= 2 * Math.PI;
            var x = center_px.x + (radius_px * Math.cos(a));
            var y = center_px.y + (radius_px * Math.sin(a));
            corners.push({x: x, y: y});
        }

        var tester_multiplier = 1.5;
        for (var i = 0; i < points; i++) {
            var a = ((i / (points)) + (starting_angle || 0)) % 1;
            a *= 2 * Math.PI;
            var point_to = {
                x: center_px.x + (radius_px * tester_multiplier * Math.cos(a)),
                y: center_px.y + (radius_px * tester_multiplier * Math.sin(a))
            };

            for (var l = 0; l < corners.length; l++) {
                var corner_1 = corners[l];
                var corner_2 = corners[(l + 1) % corners.length];

                var intersect = checkLineIntersection(center_px, point_to, corner_1, corner_2);

                if (intersect.onLine1 && intersect.onLine2) {
                    var tile = tile_xy_from_screen_xy(game, intersect.x, intersect.y); //TODO: Handle multiple intersections
                    //if (_c.tile_is_traversable(game, tile.x, tile.y)) {
                    tiles.push(_c.tile(game, tile.x, tile.y));
                    //}
                }
            }

            //TESTING for visibility and placement checking
            overlay_lines.push({p1: center_px, p2: point_to});

        }

        return tiles;
    }

    //TESTING
    _c.testAddRandomLines = function (context, color) {
        context.strokeStyle = color || 'blue';
        for (var i = 0; i < overlay_lines.length; i++) {
            var segment = overlay_lines[i];

            context.beginPath();
            context.moveTo(segment.p1.x, segment.p1.y);
            context.lineTo(segment.p2.x, segment.p2.y);
            context.closePath();
            context.stroke()
        }
        return context;
    };

    _c.shape_to_tiles = function (game, center, shape, points, radius, starting_angle) {
        var tiles = [];
        var center_px = screen_xy_from_tile_xy(game, center.x, center.y);
        var radius_px = Helpers.distanceXY(
            center_px,
            screen_xy_from_tile_xy(game, center.x - (radius * 2), center.y)
        );

        if (shape == 'circle') {
            for (var i = 0; i < points; i++) {
                var a = (i / (points)) + (starting_angle || 0);
                a *= 2 * Math.PI;
                var screen_x = center_px.x + (radius_px * Math.cos(a));
                var screen_y = center_px.y + (radius_px * Math.sin(a));

                var tile = tile_xy_from_screen_xy(game, screen_x, screen_y)
                if (_c.tile_is_traversable(game, tile.x, tile.y)) {
                    tiles.push(_c.tile(game, tile.x, tile.y));
                }
            }
        } else if (shape == 'square') {
            tiles = polygon_intersections(game, 4, points, starting_angle, center, center_px, radius_px)

        } else if (shape == 'pentagon') {
            tiles = polygon_intersections(game, 5, points, starting_angle, center, center_px, radius_px)

        } else if (shape == 'hexagon') {
            tiles = polygon_intersections(game, 6, points, starting_angle, center, center_px, radius_px)

        } else if (shape == 'septagon') {
            tiles = polygon_intersections(game, 7, points, starting_angle, center, center_px, radius_px)

        } else if (shape == 'octagon') {
            tiles = polygon_intersections(game, 8, points, starting_angle, center, center_px, radius_px)


        } else if (shape == 'rounded square') {
            for (var i = 0; i < points; i++) {
                var a = (i / (points)) + (starting_angle || 0);
                a *= 2 * Math.PI;
                var c = Math.cos(a);
                var s = Math.sin(a);
                c = (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 1 / 2);
                s = (s < 0 ? -1 : 1) * Math.pow(Math.abs(s), 1 / 2);
                var screen_x = center_px.x + (radius_px * c);
                var screen_y = center_px.y + (radius_px * s);

                var tile = tile_xy_from_screen_xy(game, screen_x, screen_y)
                if (_c.tile_is_traversable(game, tile.x, tile.y)) {
                    tiles.push(_c.tile(game, tile.x, tile.y));
                }
            }
        } else if (shape == 'diamond') {
            for (var i = 0; i < points; i++) {
                var a = (i / (points)) + (starting_angle || 0);
                a *= 2 * Math.PI;
                var c = Math.cos(a);
                var s = Math.sin(a);
                c = (c < 0 ? -1 : 1) * Math.abs(Math.pow(c, 3));
                s = (s < 0 ? -1 : 1) * Math.abs(Math.pow(s, 3));
                var screen_x = center_px.x + (radius_px * c);
                var screen_y = center_px.y + (radius_px * s);

                var tile = tile_xy_from_screen_xy(game, screen_x, screen_y)
                if (_c.tile_is_traversable(game, tile.x, tile.y)) {
                    tiles.push(_c.tile(game, tile.x, tile.y));
                }
            }
        } else if (shape == 'flower') {
            for (var i = 0; i < points; i++) {
                var a = (i / (points)) + (starting_angle || 0);
                a *= 2 * Math.PI;
                var c = Math.cos(a);
                var s = Math.sin(a);
                c = (c < 0 ? -1 : 1) * Math.abs(Math.pow(c, 4));
                s = (s < 0 ? -1 : 1) * Math.abs(Math.pow(s, 4));
                var screen_x = center_px.x + (radius_px * c);
                var screen_y = center_px.y + (radius_px * s);

                var tile = tile_xy_from_screen_xy(game, screen_x, screen_y)
                if (_c.tile_is_traversable(game, tile.x, tile.y)) {
                    tiles.push(_c.tile(game, tile.x, tile.y));
                }
            }
        }

        return tiles;
    };
    _c.generators = {};
    _c.generators.walls = function (game, location, wall_info) {
        var wall_tiles = _c.shape_to_tiles(game, location, wall_info.shape || 'circle', wall_info.count, wall_info.radius || 4, wall_info.starting_angle);
        var last_tower = -1;
        _.each(wall_tiles, function (cell, i) {
            if (cell && !cell.impassable) {
                cell.additions = cell.additions || [];
                cell.additions.push('wall');
                cell.side = wall_info.side;

                //(i * ((wall_info.towers || 0) / wall_info.count)) % (wall_info.towers || 1) == 0;
                var tower_count = Math.round(i * ((wall_info.towers || 0) / wall_info.count));
                if (tower_count > last_tower) {
                    cell.additions.push('tower');
                    last_tower = tower_count;
                }
            }
        });
    };
    function resetSeed(game, extra) {
        ROT.RNG.setSeed(game.data.rand_seed + (extra || 0));
    }

    _c.generators.city2 = function (game, location, city_info) {
        var populations_tightness = (city_info.tightness || 1) * 3.1;
        var city_cells = [];

        //Build roads based on city size
        var number_of_roads;
        var road_location = null;
        var all_cities = _.filter(game.data.buildings, function (b) {
            return b.type == 'city' || b.type == 'city2'
        });

        if (all_cities.length > 1 && _.indexOf(all_cities, city_info) > 0 && all_cities[0].tiles) {
            road_location = all_cities[0].tiles[0];
            number_of_roads = 1;
        } else {
            number_of_roads = (city_info.road_count !== undefined) ? city_info.road_count : Math.pow(city_info.population / 100, 1 / 4);
        }

        var road_tiles = city_info.road_tiles || _c.generators.roads_from(game, number_of_roads, location, road_location);
        road_tiles.sort(function (a, b) {
            var dist_a = Helpers.distanceXY(location, a);
            var dist_b = Helpers.distanceXY(location, b);
            return dist_a > dist_b;
        });
        city_info.road_tiles = road_tiles;

        //Reset the city so it'll look the same independent of number of roads
        resetSeed(game);

        //Build the center and give it some population
        var center = _c.tile(game, location.x, location.y);
        var building_tile_tries = Math.floor(Math.sqrt(city_info.population));
        center.type = 'city';
        center.name = city_info.name;
        center.title = city_info.title;
        center.side = city_info.side;
        game.cells[center.x][center.y] = center;


        center.population = center.population || 0;
        center.population += building_tile_tries * 2;
        city_cells.push(center);


        //TODO: Work from previous population to new population

        //Pre-roll all random rolls so that they will always build in the same pattern
        var rolls = [];
        for (var i = 0; i < building_tile_tries; i++) {
            var roll_set = [
                _c.randHistogram(.05, populations_tightness * 2),
                ROT.RNG.getNormal(),
                ROT.RNG.getNormal(),
                ROT.RNG.getNormal()
            ];
            rolls.push(roll_set);
        }

        //Add population along roads
        if (road_tiles.length) {
            for (var i = 0; i < building_tile_tries; i++) {
                var road_index = Math.round(rolls[i][0] * road_tiles.length);
                var road_segment = road_tiles[road_index];

                //Assign population to all non-road/river/lake cells
                var road_neighbors = _c.surrounding_tiles(game, road_segment.x, road_segment.y, 2);
                road_neighbors = _.filter(road_neighbors, function (r) {
                    return (!_c.tile_has(r, 'road') && !_c.tile_has(r, 'river') && (r.name != 'lake'));
                });
                _.each(road_neighbors, function (neighbor) {
                    neighbor.population = neighbor.population || 0;
                    neighbor.population += building_tile_tries / (road_neighbors.length * 3);

                    if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
                });
            }
        }

        //Randomly add population in square around city
        var building_tile_radius_y = Math.pow(city_info.population, 1 / populations_tightness);
        var building_tile_radius_x = building_tile_radius_y * 1.5;
        for (var i = 0; i < building_tile_tries; i++) {
            var x, y;
            x = location.x + (rolls[i][1] * building_tile_radius_x / 4);
            y = location.y + (rolls[i][2] * building_tile_radius_y / 4);
            x = Math.floor(x);
            y = Math.floor(y);

            var cell = _c.tile(game, x, y);
            if (cell && _c.tile_is_traversable(game, x, y, false) && !_c.tile_has(cell, 'road') && !_c.tile_has(cell, 'river') && (cell.name != 'lake')) {
                cell.population = cell.population || 0;
                cell.population += building_tile_tries / 4 + (rolls[i][3] * building_tile_radius_x);
                cell.population = Math.ceil(Math.max(0, cell.population));
                cell.side = city_info.side;
                game.cells[x][y] = cell;

                if (_.indexOf(city_cells, cell) == -1) city_cells.push(cell);

                var neighbors = _c.surrounding_tiles(game, x, y, 1);
                neighbors = _.filter(neighbors, function (r) {
                    return (!_c.tile_has(r, 'road') && !_c.tile_has(r, 'river') && (r.name != 'lake'));
                });
                _.each(neighbors, function (neighbor) {
                    neighbor.population = neighbor.population || 0;
                    neighbor.population += building_tile_tries / (road_neighbors.length * 1.8);
                    neighbor.population = Math.ceil(Math.max(0, neighbor.population));
                    neighbor.side = city_info.side;

                    game.cells[neighbor.x][neighbor.y] = neighbor;

                    if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
                })
            }
        }

        //Turn cells with enough population into city cells and build farms
        var city_cells_final = [city_cells[0]]; //Start with the city center
        for (var i = 0; i < city_cells.length; i++) {
            var cell = city_cells[i];
            x = cell.x;
            y = cell.y;

            var cell_population = Math.round(cell.population);
            if (cell_population >= 70) {

                game.cells[x][y] = {
                    name: city_info.name,
                    title: city_info.title,
                    population: cell_population,
                    type: 'city',
                    side: city_info.side,
                    x: x,
                    y: y
                };

                cell.population = cell_population;

                var neighbors = _c.surrounding_tiles(game, x, y);
                _.each(neighbors, function (neighbor) {
                    neighbor.additions = neighbor.additions || [];
                    if (neighbor.type != 'city') {
                        if (neighbor.name == 'mountains') {
                            neighbor.additions.push('mine');
                        } else if (neighbor.name == 'lake' || _c.tile_has(neighbor, 'river')) {
                            neighbor.additions.push('dock');
                        } else {
                            neighbor.additions.push('farm');
                        }
                    }
                });

                if (_.indexOf(city_cells_final, cell) == -1) city_cells_final.push(cell);

            } else {
                cell.population = cell_population;
                game.cells[x][y].population = cell_population;
                game.cells[x][y].side = city_info.side;
            }
        }

        var pop_count = city_info.population - _c.population_counter(game, city_cells);
        if (pop_count > 0) {
            city_cells[0].population += Math.round(pop_count);
        }

        //Loop through cells with multiple farms and redistribute the farms further out
        var loops = 10;
        for (var l = 0; l < loops; l++) {
            var cc_length = city_cells.length;
            for (var i = 0; i < cc_length; i++) {
                var cell = city_cells[i];
                var num_farms = _c.tile_has(cell, 'farm', true);
                if ((num_farms > 5) || (cell.population > 100)) {

                    cell.additions = cell.additions || [];

//                    var neighbors = _c.opposite_tiles_from_tile_to_tile(game, city_cells[0], cell);
                    var neighbors = _c.surrounding_tiles(game, cell.x, cell.y);

                    var farms_to_give_each_neighbor = Math.floor(num_farms / neighbors.length);
                    var population_to_give_each_neighbor = (cell.population - 100) / (neighbors.length + 1);
                    _.each(neighbors, function (neighbor) {
                        neighbor.additions = neighbor.additions || [];
                        for (var f = 0; f < farms_to_give_each_neighbor; f++) {
                            neighbor.additions.push('farm');
                        }

                        neighbor.population = neighbor.population || 0;
                        neighbor.population += Math.round(population_to_give_each_neighbor);
                        neighbor.side = city_info.side;

                        game.cells[neighbor.x][neighbor.y] = neighbor;
                        if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
                    });
                    cell.additions = removeArrayItemNTimes(cell.additions, 'farm', neighbors.length * farms_to_give_each_neighbor);
                    cell.population -= Math.round(population_to_give_each_neighbor * neighbors.length);
                    cell.side = city_info.side;
                    game.cells[cell.x][cell.y] = cell;
                }
            }
        }

        return city_cells_final;
    };

    function removeArrayItemNTimes(arr, toRemove, times) {
        times = times || 10;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == toRemove) {
                arr.splice(i, 1);
                i--; // Prevent skipping an item
                times--;
                if (times <= 0) break;
            }
        }
        return arr;
    }

    _c.generators.terrain_layer = function (game, terrain_layer, cells) {
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
                born = [4, 5];
                survive = [4, 5, 6];
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
                    set_obj_color_and_food(cells[x][y]);
                    cells[x][y].x = x;
                    cells[x][y].y = y;
                }
            };
            map_layer.create(digCallback.bind(game));
        }
        return cells;
    };

    function set_obj_color_and_food(obj) {
        if (obj.color && _.isArray(obj.color)) {
            obj.color = obj.color.random();
        }

        if (obj.food && _.isArray(obj.food)) {
            obj.food = obj.food.random();
        }

    }

    _c.generators.storage = function (game, location, storage_info) {
        var size = 2;
        var loot_per = {};

        storage_info.resources = storage_info.resources || {};
        for (key in storage_info.resources) {
            loot_per[key] = Math.round(storage_info.resources[key] / (size * size));
        }


        //TODO: How to make a hex rectangle?
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

    _c.generators.roads_from = function (game, number_of_roads, starting_tile, ending_tile) {
        var tries = 20;
        var last_side = '';
        var road_tiles = [];

        var directions = ['left', 'right', 'top', 'bottom'];
        var impassible_directions = _.filter(game.game_options.water_options, function (layer) {
            return layer.name == 'sea';
        });
        _.each(impassible_directions, function (dir) {
            directions = _.without(directions, dir.location);
        });

        for (var i = 0; i < number_of_roads; i++) {
            var side = _c.randOption(directions, {}, last_side);
            last_side = side;
            for (var t = 0; t < tries; t++) {
                ending_tile = ending_tile || _c.find_a_matching_tile(game, {location: side});
                var path = _c.path_from_to(game, starting_tile.x, starting_tile.y, ending_tile.x, ending_tile.y);
                ending_tile = null;
                if (path && path.length) {
                    for (var step = 1; step < path.length; step++) {
                        var cell = _c.tile(game, path[step]);
                        var last_cell = _c.tile(game, path[step - 1]);
                        var dir = _c.direction_from_tile_to_tile(last_cell, cell);

                        if (cell) {
                            cell.additions = cell.additions || [];
                            cell.additions.push({name: 'road', symbol: dir.road_symbol});
                            road_tiles.push(cell);
                        }
                    }
                    break;
                }
            }
        }
        return road_tiles;
    };


    _c.generators.lake = function (game, water_layer, location) {
        var water_cells = [];
        var size = 30;
        if (water_layer.density == 'small') {
            size = 7;
        } else if (water_layer.density == 'medium') {
            size = 30;
        } else if (water_layer.density == 'large') {
            size = 60;
        } else if (_.isNumber(water_layer.density)) {
            size = parseInt(water_layer.density);
        }

        var building_tile_radius_y = Math.pow(size, 1 / 1.45);
        var building_tile_radius_x = building_tile_radius_y * 1.5;

        function make_water(x, y, recursion) {
            if (!_c.tile_is_traversable(game, x, y, false)) {
                return;
            }
            var is_cell_in_water_cells = (game.cells[x][y].data && game.cells[x][y].data.water);

            if (is_cell_in_water_cells) {
            } else {
                var layer = _.clone(water_layer);
                layer.data = layer.data || {};
                layer.data.water = true;
                layer.data.depth = recursion;
                layer.x = x;
                layer.y = y;
                set_obj_color_and_food(layer);

                game.cells[x][y] = layer;

                water_cells.push(layer);

                if (recursion > 1) {
                    var neighbors = _c.surrounding_tiles(game, x, y);
                    _.each(neighbors, function (neighbor) {
                        make_water(neighbor.x, neighbor.y, recursion - 1);
                    });
                }
            }
        }

        for (var i = 0; i < size; i++) {
            var x, y;
            x = location.x + _c.randInt(building_tile_radius_x) - (building_tile_radius_x / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius_y) - (building_tile_radius_y / 2) - 1;

            x = Math.floor(x);
            y = Math.floor(y);

            make_water(x, y, 3);

        }
        return water_cells;
    };

    _c.generators.lake2 = function (game, water_layer, location) {
        var water_cells = [];
        var size = 30;
        if (water_layer.density == 'small') {
            size = 7;
        } else if (water_layer.density == 'medium') {
            size = 14;
        } else if (water_layer.density == 'large') {
            size = 30;
        } else if (_.isNumber(water_layer.density)) {
            size = parseInt(water_layer.density);
        }

        var building_tile_radius_y = Math.pow(size, 1 / 1.45);
        var building_tile_radius_x = building_tile_radius_y * 1.5;

        for (var i = size; i > 0; i--) {
            var x, y, depth;
            x = location.x + _c.randInt(building_tile_radius_x) - (building_tile_radius_x / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius_y) - (building_tile_radius_y / 2) - 1;
            depth = Math.round(Math.pow(i, 1 / 3));

            x = Math.floor(x);
            y = Math.floor(y);

            var lake_tiles = _c.surrounding_tiles(game, x, y, depth, true);
            _.each(lake_tiles, function (lake_tile) {
                if (_.indexOf(water_cells, lake_tile) == -1) {

                    x = lake_tile.x;
                    y = lake_tile.y;

                    var good_tile = true;
                    if (!_c.tile_is_traversable(game, x, y, false)) {
                        good_tile = false;
                    }
                    //If it's already a lake or river
                    if (game.cells[x][y].data && game.cells[x][y].data.water) {
                        //Make it deeper if it should be
                        var current_depth = game.cells[x][y].data.depth || 0;
                        if (lake_tile.ring > current_depth) {
                            game.cells[x][y].data.depth = lake_tile.ring;
                        }
                        good_tile = false;
                    } else {
                        good_tile = true;
                    }

                    if (good_tile) {
                        var layer = _.clone(water_layer);
                        layer.data = layer.data || {};
                        layer.name = 'lake';
                        layer.data.water = true;
                        layer.data.depth = (depth - lake_tile.ring);
                        layer.x = x;
                        layer.y = y;
                        set_obj_color_and_food(layer);

                        game.cells[x][y] = layer;

                        water_cells.push(layer);
                    }
                }
            });
        }
        return water_cells;
    };

    _c.generators.river = function (game, water_layer, location) {
        var water_cells = [];

        var tries = 20;

        for (var t = 0; t < tries; t++) {
            var side = 'top';//_c.randOption(['left', 'top']);
            var ending_tile, starting_tile;
            if (side == 'left') {
                starting_tile = _c.find_a_matching_tile(game, {location: 'left', y: location.y});
                ending_tile = _c.find_a_matching_tile(game, {location: 'right', y: location.y});
            } else {
                starting_tile = _c.find_a_matching_tile(game, {location: 'top', x: location.x, locked: true});
                ending_tile = _c.find_a_matching_tile(game, {location: 'bottom', x: location.x, locked: true});

                //starting_tile = _c.find_a_matching_tile(game, {location: 'top', x: location.x});
                //ending_tile = _c.find_a_matching_tile(game, {location: 'bottom', x: location.x});
            }

            function river_weighting_callback(x, y) {
                var cell = _c.tile(game, x, y);
                var weight = 0;

                if (cell.name == 'plains') weight += 6;
                if (cell.name == 'mountains') weight += 12;
                if (cell.name == 'forest') weight += 6;
                if (cell.density == 'medium') weight += 4;
                if (cell.density == 'large') weight += 8;
                if (cell.name == 'lake') weight -= 4;
                if (cell.name == 'sea') weight -= 8;
                if (_c.tile_has(cell, 'river')) weight += 8;

                return Math.max(0, weight);
            }

            var path = _c.path_from_to(game, starting_tile.x, starting_tile.y, ending_tile.x, ending_tile.y, river_weighting_callback);

            if (path && path.length) {
                for (var step = 0; step < path.length; step++) {
                    for (var thick = 0; thick < (water_layer.thickness || 1); thick++) {

                        var y = path[step][1];
                        var x = path[step][0];

                        if (side == 'left' && thick) {
                            y += thick;
                        } else if (side == 'top' && thick) {
                            x += (2 * thick);
                        }

                        var cell = _c.tile(game, x, y);
                        if (_c.tile_is_traversable(game, x, y)) {
                            var dir;
                            if (step > 0) {
                                var last_cell = _c.tile(game, path[step - 1]);
                                if (thick == 0) {
                                    dir = _c.direction_from_tile_to_tile(last_cell, cell) || {road_symbol: ""};
                                } else {
                                    dir = _c.direction_from_tile_to_tile(last_cell, _c.tile(game, path[step])) || {road_symbol: ""};
                                }
                            } else {
                                dir = {road_symbol: ""};
                            }
                            //TODO: Don't use pathfinding, instead make it snaking

                            var layer = _.clone(water_layer.data || {});
                            layer.name = 'river';
                            layer.x = x;
                            layer.y = y;
                            layer.water = true;
                            layer.depth = water_layer.thickness || 1;
                            layer.symbol = dir.road_symbol;
                            layer.title = water_layer.title || water_layer.name;

                            cell.additions = cell.additions || [];
                            cell.additions.push(layer);

                            set_obj_color_and_food(cell);
                        }
                    }
                }
                break;
            }
        }


        return water_cells;
    };

    _c.generators.sea = function (game, water_layer) {

        var width = water_layer.width || 4;
        var beach_width = water_layer.beach_width === undefined ? 2 : water_layer.beach_width;
        var start_x, end_x, start_y, end_y;

        if (water_layer.location == 'left') {
            start_x = 0;
            end_x = width * 2;
            start_y = 0;
            end_y = _c.rows(game);

        } else if (water_layer.location == 'right') {

            start_x = _c.cols(game) - (width * 2);
            end_x = _c.cols(game);
            start_y = 0;
            end_y = _c.rows(game);
        }

        //TODO: Add coves and land wiggles

        for (var y = start_y; y < end_y; y++) {
            for (var x = start_x + y % 2; x < end_x; x += 2) {

                if (_c.tile_is_traversable(game, x, y)) {
                    var layer = _.clone(water_layer || {});
                    layer.name = 'sea';
                    layer.x = x;
                    layer.y = y;
                    layer.water = true;
                    layer.food = water_layer.food || [2, 3, 4];
                    layer.data = layer.data || [];
                    layer.data.water = true;
                    layer.data.depth = (x - start_x) / (.4 * width);
                    layer.symbol = water_layer.symbol;
                    layer.title = water_layer.title || water_layer.name;
                    set_obj_color_and_food(layer);

                    game.cells[x][y] = layer;

                }
            }
        }

        //Add beaches
        if (water_layer.location == 'left') {
            start_x = width * 2 + 1;
            end_x = (width * 2) + (beach_width * 2) + 1;
        } else if (water_layer.location == 'right') {
            start_x = _c.cols(game) - (width * 2) - (beach_width * 2);
            end_x = _c.cols(game) - (width * 2);
        }

        for (var y = start_y; y < end_y; y++) {
            for (var x = start_x + y % 2; x < end_x; x += 2) {
                if (_c.tile_is_traversable(game, x, y)) {
                    var layer = {};
                    layer.name = 'beach';
                    layer.x = x;
                    layer.y = y;
                    layer.food = [0, 1, 2];
                    layer.color = water_layer.beach_color || ['#FEEDA0', '#F6E596', '#F9F1CE'];
                    set_obj_color_and_food(layer);
                    game.cells[x][y] = layer;
                }
            }
        }
    };

    _c.generators.city = function (game, location, city_info) {

        var building_tile_tries = Math.sqrt(city_info.population);
        var building_tile_radius_y = Math.pow(city_info.population, 1 / 3.2);
        var building_tile_radius_x = building_tile_radius_y * 1.5;
        var number_of_roads = city_info.road_count || Math.pow(city_info.population / 100, 1 / 4);

        var city_cells = [];

        //Build roads based on city size
        _c.generators.roads_from(game, number_of_roads, location);

        //Reset the city so it'll look the same independent of number of roads
        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);


        //Generate city tiles & surrounding tiles
        for (var i = 0; i < building_tile_tries; i++) {
            var x, y;
            x = location.x + _c.randInt(building_tile_radius_x) - (building_tile_radius_x / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius_y) - (building_tile_radius_y / 2) - 1;

            x = Math.floor(x);
            y = Math.floor(y);
            if (_c.tile_is_traversable(game, x, y, false)) {
                game.cells[x][y] = _.clone(city_info);
                game.cells[x][y].x = x;
                game.cells[x][y].y = y;
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
                        if (city_cells[neighbor.x] && city_cells[neighbor.x][neighbor.y]) {
                            //Already in array
                        } else {
                            city_cells.push(neighbor);
                        }
                    }
                })
            }
        }

        return city_cells;
    };


})(Battlebox);