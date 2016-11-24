const canvas = document.getElementById("c");
const width = window.innerWidth;
const height = window.innerHeight;
const ctx = canvas.getContext("2d");
const ratio = (window.devicePixelRatio||1)/(ctx.backingStorePixelRatio||1);
canvas.width = width*ratio;
canvas.height = height*ratio;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
ctx.scale(ratio, ratio);


var left, right, up, down;
var fancy = true;
document.body.addEventListener("keydown", function(e) {
  if (key(e.keyCode, true))
    e.preventDefault();
});
document.body.addEventListener("keyup", function(e) {
  if (key(e.keyCode, false))
    e.preventDefault();
});
function key(code, d) {
  switch (code) {
    case 37: // left arrow
    case 65: // A
      left = d;
      break;
    case 39: // right arrow
    case 68: // D
      right = d;
      break;
    case 38: // up arrow
    case 87: // W
      up = d;
      break;
    case 40: // down arrow
    case 83: // S
      down = d;
      break;
    case 80: // P
      if (d) fancy = !fancy;
      break;
    default:
      return false;
  }
  return true;
}

var player = {
  x: width/2, y: height/4, vx: 0, vy: 0,
  update(dt) {
    const ACCEL = 1000;
    const SPEED = 200;
    var ax = 0;
    if (left) ax -= ACCEL;
    if (right) ax += ACCEL;
    var ay = 0;
    if (up) ay -= ACCEL;
    if (down) ay += ACCEL;
    if (ax!=0 && ay!=0) {
      ax *= Math.SQRT1_2;
      ay *= Math.SQRT1_2;
    }
    this.vx *= Math.pow(0.01, dt);
    this.vy *= Math.pow(0.01, dt);
    this.vx += ax*dt;
    this.vy += ay*dt;
    const m = Math.hypot(this.vx, this.vy);
    if (m > SPEED) {
      this.vx *= SPEED/m;
      this.vy *= SPEED/m;
    }
    this.x += this.vx*dt;
    this.y += this.vy*dt;
  }
};
function bloodDrop() {
  console.log("bloodDrop");
  particle(
    player,
    vSpread(0),
    randCol([.7,0,0], 0.2),
    5, 3.4
  );
  setTimer((Math.random()*2+0.3)*0.3, bloodDrop);
}
var turret = {x: width/2, y: height/2};
var particles = [], bullets = [];
for (let n=0; n<100; n++) {
  bullets.push({
    x: -9001, y: -9001,
    vx: 0, vy: 0,
    shoot(x,y,vx,vy) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      return this;
    },
    update(dt) {
      this.x += this.vx*dt;
      this.y += this.vy*dt;
      ctx.fillStyle = "#000";
      ctx.fillRect(this.x-4,this.y-4,8,8);
      
      if (Math.abs(player.x-this.x)<14 && Math.abs(player.y-this.y)<14) {
        player.x = (Math.random()*0.8 + 0.1)*width;
        player.y = (Math.random()*0.8 + 0.1)*height;
        for (var n=0; n<15; n++) {
          particle(
            this,
            vSpread(100, player.vx/2, player.vy/2),
            randCol([.3,.3,.3]),
            9, 0.8
          );
        }
        for (var n=0; n<10; n++) {
          particle(
            this,
            vSpread(75, player.vx/2, player.vy/2),
            randCol([1,.1,0]),
            9, 0.8
          );
        }
      }
      
      particle(
        this,
        vSpread(50),
        randCol([.7,0,0], 0.5),
        3, 0.3
      );
    }
  });
}

function randCol([r, g, b], f = 0.1) {
  const db = Math.random()*f*2 - f;
  return cssCol([r+db, g+db, b+db]);
}
function cssCol([r, g, b]) {
  return "rgb("+Math.floor(r*255)+","+Math.floor(g*255)+","+Math.floor(b*255)+")";
}
function vSpread(amt, xOff=0, yOff=0) { // generates a uniform vector within a circle of radius amt
  var theta = Math.random()*Math.PI*2;
  var u = Math.random()+Math.random();
  var r = amt * (u>1? 2-u : u);
  return {vx:Math.cos(theta)*r+xOff, vy:Math.sin(theta)*r+yOff};
}
function particle(pos,vel,col,size,age,fade=true) {
  var timer = age;
  var x = pos.x, y = pos.y;
  var vx = vel.vx, vy = vel.vy;
  particles.push({
    update(dt) {
      x += vx*dt;
      y += vy*dt;
      ctx.fillStyle = col;
      if (fade) ctx.globalAlpha = timer/age;
      ctx.fillRect(x-size/2,y-size/2,size,size);
      ctx.globalAlpha = 1; // restore globalAlpha
      return (timer-=dt) <= 0;
    }
  });
}

var timers = [];
function setTimer(delay, callback) {
  var end = gameTime + delay;
  timers.push({
    update() {
      if (gameTime >= end) {
        callback();
        return true;
      }
    }
  });
}

function updateList(array, dt) {
  var i = array.length;
  while (i--) {
    if (array[i].update(dt))
      array.splice(i, 1);
  }
}

var lastTime = 0, shotTimer = 0;
var gameTime = 0;
bloodDrop();
function frame(time) {
  const dt = Math.min((time - lastTime)/1000, 1/30);
  lastTime = time;
  gameTime += dt;
  updateList(timers);
  
  player.update(dt);
  
  if ((shotTimer -= dt) <= 0) {
    autoShoot();
    shotTimer = 0.2;
  }
  ctx.fillStyle = "#EEE";
  ctx.fillRect(0,0,width,height);
  updateList(particles, dt);
  updateList(bullets, dt);
  ctx.fillStyle = "#444";
  ctx.fillRect(turret.x-10,turret.y-10,20,20);
  ctx.fillStyle = "#00F";
  ctx.fillRect(player.x-10,player.y-10,20,20);
  
  requestAnimationFrame(frame);
}
function autoShoot() {
  const v = 350;
  
  if (!fancy) {
    const dx=turret.x-player.x, dy=turret.y-player.y;
    const m = -Math.hypot(dx, dy);
    shoot(turret.x,turret.y,dx*v/m,dy*v/m);
    return;
  }
  
  shoot(turret.x,turret.y,
        ...calcAutoShoot(turret.x-player.x,turret.y-player.y,player.vx,player.vy,v)
       );
}
function shoot(x, y, dx, dy) {
  bullets.unshift(bullets.pop().shoot(x,y,dx,dy));
  for (let n=0; n<20; n++) {
    particle(
      {x,y},
      vSpread(45, dx/4, dy/4),
      randCol([.5,.5,.5]),
      6, 0.6
    );
  }
}
function calcAutoShoot(dx, dy, vx, vy, v) {
  function rot(x,y) {
    return [x*cos+y*sin, y*cos-x*sin];
  }
  
  // rotate reference frame
  const m = Math.hypot(vx, vy);
  let sin = m==0? 0 : vy/m;
  let cos = m==0? 1 : vx/m;
  [vx,vy] = rot(vx,vy);
  [dx,dy] = rot(dx,dy);
  
  dy = -dy;
  const adf2 = 2*vx*dx/dy;
  let df = 1 + (dx*dx)/(dy*dy);
  
  // calculate the result
  let disc = adf2*adf2 + 4*df*(v*v-vx*vx);
  if (disc < 0) return;
  disc = Math.sqrt(disc);
  df *= 2;
  sin = -sin; // invert rot
  
  const c1 = (adf2 + disc) / df;
  const b1 = vx - c1*dx/dy;
  const t1 = dy/c1;
  const res1 = rot(b1,c1);
  const c2 = (adf2 - disc) / df;
  const b2 = vx - c2*dx/dy;
  const t2 = dy/c2;
  const res2 = rot(b2,c2);
  
  if (t1 < 0) return res2;
  if (t2 < 0) return res1;
  return t1<t2? res1 : res2;
}

requestAnimationFrame(frame);
