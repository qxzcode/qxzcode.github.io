
var touching = false;
function touchStart(tx, ty, tid) {try{
  touching = true;
  if (atkRect1.testPt(tx,ty).g) player1.btnAtk = true;
  if (jmpRect1.testPt(tx,ty).g) player1.btnJmp = true;
  if (lRect1.testPt(tx,ty).g) player1.joyL = [tid];
  if (rRect1.testPt(tx,ty).g) player1.joyR = [tid];
  if (uRect1.testPt(tx,ty).g) player1.joyU = [tid];
  if (dRect1.testPt(tx,ty).g) player1.joyD = [tid];
  if (atkRect2.testPt(tx,ty).g) player2.btnAtk = true;
  if (jmpRect2.testPt(tx,ty).g) player2.btnJmp = true;
  if (lRect2.testPt(tx,ty).g) player2.joyL = [tid];
  if (rRect2.testPt(tx,ty).g) player2.joyR = [tid];
  if (uRect2.testPt(tx,ty).g) player2.joyU = [tid];
  if (dRect2.testPt(tx,ty).g) player2.joyD = [tid];
}catch(e){alert(e)}}
function touchMove(tx, ty, tid) {
  
}
function joy(p,dx,dy) {
  p = p==1?player1:player2;
  p.joyR = dx>joyRect1.rx/3;
  p.joyL = dx<-joyRect1.rx/3;
  p.joyU = dy>joyRect1.ry/3;
  p.joyD = dy<-joyRect1.ry/4;
}
function touchEnd(tx, ty, tid) {
  touching = false;
  if (tid==player1.joyL) player1.joyL = null;
  if (tid==player1.joyR) player1.joyR = null;
  if (tid==player1.joyU) player1.joyU = null;
  if (tid==player1.joyD) player1.joyD = null;
  if (tid==player2.joyL) player2.joyL = null;
  if (tid==player2.joyR) player2.joyR = null;
  if (tid==player2.joyU) player2.joyU = null;
  if (tid==player2.joyD) player2.joyD = null;
}

function rrectCenter(x,y,rx,ry,a) {
  return {x:x,y:y,rx:rx,ry:ry,a:a,touching:function(o){
    var t = this;
    var vs = [[1,1],[1,-1],[-1,-1],[-1,1]];
    var m = mat2d.create();
    mat2d.translate(m,m,[t.x,t.y]);
    mat2d.rotate(m,m,t.a);
    var aVerts = vs.map(function(v){return vec2.transformMat2d([],[v[0]*t.rx,v[1]*t.ry],m)});
    mat2d.identity(m);
    mat2d.translate(m,m,[o.x,o.y]);
    mat2d.rotate(m,m,o.a);
    var bVerts = vs.map(function(v){return vec2.transformMat2d([],[v[0]*o.rx,v[1]*o.ry],m)});
    function testAxis(axis) {
      function proj(v){return vec2.dot(axis,v)}
      var minA=null,maxA=null,minB=null,maxB=null;
      for (var i in aVerts) {
        var x = proj(aVerts[i]);
        if (minA==null||x<minA) minA=x;
        if (maxA==null||x>maxA) maxA=x;
        x = proj(bVerts[i]);
        if (minB==null||x<minB) minB=x;
        if (maxB==null||x>maxB) maxB=x;
      }
      return minA<maxB && maxA>minB;
    }
    var ca=Math.cos(t.a),sa=Math.sin(t.a),
        cb=Math.cos(o.a),sb=Math.sin(o.a);
    return testAxis([sa,ca]) && testAxis([ca,-sa]) &&
           testAxis([sb,cb]) && testAxis([cb,-sb]);
  }};
}
function rectCenter(x,y,rx,ry) {
  return {x:x,y:y,rx:rx,ry:ry,touching:function(o){
    return Math.abs(this.x-o.x)<this.rx+o.rx && Math.abs(this.y-o.y)<this.ry+o.ry;
  },testPt:function(x,y){
    var dx=x-this.x,dy=y-this.y;
    return {dx:dx,dy:dy, g:Math.abs(dx)<this.rx&&Math.abs(dy)<this.ry};
  },toRRect:function(){return rrectCenter(this.x,this.y,this.rx,this.ry,0)}};
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
  mat4.translate(tMat,tMat,[rttBound?r.x:Math.floor(r.x-r.rx)+r.rx,rttBound?r.y:Math.floor(r.y-r.ry)+r.ry,0]);
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
var solidTex,groundTex;
var entities = [];
var player1,player2;
function initGame() {
  entities.push(player1=Player(125,50));
  entities.push(player2=Player(175,50));
  
  terrain.push(rectCorner(0,0,300,27));
  
  var img = texImg(300,30);
  for (var x=0; x<300; x++) {
    var h = 30-Math.random()*3;
    var gh = 27-Math.random()*2;
    for (var y=0; y<30; y++) {
      var c;
      if (y<h) {
        if (y<26 && Math.random()<0.02) {
          var b = Math.random()*0.1+0.45;
          c = [b,b,b];
        } else {
          var b = Math.random()*0.03;
          c = y<gh?[153/255,100/255,54/255]:[41/255,186/255,41/255];
          c[0]+=b;c[1]+=b;c[2]+=b;
        }
      } else
        c = [0,0,0,0];
      var m = (y/30)*0.7+0.3;
      c[0]*=m;c[1]*=m;c[2]*=m;
      img.set(x,y,c);
    }
  }
  groundTex = img.toTex();
  
  img = texImg(1,1);
  img.set(0,0,[1,1,1]);
  solidTex = img.toTex();
  
  initSword();
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
  camX -= (camX-(player1.rect.x+player2.rect.x)/2)*3*dt;
  setTMat();
  
  dt_acc += dt;
  for (var i=0; i<entities.length; i++) {
    if (entities[i].frame(dt,dt_acc)) {
      entities.splice(i--,1);
    }
  }
  bindTex(groundTex);
  for (var i in terrain) {
    var t = terrain[i];
    t = rectCorner(t.x-t.rx,t.y-t.ry,t.rx*2,t.ry*2+3);
    drawRect(t);
  }
  
  popTM();
  setTMat();
  bindTex(joyBgTex);
  drawRect(lRect1);
  drawRect(rRect1);
  drawRect(uRect1);
  drawRect(dRect1);
  drawRect(lRect2);
  drawRect(rRect2);
  drawRect(uRect2);
  drawRect(dRect2);
  bindTex(atkTex);
  drawRect(atkRect1);
  drawRect(atkRect2);
  bindTex(jmpTex);
  drawRect(jmpRect1);
  drawRect(jmpRect2);
  
  var err = gl.getError();
  if (err==0) requestAnimationFrame(drawFrame);
  else alert("GL error: "+err);
}catch(e){alert("drawFrame: "+e)}}


