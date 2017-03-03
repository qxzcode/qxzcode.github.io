
var canvas, ctx;
window.addEventListener("load", function(e) {
  canvas = document.getElementById("c");
  ctx = canvas.getContext("2d");
  
  init(innerWidth, innerHeight);
  requestAnimationFrame(frame);
});

var TILE_SIZE = 10;

var grid1 = [], grid2 = [];
var gridW, gridH, arrSize;
var imgData, imgDataArr;

function init(width, height) {
  canvas.width = gridW = Math.floor(width/TILE_SIZE);
  canvas.height = gridH = Math.floor(height/TILE_SIZE);
  arrSize = gridW*gridH;
  imgData = ctx.createImageData(gridW, gridH);
  imgDataArr = imgData.data;
  for (var i = 3; i < imgDataArr.length; i += 4) {
    imgDataArr[i] = 255;
  }
  for (var i = 0; i < arrSize; i++) {
    grid1[i] = Math.random() < 0.5;
  }
}

function frame() {
  // convert grid to ImageData
  for (var di = 0, gi = 0; gi < arrSize; gi++, di+=4) {
    var val = grid1[gi]? 0 : 255;
    imgDataArr[di  ] = val;
    imgDataArr[di+1] = val;
    imgDataArr[di+2] = val;
  }
  ctx.putImageData(imgData, 0, 0);
  
  // step the simulation
    step();
  
  // next frame
  requestAnimationFrame(frame);
}



function step() {
  // compute new grid
  for (var i = 0; i < arrSize; i++) {
    // count the cell's neighbors
    var count = !!grid1[i-1] + !!grid1[i+1] + !!grid1[i-gridW] + !!grid1[i+gridW] + 
                !!grid1[i-1-gridW] + !!grid1[i-1+gridW] + !!grid1[i+1-gridW] + !!grid1[i+1+gridW];
    
    grid2[i] = count==3 || (grid1[i] && count==2);
  }
  
  // swap grids (no reallocation every update)
  var tmp = grid1;
  grid1 = grid2;
  grid2 = tmp;
}













//
