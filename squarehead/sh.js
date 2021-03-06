//// Squarehead ////


// set up the canvas and rendering context
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

var winWidth, winHeight;
setWH();
function setWH() {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    var ratio = window.devicePixelRatio || 1;
    canvas.width  = winWidth*ratio;
    canvas.height = winHeight*ratio;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(ratio, ratio);
}

// input events
canvas.addEventListener("touchstart", touchStart, false);
canvas.addEventListener("touchmove", touchMove, false);
canvas.addEventListener("touchend", touchEnd, false);
function touchStart(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    for (var i=0; i<touches.length; i++) {
        var tx=touches[i].pageX, ty=touches[i].pageY, id=touches[i].identifier;
        if (gameState==0) {
            var mapH = winHeight-250, mapW = mapH*bgImg.width/bgImg.height;
            if (tx>winWidth/2-mapW/2&&tx<winWidth/2+mapW/2&&ty>winHeight/2-mapH/2&&ty<winHeight/2+mapH/2) {
                initGame(currentMap);
            } else if (tx>winWidth*15/20&&ty>winHeight/20&&tx<winWidth*19/20&&ty<winHeight*3/20) {
                coOp = !coOp;
                setCookie("sh_coOp",coOp?"1":"0");
                redraw = true;
            } else if (tx>winWidth/2) {
                if (++currentMap==maps.length)
                    currentMap = 0;
                redraw = true;
            } else {
                if (currentMap-- == 0)
                    currentMap = maps.length-1;
                redraw = true;
            }
            setCookie("sh_currentMap",currentMap);
        } else if (gameState == 1) {
            var player, b;
            if (coOp) {
                if (tx<window.innerWidth/2) {
                    player = player1;
                    var t = screenToP1(tx,ty);
                    b = moveJoystick1.touchStart(t.x,t.y,id);
                    b = b || shootJoystick1.touchStart(t.x,t.y,id);
                    b = b?0:t.x>shootJoystick1.x?1:-1;
                } else {
                    player = player2;
                    var t = screenToP2(tx,ty);
                    b = moveJoystick2.touchStart(t.x,t.y,id);
                    b = b || shootJoystick2.touchStart(t.x,t.y,id);
                    b = b?0:t.x>shootJoystick2.x?1:-1;
                }
            } else {
                player = player1;
                b = moveJoystick1.touchStart(tx,ty,id);
                b = b || shootJoystick1.touchStart(tx,ty,id);
                b = b?0:tx>shootJoystick1.x?1:-1;
            }
            if (b!=0) {
                if (b>0)
                    player.nextWeapon();
                else
                    player.prevWeapon();
            }
        } else if (gameState==2) {
            gameState = 0;
            moveJoystick1.xVal=moveJoystick1.yVal=shootJoystick1.xVal=shootJoystick1.yVal=moveJoystick2.xVal=moveJoystick2.yVal=shootJoystick2.xVal=shootJoystick2.yVal=0;
        }
    }
}
function touchMove(event) {
    event.preventDefault();
    if (gameState!=1) return;
    var touches = event.changedTouches;
    for (var i=0;i<touches.length;i++) {
        var tx=touches[i].pageX,ty=touches[i].pageY,id=touches[i].identifier;
        if (coOp) {
            if (tx<window.innerWidth/2) {
                var t = screenToP1(tx,ty);
                moveJoystick1.touchMove(t.x,t.y,id);
                shootJoystick1.touchMove(t.x,t.y,id);
            } else {
                var t = screenToP2(tx,ty);
                moveJoystick2.touchMove(t.x,t.y,id);
                shootJoystick2.touchMove(t.x,t.y,id);
            }
        } else {
            moveJoystick1.touchMove(tx,ty,id);
            shootJoystick1.touchMove(tx,ty,id);
        }
    }
}
function touchEnd(event) {
    event.preventDefault();
    if (gameState!=1) return;
    var touches = event.changedTouches;
    for (var i=0;i<touches.length;i++) {
        var tx=touches[i].pageX,ty=touches[i].pageY,id=touches[i].identifier;
        if (coOp) {
            if (tx<window.innerWidth/2) {
                var t = screenToP1(tx,ty);
                moveJoystick1.touchEnd(t.x,t.y,id);
                shootJoystick1.touchEnd(t.x,t.y,id);
            } else {
                var t = screenToP2(tx,ty);
                moveJoystick2.touchEnd(t.x,t.y,id);
                shootJoystick2.touchEnd(t.x,t.y,id);
            }
        } else {
            moveJoystick1.touchEnd(tx,ty,id);
            shootJoystick1.touchEnd(tx,ty,id);
        }
    }
}
function screenToP1(x,y) {
    return {x:y,y:-x+window.innerWidth/2};
}
function screenToP2(x,y) {
    return {x:-y+window.innerHeight,y:x-window.innerWidth/2};
}
var moveJoystick1 = newJoystick();
var shootJoystick1 = newJoystick();
var moveJoystick2 = newJoystick();
var shootJoystick2 = newJoystick();
function newJoystick() {
    return {
        x:0,y:0, size:0, touchID:null, xVal:0,yVal:0,
        touchStart:function(tx,ty,id) {
            if (tx>this.x-this.size&&tx<this.x+this.size&&ty>this.y-this.size&&ty<this.y+this.size) {
                this.touchID = id;
                this.touchMove(tx,ty,id);
                return true;
            }
            return false;
        },
        touchMove:function(tx,ty,id) {
            if (id===this.touchID) {
                var x = this.xVal = (tx-this.x)/this.size;
                var y = this.yVal = (ty-this.y)/this.size;
                var mag = sqrt(x*x + y*y);
                if (mag > 1.0) {
                    this.xVal /= mag;
                    this.yVal /= mag;
                }
            }
        },
        touchEnd:function(tx,ty,id) {
            if (id===this.touchID) {
                this.xVal = this.yVal = 0;
                this.touchID = null;
            }
        },
        draw:function() {
            var size=this.size,halfSize=size/2;
            drawCircle(this.x, this.y, size, "rgba(191,191,191,0.5)");
            drawCircle(this.x+this.xVal*halfSize, this.y+this.yVal*halfSize, halfSize, "rgba(255,255,255,0.5)");
        }
    };
}


/**** VARIABLES ****/

var gridWidth, gridHeight;
var tiles, zombieGrid;
var portals, ammoDrops;
function initTiles(mapI) {
    var map = maps[mapI].tiles;
    gridWidth = map.length;
    gridHeight = map[0].length;
    tiles = [];
    zombieGrid = [];
    portals = [];
    ammoDrops = [];
    var playersPos = [{x:gridWidth/2,y:gridHeight/2}, {x:gridWidth/2+1,y:gridHeight/2+1}];
    for (var x=0;x<gridWidth;x++) {
        zombieGrid[x] = [];
        tiles[x] = map[x].slice(0);
        for (var y=0;y<gridHeight;y++) {
            zombieGrid[x][y] = 0;
            var t = tiles[x][y];
            if (t==2)
                portals.push({x:x+0.5,y:y+0.5});
            if (t==5) {
                tiles[x][y] = 0;
                ammoDrops.push({x:x+0.5,y:y+0.5,timer:0,pack:null});
            }
            if (t==-1) {
                tiles[x][y] = 0;
                playersPos[0] = {x:x+0.5,y:y+0.5};
            }
            if (t==-2) {
                tiles[x][y] = 0;
                playersPos[1] = {x:x+0.5,y:y+0.5};
            }
        }
    }
    return playersPos;
}
var tileSize = 40;
function setTile(x,y,t) {
    tiles[x][y] = t;
    tilesChanged = true;
}

var enemies;
var round, zombieTotal, zombiesLeft, zombieTimer, zombieRate;
function initGameVars() {
    round = 1;
    zombiesLeft = zombieTotal = 30;
    zombieTimer = 0; zombieRate = 15;
}
function spawnZombie() {
    var p = portals[floor(rand()*portals.length)];
    var z = newZombie(p.x,p.y);
    if (isColliding(z)) return false;
    enemies.push(z);
    zombieGrid[floor(z.x)][floor(z.y)]++;
    return true;
}
function newZombie(x,y) {
    return {
        x:x,y:y,lastX:x,lastY:y,
        path:[],pathTimer:0,player:0,
        size:15/tileSize,drawSize:15,
        moveX:0,moveY:0,xSpeed:0,ySpeed:0,
        health:100,onFire:false,lastHurt:null,
        draw:function(offsetX, offsetY) {
            drawRect(this.x*tileSize+offsetX-this.drawSize,this.y*tileSize+offsetY-this.drawSize,this.drawSize*2,this.drawSize*2,this.onFire?"orange":"red");
        },
        update:function() {
            if (this.onFire) {
                this.health -= 1;
                this.lastHurt = this.onFire;
            }
            if (this.health <= 0) {
                if (rand()<0.05) spawnAmmoPack(this.x,this.y,true);
                remove(enemies, this);
                zombieGrid[floor(this.x)][floor(this.y)]--;
                this.lastHurt.combo = ceil(this.lastHurt.combo)+0.99;
                return true;
            }
            if (this.path.length==0||(--this.pathTimer<=0/*&&(tilesChanged||playerMoved)*/)) {
                var x=floor(this.x),y=floor(this.y);
                var p1=player1.health>0&&astar(x,y,floor(player1.x),floor(player1.y)),p1l=p1?p1.length:Infinity,p2=coOp&&player2.health>0&&astar(x,y,floor(player2.x),floor(player2.y)),p2l=p2?p2.length:Infinity;
                if (!p1&&!p2) return;
                var p=!coOp||p1l<p2l||(p1l==p2l&&rand()<0.5);
                this.path=p?p1:p2;
                this.player=p?player1:player2;
                this.path.push({x:this.player.x-0.5,y:this.player.y-0.5});
                this.pathTimer=20+rand()*20;
            }
            this.path[this.path.length-1] = {x:this.player.x-0.5,y:this.player.y-0.5};
            var pathX = this.path[0].x+0.5, pathY = this.path[0].y+0.5;
            var dx = pathX-this.x, dy = pathY-this.y, mag = sqrt(dx*dx+dy*dy);
            if (abs(dx)<0.05&&abs(dy)<0.05) this.path.shift();
            this.moveX = dx/mag;
            this.moveY = dy/mag;
            var oldX=this.x,oldY=this.y;
            if (abs(this.xSpeed)<0.1&&abs(this.ySpeed)<0.1) {
                this.x += this.moveX*0.4;
                this.y += this.moveY*0.4;
                var b = isCollidingEnemies(this)&&!isCollidingPlayers(this);
                this.x = oldX;
                this.y = oldY;
                if (!b) {
                    this.x += this.moveX*0.04;
                    this.y += this.moveY*0.04;
                }
            } else {
                this.x += (this.xSpeed*=0.90)*0.2;
                this.y += (this.ySpeed*=0.90)*0.2;
            }
            var hitPlayer = isCollidingPlayers(this);
            if (hitPlayer)
                hitPlayer.health -= this.onFire?2:1;
            doCollide(this,isColliding);
            zombieGrid[floor(oldX)][floor(oldY)]--;
            zombieGrid[floor(this.x)][floor(this.y)]++;
            return false;
        }
    };
}

var entities;
var barrels;
var gasolines;
function initGameLists() {
    enemies = [];
    entities = [];
    barrels = [];
    gasolines = [];
}
function spawnAmmoPack(x,y,drop) {
    var pack = {
        x:x,y:y,size:7/tileSize,
        age:drop?0:-Infinity,
        update:function() {
            if (++this.age > 350) {
                remove(entities, this);
                return true;
            }
            var player = isCollidingPlayers(this);
            if (player) {
                var w = player.weapons[player.weapon];
                if (w.ammo < w.maxAmmo) {
                    w.ammo = w.maxAmmo;
                    remove(entities, this);
                    return true;
                }
            }
            return false;
        },
        draw:function(offsetX, offsetY) {
            drawRect(this.x*tileSize+offsetX-7,this.y*tileSize+offsetY-7,14,14,"green");
        }
    };
    entities.push(pack);
    return pack;
}

function initWeapons() {
    return [
        {
            name:"Pistol",
            damage:25,range:7,
            autofire:false,timer:0,rate:20,
            ammo:Infinity,unlocked:true,
            use:function(x,y,a,player) {
                a += rand()*0.2-0.1;
                shootBullet(x,y,a, this.range, this.damage, player);
            }
        },
        {
            name:"UZI",
            damage:15,range:8,
            autofire:true,timer:0,rate:5,
            ammo:100,maxAmmo:100,unlocked:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                a += rand()*0.2-0.1;
                shootBullet(x,y,a, this.range, this.damage, player);
            }
        },
        {
            name:"Shotgun",
            damage:13,range:5,
            autofire:false,timer:0,rate:25,
            ammo:30,maxAmmo:30,unlocked:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                for (var n=0;n<6;n++)
                    shootBullet(x,y,a+rand()*0.4-0.2, this.range,this.damage, player);
            }
        },
        {
            name:"Grenade",
            autofire:false,timer:0,rate:20,
            ammo:10,maxAmmo:10,unlocked:false,
            cluster:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                entities.push({
                    x:x,y:y,lastX:x,lastY:y,size:4/tileSize,
                    xSpeed:cos(a+=rand()*.2-.1)*0.4,ySpeed:sin(a)*0.4,
                    timer:60,
                    player:player,
                    update:function() {
                        this.x += (this.xSpeed*=0.90);
                        this.y += (this.ySpeed*=0.90);
                        doCollide(this,isCollidingTiles);
                        if (--this.timer <= 0) {
                            explosion(this.x,this.y,3,this.player.weapons[3].cluster, this.player);
                            remove(entities, this);
                            return true;
                        }
                        return false;
                    },
                    draw:function(offsetX, offsetY) {
                        drawRect(this.x*tileSize+offsetX-4,this.y*tileSize+offsetY-4,8,8,"darkgray");
                    }
                });
            }
        },
        {
            name:"Wall",
            autofire:false,timer:0,rate:10,
            ammo:20,maxAmmo:20,unlocked:false,
            use:function(x,y,a,player) {
                x=floor(x);y=floor(y);
                if (tiles[x][y]==0) {
                    if (--this.ammo<0) {
                        this.ammo = 0;
                        return;
                    }
                    setTile(x,y,10);
                    player.inTiles.push(x+y*gridWidth);
                }
            }
        },
        {
            name:"Barrel",
            autofire:false,timer:0,rate:10,
            ammo:20,maxAmmo:20,unlocked:false,
            bigbang:false,cluster:false,
            use:function(x,y,a,player) {
                x=floor(x);y=floor(y);
                if (tiles[x][y]==0) {
                    if (--this.ammo<0) {
                        this.ammo = 0;
                        return;
                    }
                    setTile(x,y,3);
                    player.inTiles.push(x+y*gridWidth);
                }
            }
        },
        {
            name:"Gasoline",
            autofire:false,timer:0,rate:10,
            ammo:20,maxAmmo:20,unlocked:false,
            burntime:240,damage:0.5,
            use:function(x,y,a,player) {
                x=floor(x);y=floor(y);
                if (tiles[x][y]==0) {
                    if (--this.ammo<0) {
                        this.ammo = 0;
                        return;
                    }
                    setTile(x,y,4);
                }
            }
        },
        {
            name:"Mine",
            autofire:false,timer:0,rate:10,
            ammo:20,maxAmmo:20,unlocked:false,
            bigbang:false,cluster:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                entities.push({
                    x:x,y:y,size:13/tileSize,
                    xSpeed:cos(a+=rand()*.2-.1)*0.7,ySpeed:sin(a)*0.7,
                    timer:-2,
                    player:player,
                    update:function() {
                        if (this.timer<-1 && --this.timer==-30) {
                            this.timer = -1;
                        }
                        if (this.timer==-1 && (isCollidingEnemies(this)||isCollidingPlayers(this))) {
                            this.timer = 40;
                        }
                        if (this.timer>-1 && --this.timer==0) {
                            explosion(this.x,this.y,this.player.weapons[7].bigbang?3.5:2.5,this.player.weapons[7].cluster, this.player);
                            remove(entities, this);
                            return true;
                        }
                        return false;
                    },
                    draw:function(offsetX, offsetY) {
                        drawRect(this.x*tileSize+offsetX-13,this.y*tileSize+offsetY-13,26,26,"darkgray");
                        if (this.timer>=-1)
                            drawRect(this.x*tileSize+offsetX-4,this.y*tileSize+offsetY-4,8,8,this.timer==-1?"lime":"red");
                    }
                });
            }
        },
        {
            name:"Rocket",
            autofire:false,timer:0,rate:20,
            ammo:20,maxAmmo:20,unlocked:false,
            bigbang:false,cluster:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                entities.push({
                    x:x,y:y,lastX:x,lastY:y,size:6/tileSize,
                    xSpeed:cos(a+=rand()*.2-.1)*0.7,ySpeed:sin(a)*0.7,
                    timer:60,
                    player:player,
                    update:function() {
                        this.x += this.xSpeed;
                        this.y += this.ySpeed;
                        if (isCollidingTiles(this)||isCollidingEnemies(this)) {
                            explosion(this.x,this.y,this.player.weapons[8].bigbang?3.5:2.5,this.player.weapons[8].cluster, this.player);
                            remove(entities, this);
                            return true;
                        }
                        return false;
                    },
                    draw:function(offsetX, offsetY) {
                        drawRect(this.x*tileSize+offsetX-6,this.y*tileSize+offsetY-6,12,12,"orange");
                    }
                });
            }
        },
        {
            name:"Flamethrower",
            autofire:false,timer:0,rate:5,
            ammo:100,maxAmmo:100,unlocked:false,
            farther:false,
            use:function(x,y,a,player) {
                if (--this.ammo<0) {
                    this.ammo = 0;
                    return;
                }
                var s = this.farther?1.0:0.7;
                entities.push({
                    x:x,y:y,lastX:x,lastY:y,size:6/tileSize,
                    xSpeed:cos(a+=rand()*.2-.1)*s,ySpeed:sin(a)*s,
                    age:0,
                    player:player,
                    update:function() {
                        this.x += (this.xSpeed*=0.90);
                        this.y += (this.ySpeed*=0.90);
                        doCollide(this,isCollidingTiles);
                        var hit = isCollidingEnemies(this);
                        if (hit) {
                            hit.health -= 3;
                            hit.onFire = hit.lastHurt = this.player;
                        }
                        var tx=floor(this.x),ty=floor(this.y), t=tiles[tx][ty];
                        if (t==3) blowBarrel(tx,ty,this.player);
                        if (t==4) igniteGas(tx,ty,this.player);
                         if (++this.age >= 30) {
                            remove(entities, this);
                            return true;
                        }
                        return false;
                    },
                    draw:function(offsetX, offsetY) {
                        drawRect(this.x*tileSize+offsetX-6,this.y*tileSize+offsetY-6,12,12,"orange");
                    }
                });
            }
        }
    ];
}
function doUpgrades(player) {
    // pistol
    if(player.maxCombo>=3)player.weapons[0].rate=12;
    if(player.maxCombo>=12)player.weapons[0].damage=34;
    // UZI
    if(player.maxCombo>=4)player.weapons[1].unlocked=true;
    if(player.maxCombo>=7)player.weapons[1].rate=2.5;
    if(player.maxCombo>=13)player.weapons[1].maxAmmo=200;
    if(player.maxCombo>=24)player.weapons[1].range=16;
    // shotgun
    if(player.maxCombo>=10)player.weapons[2].unlocked=true;
    if(player.maxCombo>=17)player.weapons[2].maxAmmo=60;
    if(player.maxCombo>=21)player.weapons[2].range=10;
    if(player.maxCombo>=29)player.weapons[2].rate=15;
    // grenade
    if(player.maxCombo>=19)player.weapons[3].unlocked=true;
    if(player.maxCombo>=25)player.weapons[3].maxAmmo=20;
    if(player.maxCombo>=34)player.weapons[3].cluster=true;
    // wall
    if(player.maxCombo>=30)player.weapons[4].unlocked=true;
    if(player.maxCombo>=35)player.weapons[4].rate=5;
    if(player.maxCombo>=40)player.weapons[4].maxAmmo=40;
    // barrel
    if(player.maxCombo>=41)player.weapons[5].unlocked=true;
    if(player.maxCombo>=46)player.weapons[5].rate=5;
    if(player.maxCombo>=51)player.weapons[5].maxAmmo=40;
    if(player.maxCombo>=58)player.weapons[5].bigbang=true;
    if(player.maxCombo>=67)player.weapons[5].cluster=true;
    // gasoline
    if(player.maxCombo>=45)player.weapons[6].unlocked=true;
    if(player.maxCombo>=50)player.weapons[6].rate=5;
    if(player.maxCombo>=56)player.weapons[6].maxAmmo=40;
    if(player.maxCombo>=63)player.weapons[6].burntime=480;
    if(player.maxCombo>=70)player.weapons[6].damage=1;
    // mine
    if(player.maxCombo>=53)player.weapons[7].unlocked=true;
    if(player.maxCombo>=67)player.weapons[7].maxAmmo=40;
    if(player.maxCombo>=97)player.weapons[7].bigbang=true;
    if(player.maxCombo>=100)player.weapons[7].cluster=true;
    // rocket
    if(player.maxCombo>=61)player.weapons[8].unlocked=true;
    if(player.maxCombo>=80)player.weapons[8].rate=10;
    if(player.maxCombo>=89	)player.weapons[8].maxAmmo=40;
    if(player.maxCombo>=98)player.weapons[8].bigbang=true;
    if(player.maxCombo>=115)player.weapons[8].cluster=true;
    // flamethrower
    if(player.maxCombo>=85)player.weapons[9].unlocked=true;
    if(player.maxCombo>=99)player.weapons[9].maxAmmo=200;
    if(player.maxCombo>=110)player.weapons[9].rate=4;
    if(player.maxCombo>=125)player.weapons[9].farther=true;
}
var bulletPaths = [];
function shootBullet(x,y,a,rng,dmg,player) {
    var sx = cos(a)/10, sy = sin(a)/10;
    var bullet = {x:x,y:y,size:0.1};
    rng *= 10;
    for (var n=0;n<rng;n++) {
        bullet.x += sx;
        bullet.y += sy;
        var hit;
        if (hit=isCollidingTiles(bullet)) {
            var tx = hit.x-0.5, ty = hit.y-0.5;
            if (tx>=0&&ty>=0&&tx<gridWidth&&ty<gridHeight) {
                if (tiles[tx][ty]==3) {
                    blowBarrel(tx,ty,player);
                }
                if (tiles[tx][ty]>9) {
                    tiles[tx][ty] += dmg/3;
                    tilesChanged = true;
                }
            }
            break;
        }
        if ((hit=isCollidingEnemies(bullet))&&hit.health>0) {
            hit.health -= dmg;
            hit.lastHurt = player;
            var mag = sqrt(sx*sx + sy*sy);
            hit.xSpeed = sx/mag;
            hit.ySpeed = sy/mag;
            break;
        }
    }
    bulletPaths.push({x1:x,y1:y,x2:bullet.x,y2:bullet.y});
}
var explosions = [];
function explosion(x,y,size,cluster,player) {
    explosions.push({x:x,y:y,s:size});
    if (cluster) {
        for (var n=0;n<5;n++) {
            var a = rand()*Math.PI*2;
            entities.push({
                    x:x,y:y,lastX:x,lastY:y,size:3/tileSize,
                    xSpeed:cos(a)*0.3,ySpeed:sin(a)*0.3,
                    timer:5+rand()*15,
                    player:player,
                    update:function() {
                        this.x += (this.xSpeed*=0.90);
                        this.y += (this.ySpeed*=0.90);
                        doCollide(this,isCollidingTiles);
                        if (--this.timer <= 0) {
                            explosion(this.x,this.y,1.5,false,this.player);
                            remove(entities, this);
                            return true;
                        }
                        return false;
                    },
                    draw:function(offsetX, offsetY) {
                        drawRect(this.x*tileSize+offsetX-3,this.y*tileSize+offsetY-3,6,6,"darkgray");
                    }
                });
        }
    }
    for (var i=-2;i<enemies.length;i++) {
        if (i==-2&&!coOp) continue;
        var e = i==-1?player1:i==-2?player2:enemies[i];
        var dx = e.x-x, dy = e.y-y, dist = sqrt(dx*dx+dy*dy);
        if (dist < size) {
            e.health -= (size-dist)*100;
            e.lastHurt = player;
            e.xSpeed = dx*(size-dist)*3/dist;
            e.ySpeed = dy*(size-dist)*3/dist;
        }
    }
    var xMax = ceil(x+size), yMax = ceil(y+size);
    for (var tx=floor(x-size);tx<xMax;tx++) {
        for (var ty=floor(y-size);ty<yMax;ty++) {
            if (tx>=0&&tx<gridWidth&&ty>=0&&ty<gridHeight) {
                if (tiles[tx][ty]==3) {
                    blowBarrel(tx,ty,player);
                }
                if (tiles[tx][ty]==4)
                    igniteGas(tx,ty,player);
                if (tiles[tx][ty]>9) {
                    var dx = tx+0.5-x, dy = ty+0.5-y, dist = sqrt(dx*dx+dy*dy);
                    var dmg = (size-dist)*33;
                    tiles[tx][ty] += dmg>0?dmg:0;
                    tilesChanged = true;
                }
            }
        }
    }
}
function blowBarrel(x,y,player) {
    barrels.push({x:x,y:y,p:player});
    tiles[x][y]=3.5;
}
function igniteGas(tx,ty,player) {
    setTile(tx,ty,5);
    gasolines.push({x:tx+0.5,y:ty+0.5,p:player,size:0.5,age:rand()*20-10});
}

var player1,player2, coOp = getCookie("sh_coOp")=="1";
function initPlayer(pos) {
    return {
        x:pos.x,y:pos.y,lastX:gridWidth/2+.5,lastY:gridHeight/2+.5,
        size:15/tileSize,drawSize:15,
        moveX:0,moveY:0,xSpeed:0,ySpeed:0,shootX:0,shootY:0,
        health:100.0,weapon:0,weapons:initWeapons(),
        combo:0,maxCombo:0,
        inTiles:[],
        timer:100,
        draw:function(offsetX, offsetY) {
            var x = this.x*tileSize+offsetX, y = this.y*tileSize+offsetY;
            if (this.timer<0||this.timer%8<4)
                drawRect(x-this.drawSize,y-this.drawSize,this.drawSize*2,this.drawSize*2,"blue");
            drawRect(x-this.drawSize*0.9,y-this.drawSize-10,this.drawSize*2*0.9*this.health/100,5,"rgb(0,255,0)");
        },
        update:function(moveJoystick,shootJoystick) {
            this.timer--;
            if (coOp && this.health <= 0 && this.timer < 0) {
                this.timer = 400;
                this.x=-9001;
                this.weapon=this.combo=this.xSpeed=this.ySpeed=0;
                for (var i=1;i<this.weapons.length;i++)
                    if(this.weapons[i].unlocked)this.weapons[i].ammo=0;
            }
            if (coOp && this.timer == 101) {
                var clearTiles = [];
                for (var x=0;x<gridWidth;x++) {
                    for (var y=0;y<gridHeight;y++) {
                        var t = tiles[x][y];
                        if ((t==0||t==4||t==5)&&zombieGrid[x][y]<1)
                            clearTiles.push({x:x,y:y});
                    }
                }
                if (clearTiles.length<1) this.timer = 400;
                else {
                    var tile = clearTiles[floor(rand()*clearTiles.length)];
                    this.x=this.lastX=tile.x+0.5;
                    this.y=this.lastY=tile.y+0.5;
                }
            }
            if (this.timer > 100) return;
            if (this.timer > 0) this.health = 100;
            if (this.health < 100) this.health += 0.1;
            this.moveX = moveJoystick.xVal;
            this.moveY = moveJoystick.yVal;
            this.shootX = shootJoystick.xVal;
            this.shootY = shootJoystick.yVal;
            var oldTx = floor(this.x), oldTy = floor(this.y);
            if (abs(this.xSpeed)<0.1&&abs(this.ySpeed)<0.1) {
                this.x += this.moveX*0.15;
                this.y += this.moveY*0.15;
            } else {
                this.x += (this.xSpeed*=0.90)*0.2;
                this.y += (this.ySpeed*=0.90)*0.2;
            }
            doCollide(this,isColliding);
            playerMoved = oldTx!=floor(this.x) || oldTy!=floor(this.y);
            
            if (--this.weapons[this.weapon].timer<=0&&(this.shootX!=0||this.shootY!=0)) {
                var a = Math.atan2(this.shootY,this.shootX);
                this.weapons[this.weapon].use(this.x,this.y,a,this);
                this.weapons[this.weapon].timer = this.weapons[this.weapon].rate;
            }
        },
        nextWeapon:function() {
            if (++this.weapon>=this.weapons.length)
                this.weapon = 0;
            var w = this.weapons[this.weapon];
            if (!(w.unlocked/*&&w.ammo>0*/))
                this.nextWeapon();
        },
        prevWeapon:function() {
            if (--this.weapon<0)
                this.weapon = this.weapons.length-1;
            var w = this.weapons[this.weapon];
            if (!(w.unlocked/*&&w.ammo>0*/))
                this.prevWeapon();
        }
    };
}

function doCollide(e,func) {
    var newX = e.x, newY = e.y;
    e.x = e.lastX; e.y = e.lastY;
    if (func(e)) {
        e.x = newX; e.y = newY;
        e.lastX = e.x;
        e.lastY = e.y;
        return;
    }
    var bb;
    e.x = newX;
    if (bb=func(e)) {
        if (e.x-e.lastX>0)
            e.x = bb.x-bb.size-e.size-0.01;
        else
            e.x = bb.x+bb.size+e.size+0.01;
        e.xSpeed = 0;
    }
    e.y = newY;
    if (bb=func(e)) {
        if (e.y-e.lastY>0)
            e.y = bb.y-bb.size-e.size-0.01;
        else
            e.y = bb.y+bb.size+e.size+0.01;
        e.ySpeed = 0;
    }
    e.lastX = e.x;
    e.lastY = e.y;
}
function isCollidingTiles(e) {
    var tileBB = {x:0,y:0}, hit = null;
    var xMax = ceil(e.x+e.size), yMax = ceil(e.y+e.size);
    var newInTiles = [];
    for (var x=floor(e.x-e.size);x<xMax;x++) {
        tileBB.x = x+0.5;
        for (var y=floor(e.y-e.size);y<yMax;y++) {
            var t;
            if ((x>=0&&x<gridWidth&&y>=0&&y<gridHeight) && ((t=tiles[x][y])==0||t==4||t==5||(t==2&&e.weapon==null)||(t==3&&e.age!=null))) continue;
            tileBB.y = y+0.5;
            tileBB.size = /*t==3?17/tileSize:*/0.5;
            var r = e.size+tileBB.size;
            if (abs(e.x-tileBB.x)<r && abs(e.y-tileBB.y)<r) {
                if (e.inTiles) {
                    var hash=x+y*gridWidth,i=e.inTiles.indexOf(hash);
                    if (i>=0) {
                        newInTiles.push(hash);
                        continue;
                    }
                }
                hit = hit || {x:tileBB.x,y:tileBB.y,size:tileBB.size};
            }
        }
    }
    if (e.inTiles) e.inTiles = newInTiles;
    return hit;
}
function isCollidingEnemies(e) {
    for (var i=0;i<enemies.length;i++) {
        r = e.size+enemies[i].size;
        if (e!=enemies[i] && abs(e.x-enemies[i].x)<r && abs(e.y-enemies[i].y)<r)
            return enemies[i];
    }
    return null;
}
function isCollidingPlayers(e) {
    if (e != player1) {
        var r = e.size+player1.size;
        if (abs(e.x-player1.x)<r && abs(e.y-player1.y)<r)
            return player1;
    }
    if (coOp && e != player2) {
        var r = e.size+player2.size;
        if (abs(e.x-player2.x)<r && abs(e.y-player2.y)<r)
            return player2;
    }
    return null;
}
function isColliding(e) {
    return isCollidingTiles(e)||isCollidingEnemies(e)||isCollidingPlayers(e);
}
function abs(n) {
    return n<0?-n:n;
}
function sin(n) {
    return Math.sin(n);
}
function cos(n) {
    return Math.cos(n);
}
function floor(n) {
    return Math.floor(n);
}
function ceil(n) {
    return Math.ceil(n);
}
function sqrt(n) {
    return Math.sqrt(n);
}
function rand() {
    return Math.random();
}
function remove(arr,item) {
    arr.splice(arr.indexOf(item),1);
}

// start the main loop!
function initGame(mapI) {
    var playersPos=initTiles(mapI);
    initGameVars();
    initGameLists();
    player1 = initPlayer(playersPos[0]);
    if (coOp) player2 = initPlayer(playersPos[1]);
    var w=coOp?winHeight:winWidth,h=coOp?winWidth/2:winHeight;
    moveJoystick1.size=moveJoystick2.size=shootJoystick1.size=shootJoystick2.size=h/5;
    moveJoystick1.x=moveJoystick2.x=w/5;
    shootJoystick1.x=shootJoystick2.x=w-w/5;
    moveJoystick1.y=moveJoystick2.y=shootJoystick1.y=shootJoystick2.y=h-w/5;
    gameState = 1;
}
var tilesChanged = true, playerMoved = false;
var bgImg;
function drawBg(buf) {
    return renderToBuffer(gridWidth*tileSize,gridHeight*tileSize,function(ctx){
        clearCanvas(ctx);
        for (var x=0;x<gridWidth;x++) {
            var xPos = x*tileSize;
            for (var y=0;y<gridHeight;y++) {
                var yPos = y*tileSize;
                var t = floor(tiles[x][y]);
                if (t>0&&t!=3&&t<10) drawRect(xPos,yPos, tileSize,tileSize, t==1?"white":t==2?"purple":t==4?"brown":"orange",ctx);
                if (t>=100) {tiles[x][y]=0;continue;}
                if (t==3||t>9) drawCircle(xPos+20,yPos+20,17,t==3?"tan":"white",ctx);
                if (t>32) drawCircle(xPos+17,yPos+28,3,"#DEB887",ctx);
                if (t>54) drawCircle(xPos+21,yPos+10,3,"#DEB887",ctx);
                if (t>76) drawCircle(xPos+28,yPos+23,3,"#DEB887",ctx);
            }
        }
    },buf);
}
var gameState = 0, currentMap = +getCookie("sh_currentMap")||0, redraw = true;
frame();

// main everything function - called every frame
function frame() {try{
    
    // draw/update stuff
    if (gameState==0 && redraw) {
        clearCanvas();
        drawText("Level Select",winWidth/2,winHeight/12);
        initTiles(currentMap);
        bgImg = drawBg(bgImg);
        var mapH = winHeight*2/3, mapW = mapH*bgImg.width/bgImg.height;
        ctx.drawImage(bgImg,winWidth/2-mapW/2,winHeight/2-mapH/2,mapW,mapH);
        drawText("Map "+(currentMap+1)+"/"+maps.length+":  "+maps[currentMap].name,winWidth/2,winHeight*11/12);
        drawRect(winWidth*15/20,winHeight/20,winWidth*4/20,winHeight*2/20,"darkgray");
        drawText("Co-op: "+(coOp?"ON":"OFF"),winWidth*17/20,winHeight/10);
        redraw = false;
    }
    if (gameState==2 && !redraw) {
        clearCanvas();
        drawText(["You died!","The zombies won!","Game over!"][floor(rand()*3)],winWidth/2,winHeight/2);
        drawText("Tap to return to level select",winWidth/2,winHeight*3/4);
        redraw = true;
    }
    if (gameState==1) {
        // update game
        var tmp_barrels = barrels;
        barrels = [];
        for (var i=0;i<tmp_barrels.length;i++) {
            var b = tmp_barrels[i];
            setTile(b.x,b.y,0);
            explosion(b.x+0.5,b.y+0.5,b.p.weapons[5].bigbang?3:2,b.p.weapons[5].cluster,b.p);
        }
        for (var i=0;i<gasolines.length;i++) {
            var g = gasolines[i];
            var hit = isCollidingEnemies(g)||isCollidingPlayers(g);
            if (hit) {
                hit.onFire = hit.lastHurt = g.p;
                hit.health -= g.p.weapons[6].damage;
            }
            var tx = g.x-0.5, ty = g.y-0.5;
            if (tiles[tx+1][ty]==4&&rand()<0.08) igniteGas(tx+1,ty,g.p);
            if (tiles[tx-1][ty]==4&&rand()<0.08) igniteGas(tx-1,ty,g.p);
            if (tiles[tx][ty+1]==4&&rand()<0.08) igniteGas(tx,ty+1,g.p);
            if (tiles[tx][ty-1]==4&&rand()<0.08) igniteGas(tx,ty-1,g.p);
            if (tiles[tx+1][ty+1]==4&&rand()<0.08) igniteGas(tx+1,ty+1,g.p);
            if (tiles[tx-1][ty+1]==4&&rand()<0.08) igniteGas(tx-1,ty+1,g.p);
            if (tiles[tx+1][ty-1]==4&&rand()<0.08) igniteGas(tx+1,ty-1,g.p);
            if (tiles[tx-1][ty-1]==4&&rand()<0.08) igniteGas(tx-1,ty-1,g.p);
            if (g.age++>=g.p.weapons[6].burntime) {
                gasolines.splice(i--,1);
                setTile(tx,ty,0);
            }
        }
        for (var i=0;i<ammoDrops.length;i++) {
            var d = ammoDrops[i];
            if ((d.pack==null||(entities.indexOf(d.pack)<0&&(d.pack=null))) && --d.timer<0) {
                d.pack = spawnAmmoPack(d.x,d.y,false);
                d.timer = 1000;
            }
        }
        player1.update(moveJoystick1,shootJoystick1);
        if (coOp) player2.update(moveJoystick2,shootJoystick2);
        if (player1.health <= 0 && (!coOp || player2.health <= 0)) gameState = 2;
        for (var i=0;i<enemies.length;i++)
            if (enemies[i].update()) i--;
        for (var i=0;i<entities.length;i++)
            if (entities[i].update()) i--;
        if (zombiesLeft>0 && enemies.length<70 && --zombieTimer<=0) {
            if (spawnZombie()) {
                zombiesLeft--;
                zombieTimer += zombieRate;
            }
        }
        if (zombiesLeft==0 && enemies.length==0) {
            round++;
            zombiesLeft = zombieTotal = floor(zombieTotal*1.2);
            zombieRate /= 1.1;
        }
        if (floor(player1.combo) > player1.maxCombo) {
            player1.maxCombo = floor(player1.combo);
            doUpgrades(player1);
        }
        if (coOp && floor(player2.combo) > player2.maxCombo) {
            player2.maxCombo = floor(player2.combo);
            doUpgrades(player2);
        }
        player1.combo -= Math.min(0.01*Math.pow(1.04,player1.combo),0.11);
        if (player1.combo<1) player1.combo=0.1;
        if (coOp) {
            player2.combo -= Math.min(0.01*Math.pow(1.04,player2.combo),0.11);
            if (player2.combo<1) player2.combo=0.1;
        }
        
        // draw scene
        var p1 = false;
        do {
            p1 = !p1;
            if (coOp) {
                ctx.save();
                ctx.rotate(p1?Math.PI/2:-Math.PI/2);
                var oldWinWidth = winWidth;
                winWidth = winHeight;
                winHeight = oldWinWidth/2;
                ctx.translate(p1?0:-winWidth,p1?-winHeight:winHeight);
                ctx.beginPath();
                ctx.rect(0,0,winWidth,winHeight);
                ctx.clip();
            }
            
            var player = p1?player1:player2;
            if (player.health<0) {
                clearCanvas();
                drawText("You died!",winWidth/2,winHeight/2);
                drawText("You will respawn in a few moments...",winWidth/2,winHeight*3/4);
            } else {
            var offsetX = -player.x*tileSize+winWidth/2, offsetY = -player.y*tileSize+winHeight/2;
            if (offsetX>0)offsetX=0;if(offsetY>0)offsetY=0;if(offsetX<winWidth-gridWidth*tileSize)offsetX=winWidth-gridWidth*tileSize;if(offsetY<winHeight-gridHeight*tileSize)offsetY=winHeight-gridHeight*tileSize;
            if (tilesChanged) {
                bgImg = drawBg(bgImg);
                tilesChanged = false;
            }
            drawImage(bgImg,offsetX,offsetY);
            for (var i=0;i<bulletPaths.length;i++) {
                var l = bulletPaths[i];
                drawLine(l.x1*tileSize+offsetX,l.y1*tileSize+offsetY,l.x2*tileSize+offsetX,l.y2*tileSize+offsetY,"black");
            }
            player1.draw(offsetX,offsetY);
            if (coOp) player2.draw(offsetX,offsetY);
            for (var i=0;i<enemies.length;i++)
                enemies[i].draw(offsetX,offsetY);
            for (var i=0;i<entities.length;i++)
                entities[i].draw(offsetX,offsetY);
            for (var i=0;i<explosions.length;i++) {
                var e = explosions[i];var s=e.s*tileSize;
                drawCircle(e.x*tileSize+offsetX,e.y*tileSize+offsetY,s,"white");
            }
            // HUD/controls
            if (p1) {
                moveJoystick1.draw();
                shootJoystick1.draw();
            } else {
                moveJoystick2.draw();
                shootJoystick2.draw();
            }
            var w = player.weapons[player.weapon];
            drawText(w.name+(player.weapon==0?"":" ("+w.ammo+"/"+w.maxAmmo+")"), shootJoystick1.x,shootJoystick1.y-shootJoystick1.size*1.2);
            var gap = winHeight/12;
            drawText("Round "+round,winWidth/2,gap);
            drawText("Zombies left: "+(enemies.length+zombiesLeft),winWidth/2,gap*2);
            drawText("Combo: "+floor(player.combo),winWidth/2,gap*3);
            var barW = winWidth/10;
            drawRect(winWidth/2-barW/2,gap*3.2,player.combo<1?0:player.combo%1*barW,barW/5,"lime");
            }
            if (coOp) {
                ctx.restore();
                setWH();
            }
        } while (coOp && p1);
        bulletPaths = [];
        explosions = [];
        if (coOp)
            drawRect(winWidth/2-5,0,10,winHeight);
    }
    
    // request the next frame
    // requestAnimationFrame(frame);
    setTimeout(frame, 25);
}catch(e){
    document.body.innerHTML = `<pre>

Squarehead has crashed! Please report the following message to Quinn (I cannot fix this if you just say "it crashed"):

${e.message}</pre>`;
}}
