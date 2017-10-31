
var boxsize = 20;
function playerGraphic(){
  var player = new PIXI.Graphics();
  player.lineStyle(2, 0x000000, 1);
  player.beginFill(0x0000ff, 1);
  player.drawRect(0, 0, boxsize, boxsize);
  player.drawRect(0, boxsize, boxsize, boxsize);
  player.drawRect(0, 2*boxsize, boxsize, boxsize);
  player.drawRect(boxsize, boxsize, boxsize, boxsize);
  return player;
}

function enemyGraphic(){
  var enemy = new PIXI.Graphics();
  enemy.lineStyle(2, 0x000000, 1);
  enemy.beginFill(0xff0000, 1);
  enemy.drawRect(0, 0, boxsize, boxsize);
  enemy.drawRect(0, boxsize, boxsize, boxsize);
  return enemy;
}


function bulletGraphic(){
  var bullet = new PIXI.Graphics();
  bullet.lineStyle(2,0x000000,1);
  bullet.beginFill(0xffff00);
  bullet.drawRect(0,0,boxsize,boxsize/3);
  return bullet;
}

function barGraphic() {
  var bar = new PIXI.Graphics();
  bar.beginFill(0x696969);
  bar.drawRect(0,0,window.innerWidth, 49);
  bar.alpha = 0.5;
  return bar;
}
