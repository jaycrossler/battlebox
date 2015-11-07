(function (Battlebox) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,forces,buildings'.split(','),

        cols: 200,
        rows: 50,
        cell_size: 17,

        height: 'mountainous',

        terrain_options: [
            {name:'plains', ground:true, draw_type: 'flat', color:["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"], symbol:' '},
            {name:'mountains', density:'sparse', smoothness: 3, not_center:true, color:['brown'], impassible:true, symbol:'M'},
            {name:'forest', density:'sparse', not_center:true, color:['darkgreen','green'], data:{movement:'slow'}, symbol:'#'},
            {name:'lake', density:'sparse', smoothness:5, placement:'left', color:['#03f','#04b','#00d'], data:{water:true}, symbol:'-'},
            {name:'river', density:'small', thickness:.1, placement:'left', color:['#00f','#00e','#00d'], data:{water:true}, symbol:'/'}
        ],

        forces: [
            {name:'Attacker Main Army Force', side: 'Yellow', location:'random',
                troops:{soldiers:520, cavalry:230, siege:50}},

            {name:'Task Force Alpha', side: 'Yellow', symbol:'#A', location:'random',
                plan: 'run away', backup_strategy: 'bombard',
                troops:{soldiers:80, cavalry:20, siege:10}},

            {name:'Task Force Bravo', side: 'Yellow', symbol:'#B', location:'random',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops:{cavalry:20}},

            {name:'Task Force Charlie', side: 'Yellow', symbol:'#C', location:'random',
                plan: 'wander',
                troops:{cavalry:20}},

            {name:'Defender City Force', side: 'Pink', location:'center',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops:{soldiers:620, cavalry:40, siege:100}}
        ],

        buildings:[
            {name:'Large City', type:'city', population:3000, fortifications:20}
        ],

        variables: [
            {name:'test', initial: 1}
        ],

        functions_on_setup:[],
        functions_each_tick:[]
    };



    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);