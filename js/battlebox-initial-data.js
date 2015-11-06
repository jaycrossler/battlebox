(function (Battlebox) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,forces,buildings'.split(','),

        cols: 200,
        rows: 50,
        cell_size: 15,

        terrain_options: [
            {name:'plains', ground:true, draw_type: 'flat', color:["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"], symbol:' '},
            {name:'mountains', density:'sparse', smoothness: 3, not_center:true, color:['brown'], impassible:true, symbol:'M'},
            {name:'forest', density:'sparse', not_center:true, color:['darkgreen','green'], data:{movement:'slow'}, symbol:'#'},
            {name:'lake', density:'sparse', smoothness:5, placement:'left', color:['#03f','#04b','#00d'], data:{water:true}, symbol:'-'},
            {name:'river', density:'small', placement:'left', color:['#00f','#00e','#00d'], data:{water:true}, symbol:'/'}
        ],

        forces: [
            {name:'Attacker Main Army Force', side: 'Red', location:'random', troops:[{name:'soldiers', amount:520}, {name:'cavalry', amount:230}, {name:'siege', amount:50}]},
            {name:'Task Force Alpha', side: 'Red', symbol:'#A', location:'random', troops:[{name:'soldiers', amount:20}, {name:'cavalry', amount:50}]},
            {name:'Task Force Bravo', side: 'Red', symbol:'#B', location:'random', troops:[{name:'soldiers', amount:20}, {name:'cavalry', amount:50}]},
            {name:'Task Force Charlie', side: 'Red', symbol:'#C', location:'random', troops:[{name:'soldiers', amount:20}, {name:'cavalry', amount:50}]},

            {name:'Defender City Force', side: 'Blue', location:'center', troops:[{name:'soldiers', amount:320}, {name:'cavalry', amount:290}, {name:'siege', amount:150}]}
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