(function (Battlebox) {
    //TODO: Work with multiple save games

    var _c = new Battlebox('get_private_functions');
    var cookie_name = 'battlebox_1';

    function read_cookie(name) {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        result && (result = JSON.parse(result[1]));
        return result;
    }

    function bake_cookie(name, value) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 30);
        var cookie = [name, '=', JSON.stringify(value), '; expires=.', exdate.toUTCString(), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
        document.cookie = cookie;
    }

    _c.autosave_if_time = function (game) {
        if (game.game_options.autosave) {
            game.data.autosave_counter = game.data.autosave_counter || 0;
            game.data.autosave_counter += 1;
            if (game.data.autosave_counter >= game.game_options.autosave_every) {
                _c.save(game, 'auto');
                game.data.autosave_counter = 0;
            }
        }
    };
    _c.load = function (game, loadType) {
        var loaded_game_data;
        var game_was_loaded = false;

        if (loadType == 'cookie') {
            loaded_game_data = read_cookie(cookie_name);
            if (loaded_game_data) {
                game.logMessage('Loaded saved game from cookie. Save system switching to localStorage.');
            } else {
                console.info('Unable to find cookie');
                return false;
            }
        } else if (loadType == 'localStorage') {
            var loaded_game_data_str;
            try {
                loaded_game_data_str = localStorage.getItem(cookie_name);
                if (loaded_game_data_str) {
                    loaded_game_data = JSON.parse(loaded_game_data_str);
                }
            } catch (err) {
                console.info('Cannot access localStorage - browser may not support localStorage, or storage may be corrupt')
            }
            if (loaded_game_data) {
                game.logMessage('Loaded saved game from localStorage')
            } else {
                console.info('Unable to find variables in localStorage. Attempting to load cookie.')
                _c.load(game, 'cookie');
                return false;
            }
        } else if (loadType == 'import') {
            //take the import string, decompress and parse it
            var compressed = document.getElementById('impexpField').value;
            var decompressed = LZString.decompressFromBase64(compressed);

            loaded_game_data = JSON.parse(decompressed);
            game.logMessage('Imported saved game');
        }

        if (loaded_game_data && loaded_game_data.rand_seed && loaded_game_data.variables && loaded_game_data.resources && loaded_game_data.resources.food !== undefined) {
            //Seems like a valid data structure
            game.data = loaded_game_data;
            game_was_loaded = true;
            _c.initialize_ui_display(game);
            _c.update_ui_display(game);
        } else {
            game.logMessage('No valid saved game data available, starting with defaults');
        }

        return game_was_loaded;

    };
    _c.save = function (game, saveType) {
        bake_cookie(cookie_name, game.data);
        try {
            localStorage.setItem(cookie_name, JSON.stringify(game.data));
        } catch (err) {
            game.logMessage('Cannot access localStorage to save game - browser may be old or storage may be corrupt');
        }

        //Update console for debugging, also the player depending on the type of save (manual/auto)
        if (saveType == 'export') {
            var string_data = JSON.stringify(game.data);
            var compressed = LZString.compressToBase64(string_data);
            console.log('Compressed Save from ' + string_data.length + ' to ' + compressed.length + ' characters');
            document.getElementById('impexpField').value = compressed;
            game.logMessage('Saved game and exported to base64', true);
        }
        if (read_cookie(cookie_name) || localStorage.getItem(cookie_name)) {
//            console.log('Savegame exists');
            if (saveType == 'auto') {
                game.logMessage('Autosaved', false);
            } else if (saveType == 'manual') {
                game.logMessage('Saved game manually', true);
            }
        }
    };

    _c.toggleAutosave = function (game, saveType) {
        //TODO: Toggle autosave and have some visual indicator switch
    };
    _c.deleteSave = function (game) {
        bake_cookie(cookie_name, '');
        localStorage.setItem(cookie_name, '');
    };
    _c.reset = function (saveType) {
    };

})(Battlebox);