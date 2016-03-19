

function Player(x,y) {
  return {
    rect: rectCenter(x,y,3,7),
    vx:0, vy:0,
    oldX:x, oldY:y,
    onGround: false,
    frame:
function(dt,t) {
  var r = this.rect;
  if (joyL)
    r.x -= 100*dt;
  if (joyR)
    r.x += 100*dt;
  if (btnJmp) {
    btnJmp = false;
    if (this.onGround)
      this.vy = 300;
  }
  this.vy -= 1000*dt;
  r.y += this.vy*dt;
  this.doCollide();
  
  drawRect(r,[0,1,0]);
  return false;
},
  doCollide:
function() {
  this.onGround = false;
  var newY = this.rect.y;
  this.rect.y = this.oldY;
  var res = checkTerrain(this.rect);
  if (res) {
    if (this.rect.x-this.oldX>0)
      this.rect.x = res.x-(res.rx+this.rect.rx);
    else
      this.rect.x = res.x+(res.rx+this.rect.rx);
    this.vx = 0;
  }
  this.rect.y = newY;
  res = checkTerrain(this.rect);
  if (res) {
    if (this.rect.y-this.oldY>0)
      this.rect.y = res.y-(res.ry+this.rect.ry);
    else {
      this.rect.y = res.y+(res.ry+this.rect.ry);
      this.onGround = true;
    }
    this.vy = 0;
  }
  this.oldX = this.rect.x;
  this.oldY = this.rect.y;
}
  };
}

