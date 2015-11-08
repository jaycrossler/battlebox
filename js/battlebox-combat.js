(function (Battlebox) {

    //TODO: Game still goes on if main player's force is killed - move to all autonomous on timer

    var _c = new Battlebox('get_private_functions');

    _c.entity_attacks_entity = function (game, attacker, defender, callback) {
        attacker._data.troops = attacker._data.troops || {};
        defender._data.troops = defender._data.troops || {};
        callback = callback || _c.log_message_to_user;

        var a_name = attacker._data.name || "Attacker";
        var a_side = attacker._data.side || "Side 1";
        var a_count = (attacker._data.troops.soldiers || 0) + (attacker._data.troops.cavalry || 0) + (attacker._data.troops.siege || 0) + (1000 * (attacker._data.troops.adult_dragon || 0));

        var d_name = defender._data.name || "Defender";
        var b_side = defender._data.side || "Side 2";
        var d_count = (defender._data.troops.soldiers || 0) + (defender._data.troops.cavalry || 0) + (defender._data.troops.siege || 0) + (1000 * (defender._data.troops.adult_dragon || 0));

        var enemies_alive;
        var message = "";
        var game_over_side;

        if (a_count >= d_count) {
            defender.is_dead = true;
            _c.remove_entity(game, defender);

            message = "<b>" +a_name + " ("+a_side+", size "+a_count+")</b> wins attacking "+ d_name + " ("+b_side+", size "+d_count+")";

            enemies_alive = _c.find_unit_status(game, attacker, {side: 'enemy', return_multiple:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = attacker._data.side;
            }
            callback(game, message, 3, a_side);

        } else {
            attacker.is_dead = true;
            _c.remove_entity(game, attacker);

            message = a_name + " ("+a_side+", size "+a_count+") loses attacking <b>"+ d_name + " ("+b_side+", size "+d_count+")</b>";

            enemies_alive = _c.find_unit_status(game, defender, {side: 'enemy', return_multiple:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = defender._data.side;
            }

            callback(game, message, 3, b_side);
        }

        if (game_over_side) {
            _c.game_over(game, game_over_side);
        }

    }



})(Battlebox);