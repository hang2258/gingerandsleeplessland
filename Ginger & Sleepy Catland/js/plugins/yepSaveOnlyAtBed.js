/*:
 * @plugindesc Chỉ Save khi đứng gần giường (nhấn Enter). Load vẫn hoạt động từ menu. Tương thích YEP_SaveCore.
 */

(function() {

    // Chặn Save trong menu
    Scene_Save.prototype.onSavefileOk = function() {
        SoundManager.playBuzzer();
        this.popScene();
    };

    // Cho phép Load trong menu (mặc định)

    // Plugin command SaveToSlot1 (Tương thích YEP_SaveCore)
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'SaveToSlot1') {
        const saveId = 1;
        if (DataManager.isThisGameFile(saveId)) {
            if (Yanfly && Yanfly.Save && Yanfly.Save.saveGame) {
            // Gọi hàm save của YEP_SaveCore
            Yanfly.Save.saveGame(saveId);
            } else {
            // Dùng DataManager nếu không có YEP
            DataManager.saveGame(saveId);
            }
        } else {
          // Nếu slot chưa tồn tại, dùng save bình thường
            DataManager.saveGame(saveId);
        }
        $gameMessage.add("Your story has been saved!");
        }
    };
    })();