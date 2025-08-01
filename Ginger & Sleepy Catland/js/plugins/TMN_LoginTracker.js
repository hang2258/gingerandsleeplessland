/*:
 * @plugindesc Tracks login identity and gameplay session time using plugin commands [MV Compatible v1.0]
 * @author hang
 *
 * @help
 * ┌─────────────────────── USAGE ────────────────────────┐
 * │ Use Plugin Command: StartTrackTime — begins timer    │
 * │ Use Plugin Command: EndgameTime — saves finish time  │
 * └──────────────────────────────────────────────────────┘
 *
 * Requires:
 *   - Global: LocalUsers
 *   - Global: loggedInUserEmail
 */

// RPG Maker MV-Compatible Command Handler
const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  _Game_Interpreter_pluginCommand.call(this, command, args);

  if (command === "StartTrackTime") {
    if (loggedInUserEmail) {
      window.startTime = Date.now();
      console.log(`StartTrackTime: tracking begins for ${loggedInUserEmail}`);
    } else {
      console.warn("StartTrackTime failed: no user logged in.");
    }
  }

  if (command === "EndgameTime") {
    if (loggedInUserEmail && window.startTime) {
      const duration = Date.now() - window.startTime;
      const user = LocalUsers[loggedInUserEmail];
      if (user && typeof user === 'object') {
        user.completionTime = duration;
        console.log(`EndgameTime: ${loggedInUserEmail} finished in ${duration} ms`);
      } else {
        console.warn("EndgameTime failed: user object not valid.");
      }
    } else {
      console.warn("EndgameTime failed: missing login or startTime.");
    }
  }
};

// Patch: Enhanced login logic for object-based accounts
if (typeof Scene_Login !== "undefined") {
  const _Scene_Login_performLogin = Scene_Login.prototype.performLogin;
  Scene_Login.prototype.performLogin = function() {
    const uname = this._usernameInput.text();
    const pass = this._passwordInput.text();

    if (LocalUsers[uname] && LocalUsers[uname].password === pass) {
      loggedInUserEmail = uname;
      SceneManager.goto(Scene_Title);
    } else {
      alert("Login failed. Please check your username and password.");
      this._loginButton.activate();
    }
  };
}

// Patch: Register user with {password, completionTime}
if (typeof Scene_Register !== "undefined") {
  const _Scene_Register_registerUser = Scene_Register.prototype.registerUser;
  Scene_Register.prototype.registerUser = function() {
    const uname = this._newUser.text();
    const pass = this._newPass.text();

    if (!LocalUsers[uname]) {
      LocalUsers[uname] = {
        password: pass,
        completionTime: null
      };
      alert("Account created successfully!");
      SceneManager.gotoLoginScene();
    } else {
      alert("Username already exists.");
      this._registerButton.activate();
    }
  };
}