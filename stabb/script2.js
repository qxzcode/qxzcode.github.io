

function Player(x,y) {
  return {
    rect: rectCenter(x,y,5,10),
    vx:0, vy:0,
    oldX:x, oldY:y,
    onGround: false,
    joyL:false,joyR:false,joyU:false,joyD:false,
    btnAtk:false,btnJmp:false,
    frame:
function(dt,t) {
  var r = this.rect;
  if (this.joyL)
    r.x -= 100*dt;
  if (this.joyR)
    r.x += 100*dt;
  if (this.btnJmp) {
    this.btnJmp = false;
    if (this.onGround)
      this.vy = 300;
  }
  this.vy -= 1000*dt;
  r.x += this.vx*dt;
  r.y += this.vy*dt;
  this.doCollide();
  
  bindTex(null);
  drawRect(r);
  var a = this.joyD?Math.sin(t*8):0;
  drawSwordHeld(r.x+4,r.y+2,a/2);
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

var drawSwordCenter,drawSwordHeld;
function initSword() {
  var rtt = createRTT(16,16);
  var r = rectCorner(0,0,16,16);
  drawSwordCenter = function(x,y,a) {
    rtt.start();
    mat4.translate(tMat,tMat,[8,8,0]);
    mat4.rotateZ(tMat,tMat,a);
    setTMat();
    bindTex(solidTex);
    drawRect(rectCenter(0,0,8,0.5),[0.8,0.8,0.8]);
    drawRect(rectCenter(-5.5,0,0.5,1.5),[0.8,0.8,0.8]);
    rtt.stop();
    bindTex(rtt.tex);
    r.x = x;
    r.y = y;
    drawRect(r);
  }
  drawSwordHeld = function(x,y,a) {
    drawSwordCenter(x+Math.cos(a)*5,y+Math.sin(a)*5,a);
  }
}; 
