class Asteroid{
    constructor(){
        let a = map(Math.random(), 0, 1, 0, Math.PI * 2);
        this.size = map(Math.random(), 0, 1, 0.3, 0.6); 
        this.position = Vector2.rotate(new Vector2(-100, 500), planetCenter, a);
        this.collisionPosition = new Vector2();
        this.scale = new Vector2(asteroidDataWidth * this.size, asteroidDataHeight * this.size);
        this.rockScale = new Vector2(rockDataWidth * this.size, rockDataHeight * this.size);
        this.velocity = new Vector2();
        this.speed = map(Math.random(), 0, 1, 80, 120);
        this.angle = 0;
        this.animationTimer = 0;
        this.frameTime = 0;
        this.color = 0;
        this.hitPosition = new Vector2();
        this.hit = false;
    }
}

class Explosion{
    constructor(x, y){
        this.position = new Vector2(x, y);
        this.scale = new Vector2(explosion1DataWidth, explosion1DataHeight);
        this.animationTimer = 0;
        this.currentFrame = 0;
        this.angle = 0;
    }
}

class DustCloud{
    constructor(x, y){
        this.position = new Vector2(x, y);
        this.scale = new Vector2(explosion2DataWidth, explosion2DataHeight);
        this.color = new Vector4(1, 1, 1, 1);
    }
}

const aspectRatio = 1.7777778;
const clearColor = new Vector4(0, 0, 0, 0);
const blackColor = new Vector4(0, 0, 0, 1);
const whiteColor = new Vector4(1, 1, 1, 1);

const planetHealthBackgroundColor = new Vector4(0, 0, 0.5, 0.75);
const planetHealthForegroundColor = new Vector4(0, 0, 1, 0.75);

const idealCanvasWidth = 1703;
const idealCanvasHeight = 958;

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

var startTime = 0;
var endTime = 0;
var deltaTime = 0;

var cameraShake = false;
var cameraOffset = new Vector2(5, 5);
var cameraShakeTimer = 0;
var cameraShakeDuration = 1;

var planetTexture;
var asteroidTexture;
var rockTexture;
var spaceTexture;
var dino1Texture;
var dino2Texture;
var dino3Texture;
var dinoJumpTexture;
var explosion1Texture;
var explosion2Texture;
var explosion3Texture;
var currentDinoTexture;
var arrowTexture;
var endScreenTexture;
var titleTexture;
var currentDinoWalkFrame = 0;
var dinoAnimationTextures = [];
var explosionAnimationTextures = [];
var explosionScales = [
    new Vector2(explosion1DataWidth, explosion1DataHeight),
    new Vector2(explosion2DataWidth, explosion2DataHeight),
    new Vector2(explosion3DataWidth, explosion3DataHeight),
    new Vector2(explosion2DataWidth, explosion2DataHeight),
    new Vector2(explosion1DataWidth, explosion1DataHeight),
];

var spacePosition = new Vector2(0, 0);
var spaceScale = new Vector2(idealCanvasWidth, idealCanvasHeight);

var planetPosition = new Vector2(700, 375);
var planetScale = new Vector2(250, 250);
var planetCenter = Vector2.add(planetPosition, Vector2.scale(planetScale, 0.5));
var planetAngle = 0;
var planetAngleAddAmount = 0;
var planetMaxHealth = 10;
var planetHealth = planetMaxHealth;
var planetHealthBarPosition = new Vector2();
var planetHealthBarScale = new Vector2();

var dinoGroundPosition = 620;
var dinoPosition = new Vector2(800, dinoGroundPosition);
var dinoScale = new Vector2(dino1DataWidth, dino1DataHeight);

var dinoAnimationTimer = 0;
var dinoFrameTime = 0.5;

var dinoFacingRight = true;
var dinoJumping = false;
var dinoJumpForce = 70;
var dinoJumpVelocity = 0;
var dinoCollisionPosition = new Vector2();

var gravity = 100;

var rockScale = new Vector3(rockDataWidth * 0.5, rockDataHeight * 0.5);

var asteroidLaunchTimer = 0;
var asteroidLaunchDuration = 10;

var asteroidFrameTime = 0.1;
var asteroidAltColor = new Vector4(0.7, 0.7, 0.7, 1);
var asteroidColorList = [whiteColor, asteroidAltColor];

var planetAlive = true;
var gameEndTimer = 0;
var gameEndDuration = 10;
var score = 0;
var hiScore = 0;

var asteroids = [];
var explosions = [];
var dustClouds = [];

var testAudio;
var bonkAudio;
var boomAudio;
var crashAudio;

var soundOn = false;

const gameStateTitle = 0;
const gameStatePlayGame = 1;
const gameStateEnd = 2;
const gameStateHowToPlay1 = 3;
const gameStateHowToPlay2 = 4;
var currentGameState = gameStateTitle;

var keyInputs = new Array(128).fill(false);
var keyLocks = new Array(128).fill(false);

window.onload = function(){
    window.addEventListener("resize", windowResized);
    window.addEventListener("mousedown", mousePressed);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    let hs = localStorage.getItem('hiScore');
    if(hs != null){
        hiScore = hs;
    }

    canvas = document.getElementById("canvasID");
    textCanvas = document.getElementById("textCanvasID");
    textContext = textCanvas.getContext("2d");

    canvas.style.position = "absolute";
    textCanvas.style.position = "absolute";
    canvas.top = 0;
    canvas.left = 0;
    canvas.width = idealCanvasWidth;
    canvas.height = idealCanvasHeight;
    textCanvas.top = 0;
    textCanvas.left = 0;
    textCanvas.width = idealCanvasWidth;
    textCanvas.height = idealCanvasHeight;

    gl = canvas.getContext('webgl2');
    gl.viewport(0, 0, idealCanvasWidth, idealCanvasHeight);
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 1);

    windowResized();

    initCanvasRenderer(idealCanvasWidth, idealCanvasHeight);

    planetTexture = generateGLTexture2D(planetData, planetDataWidth, planetDataHeight);
    asteroidTexture = generateGLTexture2D(asteroidData, asteroidDataWidth, asteroidDataHeight);
    rockTexture = generateGLTexture2D(rockData, rockDataWidth, rockDataHeight);
    spaceTexture = generateGLTexture2D(spaceData, spaceDataWidth, spaceDataHeight);
    dino1Texture = generateGLTexture2D(dino1Data, dino1DataWidth, dino1DataHeight);
    dino2Texture = generateGLTexture2D(dino2Data, dino2DataWidth, dino2DataHeight);
    dino3Texture = generateGLTexture2D(dino3Data, dino3DataWidth, dino3DataHeight);
    dinoJumpTexture = generateGLTexture2D(dinoJumpData, dinoJumpDataWidth, dinoJumpDataHeight);
    explosion1Texture = generateGLTexture2D(explosion1Data, explosion1DataWidth, explosion1DataHeight);
    explosion2Texture = generateGLTexture2D(explosion2Data, explosion2DataWidth, explosion2DataHeight);
    explosion3Texture = generateGLTexture2D(explosion3Data, explosion3DataWidth, explosion3DataHeight);
    arrowTexture = generateGLTexture2D(arrowData, arrowDataWidth, arrowDataHeight);
    endScreeTexture = generateGLTexture2D(endScreenData, endScreenDataWidth, endScreenDataHeight);
    titleTexture = generateGLTexture2D(titleData, titleDataWidth, titleDataHeight);
    dinoAnimationTextures.push(dino1Texture);
    dinoAnimationTextures.push(dino2Texture);
    dinoAnimationTextures.push(dino1Texture);
    dinoAnimationTextures.push(dino3Texture);
    explosionAnimationTextures.push(explosion1Texture);
    explosionAnimationTextures.push(explosion2Texture);
    explosionAnimationTextures.push(explosion3Texture);
    explosionAnimationTextures.push(explosion2Texture);
    explosionAnimationTextures.push(explosion1Texture);
    currentDinoTexture = dinoAnimationTextures[0];

    asteroids.push(new Asteroid());

    testAudio = document.getElementById("testAudioID");
    bonkAudio = document.getElementById("bonkAudioID");
    boomAudio = document.getElementById("boomAudioID");
    crashAudio = document.getElementById("crashAudioID");

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
                currentGameState = gameStateHowToPlay1;
            }else if(keyPressedOnce(KEY_ENTER)){
                resetGame();
                currentGameState = gameStatePlayGame;
            }
            
            renderQuad(new Vector2(), new Vector2(idealCanvasWidth, idealCanvasHeight), new Vector4(1, 1, 1, 0.6), endScreeTexture);
            renderQuad(new Vector2(500, 500), new Vector2(titleDataWidth * 3, titleDataHeight * 3), whiteColor, titleTexture);
            textScale = canvas.width * 0.05;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#CCCCCC";
            textContext.fillText("Click to Toggle Sound: ", 500 * textOffset, 650 * textOffset);
            if(soundOn){
                textContext.fillText("ON", 1500 * textOffset, 655 * textOffset);
            }else{
                textContext.fillText("OFF", 1500 * textOffset, 655 * textOffset);
            }
            textContext.fillText("Press W to Learn How to Play", 430 * textOffset, 780 * textOffset);
            textContext.fillText("Press ENTER to Start the Game", 380 * textOffset, 910 * textOffset);
            textContext.fillText("High Score: " + hiScore, 700 * textOffset, 1030 * textOffset);
            break;
        }
        case gameStatePlayGame:{
            planetAngleAddAmount = 0;

            asteroidLaunchDuration -= deltaTime * 0.1;
            if(asteroidLaunchDuration < 1){
                asteroidLaunchDuration = 1;
            }

            if(dinoJumping){
                for(let i = 0; i < asteroids.length; i++){
                    let as = asteroids[i];
                    if(!as.hit && Vector2.distance(dinoCollisionPosition, as.collisionPosition) < 35){
                        as.hit = true;
                        as.position = as.collisionPosition;
                        as.velocity = Vector2.sub(as.collisionPosition, dinoCollisionPosition);
                        dustClouds.push(new DustCloud(as.collisionPosition.x, dinoCollisionPosition.y));
                        asteroidLaunchDuration += 0.1;
                        playSound(bonkAudio);
                    }
                }

                if(keyInputs[KEY_D]){
                    planetAngleAddAmount = deltaTime;
                }
                if(keyInputs[KEY_A]){
                    planetAngleAddAmount = -deltaTime;
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

                if(dinoFacingRight){
                    dinoCollisionPosition.x = dinoPosition.x + dinoScale.x * 0.7;
                    dinoCollisionPosition.y = dinoPosition.y + dinoScale.y * 0.9;
                }else{
                    dinoCollisionPosition.x = dinoPosition.x + dinoScale.x * 0.8 ;
                    dinoCollisionPosition.y = dinoPosition.y + dinoScale.y * 0.9;
                }
                

            }else{
                if(keyInputs[KEY_D]){
                    dinoAnimationTimer += deltaTime * 3;
                    planetAngleAddAmount = deltaTime;
                }
                if(keyInputs[KEY_A]){
                    dinoAnimationTimer += deltaTime * 3;
                    planetAngleAddAmount = -deltaTime;
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

                if(keyPressedOnce(KEY_W)){
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
                    playSound(testAudio);
                    dinoAnimationTimer = 0;
                    currentDinoWalkFrame = (currentDinoWalkFrame + 1) % dinoAnimationTextures.length;
                    currentDinoTexture = dinoAnimationTextures[currentDinoWalkFrame];
                }
            }
            planetAngle += planetAngleAddAmount;

            asteroidLaunchTimer += deltaTime;
            if(asteroidLaunchTimer > asteroidLaunchDuration){
                asteroidLaunchTimer = 0;
                asteroids.push(new Asteroid);
            }

            if(cameraShake){
                cameraOffset.x += map(Math.random(), 0, 1, -1, 1);
                cameraOffset.y += map(Math.random(), 0, 1, -1, 1);

                cameraShakeTimer += deltaTime;
                if(cameraShakeTimer > cameraShakeDuration){
                    cameraShake = false;
                }
            }else{
                cameraOffset.x = 0;
                cameraOffset.y = 0;
            }

            textContext.fillStyle = "#FFFFFF";
            textContext.fillText("Score: " + score.toFixed(3), 50 * textOffset, 50 * textOffset);
            renderQuad(Vector2.add(cameraOffset, spacePosition), spaceScale, whiteColor, spaceTexture);
            renderRotatedQuad(planetPosition, planetScale, whiteColor, planetTexture, planetAngle);

            if(planetAlive){
                score += deltaTime;
                renderQuad(dinoPosition, dinoScale, whiteColor, currentDinoTexture);
            }else{
                gameEndTimer += deltaTime;
                if(gameEndTimer > gameEndDuration){
                    currentGameState = gameStateEnd;
                }

                if(Math.random() < 0.05){
                    let xx = map(Math.random(), 0, 1, -100, 100);
                    let yy = map(Math.random(), 0, 1, -100, 100);
                    explosions.push(new Explosion(planetCenter.x + xx, planetCenter.y + yy));
                }
            }

            for(let i = 0; i < asteroids.length; i++){
                let as = asteroids[i];

                for(let j = 0; j < asteroids.length; j++){
                    if(j == i){
                        continue;
                    }
                    let as2 = asteroids[j];
                    if(as.hit == as2.hit){
                        continue;
                    }
                    if(Vector2.distance(as.collisionPosition, as2.collisionPosition) < 20){
                        explosions.push(new Explosion(as.collisionPosition.x, as.collisionPosition.y));
                        planetHealth += as.size;
                        asteroidLaunchDuration += 0.2;
                        if(planetHealth > planetMaxHealth){
                            planetHealth = planetMaxHealth;
                        }
                        if(i < j){
                            asteroids.splice(i, 1);
                            asteroids.splice(j - 1, 1);
                        }else{
                            asteroids.splice(j, 1);
                            asteroids.splice(i - 1, 1);
                        }
                        i--;
                        playSound(crashAudio);
                        break;
                    }
                }

                as.animationTimer += deltaTime;
                if(as.animationTimer > asteroidFrameTime){
                    as.animationTimer = 0;
                    as.color = (as.color + 1) % asteroidColorList.length;
                }

                if(as.hit){
                    as.velocity = Vector2.sub(as.position, dinoPosition);
                    if(Vector2.distance(as.position, planetCenter) > 1000){
                        asteroids.splice(i, 1);
                        i--;
                        continue;
                    }

                    as.collisionPosition.x = as.position.x + as.rockScale.x * 0.5;
                    as.collisionPosition.y = as.position.y + as.rockScale.y * 0.5;
                    as.collisionPosition = Vector2.rotate(as.collisionPosition, Vector2.add(as.position, Vector2.scale(as.rockScale, 0.5)), as.angle);
                }else{
                    as.velocity = Vector2.sub(planetCenter, as.position);

                    as.collisionPosition.x = as.position.x + as.scale.x * 0.75;
                    as.collisionPosition.y = as.position.y + as.scale.y * 0.5;
                    as.collisionPosition = Vector2.rotate(as.collisionPosition, Vector2.add(as.position, Vector2.scale(as.scale, 0.5)), as.angle);
                }

                as.position = Vector2.rotate(as.position, planetCenter, planetAngleAddAmount);
                as.angle = Math.atan2(as.velocity.y, as.velocity.x);
                as.velocity.normalize();
                as.velocity.scale(deltaTime * as.speed);
                as.position.add(as.velocity);


                if(!as.hit && Vector2.distance(as.collisionPosition, planetCenter) < 75){
                    asteroids.splice(i, 1);
                    explosions.push(new Explosion(as.collisionPosition.x, as.collisionPosition.y));
                    cameraShake = true;
                    cameraShakeTimer = 0;
                    planetHealth -= as.size;
                    if(planetHealth <= 0){
                        planetHealth = 0;
                        planetAlive = false;
                        cameraShake = true;
                        cameraShakeDuration = 10;
                        cameraShakeTimer = 0;
                    }
                    playSound(boomAudio);
                    i--;
                }
                if(as.hit){
                    renderRotatedQuad(Vector2.add(cameraOffset, as.position), as.rockScale, asteroidColorList[as.color], rockTexture, as.angle);
                }else{
                    if(as.position.y > idealCanvasHeight){
                        renderRotatedQuad(new Vector2(as.position.x, idealCanvasHeight - 39), new Vector2(39, 39), whiteColor, arrowTexture, 0);
                    }else if(as.position.y < 0){
                        renderRotatedQuad(new Vector2(as.position.x, 0), new Vector2(39, 39), whiteColor, arrowTexture, Math.PI);
                    }else{
                        renderRotatedQuad(Vector2.add(cameraOffset, as.position), as.scale, asteroidColorList[as.color], asteroidTexture, as.angle);
                    }
                }
            }

            for(let i = 0; i < explosions.length; i++){                
                let ex = explosions[i];
                ex.angle += deltaTime * 3;
                ex.animationTimer += deltaTime;
                if(ex.animationTimer > 0.3){
                    ex.animationTimer = 0;
                    ex.currentFrame++;
                    ex.scale = explosionScales[ex.currentFrame];
                    if(ex.currentFrame >= explosionAnimationTextures.length){
                        explosions.splice(i, 1);
                        i--;
                        continue;
                    }
                }
                ex.position = Vector2.rotate(ex.position, planetCenter, planetAngleAddAmount);
                renderRotatedQuad(ex.position, ex.scale, whiteColor, explosionAnimationTextures[ex.currentFrame], ex.angle);
            }

            for(let i = 0; i < dustClouds.length; i++){
                let dc = dustClouds[i];
                dc.position = Vector2.rotate(dc.position, planetCenter, planetAngleAddAmount);
                renderQuad(dc.position, dc.scale, dc.color, explosion2Texture);
                dc.color.w -= deltaTime;
                if(dc.color.w < 0){
                    dustClouds.splice(i, 1);
                    i--;
                }
            }

            textContext.fillText("Planet's Health", 500 * textOffset, 875 * textOffset);
            renderQuad(new Vector2(400, 100), new Vector2(800, 100), planetHealthBackgroundColor);
            renderQuad(new Vector2(420, 120), new Vector2(760 * (planetHealth / planetMaxHealth), 60), planetHealthForegroundColor);

            break;
        }
        case gameStateEnd:{
            textScale = canvas.width * 0.15;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#333333";
            textContext.fillText("GAME OVER", 100 * textOffset, 300 * textOffset);
            textScale = canvas.width * 0.14;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#EEEEEE";
            textContext.fillText("GAME OVER", 160 * textOffset, 300 * textOffset);

            textScale = canvas.width * 0.045;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#EEEEEE";
            textContext.fillText("You kept the planet alive for " + score.toFixed(3) + " seconds.", 50 * textOffset, 600 * textOffset);
            if(score > hiScore){
                textContext.fillText("NEW HI SCORE!", 650 * textOffset, 700 * textOffset);
            }
            textContext.fillText("Press ENTER to Play Again", 450 * textOffset, 800 * textOffset);
            textContext.fillText("Press W to Return to the Title Screen", 250 * textOffset, 900 * textOffset);

            renderQuad(new Vector2(), new Vector2(idealCanvasWidth, idealCanvasHeight), new Vector4(1, 1, 1, 0.6), endScreeTexture);

            if(keyPressedOnce(KEY_W)){
                currentGameState = gameStateTitle;
                if(score > hiScore){
                    hiScore = score.toFixed(3);
                    localStorage.setItem('hiScore', "" + hiScore);
                }
            }
            if(keyPressedOnce(KEY_ENTER)){
                if(score > hiScore){
                    hiScore = score.toFixed(3);
                    localStorage.setItem('hiScore', "" + hiScore);
                }
                resetGame();
                currentGameState = gameStatePlayGame;
            }
            break;
        }
        case gameStateHowToPlay1:{
            textScale = canvas.width * 0.04;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#CCCCCC";
            textContext.fillText("Asteroids are coming to destroy your planet!", 50 * textOffset, 100 * textOffset);
            textContext.fillText("Press A to Move Left", 50 * textOffset, 200 * textOffset);
            textContext.fillText("Press D to Move Right", 50 * textOffset, 300 * textOffset);
            textContext.fillText("Press W to Jump", 50 * textOffset, 400 * textOffset);

            textScale = canvas.width * 0.03;
            textContext.font = textScale + "px Arial";
            textContext.fillText("Hit the Asteroids with Your Head While Jumping to Deflect Them", 50 * textOffset, 550 * textOffset);

            textScale = canvas.width * 0.02;
            textContext.font = textScale + "px Arial";
            textContext.fillText("Press SPACE to Continue", 800 * textOffset, 1100 * textOffset);

            renderQuad(new Vector2(1400, 840), new Vector2(asteroidDataWidth * 1.75, asteroidDataHeight * 1.75), whiteColor, asteroidTexture);
            renderQuad(new Vector2(830, 780), new Vector2(-dino2DataWidth * 1.75, dino2DataHeight * 1.75), whiteColor, dino2Texture);
            renderQuad(new Vector2(750, 700), new Vector2(dino2DataWidth * 1.75, dino2DataHeight * 1.75), whiteColor, dino2Texture);
            renderQuad(new Vector2(550, 550), new Vector2(dinoJumpDataWidth * 1.75, dinoJumpDataHeight * 1.75), whiteColor, dinoJumpTexture);
            renderQuad(new Vector2(580, 100), new Vector2(dinoJumpDataWidth * 3, dinoJumpDataHeight * 3), whiteColor, dinoJumpTexture);
            renderQuad(new Vector2(700, 305), new Vector2(explosion2DataWidth * 3, explosion2DataWidth * 3), whiteColor, explosion2Texture);
            renderQuad(new Vector2(770, 365), new Vector2(rockDataWidth * 2, rockDataHeight * 2), whiteColor, rockTexture);

            if(keyPressedOnce(KEY_SPACE)){
                currentGameState = gameStateHowToPlay2;
            }
            break;
        }
        case gameStateHowToPlay2:{
            textScale = canvas.width * 0.04;
            textContext.font = textScale + "px Arial";
            textContext.fillStyle = "#CCCCCC";
            textContext.fillText("Colliding Asteroids Will Damage the Planet", 50 * textOffset, 100 * textOffset);

            textContext.fillText("Larger Asteroids Will Do More Damage", 50 * textOffset, 400 * textOffset);

            textScale = canvas.width * 0.03;
            textContext.font = textScale + "px Arial";
            textContext.fillText("The Planet Will be Destroyed When Its Health Reaches 0", 50 * textOffset, 600 * textOffset);
            textContext.fillText("Deflect Asteroids into Others to Increase the Planet's Health", 50 * textOffset, 800 * textOffset);

            textScale = canvas.width * 0.02;
            textContext.font = textScale + "px Arial";
            textContext.fillText("Press SPACE to Return to the Title Screen", 600 * textOffset, 1100 * textOffset);

            textScale = canvas.width * 0.01;
            textContext.font = textScale + "px Arial";
            textContext.fillText("Planet's Health", 500 * textOffset, 450 * textOffset);
            textContext.fillText("Planet's Health", 500 * textOffset, 650 * textOffset);

            renderQuad(new Vector2(700, 680), new Vector2(planetDataWidth, planetDataHeight), whiteColor, planetTexture);
            renderQuad(new Vector2(780, 780), new Vector2(explosion3DataWidth * 2, explosion3DataHeight * 2), whiteColor, explosion3Texture);

            renderQuad(new Vector2(400, 520), new Vector2(600, 50), planetHealthBackgroundColor);
            renderQuad(new Vector2(420, 530), new Vector2(500, 30), planetHealthForegroundColor);
            renderQuad(new Vector2(400, 350), new Vector2(600, 50), planetHealthBackgroundColor);

            renderRotatedQuad(new Vector2(700, 180), new Vector2(asteroidDataWidth * 1, asteroidDataHeight * 1), whiteColor, asteroidTexture, -2);
            renderQuad(new Vector2(685, 65), new Vector2(rockDataWidth * 1.1, rockDataHeight * 1.1), whiteColor, rockTexture);
            renderQuad(new Vector2(700, 95), new Vector2(explosion2DataWidth * 3, explosion2DataWidth * 3), whiteColor, explosion2Texture);

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

function resetGame(){
    asteroids = [];
    explosions = [];
    dustClouds = [];
    planetHealth = planetMaxHealth;
    score = 0;
    planetAngle = 0;
    cameraShake = false;
    cameraShakeDuration = 1;
    currentDinoWalkFrame = 0
    planetAlive = true;
    gameEndTimer = 0;
    gameEndDuration = 10;
    asteroidLaunchTimer = 0;
    asteroidLaunchDuration = 10;
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
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

function keyDown(e){
    keyInputs[e.keyCode] = true;
}

function keyUp(e){
    keyInputs[e.keyCode] = false;
}

function playSound(sound){
    if(soundOn){
        sound.play();
    }
}

function mousePressed(e){
    if(currentGameState == gameStateTitle){
        soundOn = !soundOn;

        playSound(testAudio);
    }
}

function keyPressedOnce(key){
    if(keyInputs[key] && !keyLocks[key]){
        keyLocks[key] = true;
        return true;
    }else if(!keyInputs[key]){
        keyLocks[key] = false;
    }
}

function map(v, minA, maxA, minB, maxB){
    let pct = (v - minA) / (maxA - minA);
    return ((maxB - minB) * pct) + minB;
}