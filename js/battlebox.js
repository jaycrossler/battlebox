var Battlebox = (function ($, _, Helpers, maths) {
    //Uses jquery and Underscore

    //-----------------------------
    //Private Global variables
    var version = '0.0.1',
        summary = 'HTML game engine to simulate a battlefield for multiple troops to combat upon.',
        author = 'Jay Crossler - http://github.com/jaycrossler',
        file_name = 'battlebox.js';

    var _data = {};
    var _game_options = {};

    //-----------------------------
    //Initialization
    function BattleboxClass(option1, option2, option3) {
        this.version = file_name + ' (version ' + version + ') - ' + summary + ' by ' + author;
        this.timing_log = [];
        this.game_options = null;
        this.times_game_drawn = 0;
        this.initialization_seed = null;

        return this.api(option1, option2, option3);
    }

    BattleboxClass.prototype.api = function (option1, option2, option3) {
        if (option1 == 'get_private_functions') {
            return this._private_functions;
        } else if (option1 == 'add_game_option') {
            _game_options[option2] = _game_options[option2] || [];
            if (_.isArray(option3)) {
                _game_options[option2] = _game_options[option2].concat(option3);
            } else {
                _game_options[option2].push(option3);
            }
        } else if (option1 == 'set_game_option') {
            _game_options[option2] = option3;
        } else if (option1 == 'get_game_options') {
            return _game_options;
        } else if (option1 == 'get_game_option_category') {
            return _game_options[option2];
        } else if (option1 == '') {
            //Class initialized
        } else {
            this.drawOrRedraw(option1, option2, option3);
        }
    };

    BattleboxClass.prototype.data = _data;

    BattleboxClass.prototype.initializeOptions = function (option_type, options) {
        if (option_type == 'game_options') {
            _game_options = options;
        }
    };

    BattleboxClass.prototype.drawOrRedraw = function (game_options) {
        //Begin timing loop
        var timing_start = window.performance.now();
        var game = this;

        //Set up initialization data if not previously set
        if (game.game_options === null) {
            game.initialization_seed = null;
        }
        game.initialization_options = game_options || game.initialization_options || {};
        game.game_options = $.extend({}, game.game_options || _game_options, game_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        game_options = game_options || {};
        var rand_seed = game_options.rand_seed || game.initialization_seed || Math.floor(Math.random() * 100000);
        game.initialization_seed = rand_seed;
        game.initialization_options.rand_seed = rand_seed;
        game.randomSetSeed(rand_seed);

        if (!game.data.gui_drawn && game._private_functions.initialize_display && game._private_functions.load) {
            var game_was_loaded = game._private_functions.load(game, 'localStorage');
            game._private_functions.initialize_data(game);
            if (!game_was_loaded) {
                game._private_functions.initialize_display(game);
            }
            game.data.gui_drawn = true;
        }

        //Run all functions added by plugins
        _.each(game.game_options.functions_on_setup, function (func) {
            func(game);
        });

        //Begin Game Simulation
        game.start(game.game_options);

        //Log timing information
        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        game.timing_log.push({name: "Game UI built", elapsed: time_elapsed, times_redrawn: game.times_game_drawn});
    };

    //-----------------------------
    //Supporting functions
    BattleboxClass.prototype.log = function (showToConsole, showHTML) {
        var log = "Battlebox: [seed:" + this.game_options.rand_seed + " #" + this.times_game_drawn + "]";
        _.each(this.timing_log, function (log_item) {
            if (log_item.name == 'exception') {
                if (log_item.ex && log_item.ex.name) {
                    log += "\n -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                } else if (log_item.msg) {
                    log += "\n -- EXCEPTION: " + log_item.msg;
                } else {
                    log += "\n -- EXCEPTION";
                }
            } else if (log_item.elapsed) {
                log += "\n - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
            } else {
                log += "\n - " + log_item.name;
            }
        });

        if (showToConsole) console.log(log);
        if (showHTML) log = log.replace(/\n/g, '<br/>');
        return log;
    };
    BattleboxClass.prototype.logMessage = function (msg, showToConsole) {
        if (_.isString(msg)) msg = {name: msg};

        this.timing_log.push(msg);
        if (showToConsole) {
            console.log(JSON.stringify(msg));
        }
        if (this._private_functions.log_display) {
            this._private_functions.log_display(this);
        }
    };
    BattleboxClass.prototype.lastTimeDrawn = function () {
        var time_drawn = 0;
        var last = _.last(this.timing_log);
        if (last) time_drawn = last.elapsed;

        return time_drawn;
    };

    BattleboxClass.prototype.getSeed = function (showAsString) {
        var result = this.initialization_options || {};
        return showAsString ? JSON.stringify(result) : result;
    };

    BattleboxClass.prototype.start = function (game_options) {
        if (this._private_functions.start_game_loop) {
            this._private_functions.start_game_loop(this, game_options);
        } else {
            throw "Game loop not found";
        }
    };
    BattleboxClass.prototype.stop = function () {
        if (this._private_functions.stop_game_loop) {
            this._private_functions.stop_game_loop(this);
        }
    };

    //----------------------
    //Random numbers
    BattleboxClass.prototype.randomSetSeed = function (seed) {
        this.game_options = this.game_options || {};
        this.game_options.rand_seed = seed || Math.random();
    };

    function random(game_options) {
        game_options = game_options || {};
        game_options.rand_seed = game_options.rand_seed || Math.random();
        var x = Math.sin(game_options.rand_seed++) * 300000;
        return x - Math.floor(x);
    }

    function randInt(max, game_options) {
        max = max || 100;
        return parseInt(random(game_options) * max + 1);
    }

    function randOption(options, game_options, dontUseVal) {
        var len = options.length;
        var numChosen = randInt(len, game_options) - 1;
        var result = options[numChosen];
        if (dontUseVal) {
            if (result == dontUseVal) {
                numChosen = (numChosen + 1) % len;
                result = options[numChosen];
            }
        }
        return result;
    }

    function randHistogram(center, tries, game_options, min, max) {
        //NOTE: This breaks down when 'center' is below 5% or above 95% (depending on how many tries are used), for that use randAverage
        var closest = 1;
        min = min || 0;
        max = max || 1;
        var multiplier = max - min;
        var modified_center = (center - min) / multiplier;

        for (var i = 0; i < tries; i++) {
            var roll = random(game_options);
            if (Math.abs(roll - modified_center) < Math.abs(closest - modified_center)) {
                closest = roll;
            }
        }
        return (closest * multiplier) + min;
    }
    function randAverage(rolls, chance, stddev, game_options) {
        stddev = stddev || 5;
        var expected = chance * rolls;
        var expected_modifier = randHistogram(.5, stddev, game_options);

        return expected * expected_modifier * 2;
    }
    function randRange (minVal, maxVal, game_options, floatVal) {
        //optional Floatval specifies number of decimal points
        var randVal = minVal + (random(game_options) * (maxVal - minVal + 1));
        return (floatVal !== undefined) ? Math.round(randVal - .5) : randVal.toFixed(floatVal);
    }

    function randManyRolls(rolls, chance, game_options) {
        var successes = 0;
        if (rolls < 100) {
            for (var i = 0; i < rolls; i++) {
                if (random(game_options) < chance) successes++;
            }
        } else {
            //Note, using two different randomization options for large numbers, both have different accuracies/stddevs
            if (chance < .07 || chance > .93) {
                successes = randAverage(rolls, chance, 3, game_options);
            } else {
                successes = randHistogram(rolls * chance, Math.pow(rolls, 1 / 2), game_options, 0, rolls);
            }
        }

        return Math.round(successes);
    }

    BattleboxClass.prototype._private_functions = {
        random: random,
        randInt: randInt,
        randOption: randOption,
        randRange: randRange,
        randManyRolls: randManyRolls,
        randHistogram: randHistogram
    };

    return BattleboxClass;
})($, _, Helpers, maths);

Battlebox.initializeOptions = function (option_type, options) {
    var civ_pointer = new Battlebox('');
    civ_pointer.initializeOptions(option_type, options);
};