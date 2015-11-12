var battlebox = null;

$(function () {
    var fight_seed = Helpers.getQueryVariable('fight');

    battlebox = new Battlebox({fight_seed: fight_seed});
    $('canvas').focus();
    console.log(battlebox.log());
});