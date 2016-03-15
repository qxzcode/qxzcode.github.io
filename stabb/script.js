
var touching = false;
var leftTID=null,rightTID=null;
function touchStart(tx, ty, tid) {
  touching = true;
  if (tx<width/2)
    leftTID = tid;
  if (tx>width/2)
    rightTID = tid;
  if (entities[0].onGround)
    entities[0].vy = 1500;
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


function rectCenter(x,y,rx,ry) {
  return {x:x,y:y,rx:rx,ry:ry,touching:function(o){
    return Math.abs(this.x-o.x)<this.rx+o.rx && Math.abs(this.y-o.y)<this.ry+o.ry;
  }};
}
function rectCorner(x,y,w,h) {
  return rectCenter(x+w/2,y+h/2,w/2,h/2);
}
function drawRect(r,color) {
  ctx.fillStyle = color;
  ctx.fillRect(r.x-r.rx,r.y-r.ry,r.rx*2,r.ry*2);
}

var terrain = [];
var entities = [];
function initGame() {
  onResize();
  entities.push(Player(100,300));
  terrain.push(rectCorner(0,0,9001,50));
  terrain.push(rectCorner(width/2,180,width/3,20));
  terrain.push(rectCorner(width/2.5,105,width/3,20));
}

function checkTerrain(r) {
  for (var i in terrain) {
    var t = terrain[i];
    if (t.touching(r)) return t;
  }
  return null;
}

var lastTime = null;
var dt_acc = 0;
function drawFrame(time) {try{
  if (!lastTime) lastTime = time;
  var rdt = (time-lastTime)/1000, dt = rdt;
  if (dt>1/30) dt = 1/30;
  lastTime = time;
  if(width!=window.innerWidth||height!=window.innerHeight)
    onResize();
  ctx.fillStyle = "#00B";
  ctx.fillRect(0,0,width,height);
  
  ctx.save();
  ctx.translate(width/2-entities[0].rect.x,height);
  ctx.scale(1,-1);
  dt_acc += dt;
  for (var i in terrain) {
    drawRect(terrain[i],"#0b0");
  }
  for (var i=0; i<entities.length; i++) {
    if (entities[i].frame(dt,dt_acc)) {
      entities.splice(i--,1);
    }
  }
  ctx.restore();
  
  requestAnimationFrame(drawFrame);
}catch(e){alert("drawFrame: "+e.message)}}


