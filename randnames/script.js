function e(a){a=a.replace(/([a-z])/g,'"$1":').replace(/[\dA-Z]+/g,function(a){return parseInt(a,36).toString().toUpperCase()}).replace(/(\d|})"/g,'$1,"');return f(JSON.parse(a))}function f(a){var c=0,b;for(b in a)"object"==typeof a[b]?(f(a[b]),c=null):c+=a[b];if(null!=c){var k=0;for(b in a){a[b]/=c;var d=a[b];a[b]+=k;k+=d}}return a}window.addEventListener("load",function(){single=e(single);double=e(double);triple=e(triple);g()},!1);function g(a){a=a||0;var c=document.getElementById("t"+a),b=c.cloneNode(!0);c.parentNode.replaceChild(b,c);setTimeout(function(){b.style.a="paused";for(var a=h({3:.09,4:.27,5:.5,6:.73,7:.9,8:.98,9:1}),d="",c=0;c<a;c++)d=0==c?d+h(single):1==c?d+h(double[d[c-1]]):d+h(triple[d[c-2]][d[c-1]]);b.innerText=d[0].toUpperCase()+d.slice(1);b.style.a="running"},350);4>a&&setTimeout(function(){g(a+1)},150)}window.generate=g;function h(a){var c=Math.random(),b;for(b in a)if(c<a[b])return b};
