(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    _c.entity_attacks_entity = function (game, attacker, defender, callback) {
        attacker._data.troops = attacker._data.troops || {};
        defender._data.troops = defender._data.troops || {};
        callback = callback || _c.log_message_to_user;

        var a_count = (attacker._data.troops.soldiers || 0) + (attacker._data.troops.cavalry || 0) + (attacker._data.troops.siege || 0);
        var d_count = (defender._data.troops.soldiers || 0) + (defender._data.troops.cavalry || 0) + (defender._data.troops.siege || 0);

        var enemies_alive;
        var message = "Attacker: "+a_count +", Defender: "+d_count;
        var game_over_side;

        if (a_count >= d_count) {
            defender.is_dead = true;
            _c.remove_entity(game, defender);

            message += " - attacker kills defender";

            enemies_alive = _c.find_unit_status(game, attacker, {side: 'enemy', return_multiple:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = attacker._data.side;
            }

        } else {
            attacker.is_dead = true;
            _c.remove_entity(game, attacker);

            message += " - defender kills attacker";

            enemies_alive = _c.find_unit_status(game, defender, {side: 'enemy', return_multiple:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = attacker._data.side;
            }
        }

        callback(game, message, 3);

        if (game_over_side) {
            _c.game_over(game, game_over_side);
        }

    }



})(Battlebox);