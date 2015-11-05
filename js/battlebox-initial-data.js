(function (Battlebox) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,

        functions_on_setup:[],
        functions_each_tick:[],

        buildings:[]

    };



    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);