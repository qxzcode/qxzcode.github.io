const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function stop() {
    clearInterval(window.interval);
}
window.addEventListener("click", stop);
window.addEventListener("touchend", stop);

// https://stackoverflow.com/a/901144/1848578
function getQueryParameter(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const ZOOM = +getQueryParameter("zoom") || 1.0;
const WIDTH = (canvas.width = window.innerWidth) / ZOOM;
const HEIGHT = (canvas.height = window.innerHeight) / ZOOM;
ctx.scale(ZOOM, ZOOM);


const STEP = 5; // pixels
const NOISE_AMT = 0.3;
const SPLIT_RATE = 0.035; // probability density per pixel of length
const SPLIT_CHANCE = 1 - Math.pow(1 - SPLIT_RATE, STEP); // probability per node
const SPLIT_SPREAD = 0.5;

let nodes = [], activeNodes = [];

function addNode(x, y, vx, vy, auxList, parent = null) {
    const n = {x, y, vx, vy, parent};
    nodes.push(n);
    auxList.push(n);
    
    const cellKey = Math.floor(x/CELL_SIZE)+","+Math.floor(y/CELL_SIZE);
    const cell = cells[cellKey];
    if (cell) cell.push(n);
    else cells[cellKey] = [n];
}

function randNoise(mag) {
    return Math.random()*mag*2 - mag;
}

function addChildNode(p, noiseX, noiseY, auxList) {
    let vx = p.vx + noiseX, vy = p.vy + noiseY;
    const invMag = 1 / Math.hypot(vx, vy);
    vx *= invMag;
    vy *= invMag;
    addNode(
        p.x + vx*STEP, p.y + vy*STEP,
        vx, vy,
        auxList,
        p
    );
}

// stopping parameters //
const STOP_DIST_THRESHOLD = 30; // must be greater than SPLIT_DIST_THRESHOLD for getProps to work as written
const COS_THRESHOLD = 0.6;
// splitting parameters //
const SPLIT_DIST_THRESHOLD = 25;
const COUNT_THRESHOLD = 30 / STEP;
/////////////////////////
function getProps(p) {
    let count = 0;
    return forEachNearbyNode(p, n => {
        if (n === p) return false;
        const dx = n.x - p.x, dy = n.y - p.y;
        const dSq = dx*dx + dy*dy;
        if (dSq < STOP_DIST_THRESHOLD*STOP_DIST_THRESHOLD) {
            // check stop condition
            const dot = dx*p.vx + dy*p.vy;
            if (dot > 0 && dot*dot / dSq > COS_THRESHOLD*COS_THRESHOLD)
                return {stop: true, canSplit: false};
            
            // check split condition
            if (dSq < SPLIT_DIST_THRESHOLD*SPLIT_DIST_THRESHOLD) {
                ++count;
            }
        }
    }) || {stop: false, canSplit: count < COUNT_THRESHOLD};
}

const CELL_SIZE = Math.max(STOP_DIST_THRESHOLD, SPLIT_DIST_THRESHOLD) * 2;
const cells = {};
function forEachNearbyNode(p, callback) {
    const xip = Math.round(p.x/CELL_SIZE), yip = Math.round(p.y/CELL_SIZE);
    return forEachInCell(xip, yip) ||
           forEachInCell(xip-1, yip) ||
           forEachInCell(xip, yip-1) ||
           forEachInCell(xip-1, yip-1);
    
    function forEachInCell(xi, yi) {
        const cell = cells[xi+","+yi];
        if (cell) {
            for (const n of cell) {
                const res = callback(n);
                if (res) return res;
            }
        }
        return false;
    }
}


addNode(WIDTH/2, HEIGHT/2, 0, -1, activeNodes);

ctx.fillStyle = "black";
ctx.fillRect(0, 0, WIDTH, HEIGHT);

function frame() {
    const start = performance.now();
    
    /// draw
    ctx.fillStyle = ctx.strokeStyle = "white";
    for (const n of activeNodes) {
        // fillCircle(n.x, n.y, 2);
        if (n.parent)
            drawLine(n.x, n.y, n.parent.x, n.parent.y);
    }
    
    /// update
    let newNodes = [];
    for (const n of activeNodes) {
        const props = getProps(n);
        if (props.stop) continue;
        const nx = randNoise(NOISE_AMT), ny = randNoise(NOISE_AMT);
        if (props.canSplit && Math.random() < SPLIT_CHANCE) {
            let ox = n.vy*SPLIT_SPREAD, oy = -n.vx*SPLIT_SPREAD;
            if (Math.random() < 0.5) { ox = -ox; oy = -oy; }
            addChildNode(n, nx + ox, ny + oy, newNodes);
            addChildNode(n, nx - ox, ny - oy, newNodes);
        } else {
            addChildNode(n, nx, ny, newNodes);
        }
    }
    activeNodes = newNodes;
    
    const end = performance.now();
    console.log(`frame() took ${(end-start).toFixed(1)} ms`)
}

function fillCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
}
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

window.interval = setInterval(frame, 10*STEP / (+getQueryParameter("speed") || 1.0));