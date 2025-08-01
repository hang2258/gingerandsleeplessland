/*:
 * @plugindesc Leaderboard plugin for ranked completion times [MV Compatible v1.0]
 * @author hang
 *
 * @help
 * Shows a ranked list of LocalUsers based on completionTime.
 * Requires LocalUsers and completionTime set via tracking plugin.
 */

(function() {
  // Converts ms → mm:ss
  function formatTime(ms) {
    if (typeof ms !== "number") return "—";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  // Leaderboard Window
  function Window_Leaderboard() {
    this.initialize.apply(this, arguments);
  }
  Window_Leaderboard.prototype = Object.create(Window_Selectable.prototype);
  Window_Leaderboard.prototype.constructor = Window_Leaderboard;
  Window_Leaderboard.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
  };
  Window_Leaderboard.prototype.refresh = function() {
    this.contents.clear();

    const sorted = Object.keys(LocalUsers)
      .map(name => {
        const data = LocalUsers[name];
        const time = data && typeof data === "object" ? data.completionTime : null;
        return { name, time };
      })
      .sort((a, b) => {
        const ta = a.time != null ? a.time : Infinity;
        const tb = b.time != null ? b.time : Infinity;
        return ta - tb;
      });

    this._data = sorted;

    const lineHeight = this.lineHeight();
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      const rank = i + 1;
      const time = formatTime(entry.time);
      const text = `${rank}. ${entry.name} — ${time}`;
      this.drawText(text, 0, i * lineHeight, this.contents.width);
    }
  };
  Window_Leaderboard.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
  };
  Window_Leaderboard.prototype.itemHeight = function() {
    return this.lineHeight();
  };

  // Scene: Leaderboard
  function Scene_LeaderboardTime() {
    this.initialize.apply(this, arguments);
  }
  Scene_LeaderboardTime.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_LeaderboardTime.prototype.constructor = Scene_LeaderboardTime;
  Scene_LeaderboardTime.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
  };
  Scene_LeaderboardTime.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    const w = Graphics.boxWidth - 80;
    const h = Graphics.boxHeight - 160;
    const x = 40;
    const y = 60;

    this._board = new Window_Leaderboard(x, y, w, h);
    this.addChild(this._board);

    this._command = new Window_CommandLeaderboard(x, y + h + 10);
    this._command.setHandler("cancel", this.popScene.bind(this));
    this.addChild(this._command);
  };

  // Cancel Button
  function Window_CommandLeaderboard() {
    this.initialize.apply(this, arguments);
  }
  Window_CommandLeaderboard.prototype = Object.create(Window_Command.prototype);
  Window_CommandLeaderboard.prototype.constructor = Window_CommandLeaderboard;
  Window_CommandLeaderboard.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
  };
  Window_CommandLeaderboard.prototype.makeCommandList = function() {
    this.addCommand("Return", "cancel");
  };
  Window_CommandLeaderboard.prototype.windowWidth = function() {
    return 240;
  };
  Window_CommandLeaderboard.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
  };
  Window_CommandLeaderboard.prototype.numVisibleRows = function() {
    return this.maxItems();
  };

  // Add to Title Screen
  const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function() {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler("leaderboard", this.commandLeaderboard.bind(this));
  };

  const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function() {
    _Window_TitleCommand_makeCommandList.call(this);
    this.addCommand("Leaderboard", "leaderboard");
  };

  Scene_Title.prototype.commandLeaderboard = function() {
    SceneManager.push(Scene_LeaderboardTime);
  };
})();