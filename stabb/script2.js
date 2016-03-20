

function Player(x,y) {
  return {
    rect: rectCenter(x,y,5,10),
    vx:0, vy:0,
    oldX:x, oldY:y,
    onGround: false,
    joyL:false,joyR:false,joyU:false,joyD:false,
    btnAtk:false,btnJmp:false,
    sword:null,
    lunge:0,parry:0,
    frame:
function(dt,t) {
  // move and handle collisions with terrain
  var r = this.rect;
  var spd = 100, acc = 800;
  if (this.joyL) {
    this.vx -= acc*dt;
    if (this.vx<-spd) this.vx=-spd;
  } else if (this.joyR) {
    this.vx += acc*dt;
    if (this.vx>spd) this.vx=spd;
  } else {
    var p = this.vx<0;
    this.vx = Math.abs(this.vx)-acc*dt;
    if (this.vx<0) this.vx=0;
    if (p) this.vx*=-1;
  }
  if (this.btnJmp) {
    this.btnJmp = false;
    if (this.onGround)
      this.vy = 300;
  }
  if (this.btnAtk) {
    this.btnAtk = false;
    if (this.lunge<=0)
      this.lunge = .25;
  }
  this.lunge -= dt;
  this.parry -= dt;
  this.vy -= 1000*dt;
  r.x += this.vx*dt;
  r.y += this.vy*dt;
  this.doCollide();
  
  // check collisions with opponent & their sword
  var op = this==player1?player2:player1;
  var opSide = op.rect.x>r.x;
  if (op.sword) {
    if (op.sword.touching(r.toRRect())) {
      this.sword = null;
      return true;
    }
    if (this.sword&&op.sword.touching(this.sword)) {
      this.vx = opSide?-100:100;
      if (this.parry<0) this.parry = Math.PI/15;
    }
  }
  
  // draw this player
  bindTex(null);
  drawRect(r);
  var a = this.parry<0?0:-Math.sin(this.parry*30)/5;
  var l = this.lunge*4;
  var tx = l>0? (l-l*l)*4*10 : 0;
  tx += 4;
  if (!opSide) {
    a = Math.PI-a;
    tx = -tx;
  }
  this.sword = drawSwordHeld(r.x+tx,r.y+2,a);
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
  drawSwordCenter = function(x,y,a) {
    rtt.start();
    mat4.translate(tMat,tMat,[8,8,0]);
    mat4.rotateZ(tMat,tMat,a);
    bindTex(solidTex);
    drawRect(rectCenter(0,0,8,0.5),[0.8,0.8,0.8]);
    drawRect(rectCenter(-5.5,0,0.5,1.5),[0.8,0.8,0.8]);
    rtt.stop();
    bindTex(rtt.tex);
    var r = rrectCenter(x,y,8,8,a);
    drawRect(r);
    r.ry=0.5;
    return r;
  }
  drawSwordHeld = function(x,y,a) {
    return drawSwordCenter(x+Math.cos(a)*5,y+Math.sin(a)*5,a);
  }
};
