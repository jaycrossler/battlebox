(function (Battlebox) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,forces,buildings'.split(','),

        delay_between_ticks: 400,
        log_level_to_show: 2,

        cols: 260,
        rows: 90,
        cell_size: 9,
        cell_spacing: 1.1,
        cell_border: 0.01,
        transpose: false, //TODO: If using transpose, a number of other functions for placement should be tweaked

        render_style: 'outdoors', //TODO
        height: 'mountainous', //TODO

        terrain_options: [
            {name:'plains', ground:true, draw_type: 'flat', color:["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"], symbol:' '},
            {name:'mountains', density:'sparse', smoothness: 3, not_center:true, color:['gray', 'darkgray'], impassible:true, symbol:' '},
            {name:'forest', density:'sparse', not_center:true, color:['darkgreen','green'], data:{movement:'slow'}, symbol:' '},
            {name:'lake', density:'sparse', smoothness:5, placement:'left', color:['#03f','#04b','#00d'], data:{water:true}, symbol:'-'},
            {name:'river', density:'small', thickness:.1, placement:'left', color:['#00f','#00e','#00d'], data:{water:true}, symbol:'/'}
        ],

        forces: [
            {name:'Attacker Main Army Force', side: 'Yellow', location:'left', player:true,
                plan: 'invade city', backup_strategy: 'run away',
                troops:{soldiers:520, cavalry:230, siege:50}},

            {name:'Task Force Alpha', side: 'Yellow', symbol:'#A', location:'left', player: true,
                plan: 'invade city', backup_strategy: 'run away',
                troops:{soldiers:80, cavalry:20, siege:10}},

            {name:'Task Force Bravo', side: 'Yellow', symbol:'#B', location:'left', player:true,
                plan: 'invade city', backup_strategy: 'vigilant',
                troops:{cavalry:20}},

            {name:'Task Force Charlie', side: 'Yellow', symbol:'#C', location:'left', player:true,
                plan: 'look for treasure',
                troops:{cavalry:20}},


            {name:'Defender City Force', side: 'White', location:'center',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops:{soldiers:620, cavalry:40, siege:100}},

            {name:'Defender Bowmen', side: 'White', symbol:'A', location:'center',
                plan: 'defend city', backup_strategy: 'vigilant',
                troops:{soldiers:20, siege:20}},

            {name:'Defender Catapults', side: 'White', symbol:'B', location:'center',
                plan: 'defend city', backup_strategy: 'vigilant',
                troops:{soldiers:20, siege:40}},


            {name:'Sleeping Dragon', side: 'Red', symbol:'D', location:'impassible',
                plan: 'vigilant', backup_strategy: 'wait', size:3,
                troops:{adult_dragon:1}}

        ],

        //TODO: Use these in strength calculations
        troop_types: [
            {name: 'soldiers', side:'Yellow', range:1, speed: 40, strength:1, defense:2, weapon:'sword', armor:'armor', carrying:5},
            {name: 'soldiers', side:'all', range:1, speed: 30, strength:1.2, defense:1.8, weapon:'rapiers', armor:'armor', carrying:5},
            {name: 'cavalry', side:'all', range:1, speed: 70, strength:1.5, defense:1.5, weapon:'rapier', armor:'shields', carrying:2},
            {name: 'siege', title: 'siege units', side:'all', range:2, speed: 10, strength:5, defense:.5, weapon:'catapults', carrying:1},
            {name: 'adult_dragon', side:'all', range:3, speed: 120, strength:150, defense:300, weapon:'fire breath', armor:'impenetrable scales', carrying:2000}
        ],

        buildings:[
            {name:'Large City', title:'Anchorage', type:'city', population:20000, fortifications:20, location:'center'},
            {name:'Grain Storage', type:'storage', resources:{food:10000, gold:2, herbs:100}, location:'random'},
            {name:'Metal Storage', type:'storage', resources:{metal:1000, gold:2, ore:1000}, location:'random'},
            {name:'Cave Entrance', type:'dungeon', requires:{mountains:true}, location:'impassible'}
        ],

        variables: [
            {name:'test', initial: 1}
        ],

        functions_on_setup:[],
        functions_each_tick:[]
    };



    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);