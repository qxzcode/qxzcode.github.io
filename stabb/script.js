
var touching = false;
var joyTID;
var joyL=false,joyR=false,joyU=false,joyD=false;
var btnAtk=false,btnJmp=false;
function touchStart(tx, ty, tid) {//alert(fps)
  touching = true;
  var r = joyRect.testPt(tx,ty);
  if (r.g) {
    joyTID = tid;
    joy(r.dx,r.dy);
  }
  if (atkRect.testPt(tx,ty).g)
    btnAtk = true;
  if (jmpRect.testPt(tx,ty).g)
    btnJmp = true;
}
function touchMove(tx, ty, tid) {
  var r = joyRect.testPt(tx,ty);
  if (tid==joyTID) joy(r.dx,r.dy);
}
function joy(dx,dy) {
  joyR = dx>joyRect.rx/3;
  joyL = dx<-joyRect.rx/3;
  joyU = dy>joyRect.ry/2;
  joyD = dy<-joyRect.ry/2;
}
function touchEnd(tx, ty, tid) {
  touching = false;
  if (tid==joyTID) {
    joyTID = null;
    joyL=false;joyR=false;joyU=false;joyD=false;
  }
}

function rectCenter(x,y,rx,ry) {
  return {x:x,y:y,rx:rx,ry:ry,touching:function(o){
    return Math.abs(this.x-o.x)<this.rx+o.rx && Math.abs(this.y-o.y)<this.ry+o.ry;
  },testPt:function(x,y){
    var dx=x-this.x,dy=y-this.y;
    return {dx:dx,dy:dy, g:Math.abs(dx)<joyRect.rx&&Math.abs(dy)<joyRect.ry};
  }};
}
function rectCorner(x,y,w,h) {
  return rectCenter(x+w/2,y+h/2,w/2,h/2);
}
function setColor(r,g,b,a) {
  gl.uniform4fv(shader.colorLoc, [r,g,b,a==undefined?1:a]);
}
function drawRect(r,c) {
  c = c || [1,1,1];
  pushTM();
  mat4.translate(tMat,tMat,[Math.floor(r.x-r.rx)+r.rx,Math.floor(r.y-r.ry)+r.ry,0]);
  mat4.scale(tMat,tMat,[r.rx,r.ry,1]);
  setTMat();
  setColor(c[0],c[1],c[2],c[3]);
  drawBuffer(rectBuf,gl.TRIANGLE_FAN);
  popTM();
}
var rectBuf = [
-1,-1,0, 0,0,
-1,1,0,  0,1,
1,1,0,   1,1,
1,-1,0,  1,0,
];
function initBuffers() {
  initBuffer(rectBuf);
}

var terrain = [];
var groundTex;
var entities = [];
var player1;
function initGame() {
  entities.push(player1=Player(150,50));
  
  terrain.push(rectCorner(0,0,300,17));
  
  var img = texImg(300,20);
  for (var x=0; x<300; x++) {
    var h = 20-Math.random()*3;
    var gh = 17-Math.random()*2;
    for (var y=0; y<20; y++) {
      var c;
      if (y<h) {
        if (y<16 && Math.random()<0.02) {
          var b = Math.random()*0.1+0.45;
          c = [b,b,b];
        } else {
          var b = Math.random()*0.03;
          c = y<gh?[153/255,100/255,54/255]:[41/255,186/255,41/255];
          c[0]+=b;c[1]+=b;c[2]+=b;
        }
      } else
        c = [0,0,0,0];
      var m = (y/20)*0.5+0.5;
      c[0]*=m;c[1]*=m;c[2]*=m;
      img.set(x,y,c);
    }
  }
  groundTex = img.toTex();
}
function checkTerrain(r) {
  for (var i in terrain) {
    var t = terrain[i];
    if (t.touching(r)) return t;
  }
  return null;
}

var lastTime = null;
var dt_acc = 0;var fps;
var camX = 150;
function drawFrame(time) {try{
  if (!lastTime) lastTime = time;
  var rdt = (time-lastTime)/1000, dt = rdt;fps=1/rdt;
  if (dt>1/30) dt = 1/30;
  lastTime = time;
  if(width!=innerWidth/pxScale||height!=innerHeight/pxScale)
    onResize();
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  // view transform
  pushTM();
  mat4.translate(tMat,tMat,[Math.floor(-camX+width/2),0,0]);
  camX -= (camX-player1.rect.x)*2*dt;
  setTMat();
  
  dt_acc += dt;
  bindTex(groundTex);
  for (var i=0; i<entities.length; i++) {
    if (entities[i].frame(dt,dt_acc)) {
      entities.splice(i--,1);
    }
  }
  for (var i in terrain) {
    var t = terrain[i];
    t = rectCorner(t.x-t.rx,t.y-t.ry,t.rx*2,t.ry*2+3);
    drawRect(t);
  }
  
  popTM();
  setTMat();
  bindTex(joyBgTex);
  drawRect(joyRect);
  bindTex(atkTex);
  drawRect(atkRect);
  bindTex(jmpTex);
  drawRect(jmpRect);
  
  var err = gl.getError();
  if (err==0) requestAnimationFrame(drawFrame);
  else alert("GL error: "+err);
}catch(e){alert("drawFrame: "+e.message)}}


