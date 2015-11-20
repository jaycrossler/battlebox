var battlebox = null;

var second_city = {name: 'Small City', title: 'Fairbanks', type: 'city2', location: 'mid right',
            tightness:2, road_count:2, population: 10000,
            fortifications: {count:50, shape: 'circle', towers:4, radius:3.5}};


$(function () {
    var land_seed = Helpers.getQueryVariable('seed');
    var fight_seed = Helpers.getQueryVariable('fight');
    var population = Helpers.getQueryVariable('population');
    var cities = Helpers.getQueryVariable('cities');
    var forces = Helpers.getQueryVariable('forces');
    var forts = Helpers.getQueryVariable('forts');
    var tightness = Helpers.getQueryVariable('tightness');
    var placement = Helpers.getQueryVariable('placement');
    var desert = Helpers.getQueryVariable('desert');

    function custom_color_hex(game, cell, text, color, bg) {
        if (text == " ") {
            text = ' ';
        }

        return {text: text, color: color, bg: bg};
    }


    var game_options = new Battlebox('get_game_options');
    game_options.hex_drawing_callbacks.push(custom_color_hex);

    if (cities) {
        game_options.buildings.push(second_city)
    }

    if (forces) {
        if (forces = "none") {
            game_options.forces = [];
            game_options.game_over_time = undefined;
        }
    }

    if (population) {
        population = parseInt(population);
        game_options.buildings[0].population = population;
    } else {
        game_options.buildings[0].population = 1000;
    }

    if (tightness) {
        tightness = parseFloat(tightness);
        game_options.buildings[0].tightness = tightness;
    }

    if (placement) {
        game_options.buildings[0].location = placement;
    }

    if (forts) {
        forts = parseInt(forts);
        if (forts >= 1) {
            game_options.buildings[0].fortifications.push({
                count: 80,
                shape: 'square',
                radius: 6.5,
                towers: 8,
                starting_angle: 0
            });
        }
        if (forts >= 2) {
            game_options.buildings[0].fortifications.push({
                count: 90,
                shape: 'circle',
                radius: 10,
                towers: 10,
                starting_angle: .5
            });
        }
        if (forts >= 3) {
            game_options.buildings[0].fortifications.push({
                count: 260,
                shape: 'pentagon',
                radius: 17,
                towers: 10,
                starting_angle: .2
            });
        }
        if (forts >= 4) {
            game_options.buildings[0].fortifications.push({
                count: 380,
                shape: 'hexagon',
                radius: 23,
                towers: 30,
                starting_angle: 0
            });
        }
        if (forts >= 5) {
            game_options.buildings[0].fortifications.push({
                count: 500,
                shape: 'septagon',
                radius: 28,
                towers: 100,
                starting_angle: 0
            });
        }
        if (forts >= 6) {
            game_options.buildings[0].fortifications.push({
                count: 800,
                shape: 'octagon',
                radius: 32,
                towers: 100,
                starting_angle: 0
            });
        }
    }

    if (desert) {
        game_options.terrain_options = [
            {
                name: 'desert',
                ground: true,
                draw_type: 'flat',
                food: 0,
                color: ['#CC7917', '#CB6810'],
                symbol: ''
            },
            {
                name: 'dunes',
                density: 'sparse',
                food: [0, 1],
                color: ['#935614', '#A45A0A'],
                symbol: ' '
            }
        ];

        game_options.water_options = [
            {name: 'lake', density: 'small'},
            {name: 'lake', density: 'small'},
            {name: 'sea', location: 'right', width: 15}
        ]


    }

    battlebox = new Battlebox({rand_seed:land_seed || 42, fight_seed: fight_seed});
    $('canvas').focus();
    console.log(battlebox.log());
});