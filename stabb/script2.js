

function Player(x,y) {
  return {
    rect: rectCenter(x,y,20,40),
    sword: rectCenter(x+35,y-10,30,3),
    vx:0, vy:0,
    oldX:x, oldY:y,
    onGround: false,
    frame:
function(dt,t) {
  var r = this.rect;
  if (leftTID!=null)
    r.x -= 500*dt;
  if (rightTID!=null)
    r.x += 500*dt;
  this.vy += 8000*dt;
  r.y += this.vy*dt;
  this.doCollide();
  this.sword.x = r.x+35;
  this.sword.y = r.y-10;
  
  drawRect(r,"#f80");
  drawRect(this.sword,"#ccc");
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
    if (this.rect.y-this.oldY>0) {
      this.rect.y = res.y-(res.ry+this.rect.ry);
      this.onGround = true;
    } else
      this.rect.y = res.y+(res.ry+this.rect.ry);
    this.vy = 0;
  }
  this.oldX = this.rect.x;
  this.oldY = this.rect.y;
}
  };
}

