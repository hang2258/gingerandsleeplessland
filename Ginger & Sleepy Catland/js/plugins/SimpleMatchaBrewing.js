/*:
 * @plugindesc Simple Matcha Latte Brewing with stop audio on finish
 *
 * @param StirPictures
 * @type string[]
 * @desc Pictures to cycle during stir
 * @default ["stir1","stir2","stir3"]
 *
 * @param PourPictures
 * @type string[]
 * @desc Pictures for pour
 * @default ["pour1","pour2"]
 *
 * @param SprinklePictures
 * @type string[]
 * @desc Pictures to cycle during sprinkle
 * @default ["sprinkle1","sprinkle2","sprinkle3"]
 *
 * @param StirCount
 * @type number
 * @default 9
 *
 * @param PourCount
 * @type number
 * @default 5
 *
 * @param SprinkleCount
 * @type number
 * @default 6
 *
 * @param FinishCommonEvent
 * @type common_event
 * @default 1
 */

(function(){
    var params = PluginManager.parameters('SimpleMatchaBrewing');
    var stirPics = JSON.parse(params['StirPictures']);
    var pourPics = JSON.parse(params['PourPictures']);
    var sprinklePics = JSON.parse(params['SprinklePictures']);
    var stirGoal = Number(params['StirCount']);
    var pourGoal = Number(params['PourCount']);
    var sprinkleGoal = Number(params['SprinkleCount']);
    var finishEvent = Number(params['FinishCommonEvent']);

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "StartBrewingMatcha") {
            startBrewingMatcha();
        }
    };

    function startBrewingMatcha(){
        let stage = "stir";
        let count = {stir:0, pour:0, sprinkle:0};
        let indices = {stir:0, sprinkle:0};
        let pourShown = 0;

        $gameMessage.add("Stir the matcha! Press RIGHT.");

        SceneManager._scene.update = function(){
            Scene_Base.prototype.update.call(this);

            if(stage === "stir" && Input.isTriggered('right')){
                count.stir++;
                let pic = stirPics[indices.stir];
                indices.stir = (indices.stir + 1) % stirPics.length;
                showPicture(pic);
                AudioManager.playSe({name:"Stir1", volume:85, pitch:100, pan:0});
                if(count.stir >= stirGoal){
                    AudioManager.stopSe(); // Dừng tất cả SE khi hoàn thành stage
                    $gameScreen.erasePicture(1);
                    stage = "pour";
                    $gameMessage.add("Pour the milk... Press DOWN.");
                }
            }
            else if(stage === "pour" && Input.isTriggered('down')){
                count.pour++;
                if(pourShown < pourPics.length){
                    showPicture(pourPics[pourShown]);
                    pourShown++;
                }
                AudioManager.playSe({name:"pour-drink-41197", volume:90, pitch:100, pan:0});
                if(count.pour >= pourGoal){
                    AudioManager.stopSe();
                    $gameScreen.erasePicture(1);
                    stage = "sprinkle";
                    $gameMessage.add("Sprinkle sugar. Press UP.");
                }
            }
            else if(stage === "sprinkle" && Input.isTriggered('up')){
                count.sprinkle++;
                let pic = sprinklePics[indices.sprinkle];
                indices.sprinkle = (indices.sprinkle + 1) % sprinklePics.length;
                showPicture(pic);
                AudioManager.playSe({name:"sugar-sashay-into-coffee_01-100432", volume:100, pitch:100, pan:0});
                if(count.sprinkle >= sprinkleGoal){
                    AudioManager.stopSe();
                    $gameScreen.erasePicture(1);
                    $gameMessage.add("Perfect! The aroma is so good...");
                    AudioManager.playSe({name:"short-success-sound-glockenspiel-treasure-video-game-6346", volume:90, pitch:100, pan:0});
                    $gameTemp.reserveCommonEvent(finishEvent);
                    delete SceneManager._scene.update;
                }
            }
        };
    }

    function showPicture(name){
        $gameScreen.showPicture(1, name, 1, Graphics.width/2, Graphics.height/2, 100,100,255,0);
    }
})();
