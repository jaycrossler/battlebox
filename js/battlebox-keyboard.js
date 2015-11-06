(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    var movement_last_vertical_left = true;

    var key_map = {};
    key_map[ROT.VK_Y] = 0;
    key_map[ROT.VK_NUMPAD7] = 0;
    key_map[ROT.VK_U] = 1;
    key_map[ROT.VK_NUMPAD9] = 1;
    key_map[ROT.VK_L] = 2;
    key_map[ROT.VK_RIGHT] = 2;
    key_map[ROT.VK_NUMPAD6] = 2;
    key_map[ROT.VK_N] = 3;
    key_map[ROT.VK_NUMPAD3] = 3;
    key_map[ROT.VK_B] = 4;
    key_map[ROT.VK_NUMPAD1] = 4;
    key_map[ROT.VK_H] = 5;
    key_map[ROT.VK_LEFT] = 5;
    key_map[ROT.VK_NUMPAD4] = 5;
    key_map[ROT.VK_K] = 0;
    key_map[ROT.VK_UP] = 0;
    key_map[ROT.VK_NUMPAD8] = 0;
    key_map[ROT.VK_J] = 3;
    key_map[ROT.VK_DOWN] = 3;
    key_map[ROT.VK_NUMPAD2] = 3;
    key_map[ROT.VK_PERIOD] = -1;
    key_map[ROT.VK_CLEAR] = -1;
    key_map[ROT.VK_NUMPAD5] = -1;


    _c.interpret_command_from_keycode = function (code, unit_options) {
        var command = {movement: null, func: null, ignore: false};

        if ((code == 13 || code == 32) && unit_options.execute_action) {
            //TODO: Have some array of commands per unit?
            command.func = unit_options.execute_action;
            return command;
        }
        if (!(code in key_map)) {
            command.ignore = true;
            return command;
        } else {
            code = key_map[code];
        }

        if (code == -1) {
            command.ignore = true;
            return command;
        }

        //Flip left/right walking so not always going top left or bot right with up/down arrows
        movement_last_vertical_left = !movement_last_vertical_left;
        if (code == 0 && movement_last_vertical_left) {
            code = 1;
        } else if (code == 1 && !movement_last_vertical_left) {
            code = 0;
        } else if (code == 4 && movement_last_vertical_left) {
            code = 3;
        } else if (code == 3 && !movement_last_vertical_left) {
            code = 4;
        }

        var dir = ROT.DIRS[6][code];
        if (dir) {
            command.movement = dir;
        }

        return command;
    }


})(Battlebox);