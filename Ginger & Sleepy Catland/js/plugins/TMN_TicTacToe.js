/*:
 * @plugindesc Tic Tac Toe game for RPG Maker MV
 * @author Hang
 *
 * @param XImage
 * @desc File name for X image (in img/pictures/tictactoe/)
 * @default tictactoe/X_Image
 *
 * @param OImage
 * @desc File name for O image (in img/pictures/tictactoe/)
 * @default tictactoe/O_Image
 *
 * @param HighlightImage
 * @desc File name for highlight image (in img/pictures/tictactoe/)
 * @default tictactoe/Highlight_Image
 *
 * @param BackgroundImage
 * @desc File name for background image (in img/pictures/tictactoe/)
 * @default tictactoe/Background_Image
 *
 * @param XSound
 * @desc File name for X sound (in audio/se/)
 * @default X_Sound
 *
 * @param OSound
 * @desc File name for O sound (in audio/se/)
 * @default O_Sound
 *
 * @param WinSwitch
 * @desc Switch ID for win
 * @type number
 * @default 1
 *
 * @param LoseSwitch
 * @desc Switch ID for lose
 * @type number
 * @default 2
 *
 * @param TieSwitch
 * @desc Switch ID for tie
 * @type number
 * @default 3
 *
 * @param BoardOpacity
 * @desc Opacity of board windows (0–255)
 * @type number
 * @default 0
 *
 * @param WinMessage
 * @desc Message shown when player wins
 * @default You won!
 *
 * @param LoseMessage
 * @desc Message shown when player loses
 * @default You lost!
 *
 * @param TieMessage
 * @desc Message shown when it's a tie
 * @default It's a tie!
 */

(function () {
  const parameters = PluginManager.parameters("TMN_TicTacToe");
  const xImage = parameters["XImage"];
  const oImage = parameters["OImage"];
  const backgroundImage = parameters["BackgroundImage"];
  const highlightImage = parameters["HighlightImage"];
  const xSound = parameters["XSound"];
  const oSound = parameters["OSound"];
  const winSwitch = Number(parameters["WinSwitch"]);
  const loseSwitch = Number(parameters["LoseSwitch"]);
  const tieSwitch = Number(parameters["TieSwitch"]);
  const boardOpacity = Number(parameters["BoardOpacity"]);
  const winMessage = parameters["WinMessage"];
  const loseMessage = parameters["LoseMessage"];
  const tieMessage = parameters["TieMessage"];

  window.startTicTacToeGame = function () {
    SceneManager.push(Scene_TicTacToe);
  };

  function Scene_TicTacToe() {
    this.initialize.apply(this, arguments);
  }

  Scene_TicTacToe.prototype = Object.create(Scene_Base.prototype);
  Scene_TicTacToe.prototype.constructor = Scene_TicTacToe;

  Scene_TicTacToe.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
    this._cursorX = 0;
    this._cursorY = 0;
    this.gameOver = false;
    this.currentPlayer = "X";
    this.isComputerThinking = false;
    this.boardSprites = [];
    this.cellPositions = [
      [{ x: 120, y: 55 }, { x: 360, y: 65 }, { x: 595, y: 62 }],
      [{ x: 80, y: 225 }, { x: 310, y: 230 }, { x: 545, y: 235 }],
      [{ x: 30, y: 385 }, { x: 270, y: 390 }, { x: 510, y: 400 }],
    ];
  };

  Scene_TicTacToe.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer();
    this.createBackground();
    this.createBoard();
    this.createBoardWindows();
    this.createHighlightSprite();
  };

  Scene_TicTacToe.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
  };

  Scene_TicTacToe.prototype.createBackground = function () {
    const bg = new Sprite(ImageManager.loadPicture(backgroundImage));
    bg.anchor.x = 0.5;
    bg.anchor.y = 0.5;
    bg.scale.x = 0.94;
    bg.scale.y = 0.94;
    bg.x = Graphics.width / 2;
    bg.y = Graphics.height / 2;
    this.addChild(bg);
  };

  Scene_TicTacToe.prototype.createBoard = function () {
    this.board = Array(3).fill().map(() => Array(3).fill(null));
  };

  Scene_TicTacToe.prototype.createBoardWindows = function () {
    this.boardWindows = [];
    const cellWidth = 162;
    const cellHeight = 114;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const pos = this.cellPositions[i][j];
        const window = new Window_Base(pos.x, pos.y, cellWidth, cellHeight);
        window.opacity = boardOpacity;
        this.addWindow(window);
        this.boardWindows.push(window);
      }
    }
  };

  Scene_TicTacToe.prototype.createHighlightSprite = function () {
    this.highlightSprite = new Sprite();
    this.highlightSprite.bitmap = ImageManager.loadPicture(highlightImage);
    this.addChild(this.highlightSprite);
    this.updateHighlightPosition();
  };

  Scene_TicTacToe.prototype.updateHighlightPosition = function () {
    if (this.cellPositions && this._cursorY < 3 && this._cursorX < 3) {
      const pos = this.cellPositions[this._cursorY][this._cursorX];
      if (this.highlightSprite && this.highlightSprite.bitmap) {
        this.highlightSprite.x = pos.x;
        this.highlightSprite.y = pos.y;
      }
    }
  };

  Scene_TicTacToe.prototype.updateBoardWindows = function () {
    this.clearBoardSprites();

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const windowIndex = y * 3 + x;
        const window = this.boardWindows[windowIndex];

        if (this.board[y][x]) {
          const sprite = new Sprite();
          const imageName = this.board[y][x] === "X" ? xImage : oImage;
          sprite.bitmap = ImageManager.loadPicture(imageName);
          sprite.x = window.x;
          sprite.y = window.y;
          this.addChild(sprite);
          this.boardSprites.push(sprite);
        }
      }
    }
  };

  Scene_TicTacToe.prototype.clearBoardSprites = function () {
    if (this.boardSprites) {
      this.boardSprites.forEach(sprite => {
        if (sprite && sprite.parent) sprite.parent.removeChild(sprite);
      });
    }
    this.boardSprites = [];
  };

  Scene_TicTacToe.prototype.update = function () {
    Scene_Base.prototype.update.call(this);
    if (this.gameOver) return;

    if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
      this.onCancel();
    }

    this.processCursorMovement();
    this.processMouseInput();
    this.updateBoardWindows();
    this.updateHighlightPosition();

    if (this.currentPlayer === "O" && !this.isComputerThinking) {
      this.isComputerThinking = true;
      setTimeout(() => {
        this.computerMove();
        this.updateBoardWindows();
        this.isComputerThinking = false;
        if (this.checkWin()) {
          this.endGame("lose");
        } else if (this.checkTie()) {
          this.endGame("tie");
        } else {
          this.currentPlayer = "X";
        }
      }, 1000);
    }
  };

  Scene_TicTacToe.prototype.onCancel = function () {
    $gameSwitches.setValue(winSwitch, false);
    $gameSwitches.setValue(loseSwitch, false);
    $gameSwitches.setValue(tieSwitch, false);
    SceneManager.goto(Scene_Map);
  };

  Scene_TicTacToe.prototype.processCursorMovement = function () {
    if (Input.isRepeated("down")) this.moveCursor(0, 1);
    else if (Input.isRepeated("up")) this.moveCursor(0, -1);
    else if (Input.isRepeated("right")) this.moveCursor(1, 0);
    else if (Input.isRepeated("left")) this.moveCursor(-1, 0);

    if (Input.isTriggered("ok") && this.currentPlayer === "X") {
      this.selectCell();
    }
  };

  Scene_TicTacToe.prototype.moveCursor = function (x, y) {
    this._cursorX = (this._cursorX + x + 3) % 3;
    this._cursorY = (this._cursorY + y + 3) % 3;
    this.updateHighlightPosition();
  };

  Scene_TicTacToe.prototype.selectCell = function () {
    if (!this.board[this._cursorY][this._cursorX]) {
      this.makeMove(this._cursorX, this._cursorY);
    }
  };

  Scene_TicTacToe.prototype.processMouseInput = function () {
    if (TouchInput.isTriggered()) {
      const x = TouchInput.x;
      const y = TouchInput.y;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const cell = this.cellPositions[i][j];
          if (x >= cell.x && x <= cell.x + 162 && y >= cell.y && y <= cell.y + 114) {
            this._cursorX = j;
            this._cursorY = i;
            this.updateHighlightPosition();
            if (!this.board[i][j] && this.currentPlayer === "X") {
              this.makeMove(j, i);
            }
            return;
          }
        }
      }
    }
  };

Scene_TicTacToe.prototype.computerMove = function () {
  const bestMove = this.findBestMove();
  if (bestMove) {
    this.makeMove(bestMove.x, bestMove.y);
  }
};

Scene_TicTacToe.prototype.findBestMove = function () {
  let bestScore = -Infinity;
  let move = null;

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (!this.board[y][x]) {
        this.board[y][x] = "O";
        let score = this.minimax(0, false);
        this.board[y][x] = null;

        if (score > bestScore) {
          bestScore = score;
          move = { x, y };
        }
      }
    }
  }

  return move;
};

Scene_TicTacToe.prototype.minimax = function (depth, isMaximizing) {
  const winner = this.getWinner();
  if (winner === "O") return 10 - depth;  // Máy thắng → điểm cao
  if (winner === "X") return depth - 10;  // Người thắng → điểm thấp
  if (this.checkTie()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (!this.board[y][x]) {
          this.board[y][x] = "O"; // Máy đánh
          const score = this.minimax(depth + 1, false);
          this.board[y][x] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (!this.board[y][x]) {
          this.board[y][x] = "X"; // Người đánh
          const score = this.minimax(depth + 1, true);
          this.board[y][x] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
};

Scene_TicTacToe.prototype.getWinner = function () {
  const b = this.board;
  const lines = [
    [b[0][0], b[0][1], b[0][2]],
    [b[1][0], b[1][1], b[1][2]],
    [b[2][0], b[2][1], b[2][2]],
    [b[0][0], b[1][0], b[2][0]],
    [b[0][1], b[1][1], b[2][1]],
    [b[0][2], b[1][2], b[2][2]],
    [b[0][0], b[1][1], b[2][2]],
    [b[0][2], b[1][1], b[2][0]],
  ];

  for (let line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return line[0]; // 'X' hoặc 'O'
    }
  }
  return null;
};

  Scene_TicTacToe.prototype.makeMove = function (x, y) {
    if (!this.board[y][x]) {
      this.board[y][x] = this.currentPlayer;

      const soundName = this.currentPlayer === "X" ? xSound : oSound;
      AudioManager.playSe({ name: soundName, pan: 0, pitch: 100, volume: 90 });

      const imageName = this.currentPlayer === "X" ? xImage : oImage;
      const bitmap = ImageManager.loadPicture(imageName);
      const sprite = new Sprite(bitmap);
      const pos = this.cellPositions[y][x];

      sprite.x = pos.x;
      sprite.y = pos.y;
      this.addChild(sprite);
      this.boardSprites.push(sprite);

      if (this.checkWin()) {
        this.endGame(this.currentPlayer === "X" ? "win" : "lose");
      } else if (this.checkTie()) {
        this.endGame("tie");
      } else {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
      }
    }
  };

  Scene_TicTacToe.prototype.checkWin = function () {
    const b = this.board;
    const lines = [
      [b[0][0], b[0][1], b[0][2]],
      [b[1][0], b[1][1], b[1][2]],
      [b[2][0], b[2][1], b[2][2]],
      [b[0][0], b[1][0], b[2][0]],
      [b[0][1], b[1][1], b[2][1]],
      [b[0][2], b[1][2], b[2][2]],
      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]],
    ];
    return lines.some(line => line.every(cell => cell === this.currentPlayer));
  };

  Scene_TicTacToe.prototype.checkTie = function () {
    return [].concat.apply([], this.board).every(cell => cell !== null);
  };

  Scene_TicTacToe.prototype.endGame = function (result) {
    this.gameOver = true;
    if (result === "win") {
      $gameSwitches.setValue(winSwitch, true);
      if (winMessage) $gameMessage.add(winMessage);
    } else if (result === "lose") {
      $gameSwitches.setValue(loseSwitch, true);
      if (loseMessage) $gameMessage.add(loseMessage);
    } else {
      $gameSwitches.setValue(tieSwitch, true);
      if (tieMessage) $gameMessage.add(tieMessage);
    }
    setTimeout(() => SceneManager.goto(Scene_Map), 2000);
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === "StartTicTacToe") {
      startTicTacToeGame();
    }
  };
})();
