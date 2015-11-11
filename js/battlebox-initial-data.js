(function (Battlebox) {

    function game_over_function(game) {
        console.log("GAME OVER:");
        //TODO: Make some handy reference functions to easily work with results
    }

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        game_over_time: 1000,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,water_options,forces,buildings'.split(','),

        delay_between_ticks: 50,
        log_level_to_show: 2,

        cols: 260,
        rows: 90,
        cell_size: 10,
        cell_spacing: 1,
        cell_border: .01,
        transpose: false, //TODO: If using transpose, a number of other functions for placement should be tweaked

        render_style: 'outdoors', //TODO
        height: 'mountainous', //TODO

        terrain_options: [
            {name: 'plains', ground: true, draw_type: 'flat', color: ["#d0efc6", "#cfefc6", "#d1eec6"], symbol: ''},
            {name: 'mountains', density: 'medium', smoothness: 3, not_center: true, color: ['#b1c3c3', '#b3c4c4', '#8b999c'], impassible: true, symbol: ' '},
            {name: 'forest', density: 'sparse', not_center: true, color: ['#85a982', '#7B947A', '#83A283'], data: {movement: 'slow'}, symbol: ' '}
        ],

        water_options: [
            {name: 'lake', density: 'medium', location: 'left', data: {lake: true}},
            {name: 'lake', density: 'large', location: 'mid left', data: {lake: true}},
            {name: 'lake', density: 'small', location: 'mid right', island: true, symbol: '~'},
            {name: 'river', density: 'small', thickness: 1, location: 'mid left'},
//            {name:'river', density:'small', thickness:1, location:'mid right'},
//            {name:'river', title: 'Snake River', density:'medium', thickness:2, location:'center'},
            {name: 'river', title: 'Snake River', density: 'medium', thickness: 2, location: 'center'}
        ],

        forces: [
            {name: 'Attacker Main Army Force', side: 'Yellow', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'run away', try_to_loot: true, try_to_pillage: true,
                troops: {soldiers: 520, cavalry: 230, siege: 50}},

            {name: 'Task Force Alpha', side: 'Yellow', symbol: '#A', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'run away', try_to_loot: true,
                troops: {soldiers: 80, cavalry: 20, siege: 10}},

            {name: 'Task Force Bravo', side: 'Yellow', symbol: '#B', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'vigilant',
                troops: {cavalry: 20}},

            {name: 'Task Force Charlie', side: 'Yellow', symbol: '#C', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'invade_city', try_to_loot: true, try_to_pillage: true,
                troops: {cavalry: 20}},


            {name: 'Defender City Force', side: 'Black', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 620, cavalry: 40, siege: 100}},

            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},

            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},
            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},
            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},

            {name: 'Defender Catapults', side: 'Black', symbol: 'B', location: 'city',
                plan: 'run away', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 40}},


            {name: 'Sleeping Dragon', side: 'Red', symbol: 'D', location: 'impassible', not_part_of_victory: true,
                plan: 'vigilant', backup_strategy: 'wait', size: 3, move_through_impassibles: true,
                troops: {adult_dragon: 1}}

        ],

        //TODO: Use these in strength calculations
        troop_types: [
            {name: 'soldiers', side: 'Yellow', range: 1, speed: 40, strength: 1, defense: 2, weapon: 'sword', armor: 'armor', carrying: 5},
            {name: 'soldiers', side: 'all', range: 1, speed: 30, strength: 1.2, defense: 1.8, weapon: 'rapiers', armor: 'armor', carrying: 5},
            {name: 'cavalry', side: 'all', range: 1, speed: 70, strength: 1.5, defense: 1.5, weapon: 'rapier', armor: 'shields', carrying: 2},
            {name: 'siege', title: 'siege units', side: 'all', range: 2, speed: 10, strength: 5, defense: .5, weapon: 'catapults', carrying: 1},
            {name: 'adult_dragon', side: 'all', range: 3, speed: 120, strength: 150, defense: 300, weapon: 'fire breath', armor: 'impenetrable scales', carrying: 2000}
        ],

        buildings: [
//            {name: 'Large City', title: 'Anchorage', type: 'city2', tightness:1.5, population: 50000, fortifications: 20, location: 'center'},
//            {name: 'Small City', title: 'Fairbanks', type: 'city2', tightness:3, road_count:1, population: 40000, fortifications: 20, location: 'mid right'},

            {name: 'Grain Storage', type: 'storage', resources: {food: 10000, gold: 2, herbs: 100}, location: 'random'},
            {name: 'Metal Storage', type: 'storage', resources: {metal: 1000, gold: 2, ore: 1000}, location: 'random'},
            {name: 'Cave Entrance', type: 'dungeon', requires: {mountains: true}, location: 'impassible'}
        ],

        variables: [
            {name: 'test', initial: 1}
        ],

        functions_on_setup: [],
        functions_each_tick: [],
        game_over_function: game_over_function
    };


    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);