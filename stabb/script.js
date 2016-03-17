
var touching = false;
var leftTID=null,rightTID=null;
function touchStart(tx, ty, tid) {alert(fps)
  touching = true;
  if (tx<fWidth/2)
    leftTID = tid;
  if (tx>fWidth/2)
    rightTID = tid;
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
}");
  gl.useProgram(shader);
  shader.inVertLoc = gl.getAttribLocation(shader,"inVert");
  gl.enableVertexAttribArray(shader.inVertLoc);
  shader.inTexCoordLoc = gl.getAttribLocation(shader,"inTexCoord");
  gl.enableVertexAttribArray(shader.inTexCoordLoc);
  shader.tMatLoc = gl.getUniformLocation(shader,"tMat");
  shader.colorLoc = gl.getUniformLocation(shader,"color");
  
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  
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
var entities = [];
var tex;
function initGame() {
  terrain.push(rectCorner(0,0,9000,2));
  terrain.push(rectCorner(3,3,30,5));
  terrain.push(rectCorner(3,3,30,5));
  terrain.push(rectCorner(4,4,16,50));
  var img = texImg(10,10);
  for (var x=0; x<10; x++)
  for (var y=0; y<10; y++) {
    img.set(x,y,[0,x/10,0]);
  }
  tex = img.toTex();
}

var lastTime = null;
var dt_acc = 0;var fps;
function drawFrame(time) {try{
  if (!lastTime) lastTime = time;
  var rdt = (time-lastTime)/1000, dt = rdt;fps=1/rdt;
  if (dt>1/30) dt = 1/30;
  lastTime = time;
  if(fWidth!=getPx(innerWidth)||fHeight!=getPx(innerHeight))
    onResize();
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // view transform
  pushTM();
  mat4.translate(tMat,tMat,[Math.sin(dt_acc/2)*50+50,10,0]);
  mat4.rotateZ(tMat,tMat,-dt_acc*0.1);
  setTMat();
  
  dt_acc += dt;
  for (var i in terrain) {
    drawRect(terrain[i],[0,1,0]);
  }
  for (var i=0; i<entities.length; i++) {
    if (entities[i].frame(dt,dt_acc)) {
      entities.splice(i--,1);
    }
  }
  
  popTM();
  ctx.drawImage(webglCanvas,0,0);
  var err = gl.getError();
  if (err==0) requestAnimationFrame(drawFrame);
  else alert("GL error: "+err);
}catch(e){alert("drawFrame: "+e.message)}}


