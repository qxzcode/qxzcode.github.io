

function Player(x,y) {
  return {
    rect: rectCenter(x,y,5,10),
    vx:0, vy:0,
    oldX:x, oldY:y,
    onGround: false,
    joyL:null,joyR:null,joyU:null,joyD:null,
    lastJoyU:null,lastJoyD:null,
    btnAtk:false,btnJmp:false,
    sword:null,hasSword:true,
    swordPos:2,swordTar:2,
    curSY:null,lastSY:null,
    lunge:0,parry:0,
    roll:0,lastRolling:false,
    frame:
function(dt,t) {
  // move and handle collisions with terrain
  var r = this.rect;
  var spd = 100, acc = 800;
  if (this.joyL) {
    this.vx -= acc*dt;
    if (this.vx<-spd) this.vx=-spd;
  }
  if (this.joyR) {
    this.vx += acc*dt;
    if (this.vx>spd) this.vx=spd;
  }
  if (!this.joyR==!this.joyL) {
    var p = this.vx<0;
    this.vx = Math.abs(this.vx)-acc*dt;
    if (this.vx<0) this.vx=0;
    if (p) this.vx*=-1;
  }
  if (this.joyU&&!this.lastJoyU&&this.swordTar<7) {
    this.swordTar += 7;
  }
  this.lastJoyU = this.joyU;
  if (this.joyD&&!this.lastJoyD) {
    if (this.swordTar>0) this.swordTar -= 7;
    this.roll = 0.2;
  }
  this.lastJoyD = this.joyD;
  var rolling = this.roll<0 && this.joyD;
  r.ry = rolling? 5 : 10;
  if (!rolling&&this.lastRolling){r.y+=5;this.oldY+=5;this.swordTar=this.swordPos=-5}
  if (rolling&&!this.lastRolling){r.y-=5;this.oldY-=5}
  this.lastRolling = rolling;
  if (this.btnJmp) {
    this.btnJmp = false;
    if (this.onGround)
      this.vy = 300;
  }
  if (this.btnAtk) {
    this.btnAtk = false;
    if (this.lunge<=0&&!rolling)
      this.lunge = .25;
  }
  this.lunge -= dt;
  this.parry -= dt;
  this.roll -= dt;
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
      if (this.lastSY!=null && this.lastSY!=this.curSY) {
        op.hasSword = false;
      } else {
        this.vx = opSide?-100:100;
        if (this.parry<0) this.parry = Math.PI/15;
      }
    }
  }
  
  // draw this player
  bindTex(null);
  drawRect(r);
  var a = this.parry<0?0:-Math.sin(this.parry*30)/5;
  var l = this.lunge*4;
  var tx = l>0? (l-l*l)*4*20 : 0;
  tx += 4;
  if (!opSide) {
    a = Math.PI-a;
    tx = -tx;
  }
  if (this.swordPos>this.swordTar) {
    this.swordPos -= 100*dt;
    if (this.swordPos<this.swordTar)
      this.swordPos = this.swordTar;
  } else {
    this.swordPos += 100*dt;
    if (this.swordPos>this.swordTar)
      this.swordPos = this.swordTar;
  }
  this.lastSY = this.curSY;
  this.curSY = this.sword && r.y+this.swordPos;
  this.sword = rolling||!this.hasSword?null:drawSwordHeld(r.x+tx,this.curSY,a);
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
    r.ry=0.5+0.2; // a bit bigger than the sprite
    return r;
  }
  drawSwordHeld = function(x,y,a) {
    return drawSwordCenter(x+Math.cos(a)*5,y+Math.sin(a)*5,a);
  }
};
