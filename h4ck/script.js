window.addEventListener('load', function(e) {
  try {
    var url = location.href;
    msg = atob(url.slice(url.indexOf("?")+1));
    auto = true;
    setTimeout(start, 1000+rand(3000));
  } catch (e) {
    msg = prompt("Enter auth code:");
  }
}, false);

window.addEventListener('touchstart', function(e) {
  if (auto) return;
  e.preventDefault();
  start();
}, false);
window.addEventListener('click', function(e) {
  if (auto) return;
  e.preventDefault();
  start();
}, false);

function start() {
  if (phase>0) return;
  phase = 1;
  initArr();
  frame();
  setInterval(frame,60);
}

function rand(n) {
  return Math.floor(Math.random()*n);
}
function initArr() {
  for (var i=0; i<msg.length; i++)
    arr.push(i);
}

var msg, auto = false;
var arr = [];
var phase = 0;
var ticks = 0;
function frame() {try{
  ticks++;
  var h = "decrypting";
  for (var n=0; n<1+Math.floor((ticks%9)/3); n++) h += ".";
  setHeader(phase>2? "[done]" : h);
  var str = "";
  for (var i=0; i<msg.length; i++) {
    var n = phase + (arr.indexOf(i)==-1?1:0);
    if (n==1) str += " ";
    else if (n==2) str += String.fromCharCode(32+rand(95));
    else str += msg.substr(i,1);
  }
  var changes = Math.random()*msg.length/25;
  for (var n=0; n<changes; n++) {
    arr.splice(rand(arr.length),1);
    if (arr.length==0) {
      phase++;
      initArr();
    }
  }
  setText(phase>2? msg : str);
}catch(e){alert(e)}}

function setText(t) {
  document.querySelector('#test').innerText = t;
}
function setHeader(t) {
  document.querySelector('#h').innerText = t;
}
