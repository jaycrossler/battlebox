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

    var game_options = new Battlebox('get_game_options');
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

    if (forts) {
        forts = parseInt(forts);
        if (forts >= 1) {
            game_options.buildings[0].fortifications.push({
                count: 40,
                shape: 'square',
                radius: 6.5,
                towers: 8,
                starting_angle: .125
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
                radius: 18,
                towers: 10,
                starting_angle: .2
            });
        }
        if (forts >= 4) {
            game_options.buildings[0].fortifications.push({
                count: 380,
                shape: 'hexagon',
                radius: 26,
                towers: 30,
                starting_angle: 0
            });
        }


    }

    battlebox = new Battlebox({rand_seed:land_seed || 42, fight_seed: fight_seed});
    $('canvas').focus();
    console.log(battlebox.log());
});