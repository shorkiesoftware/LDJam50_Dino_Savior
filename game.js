const aspectRatio = 1.7777778;
const clearColor = new Vector4(0, 0, 0, 0);
const blackColor = new Vector4(0, 0, 0, 1);
const whiteColor = new Vector4(1, 1, 1, 1);

const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_ENTER = 13;
const KEY_SPACE = 32;

var canvas;
var textCanvas;
var textContext;
var gl;

var startTime;
var endTime;
var deltaTime;

var planetTexture;
var asteroidTexture;
var spaceTexture;
var dino1Texture;
var dino2Texture;
var dino3Texture;
var dinoJumpTexture;
var currentDinoTexture;
var currentDinoWalkFrame = 0;
var dinoAnimationTextures = [];

var spacePosition = new Vector2(0, 0);
var spaceScale = new Vector2(spaceDataWidth * 3, spaceDataHeight * 3);

var planetPosition = new Vector2(700, 375);
var planetScale = new Vector2(250, 250);
var planetAngle = 0;

var dinoGroundPosition = 620;
var dinoPosition = new Vector2(800, dinoGroundPosition);
var dinoScale = new Vector2(dino1DataWidth, dino1DataHeight);

var dinoAnimationTimer = 0;
var dinoFrameTime = 0.5;

var dinoFacingRight = true;
var dinoJumping = false;
var dinoJumpForce = 70;
var dinoJumpVelocity = 0;
var gravity = 100;

var testAudio;

var soundOn = false;

const gameStateTitle = 0;
const gameStatePlayGame = 1;
const gameStateEnd = 2;
const gameStateHowToPlay = 3;
var currentGameState = gameStatePlayGame;

var keyInputs = new Array(128).fill(false);
var keyLocks = new Array(128).fill(false);

window.onload = function(){
    window.addEventListener("resize", windowResized);
    window.addEventListener("mousedown", mousePressed);
    window.addEventListener("mousemove", mouseMoved);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    canvas = document.getElementById("canvasID");
    textCanvas = document.getElementById("textCanvasID");
    textContext = textCanvas.getContext("2d");
    gl = canvas.getContext('webgl2');
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    canvas.style.position = "absolute";
    textCanvas.style.position = "absolute";
    windowResized();

    initCanvasRenderer(canvas.width, canvas.height);

    planetTexture = generateGLTexture2D(planetData, planetDataWidth, planetDataHeight);
    asteroidTexture = generateGLTexture2D(asteroidData, asteroidDataWidth, asteroidDataHeight);
    spaceTexture = generateGLTexture2D(spaceData, spaceDataWidth, spaceDataHeight);
    dino1Texture = generateGLTexture2D(dino1Data, dino1DataWidth, dino1DataHeight);
    dino2Texture = generateGLTexture2D(dino2Data, dino2DataWidth, dino2DataHeight);
    dino3Texture = generateGLTexture2D(dino3Data, dino3DataWidth, dino3DataHeight);
    dinoJumpTexture = generateGLTexture2D(dinoJumpData, dinoJumpDataWidth, dinoJumpDataHeight);
    dinoAnimationTextures.push(dino1Texture);
    dinoAnimationTextures.push(dino2Texture);
    dinoAnimationTextures.push(dino1Texture);
    dinoAnimationTextures.push(dino3Texture);
    currentDinoTexture = dinoAnimationTextures[0];

    gl.clearColor(0.0, 0.0, 0.0, 1);

    testAudio = document.getElementById("testAudioID");

    startTime = new Date().getTime();
    setInterval(updateGame, 0);
}

function updateGame(){
    textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
    canvasDepth = 0;
    
    let textOffset = canvas.width * 0.0005;
    let textScale = canvas.width * 0.01;
    textContext.font = textScale + "px Arial";

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);


    switch(currentGameState){
        case gameStateTitle:{
            if(keyPressedOnce(KEY_W)){
                currentGameState = gameStateHowToPlay;
            }else if(keyPressedOnce(KEY_ENTER)){
                gl.clearColor(0.8, 0.5, 0, 1);
                currentGameState = gameStatePlayGame;
            }

            textContext.fillText("Game Title", 650 * textOffset, 100 * textOffset);
            textContext.fillText("Click to toggle sound", 450, 200);
            if(soundOn){
                textContext.fillText("Sound: On", 650, 300);
            }else{
                textContext.fillText("Sound: Off", 650, 300);
            }

            textContext.fillText("Press W to learn how to play", 400, 400);
            textContext.fillText("Press ENTER to begin game", 400, 500);
            break;
        }
        case gameStatePlayGame:{
            if(dinoJumping){
                if(keyInputs[KEY_D]){
                    planetAngle += deltaTime;
                }
                if(keyInputs[KEY_A]){
                    planetAngle -= deltaTime;
                }

                dinoPosition.y += dinoJumpVelocity * deltaTime * 2;
                dinoJumpVelocity -= gravity * deltaTime * 2;
                if(dinoPosition.y <= dinoGroundPosition){
                    currentDinoTexture = dinoAnimationTextures[currentDinoWalkFrame];
                    dinoScale.x = dino1DataWidth;
                    dinoScale.y = dino1DataHeight;
                    dinoPosition.y = dinoGroundPosition
                    dinoJumping = false;

                    if(!dinoFacingRight){
                        dinoScale.x = -dinoScale.x;
                        dinoPosition.x = 850;
                    }
                }
            }else{
                if(keyInputs[KEY_D]){
                    dinoAnimationTimer += deltaTime * 3;
                    planetAngle += deltaTime;
                }
                if(keyInputs[KEY_A]){
                    dinoAnimationTimer += deltaTime * 3;
                    planetAngle -= deltaTime;
                }

                if(keyPressedOnce(KEY_A) && dinoScale.x > 0){
                    dinoScale.x = -dinoScale.x;
                    dinoPosition.x = 850;
                    dinoFacingRight = false;
                }
                if(keyPressedOnce(KEY_D) && dinoScale.x < 0){
                    dinoScale.x = -dinoScale.x;
                    dinoPosition.x = 800;
                    dinoFacingRight = true;
                }

                if(keyPressedOnce(KEY_SPACE)){
                    currentDinoTexture = dinoJumpTexture;
                    dinoScale.x = dinoJumpDataWidth;
                    dinoScale.y = dinoJumpDataHeight;
                    dinoJumpVelocity = dinoJumpForce;
                    dinoJumping = true;

                    if(!dinoFacingRight){
                        dinoScale.x = -dinoScale.x;
                        dinoPosition.x = 850;
                    }
                }

                if(dinoAnimationTimer > dinoFrameTime){
                    dinoAnimationTimer = 0;
                    currentDinoWalkFrame = (currentDinoWalkFrame + 1) % dinoAnimationTextures.length;
                    currentDinoTexture = dinoAnimationTextures[currentDinoWalkFrame];
                }
            }

            textContext.fillStyle = "#FFFFFF";
            textContext.fillText("delta: " + deltaTime, 50 * textOffset, 50 * textOffset);
            renderQuad(spacePosition, spaceScale, whiteColor, spaceTexture);
            renderRotatedQuad(planetPosition, planetScale, whiteColor, planetTexture, planetAngle);
            renderQuad(dinoPosition, dinoScale, whiteColor, currentDinoTexture);
            
            break;
        }
        case gameStateEnd:{
            break;
        }
        case gameStateHowToPlay:{
            textContext.fillText("A to left", 400, 100);
            textContext.fillText("D to right", 400, 200);
            textContext.fillText("SPACE to jump", 400, 300);
            textContext.fillText("Press SPACE to return to the main menu", 100, 400);
            if(keyPressedOnce(KEY_SPACE)){
                currentGameState = gameStateTitle;
            }
            break;
        }
    }

    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    startTime = endTime;
}

function windowResized(e){
    canvas.top = 0;
    canvas.left = 0;
    textCanvas.top = 0;
    textCanvas.left = 0;
    if(window.innerWidth > window.innerHeight * aspectRatio){
        canvas.height = window.innerHeight * 0.95;
        canvas.width = canvas.height * aspectRatio;
    }else{
        canvas.width = window.innerWidth * 0.95;
        canvas.height = canvas.width * (1.0 / aspectRatio);
    }    

    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    if(gl != null){
        gl.viewport(canvas.left, canvas.bottom, canvas.width, canvas.height);
    }
}

function keyDown(e){
    keyInputs[e.keyCode] = true;
}

function keyUp(e){
    keyInputs[e.keyCode] = false;
}

function mousePressed(e){
    soundOn = !soundOn;

    if(soundOn){
        testAudio.play();
    }
}

function mouseMoved(e){

}

function keyPressedOnce(key){
    if(keyInputs[key] && !keyLocks[key]){
        keyLocks[key] = true;
        return true;
    }else if(!keyInputs[key]){
        keyLocks[key] = false;
    }
}

