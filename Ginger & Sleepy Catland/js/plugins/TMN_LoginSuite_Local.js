/*:
 * @plugindesc Local login system with registration and password change
 * @author hang
 *
 * @help Players can log in, register, and change password—all offline.2
 */
var loggedInUserEmail = null;
var LocalUsers = {
  "player1": { password: "password123", completionTime: null },
  "hero":    { password: "sword",       completionTime: null }
};

//Auto-convert string-format users to object format
for (const name in LocalUsers) {
  const value = LocalUsers[name];
  if (typeof value === "string") {
    LocalUsers[name] = {
      password: value,
      completionTime: null
    };
    console.log(`Migrated legacy account: ${name}`);
  }
}

(function() {

// ============================
// Input Window
// ============================
function Window_LoginInput() {
  this.initialize.apply(this, arguments);
}
Window_LoginInput.prototype = Object.create(Window_Base.prototype);
Window_LoginInput.prototype.constructor = Window_LoginInput;
Window_LoginInput.prototype.initialize = function(x, y, prompt, isPassword) {
  var width = 240;
  var height = this.fittingHeight(1);
  Window_Base.prototype.initialize.call(this, x, y, width, height);
  this._text = '';
  this._prompt = prompt;
  this._isPassword = isPassword || false;
  this._active = false;
  this.refresh();
  this.setClickHandler();
};
Window_LoginInput.prototype.setClickHandler = function() {
  this._windowSpriteContainer.interactive = true;
  this._windowSpriteContainer.on('pointerdown', () => {
    SceneManager._scene.setActiveInput(this);
  });
};
Window_LoginInput.prototype.refresh = function() {
  this.contents.clear();
  const displayText = this._isPassword ? '*'.repeat(this._text.length) : this._text;
  this.drawText(this._prompt + ' ' + displayText, 0, 0, this.contentsWidth(), 'left');
};
Window_LoginInput.prototype.text = function() { return this._text; };
Window_LoginInput.prototype.activate = function() { this._active = true; };
Window_LoginInput.prototype.deactivate = function() { this._active = false; };
Window_LoginInput.prototype.processHandling = function() {
  if (this.isOpenAndActive()) {
    if (Input.isRepeated('backspace')) this.processBackspace();
  }
};
Window_LoginInput.prototype.processBackspace = function() {
  if (this._text.length > 0) {
    this._text = this._text.slice(0, -1);
    this.refresh();
  }
};
Window_LoginInput.prototype.update = function() {
  Window_Base.prototype.update.call(this);
  this.processHandling();
};
Window_LoginInput.prototype.processCharacter = function(character) {
  if (this._text.length < this.maxLength()) {
    this._text += character;
    this.refresh();
  }
};
Window_LoginInput.prototype.maxLength = function() { return 20; };
Window_LoginInput.prototype.isOpenAndActive = function() {
  return this.isOpen() && this._active;
};
Window_LoginInput.prototype.onKeyDown = function(event) {
  if (this.isOpenAndActive()) {
    if (event.key.length === 1) this.processCharacter(event.key);
    if (event.key === 'Backspace') this.processBackspace();
  }
};

document.addEventListener('keydown', function(event) {
  const scene = SceneManager._scene;
  if (scene._activeInput instanceof Window_LoginInput) {
    if (event.key === "Tab") {
      event.preventDefault();
      scene.switchActiveInput();
    } else {
      scene._activeInput.onKeyDown(event);
    }
  }
});

// ============================
// Login Scene
// ============================
function Scene_Login() { this.initialize.apply(this, arguments); }
Scene_Login.prototype = Object.create(Scene_Base.prototype);
Scene_Login.prototype.constructor = Scene_Login;
Scene_Login.prototype.create = function() {
  this.createBackground();
  this.createLoginUI();
};
Scene_Login.prototype.createBackground = function() {
  this._backgroundSprite = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
  this.addChild(this._backgroundSprite);
};
Scene_Login.prototype.createLoginUI = function() {
  const cx = Graphics.width / 2;
  const cy = Graphics.height / 2;

  this._usernameInput = new Window_LoginInput(cx - 120, cy - 60, 'Username:', false);
  this._passwordInput = new Window_LoginInput(cx - 120, cy, 'Password:', true);
  this._loginButton = new Window_CommandLogin(cx - 120, cy + 60);

  this._usernameInput.setClickHandler(() => this.setActiveInput(this._usernameInput));
  this._passwordInput.setClickHandler(() => this.setActiveInput(this._passwordInput));

  this._loginButton.setHandler('login', this.performLogin.bind(this));
  this._loginButton.setHandler('register', () => SceneManager.gotoRegisterScene());
  this._loginButton.setHandler('change', () => SceneManager.gotoChangePasswordScene());

  this.addChild(this._usernameInput);
  this.addChild(this._passwordInput);
  this.addChild(this._loginButton);

  this.setActiveInput(this._usernameInput);
};
Scene_Login.prototype.setActiveInput = function(input) {
  this._activeInput = input;
  this._usernameInput.deactivate();
  this._passwordInput.deactivate();
  input.activate();
};
Scene_Login.prototype.switchActiveInput = function() {
  this.setActiveInput(this._activeInput === this._usernameInput ? this._passwordInput : this._usernameInput);
};
Scene_Login.prototype.performLogin = function() {
  const uname = this._usernameInput.text();
  const pass = this._passwordInput.text();

  if (LocalUsers[uname] && LocalUsers[uname].password === pass) {
    loggedInUserEmail = uname;
    SceneManager.goto(Scene_Title);
  } else {
    alert('Login failed. Please check your username and password.');
    this._loginButton.activate();
  }
};
function Window_CommandLogin() {
  this.initialize.apply(this, arguments);
}
Window_CommandLogin.prototype = Object.create(Window_Command.prototype);
Window_CommandLogin.prototype.constructor = Window_CommandLogin;
Window_CommandLogin.prototype.initialize = function(x, y) {
  Window_Command.prototype.initialize.call(this, x, y);
};
Window_CommandLogin.prototype.makeCommandList = function() {
  this.addCommand('Login', 'login');
  this.addCommand('Register', 'register');
  this.addCommand('Change Password', 'change');
};
Window_CommandLogin.prototype.windowWidth = function() {
  return 240;
};
Window_CommandLogin.prototype.numVisibleRows = function() {
  return this.maxItems();
};


// ============================
// Register Scene
// ============================
function Scene_Register() { this.initialize.apply(this, arguments); }
Scene_Register.prototype = Object.create(Scene_Base.prototype);
Scene_Register.prototype.constructor = Scene_Register;
Scene_Register.prototype.initialize = function() {
  Scene_Base.prototype.initialize.call(this);
};
Scene_Register.prototype.switchActiveInput = function() {
  if (this._activeInput === this._newUser) {
    this.setActiveInput(this._newPass);
  } else {
    this.setActiveInput(this._newUser);
  }
};
Scene_Register.prototype.create = function() {
  const cx = Graphics.width / 2;
  const cy = Graphics.height / 2;

  this._newUser = new Window_LoginInput(cx - 120, cy - 60, 'New Username:', false);
  this._newPass = new Window_LoginInput(cx - 120, cy, 'New Password:', true);
  this._registerButton = new Window_CommandRegister(cx - 120, cy + 60);

  this._newUser.setClickHandler(() => this.setActiveInput(this._newUser));
  this._newPass.setClickHandler(() => this.setActiveInput(this._newPass));
  this._registerButton.setHandler('register', this.registerUser.bind(this));
  this._registerButton.setHandler('cancel', () => SceneManager.gotoLoginScene()); //  Cancel handler

  this.addChild(this._newUser);
  this.addChild(this._newPass);
  this.addChild(this._registerButton);
  this.setActiveInput(this._newUser);
};
Scene_Register.prototype.setActiveInput = function(input) {
  this._activeInput = input;
  this._newUser.deactivate();
  this._newPass.deactivate();
  input.activate();
};
Scene_Register.prototype.registerUser = function() {
  const uname = this._newUser.text();
  const pass = this._newPass.text();

  if (!LocalUsers[uname]) {
    LocalUsers[uname] = {
    password: pass,
    completionTime: null
  };
    alert('Account created!');
    SceneManager.gotoLoginScene();
  } else {
    alert('Username already exists.');
    this._registerButton.activate();
  }
};
SceneManager.gotoRegisterScene = function() {
  SceneManager.goto(Scene_Register);
};

function Window_CommandRegister() {
  this.initialize.apply(this, arguments);
}
Window_CommandRegister.prototype = Object.create(Window_Command.prototype);
Window_CommandRegister.prototype.constructor = Window_CommandRegister;
Window_CommandRegister.prototype.initialize = function(x, y) {
  Window_Command.prototype.initialize.call(this, x, y);
};
Window_CommandRegister.prototype.makeCommandList = function() {
  this.addCommand('Register', 'register');
  this.addCommand('Cancel', 'cancel'); // Cancel option
};
Window_CommandRegister.prototype.windowWidth = function() {
  return 240;
};
Window_CommandRegister.prototype.windowHeight = function() {
  return this.fittingHeight(this.numVisibleRows());
};
Window_CommandRegister.prototype.numVisibleRows = function() {
  return this.maxItems();
};

// ============================
// Change Password Scene
// ============================
function Scene_ChangePassword() { this.initialize.apply(this, arguments); }
Scene_ChangePassword.prototype = Object.create(Scene_Base.prototype);
Scene_ChangePassword.prototype.constructor = Scene_ChangePassword;
Scene_ChangePassword.prototype.initialize = function() {
  Scene_Base.prototype.initialize.call(this);
};
Scene_ChangePassword.prototype.switchActiveInput = function() {
  if (this._activeInput === this._usernameInput) {
    this.setActiveInput(this._oldPass);
  } else if (this._activeInput === this._oldPass) {
    this.setActiveInput(this._newPass);
  } else {
    this.setActiveInput(this._usernameInput);
  }
};
Scene_ChangePassword.prototype.create = function() {
  const cx = Graphics.width / 2;
  const cy = Graphics.height / 2;

  this._usernameInput = new Window_LoginInput(cx - 120, cy - 120, 'Username:', false);
  this._oldPass = new Window_LoginInput(cx - 120, cy - 60, 'Current:', true);
  this._newPass = new Window_LoginInput(cx - 120, cy, 'New:', true);
  this._submitButton = new Window_CommandChange(cx - 120, cy + 60);

  this._usernameInput.setClickHandler(() => this.setActiveInput(this._usernameInput));
  this._oldPass.setClickHandler(() => this.setActiveInput(this._oldPass));
  this._newPass.setClickHandler(() => this.setActiveInput(this._newPass));
  this._submitButton.setHandler('change', this.changePassword.bind(this));
  this._submitButton.setHandler('cancel', () => SceneManager.gotoLoginScene()); // Cancel handler

  this.addChild(this._usernameInput);
  this.addChild(this._oldPass);
  this.addChild(this._newPass);
  this.addChild(this._submitButton);

  this.setActiveInput(this._usernameInput);
};
Scene_ChangePassword.prototype.setActiveInput = function(input) {
  this._activeInput = input;
  this._usernameInput.deactivate();
  this._oldPass.deactivate();
  this._newPass.deactivate();
  input.activate();
};
Scene_ChangePassword.prototype.changePassword = function() {
  const username = this._usernameInput.text();
  const oldP = this._oldPass.text();
  const newP = this._newPass.text();

  if (LocalUsers[username] && LocalUsers[username] === oldP) {
    LocalUsers[username] = newP;
    alert('Password changed!');
    SceneManager.gotoLoginScene();
  } else {
    alert('Incorrect username or password.');
    this._submitButton.activate();
  }
};
SceneManager.gotoChangePasswordScene = function() {
  SceneManager.goto(Scene_ChangePassword);
};

function Window_CommandChange() {
  this.initialize.apply(this, arguments);
}
Window_CommandChange.prototype = Object.create(Window_Command.prototype);
Window_CommandChange.prototype.constructor = Window_CommandChange;
Window_CommandChange.prototype.initialize = function(x, y) {
  Window_Command.prototype.initialize.call(this, x, y);
};
Window_CommandChange.prototype.makeCommandList = function() {
  this.addCommand('Change', 'change');
  this.addCommand('Cancel', 'cancel'); // Cancel option
};
Window_CommandChange.prototype.windowWidth = function() {
  return 240;
};
Window_CommandChange.prototype.windowHeight = function() {
  return this.fittingHeight(this.numVisibleRows());
};
Window_CommandChange.prototype.numVisibleRows = function() {
  return this.maxItems();
};

SceneManager.gotoLoginScene = function() { SceneManager.goto(Scene_Login); };
const _Scene_Boot_start = Scene_Boot.prototype.start;
Scene_Boot.prototype.start = function() {
  _Scene_Boot_start.call(this);
  SceneManager.gotoLoginScene();
};
})();