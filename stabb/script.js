
var touching = false;
var leftTID=null,rightTID=null;
function touchStart(tx, ty, tid) {//alert(fps)
  touching = true;
  if (ty>fHeight*3/4) {
    if (player1.onGround) player1.vy = 200;
  } else {
    if (tx<fWidth/2)
      leftTID = tid;
    if (tx>fWidth/2)
      rightTID = tid;
  }
}
function touchMove(tx, ty, tid) {
  
}
function touchEnd(tx, ty, tid) {
  touching = false;
  if (tid==leftTID)
    leftTID = null;
  if (tid==rightTID)
    rightTID = null;
}

var tMat=mat4.create();
var shader;
function initGL() {
  shader = createShaderProg("\
attribute vec3 inVert;\
attribute vec2 inTexCoord;\
uniform mat4 tMat;\
varying vec2 texCoord;\
void main() {\
  gl_Position = tMat*vec4(inVert,1.0);\
  texCoord = inTexCoord;\
}",
"\
precision mediump float;\
uniform vec4 color;\
uniform sampler2D sampler;\
varying vec2 texCoord;\
void main() {\
  gl_FragColor = color*texture2D(sampler,texCoord);\
  if (gl_FragColor.a<0.5) discard;\
}");
  gl.useProgram(shader);
  shader.inVertLoc = gl.getAttribLocation(shader,"inVert");
  gl.enableVertexAttribArray(shader.inVertLoc);
  shader.inTexCoordLoc = gl.getAttribLocation(shader,"inTexCoord");
  gl.enableVertexAttribArray(shader.inTexCoordLoc);
  shader.tMatLoc = gl.getUniformLocation(shader,"tMat");
  shader.colorLoc = gl.getUniformLocation(shader,"color");
  
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  onResize();
  initBuffers();
}


function rectCenter(x,y,rx,ry) {
  return {x:x,y:y,rx:rx,ry:ry,touching:function(o){
    return Math.abs(this.x-o.x)<this.rx+o.rx && Math.abs(this.y-o.y)<this.ry+o.ry;
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
  mat4.translate(tMat,tMat,[r.x,r.y,0]);
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
  entities.push(player1=Player(80,50));
  
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
var camX = 50;
function drawFrame(time) {try{
  if (!lastTime) lastTime = time;
  var rdt = (time-lastTime)/1000, dt = rdt;fps=1/rdt;
  if (dt>1/30) dt = 1/30;
  lastTime = time;
  if(fWidth!=getPx(innerWidth)||fHeight!=getPx(innerHeight))
    onResize();
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  // view transform
  pushTM();
  mat4.translate(tMat,tMat,[-camX+width/2,0,0]);
  camX -= (camX-player1.rect.x)*5*dt;
  setTMat();
  
  dt_acc += dt;
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
  ctx.drawImage(webglCanvas,0,0);
  var err = gl.getError();
  if (err==0) requestAnimationFrame(drawFrame);
  else alert("GL error: "+err);
}catch(e){alert("drawFrame: "+e.message)}}


