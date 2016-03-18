
var touching = false;
var leftTID=null,rightTID=null;
function touchStart(tx, ty, tid) {//alert(fps)
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
  gl_FragColor = texture2D(sampler,texCoord);\
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
var groundTex;
function initGame() {
  terrain.push(rectCorner(0,0,300,20));
  var img = texImg(300,20);
  for (var x=0; x<300; x++) {
    var h = 20-Math.random()*3;
    for (var y=0; y<20; y++) {
      var c;
      if (y<h) {
        if (y<17 && Math.random()<0.02) {
          var b = Math.random()*0.1+0.45;
          c = [b,b,b];
        } else {
          var b = Math.random()*0.03;
          c = [153/255+b,100/255+b,54/255+b];
        }
      } else
        c = [0,0,0,0];
      img.set(x,y,c);
    }
  }
  groundTex = img.toTex();
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
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  // view transform
  pushTM();
  mat4.translate(tMat,tMat,[-Math.sin(dt_acc)*30-40,0,0]);
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


