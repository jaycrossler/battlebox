(function (Battlebox) {

    function game_over_function(game) {
        console.log("GAME OVER:");
        //TODO: Make some handy reference functions to easily work with results
    }

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        game_over_time: 600,
        delay_to_pillage: 80,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,water_options,forces,buildings'.split(','),

        delay_between_ticks: 50,
        log_level_to_show: 4,

        cols: 260,
        rows: 90,
        cell_size: 10,
        cell_spacing: 1,
        cell_border: 0,
        transpose: false, //TODO: If using transpose, a number of other functions for placement should be tweaked

        render_style: 'outdoors', //TODO
        height: 'mountainous', //TODO

        sides: [
            {
                side: 'Yellow', player: true, plan: 'invade city', backup_strategy: 'vigilant',
                face_options: {rand_seed: 42, race: 'Human'}, //TODO
                morale: 10,  //TODO
                communication_speed: 1, //TODO
                try_to_loot: true, try_to_pillage: true,
                goals: {weak_enemies: 7, loot: 3, all_enemies: 4, city: 2, friendly_units: 2, farm: 1, population: 1}
            },
            {
                side: 'White', home_city: 'Anchorage', face_options: {race: 'Elf'},
                plan: 'defend city', backup_strategy: 'vigilant', morale: 15,
                goals: {weak_enemies: 7, towers: 6, walls: 5, all_enemies: 4, city: 3}
            }
        ],

        terrain_options: [
            {name: 'plains', ground: true, draw_type: 'flat', color: ["#d0efc6", "#cfefc6", "#d1eec6"], symbol: ''},
            {
                name: 'mountains',
                density: 'medium',
                smoothness: 3,
                not_center: true,
                color: ['#b1c3c3', '#b3c4c4', '#8b999c'],
                impassable: true,
                symbol: ' '
            },
            {name: 'forest', density: 'sparse', not_center: true, color: ['#85a982', '#7B947A', '#83A283'], data: {movement: 'slow'}, symbol: ' '}
        ],

        water_options: [
            {name: 'lake', density: 'medium', location: 'left'},
            {name: 'lake', density: 'large', location: 'mid left'},
            {name: 'lake', density: 'small', location: 'mid right', symbol: '~'},
            {name: 'sea', location: 'right', width: 5},
            {name: 'river', density: 'small', thickness: 1, location: 'mid left'},
//            {name:'river', density:'small', thickness:1, location:'mid right'},
//            {name:'river', title: 'Snake River', density:'medium', thickness:2, location:'center'},
            {name: 'river', title: 'Snake River', density: 'medium', thickness: 2, location: 'center'}
        ],

        forces: [
            {
                name: 'Attacker Main Army', side: 'Yellow', location: 'left', player: true,
                //goals: {weak_enemies: 6, loot: 4, all_enemies: 7, explore: 2, city: 3},
                troops: {soldiers: 520, cavalry: 230, siege: 50}
            },
            {
                name: 'Task Force Alpha', side: 'Yellow', symbol: '#A', location: 'left', player: true,
                leader: {name: 'General Vesuvius', face_options: {race: 'Demon', age: 120}}, //TODO
                //goals: {weak_enemies: 7, loot: 4, all_enemies: 5, explore: 2, city: 3},
                troops: [
                    {name: 'soldiers', count: 80, experience: 'veteran', victories: 12},
                    {name: 'cavalry', count: 20, experience: 'veteran', victories: 13},
                    {name: 'siege', count: 10, experience: 'master', victories: 23}
                ]
            },
            {
                name: 'Task Force Bravo', side: 'Yellow', symbol: '#B', location: 'left', player: true,
                troops: {cavalry: 20}
            },
            {
                name: 'Task Force Charlie', side: 'Yellow', symbol: '#C', location: 'left', player: true,
                troops: {cavalry: 20}
            },
            {
                name: 'Task Force Delta', side: 'Yellow', symbol: '#D', location: 'left', player: true,
                troops: {cavalry: 20}
            },
            {
                name: 'Task Force Echo', side: 'Yellow', symbol: '#E', location: 'left', player: true,
                troops: {cavalry: 20}
            },
            //------------------------------
            {
                name: 'Defender City Force', side: 'White', location: 'city',
                plan: 'seek closest',
                troops: {soldiers: 620, cavalry: 40, siege: 100}
            },
            {
                name: 'Defender Bowmen 1', side: 'White', symbol: '1', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 2', side: 'White', symbol: '2', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 3', side: 'White', symbol: '3', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 4', side: 'White', symbol: '4', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 5', side: 'White', symbol: '5', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 6', side: 'White', symbol: '6', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 7', side: 'White', symbol: '7', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Bowmen 8', side: 'White', symbol: '8', location: 'city',
                troops: {soldiers: 20, siege: 20}
            },
            {
                name: 'Defender Catapults', side: 'White', symbol: 'B', location: 'city',
                troops: {soldiers: 20, siege: 40}
            },
            //----------------------------
            {
                name: 'Sleeping Dragon',
                side: 'Red',
                symbol: '}O{',
                location: 'impassable',
                not_part_of_victory: true,
                plan: 'wander',
                backup_strategy: 'wait',
                size: 3,
                move_through_impassable: true,
                try_to_loot: true,
                try_to_pillage: true,
                troops: {adult_dragon: 1}
            }
        ],

        forces_data: [
            {
                name: 'soldiers',
                side: 'Yellow',
                speed: 40,
                strength: 1.2,
                defense: 1.8,
                weapon: 'rapier'  //TODO: Use in messages
            },
            {
                name: 'soldiers',
                side: 'White',
                speed: 30,
                strength: 1,
                defense: 2,
                weapon: 'halberds'
            },
            {
                name: 'soldiers',
                side: 'all',
                range: 1,
                vision: 5,
                speed: 30,
                strength: 1,
                defense: 2,
                weapon: 'sword',
                armor: 'armor',
                carrying: 5
            },
            {
                name: 'cavalry',
                side: 'all',
                range: 1,
                vision: 6,
                speed: 70,
                initiative: 80,  //Note: Initiative can be different than speed
                strength: 1.5,
                defense: 1.5,
                weapon: 'rapier',
                armor: 'shields',
                carrying: 2
            },
            {
                name: 'siege',
                title: 'siege units',
                side: 'all',
                range: 2,
                vision: 7,
                speed: 25,
                ranged_strength: 5,
                strength: .5,
                defense: .5,
                weapon: 'catapults',
                carrying: 1
            },
            {
                name: 'adult_dragon',
                side: 'all',
                range: 2,
                vision: 7,
                speed: 120,
                strength: 150,
                ranged_strength: 50,
                defense: 300,
                weapon: 'fire breath',
                armor: 'impenetrable scales',
                carrying: 2000
            }
        ],

        buildings: [
            {
                name: 'Large City', title: 'Anchorage', type: 'city2', location: 'center',
                tightness: 1, population: 20000, side: 'White',
                fortifications: []
            },
            {name: 'Grain Storage', type: 'storage', resources: {food: 10000, gold: 2, herbs: 100}, location: 'random'},
            {name: 'Metal Storage', type: 'storage', resources: {metal: 1000, gold: 2, ore: 1000}, location: 'random'},
            {name: 'Cave Entrance', type: 'dungeon', requires: {mountains: true}, location: 'impassable'}
        ],

        variables: [
            {name: 'test', initial: 1}
        ],

        functions_on_setup: [],
        functions_each_tick: [],
        hex_drawing_callbacks: [],
        game_over_function: game_over_function
    };


    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);