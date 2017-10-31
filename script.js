var renderer = PIXI.autoDetectRenderer(256, 256);
var stage = new PIXI.Container();
var gameScene,initialScene;

var enemySpeed = 6;
var playerspeed = 5;
var bulletspeed = 2;
var bulletspeedincrease = 10;
var bulletspeedmax = 30;

var enemyCount = 2;

var up = keyboard(38);
var down = keyboard(40);
var space = keyboard(32);
var player;

var Initshots = 10;

var score = 0;
var highscore = 0;

var killReward = 4;


var state = greeting;
var gameState = 0;
var GREETING = 0, GAME = 1, GAMEOVER = 2;
var spawnpos = window.innerWidth*0.3;
var spawnIncreaseCounter = 0;
var spawnTimer = 0;



var container = {x: 0, y: 50, width: window.innerWidth, height: window.innerHeight - 50};

var playerHealth = 3;
var playerTimeToReload = 3;
var playerReloadTimer = 0;

var bullets = [];
var enemies = [];

var topText;
var botText;

var ALLY = true,ENEMY = false;

window.onload = function() {
  setup();
  gameLoop();
};


function setup(){
  gameScene = new PIXI.Container();
  stage.addChild(gameScene);

  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(window.innerWidth, window.innerHeight);

  //Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

  var topBar = barGraphic();
  gameScene.addChild(topBar);
  var botBar = barGraphic();
  botBar.y = window.innerHeight-50;
  gameScene.addChild(botBar);

  var textFormat = {fontFamily: "Futura", fontSize: 32, fill:'white', align: 'center'};
  topText = new PIXI.Text("Shots: " + Initshots, textFormat);
  topText.x = window.innerWidth/2 - topText.width/2;
  topText.y = 5;
  gameScene.addChild(topText);

  botText = new PIXI.Text("Current score: " + score + " Highscore: " + highscore  , textFormat);
  botText.x = window.innerWidth/2 - botText.width/2;
  botText.y = window.innerHeight-45;
  gameScene.addChild(botText);

  player = playerGraphic();
  player.x = window.innerWidth*0.1;
  player.y = window.innerHeight*0.5;
  player.vy = 0;
  player.vx = 0;
  player.shots = Initshots;
  player.shooting = false;
  player.team = ALLY;
  gameScene.addChild(player);

  for(var i = 0 ;  i < enemyCount; i++){
    spawnEnemy();
  }

  initialScene = new PIXI.Container();
  stage.addChild(initialScene);

  var initText = new PIXI.Text("Welcome! \n Press space to begin the game",{fontFamily: "Futura", fontSize: 32, fill:'white', align: 'center'});
  initText.x = window.innerWidth/2 - initText.width/2;
  initText.y = window.innerHeight/2 - initText.height/2;
  initialScene.addChild(initText);

  gameOverScene = new PIXI.Container();
  stage.addChild(gameOverScene);

  var gameOverText = new PIXI.Text("Game Over! \n Press space to play again",{fontFamily: "Futura", fontSize: 32, fill:'white', align: 'center'});
  gameOverText.x = window.innerWidth/2 - gameOverText.width/2;
  gameOverText.y = window.innerHeight/2 - gameOverText.height/2;
  gameOverScene.addChild(gameOverText);



  up.press = function(){
    player.vy = -playerspeed;
  };
  up.release = function(){
    if (!down.isDown) {
      player.vy = 0;
    }
  };

  down.press = function(){
    player.vy = playerspeed;
  };
  down.release = function(){
    if(!up.isDown){
      player.vy = 0;
    }
  };
  space.press = function(){

    if(gameState === GREETING || gameState === GAMEOVER){
      state = play;
      gameState = GAME;
    }else if(gameState == GAME){
      player.shooting = true;
    }
  };
  space.release = function(){
    if(player.shooting === true){
      player.shooting = false;
    }
  };
}


function gameLoop(){
  requestAnimationFrame(gameLoop);
  state();
  renderer.render(stage);
}

function play() {
  initialScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;
  //Player
  player.y += player.vy;
  player.x += player.vx;
  contain(player, container);
  if(player.shooting === true && playerReloadTimer >= playerTimeToReload && player.shots >= 1){
    playerReloadTimer = 0 ;
    player.shots -=1;
    topText.setText("Shots: " + player.shots);
    spawnBullet(player);
  }
  if(playerReloadTimer < playerTimeToReload){
    playerReloadTimer += 0.1;
  }



  //Bullets
  var tempBullets = [];
  bullets.forEach(function(bullet){
    var marked = false;
    bullet.y += bullet.vy;
    bullet.x += bullet.vx;
    if(bullet.vx <= bulletspeedmax){
      bullet.vx += bullet.vx/bulletspeedincrease;
    }


    var atWall = contain(bullet,container);
    if(atWall === "left" || atWall ==="right"){
      gameScene.removeChild(bullet);
      marked = true;
    }else if(bullet.tag === "a"){
      enemies.forEach(function(enemy){
        if(colliderRectangle(bullet,enemy)){
          marked = true;

          gameScene.removeChild(bullet);
          enemy.health -= 1;
        }
      });
    }
    if(!marked){
      tempBullets.push(bullet);
    }
  });
  bullets = tempBullets;



  //Enemy
  if(enemies.length < enemyCount && spawnTimer >= 2){
    spawnIncreaseCounter++;
    if(spawnIncreaseCounter >= 3){
      spawnIncreaseCounter = 0;
      if(spawnpos <=  window.innerWidth * 0.8){
          spawnpos += window.innerWidth*0.1;
      }
    }
    spawnEnemy();
  }
  if(spawnTimer < 2){
    spawnTimer += 0.1;
  }

  var tempEnemies = [];
  enemies.forEach(function(enemy){
    enemy.y += enemy.vy;
    enemy.x += enemy.vx;
    var atWall = contain(enemy,container) ;
    if(atWall === "top" ||  atWall === "bottom"){
      enemy.vy *= -1;
    }
    if(enemy.health <= 0){
      player.shots += killReward;
      topText.setText("Shots: " + player.shots);
      gameScene.removeChild(enemy);
      spawnTimer = 0;
      score++;
    }else{
      tempEnemies.push(enemy);
    }
  });
  enemies = tempEnemies;

  if(score > highscore){
    highscore = score;
  }

  botText.setText("Current score: " + score + " Highscore: " + highscore);

  //Test gameover
  if(player.shots <= 0 && bullets.length <= 0){
    state = gameOver;
    gameState = GAMEOVER;
  }
}

function greeting() {
  gameScene.visible = false;
  gameOverScene.visible = false;
  initialScene.visible = true;
}

function gameOver() {
  gameScene.visible = false;
  gameOverScene.visible = true;
  initialScene.visible = false;
  score = 0;
  spawnpos = window.innerWidth * 0.3;
  player.shots = 10;
  enemies.forEach(function(enemy){
    gameScene.removeChild(enemy);
  });
  enemies = [];
  for(var i = 0 ;  i < enemyCount; i++){
    spawnEnemy();
  }
  topText.setText("Shots: " + player.shots);

}



function contain(sprite, container) {
  var collision;
  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }
  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }
  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }
  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }
  //Return the `collision` value
  return collision;
}
//The `hitTestRectangle` function

function colliderRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;
}

function spawnBullet(spawner){
  var bullet = bulletGraphic();
  bullet.x = spawner.x + 40;
  bullet.y = spawner.y + 25;
  bullet.vy = 0;
  if(spawner.team){
    bullet.vx = bulletspeed;
    bullet.tag = "a"; //a for ally
  }else{
    bullet.vx = -bulletspeed;
    bullet.tag = "e"; //e for enemy
  }

  bullets.push(bullet);
  gameScene.addChild(bullet);
}

function spawnEnemy() {
  enemy = enemyGraphic();
  enemy.x = spawnpos;
  enemy.y = window.innerHeight*Math.random();
  enemy.vy = randomInt(5,7);
  enemy.vx = 0;
  enemy.health = 2;
  enemy.team = ENEMY;
  enemy.hit = false;

  enemies.push(enemy);
  gameScene.addChild(enemy);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    //event.preventDefault(); This also disables standard inputs.
  };
  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    //event.preventDefault();
  };
  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}
