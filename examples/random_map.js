var battlebox = null;

$(function () {
    var fight_seed = Helpers.getQueryVariable('fight');

    var game_options = new Battlebox('get_game_options');
    game_options.buildings[0].population = Helpers.randOption([1000,3000,7000,15000,60000,120000,300000,500000]);
    game_options.buildings[0].tightness = Helpers.randOption([.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.8,2,2.2,3]);


    battlebox = new Battlebox({fight_seed: fight_seed});
    $('canvas').focus();
    console.log(battlebox.log());
});