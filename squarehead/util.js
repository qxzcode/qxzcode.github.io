//// pathfinding
function astar(n,m,q,r){function w(g){var h=[],k=g.x;g=g.y;var e=!1,b=!1,c=!1,f=!1,a;d[k-1]&&(a=d[k-1][g])&&!a.isWall&&(b=!0,a.cost=1+a.z,h.push(a));d[k+1]&&(a=d[k+1][g])&&!a.isWall&&(e=!0,a.cost=1+a.z,h.push(a));d[k]&&(a=d[k][g-1])&&!a.isWall&&(f=!0,a.cost=1+a.z,h.push(a));d[k]&&(a=d[k][g+1])&&!a.isWall&&(c=!0,a.cost=1+a.z,h.push(a));d[k-1]&&(a=d[k-1][g-1])&&!a.isWall&&b&&f&&(a.cost=1.4+a.z,h.push(a));d[k+1]&&(a=d[k+1][g-1])&&!a.isWall&&e&&f&&(a.cost=1.4+a.z,h.push(a));d[k-1]&&(a=d[k-1][g+1])&&!a.isWall&&b&&c&&(a.cost=1.4+a.z,h.push(a));d[k+1]&&(a=d[k+1][g+1])&&!a.isWall&&e&&c&&(a.cost=1.4+a.z,h.push(a));return h}function x(){var g=e[0],h=e.pop();if(0<e.length){e[0]=h;for(var h=0,b=e.length,c=e[h],d=c.f;;){var f=h+1<<1,l=f-1,a=null,m;l<b&&(m=e[l].f,m<d&&(a=l));f<b&&e[f].f<(null==a?d:m)&&(a=f);if(null!=a)e[h]=e[a],e[a]=c,h=a;else break}}return g}function p(g){for(var b=e[g];0<g;){var c=(g+1>>1)-1,d=e[c];if(b.f<d.f)e[c]=b,e[g]=d,g=c;else break}}function s(b,c,d,e){var f=sqrt(2);b=abs(d-b);c=abs(e-c);return 1*(b+c)+(f-2)*Math.min(b,c)}function t(b){for(var c=[];b.parent;)c.push(b),b=b.parent;return c.reverse()}for(var d=[],b=0;b<gridWidth;b++){d[b]=[];for(var f=0;f<gridHeight;f++){var l=tiles[b][f];d[b][f]={x:b,y:f,isWall:0!=l&&2!=l&&4!=l&&5!=l,f:0,g:0,h:0,z:0==zombieGrid[b][f]?0:2,visited:!1,closed:!1,parent:null}}}var e=[],b=d[n][m];n=d[q][r];m=b;b.h=s(b.x,b.y,n.x,n.y);e.push(b);for(p(e.length-1);0<e.length;){b=x();if(b.x==q&&b.y==r)return t(b);b.closed=!0;for(var f=w(b),l=0,y=f.length;l<y;l++){var c=f[l];if(!c.closed){var u=b.g+c.cost,v=c.visited;if(!v||u<c.g){c.visited=!0;c.parent=b;c.h=c.h||s(c.x,c.y,n.x,n.y);c.g=u;c.f=c.g+c.h;if(c.h<m.h||c.h==m.h&&c.g<m.g)m=c;v?p(e.indexOf(c)):(e.push(c),p(e.length-1))}}}}return t(m)}

//// drawing utility functions
function drawCircle(x,y, r, color, ct) {
    ct = ct || ctx;
    ct.fillStyle = color;
    ct.beginPath();
    ct.arc(x,y, r, -9,9);
    ct.fill();
}
function drawRect(x,y, w,h, color, ct) {
    ct = ct || ctx;
    ct.fillStyle = color;
    ct.fillRect(x,y, w,h);
}
function drawLine(x1,y1, x2,y2, color, ct) {
    ct = ct || ctx;
    ct.strokeStyle = color;
    ct.beginPath();
    ct.moveTo(x1, y1);
    ct.lineTo(x2, y2);
    ct.stroke();
}
function drawText(text, x,y, ct) {
    ct = ct || ctx;
    ct.textAlign = "center";
    ct.textBaseline = "middle";
    ct.font = floor(winHeight/18)+"px Arial";
    ct.fillStyle = document.body.style.color;
    ct.fillText(text, x,y);
}
function drawImage(img, x,y, ct) {
    ct = ct || ctx;
    ct.drawImage(img, x, y);
}
function clearCanvas(ct) {
    ct = ct || ctx;
    ct.fillStyle = document.body.style.backgroundColor;
    ct.fillRect(0, 0, ct.canvas.width, ct.canvas.height);
}
function renderToBuffer(w,h, func, buf) {
    buf = buf || document.createElement("canvas");
    buf.width = w;
    buf.height = h;
    func(buf.getContext("2d"));
    return buf;
}

// cookie handling
function setCookie(name, value) {
    if (location.protocol=="file:") return;
    localStorage[name] = value;
}
function getCookie(name) {
    if (location.protocol=="file:") return;
    return localStorage[name];
}
