/*:
 * @plugindesc Minigame nhấn đúng thời điểm (phiên bản không dùng registerCommand – đã sửa tint)
 * @target MV
 * @author hang
 */

(() => {
  window.startPasswaterGame = function () {
    if (!(SceneManager._scene instanceof Scene_Map)) {
      $gameMessage.add("Không thể khởi động minigame khi không ở bản đồ!");
      return;
    }

    const pointerY = 312;
    const barLength = 416;
    const barStartX = 344;
    const barEndX = barStartX + barLength;
    const pointerWidth = 48;
    const halfW = pointerWidth / 2;

    // Tính khoảng tâm pointer có thể với tới
    const centerMin = barStartX + halfW;
    const centerMax = barEndX   - halfW;

    let pointerX = barStartX;
    let pointerSpeed = 1;
    let movingRight = true;
    let won = false;

    // Hàm sinh vị trí ngẫu nhiên cho goalCenter
    const rndCenter = () => centerMin + Math.randomInt(centerMax - centerMin + 1);

    // Khởi tạo vùng hit
    let goalCenter = rndCenter();
    let goalLeft   = goalCenter - halfW;
    let goalRight  = goalCenter + halfW;

    // Hiệu ứng khởi đầu
    $gameScreen.startTint([-68, -68, -68, 0], 30);
    $gameScreen.showPicture(1, "minigame_bar_background", 0, barStartX, pointerY, 100,100,255,0);
    $gameScreen.showPicture(2, "minigame_bar_hit_area",  0, goalLeft,         pointerY, 100,100,255,0);
    $gameScreen.showPicture(3, "minigame_pointer",       0, pointerX,         pointerY, 100,100,255,0);

    let loopActive = true;

    const update = () => {
      if (!loopActive) return;

      // 1) Di chuyển
      pointerX += movingRight ? pointerSpeed : -pointerSpeed;
      // 2) Clamp cho pointer không vượt thanh bar
      pointerX = Math.max(barStartX, Math.min(barEndX - pointerWidth, pointerX));
      // 3) Đổi hướng
      if (pointerX + pointerWidth >= barEndX) movingRight = false;
      if (pointerX <= barStartX) movingRight = true;
      // 4) Vẽ lại pointer
      $gameScreen.showPicture(3, "minigame_pointer", 0, pointerX, pointerY, 100,100,255,0);

      // Bấm OK?
      if (Input.isTriggered('ok')) {
        const centerX = pointerX + halfW;
        if (centerX >= goalLeft && centerX <= goalRight) {
          // Hit!
          AudioManager.playSe({ name:"Decision2", volume:75, pitch:100, pan:0 });
          $gameScreen.startFlash([0,255,0,51], 5);
          pointerSpeed++;

          if (pointerSpeed === 2) {
            // Lại sinh vùng hit mới
            goalCenter = rndCenter();
            goalLeft   = goalCenter - halfW;
            goalRight  = goalCenter + halfW;
            $gameScreen.showPicture(2, "minigame_bar_hit_area", 0, goalLeft, pointerY, 100,100,255,0);
          }

          if (pointerSpeed === 3) {
            $gameMessage.add("You did it, great job!");
            won = true;
            loopActive = false;
            endGame();
            return;
          }
        } else {
          // Miss
          AudioManager.playSe({ name:"Buzzer2", volume:75, pitch:100, pan:0 });
          $gameScreen.startFlash([255,0,0,51], 5);
          $gameMessage.add("You missed! Feel free to try again later!");
          loopActive = false;
          endGame();
          return;
        }
      }

      // Bấm Cancel hủy game
      if (Input.isTriggered('cancel')) {
        loopActive = false;
        endGame();
        return;
      }

      requestAnimationFrame(update);
    };

    const endGame = () => {
      [1,2,3].forEach(id => $gameScreen.erasePicture(id));
      $gameScreen.startTint([0,0,0,0], 30);
      setTimeout(() => {
        if (won) $gamePlayer.reserveTransfer(10, 47, 9, 2, 0);
      }, 100);
    };

    update();
  };
})();
