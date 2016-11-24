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


function randCol([r, g, b], f = 0.1) {
  const db = Math.random()*f*2 - f;
  return [r+db, g+db, b+db];
}
function cssCol([r, g, b]) {
  return "rgb("+Math.floor(r*255)+","+Math.floor(g*255)+","+Math.floor(b*255)+")";
}

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
    let ax = 0;
    if (left) ax -= ACCEL;
    if (right) ax += ACCEL;
    let ay = 0;
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
    
    // particle(
    //   this.x,this.y,
    //   Math.random()*50-25,Math.random()*50-25,
    //   cssCol(randCol([0.7,0.7,0.7])),
    //   8, 0.6
    // );
  }
};
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
      }
      
      particle(
        this.x,this.y,
        Math.random()*50-25,Math.random()*50-25,
        cssCol(randCol([1,0,0])),
        3, 0.6
      );
    }
  });
}

function particle(x,y,vx,vy,col,size,age,fade=true) {
  particles.push({
    x, y, vx, vy, col, size, timer:age,
    update(dt) {
      this.x += this.vx*dt;
      this.y += this.vy*dt;
      ctx.fillStyle = this.col;
      if (fade) ctx.globalAlpha = this.timer/age;
      ctx.fillRect(this.x-this.size/2,this.y-this.size/2,this.size,this.size);
      ctx.globalAlpha = 1; // restore globalAlpha
      return (this.timer-=dt) <= 0;
    }
  });
}

function updateList(array, dt) {
  let i = array.length;
  while (i--) {
    if (array[i].update(dt))
      array.splice(i, 1);
  }
}

var lastTime = 0, shotTimer = 0;
function frame(time) {
  const dt = Math.min((time - lastTime)/1000, 1/30);
  lastTime = time;
  
  player.update(dt);
  
  if ((shotTimer -= dt) <= 0) {
    autoShoot();
    shotTimer = 0.4;
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
  for (let n=0; n<10; n++) {
    particle(
      x,y,
      dx/4+Math.random()*50-25,dy/4+Math.random()*50-25,
      cssCol(randCol([.5,.5,.5])),
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
