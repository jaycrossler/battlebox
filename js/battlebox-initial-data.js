(function (Battlebox) {

    function game_over_function(game) {
        console.log("GAME OVER:");
        //TODO: Make some handy reference functions to easily work with results
    }

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        game_over_time: 500,
        delay_to_pillage: 80,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,water_options,forces,buildings'.split(','),

        delay_between_ticks: 20,
        delay_to_set_on_battle: 500,
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
                face_options: {race: 'Human'}, //TODO
                morale: 10,  //TODO - Should it also take morale from leaders?
                communication_range: 10,
                try_to_loot: true, try_to_pillage: true,
                starting_food: 5,
                goals: {
                    weak_enemies: 7,
                    loot: 3,
                    all_enemies: 4,
                    city: 2,
                    explore: 3,
                    friendly_units: -2,
                    farm: 1,
                    population: 1
                }
            },
            {
                side: 'White', home_city: 'Anchorage', face_options: {race: 'Elf'},
                plan: 'defend city', backup_strategy: 'vigilant', morale: 15,
                starting_food: 5,
                goals: {
                    towers: 6, walls: 5, city: 3,
                    friendly_units: -8//TODO: Strong_enemies Doesn't seem to matter)
                }
            }
        ],

        terrain_options: [
            {
                name: 'plains',
                ground: true,
                draw_type: 'flat',
                food: [3, 4, 5],
                color: ["#d0efc6", "#cfefc6", "#d1eec6"],
                symbol: ''
            },
            {
                name: 'mountains',
                density: 'medium',
                smoothness: 3,
                food: [0, 1],
                not_center: true,
                color: ['#b1c3c3', '#b3c4c4', '#8b999c'],
                impassable: true,
                symbol: ' '
            },
            {
                name: 'forest',
                density: 'sparse',
                food: [5, 6],
                color: ['#85a982', '#7B947A', '#83A283'],
                data: {movement: 'slow'},
                symbol: ' '
            }
        ],

        water_options: [
            {name: 'lake', density: 'medium', location: 'left', food: [1, 2, 3]},
            {name: 'lake2', density: 'large', location: 'mid left', food: [2, 3]},
            {name: 'lake', density: 'small', location: 'mid right', symbol: '~', food: [2, 3, 4]},
            {name: 'sea', location: 'right', width: 5, food: [4, 5, 6, 7], beach_width: 3},
            {name: 'river', density: 'small', thickness: 1, food: [2, 3], location: 'mid left'},
            {name: 'river', title: 'Snake River', density: 'medium', thickness: 2, food: [3, 4], location: 'center'}
        ],

        forces: [
            {
                name: 'Attacker Main Army', side: 'Yellow', location: 'left', player: true,
                leader: {name: 'Athena', face_options: {gender: 'Female', age: 50}},
                troops: {soldiers: 600, cavalry: 200, siege: 100}
                //,strategy_post_plan_callback: function (move, unit_vision) {
                //    var unit = this;
                //    console.log("[" + unit._symbol + "] ");
                //    //console.table(move);
                //
                //    if (unit.fatigue > 0) {
                //        console.log('[' + battlebox.data.tick_count + '] Fatigue :' + unit.fatigue + ', Units:' + unit.unit_count);
                //    }
                //
                //    return move;
                //}
            },
            {
                name: 'Task Force Alpha', side: 'Yellow', symbol: '#A', location: 'left', player: true,
                leader: {name: 'Vesuvius', face_options: {race: 'Demon', age: 120}},
                //goals: {weak_enemies: 7, loot: 4, all_enemies: 5, explore: 2, city: 3},
                troops: [
                    {name: 'soldiers', count: 10, experience: 'veteran', victories: 12}, //TODO: Experience, victories
                    {name: 'cavalry', count: 10, experience: 'veteran', victories: 13},
                    {name: 'archers', count: 80, experience: 'master', victories: 23}
                ]
            },
            {
                name: 'Task Force Bravo', side: 'Yellow', symbol: '#B', location: 'left', player: true,
                troops: {cavalry: 125}
            },
            {
                name: 'Task Force Charlie', side: 'Yellow', symbol: '#C', location: 'left', player: true,
                troops: {cavalry: 125}
            },
            {
                name: 'Task Force Delta', side: 'Yellow', symbol: '#D', location: 'left', player: true,
                troops: {cavalry: 125}
            },
            {
                name: 'Task Force Echo', side: 'Yellow', symbol: '#E', location: 'left', player: true,
                troops: {cavalry: 125}
            },
            //------------------------------
            {
                name: 'Defender City Force', side: 'White', location: 'city', symbol: "!",
                leader: {name: 'Protectron', face_options: {race: 'Navi', age: 120}},
                troops: {soldiers: 500, cavalry: 40, archers: 100}
            },
            {
                name: 'Defender Bowmen 1', side: 'White', symbol: '1', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 2', side: 'White', symbol: '2', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 3', side: 'White', symbol: '3', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 4', side: 'White', symbol: '4', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 5', side: 'White', symbol: '5', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 6', side: 'White', symbol: '6', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 7', side: 'White', symbol: '7', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Bowmen 8', side: 'White', symbol: '8', location: 'city',
                troops: {soldiers: 20, archers: 20}
            },
            {
                name: 'Defender Catapults', side: 'White', symbol: '9', location: 'city',
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
                vision: 4,
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
                vision: 4,
                speed: 70,
                initiative: 80,  //Note: Initiative can be different than speed
                strength: 1.5,
                defense: 1.5,
                weapon: 'rapier',
                armor: 'shields',
                carrying: 2
            },
            {
                name: 'archers',
                title: 'bowmen',
                side: 'all',
                range: 2,
                vision: 5,
                speed: 50,
                initiative: 80,
                ranged_strength: 3,
                strength: .5,
                defense: .8,
                weapon: 'longbows',
                carrying: 2
            },
            {
                name: 'siege',
                title: 'siege units',
                side: 'all',
                range: 2,
                vision: 5,
                speed: 25,
                ranged_strength: 5,
                strength: .5,
                defense: .5,
                weapon: 'catapults',
                area_attacks: true,
                carrying: 1
            },
            {
                name: 'zombies',
                title: 'zombie swarm',
                side: 'all',
                eat_the_dead: true,
                range: 1,
                vision: 2,
                speed: 20,
                strength: 3,
                defense: .5,
                weapon: 'bites',
                carrying: 1
            },

            {
                name: 'adult_dragon',
                side: 'all',
                range: 2,
                vision: 6,
                speed: 120,
                strength: 150,
                ranged_strength: 50,
                defense: 300,
                weapon: 'fire breath',
                armor: 'impenetrable scales',
                area_attacks: true,
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