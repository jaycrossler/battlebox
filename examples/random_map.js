var battlebox = null;

$(function () {
    var fight_seed = Helpers.getQueryVariable('fight');

    battlebox = new Battlebox({rand_seed:42, fight_seed: fight_seed});
    $('canvas').focus()
});