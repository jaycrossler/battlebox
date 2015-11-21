(function (Battlebox) {

    //TODO: Game is over if all of the forces on a defender's side are killed.  How to handle monsters?
    //TODO: Should there be a list of sides that matter in a conflict?

    var _c = new Battlebox('get_private_functions');
    _c.battle = {};
    _c.battle.fight = function (game, attacker, defender, ranged_only) {

        //Slow down game clock if set
        if (game.game_options.delay_to_set_on_battle !== undefined) {
            game.game_options.delay_between_ticks = game.game_options.delay_to_set_on_battle;
            game.game_options.reset_clock_to_default_at = game.data.tick_count + 8;
        }

        var attacker_strength = 0;
        var attacker_ranged_strength = 0;
        var attacker_defense = 0;
        _.each(attacker.forces, function (force) {
            var count = force.count || 1;

            var is_ranged = (force.ranged_strength) || (force.range > 1);
            if (is_ranged) {
                var strength = force.ranged_strength || force.strength || 1;

                //var tile = attacker.tile_on();
                //if (_c.tile_has(tile, 'tower') && (tile.side == attacker.side)) {strength *= 1.5;}
                attacker_ranged_strength += count * strength;
            }
            attacker_strength += count * (force.strength || 1);
            attacker_defense += count * (force.defense || 1);
            force.mode = 'attacking';
        });

        var defender_strength = 0;
        var defender_ranged_strength = 0;
        var defender_defense = 0;
        _.each(defender.forces, function (force) {
            var count = force.count || 1;

            var is_ranged = (force.ranged_strength) || (force.range > 1);
            if (is_ranged) {
                var strength = force.ranged_strength || force.strength || 1;

                //var tile = defender.tile_on();
                //if (_c.tile_has(tile, 'tower') && (tile.side == defender.side)) {strength *= 1.5;}
                defender_ranged_strength += count * strength;
            }
            defender_strength += count * (force.strength || 1);
            defender_defense += count * (force.defense || 1);
            force.mode = 'defending';
        });

        //TODO: Run away if weaker?

        //Call for help if enemy is stronger
        if (defender_defense < attacker_strength) {  //TODO: What about ranged attacks? move to end if dead?
            defender.tell_friends_about({
                message: "Strong Enemy Attacking",
                strength: ranged_only ? attacker_ranged_strength : attacker_strength,
                ranged: ranged_only,
                location: {x: defender.x, y: defender.y}
            });
        }
        if (attacker_defense < defender_strength) {
            attacker.tell_friends_about({
                message: "Strong Enemy Defending",
                strength: ranged_only ? defender_ranged_strength : defender_strength,
                ranged: ranged_only,
                location: {x: defender.x, y: defender.y}
            });
        }


        //Sort from fastest to slowest
        var all_forces = [].concat(attacker.forces, defender.forces);
        all_forces.sort(function (a, b) {
            var a_initiative = a.initiative || a.speed || 40;
            var b_initiative = b.initiative || b.speed || 40;
            return (a_initiative < b_initiative);
        });

        //For each group of forces
        for (var f = 0; f < all_forces.length; f++) {
            var force = all_forces[f];

            //If ranged only, skip non-ranged forces attacking
            if (ranged_only && !(force.ranged_strength || force.range > 1 )) continue;

            if (force.count && !force.dead) {
                for (var i = 0; i < force.count; i++) {
                    //Have each troop attack a random enemy
                    //TODO: Allow attacking fastest, slowest, weakest, strongest, least defended, etc

                    var enemy_side = force.mode == 'attacking' ? defender.forces : attacker.forces;
                    if (enemy_side.length) {

                        var target_force = _c.randOption(force.mode == 'attacking' ? defender.forces : attacker.forces);
                        var defender_defense_val = target_force.defense || 1;
                        if (target_force.protected_by_walls) {
                            defender_defense_val += (defender_defense_val * target_force.protected_by_walls * .5);
                        }
                        if (target_force.in_towers) {
                            defender_defense_val += (defender_defense_val * target_force.in_towers * .2);
                        }


                        //See if attack hit
                        var strength = (ranged_only ? force.ranged_strength : force.strength) || 1;
                        var to_hit_chance = strength / defender_defense_val;
                        var enemy_killed = (to_hit_chance >= 1) ? true : (_c.random() <= to_hit_chance);
                        if (enemy_killed) {
                            //------------------------------------------------
                            //If the attacked force is removed, take it off the unit
                            target_force.count--;
                            if (target_force.count <= 0) {
                                var f_i = _.indexOf(all_forces, target_force);
                                if (f_i > -1) {
                                    all_forces[f_i].dead = true;
                                }

                                if (force.mode == 'attacking') {
                                    defender.forces = _.reject(defender.forces, target_force);
                                } else {
                                    attacker.forces = _.reject(attacker.forces, target_force);
                                }
                            }

                            //------------------------------------------------
                            //See if enemy gets returning free hit against attacker - 20% of normal attack chance
                            var attacker_defense_val = force.defense || 1; //TODO: Add tower defense?
                            if (force.protected_by_walls) {
                                attacker_defense_val += (attacker_defense_val * force.protected_by_walls * .5);
                            }

                            //If ranged battle, only ranged enemies get a return kill chance
                            if (ranged_only && !(target_force.ranged_strength || target_force.range > 1 )) continue;

                            //TODO: Turn all bonuses into constants
                            var target_strength = (ranged_only ? target_force.ranged_strength : target_force.strength) || 1;

                            var return_hit_chance = (.2 * target_strength) / attacker_defense_val;
                            if (_c.random() <= return_hit_chance) {

                                //------------------------------------------------
                                //If the returned-fire force is removed, take it off the unit
                                force.count--;
                                if (force.count <= 0) {
                                    var f_i = _.indexOf(all_forces, force);
                                    if (f_i > -1) {
                                        all_forces[f_i].dead = true;
                                    }

                                    if (force.mode == 'attacking') {
                                        attacker.forces = _.reject(attacker.forces, force);
                                    } else {
                                        defender.forces = _.reject(defender.forces, force);
                                    }
                                }
                            }

                        }
                    } else {
                        //Enemy eliminated
                        break;
                    }
                }
            }
        }
    };
    _c.entity_range_attacks_entity = function (game, attacker, defender, callback) {
        _c.entity_attacks_entity(game, attacker, defender, callback, true);
    };

    _c.entity_attacks_entity = function (game, attacker, defender, callback, ranged_only) {
        attacker._data.troops = attacker._data.troops || {};
        defender._data.troops = defender._data.troops || {};
        callback = callback || _c.log_message_to_user;

        var a_name = attacker._data.name || "Attacker";
        var a_side = attacker._data.side || "Side 1";

        var d_name = defender._data.name || "Defender";
        var b_side = defender._data.side || "Side 2";

        //Count before fight
        var a_count = 0;
        _.each(attacker.forces, function (force) {
            a_count += force.count || 0;
        });

        var d_count = 0;
        _.each(defender.forces, function (force) {
            d_count += force.count || 0;
        });

        if ((a_count <= 0) || (d_count <= 0)) return true;

        //Have the forces fight together
        _c.battle.fight(game, attacker, defender, ranged_only);


        //Count the survivors
        var a_count_after = 0;
        _.each(attacker.forces, function (force) {
            a_count_after += force.count || 0;
        });

        var d_count_after = 0;
        _.each(defender.forces, function (force) {
            d_count_after += force.count || 0;
        });

        //Find if the game ended or if attacker won
        var enemies_alive;
        var message = "";
        var game_over_side;

        var a_msg = "<span style='background-color:" + attacker._data.side + "'>" + a_name + " ([" + (attacker._symbol || '@') + "] was size " + a_count + ", now " + (a_count_after) + ")</span>";
        var d_msg = "<span style='background-color:" + defender._data.side + "'>" + d_name + " ([" + (defender._symbol || '@') + "] was size " + d_count + ", now " + (d_count_after) + ")</span>";

        var a_lost = a_count - a_count_after;
        var d_lost = d_count - d_count_after;

        attacker.reset_bonuses();
        defender.reset_bonuses();

        if (d_lost >= a_lost) {
            message = a_msg + " WINS attacking " + d_msg;
            attacker.fights_won = attacker.fights_won || 0;
            attacker.fights_won++;
            defender.fights_lost = defender.fights_lost || 0;
            defender.fights_lost++;

            callback(game, message, 3, a_side);
        } else {
            message = a_msg + " LOST attacking " + d_msg;

            defender.fights_won = defender.fights_won || 0;
            defender.fights_won++;
            attacker.fights_lost = attacker.fights_lost || 0;
            attacker.fights_lost++;

            callback(game, message, 3, b_side);
        }


        if (a_count_after <= 0) {
            attacker.is_dead = true;
            _c.remove_entity(game, attacker);
        }
        if (d_count_after <= 0) {
            defender.is_dead = true;
            _c.remove_entity(game, defender);
        }

        enemies_alive = _c.find_unit_by_filters(game, attacker, {
            side: 'enemy',
            return_multiple: true,
            only_count_forces: true
        });
        if (enemies_alive.target.length == 0) {
            game_over_side = attacker._data.side;
        }

        var friends_alive = _c.find_unit_by_filters(game, defender, {
            side: 'enemy',
            return_multiple: true,
            only_count_forces: true
        });
        if (friends_alive.target.length == 0) {
            game_over_side = defender._data.side;
        }


        if (game_over_side) {
            _c.game_over(game, game_over_side);
        }

        return defender.is_dead;

    }


})(Battlebox);