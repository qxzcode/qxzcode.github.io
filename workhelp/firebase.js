fb = new Firebase("https://workhelp.firebaseio.com/");
requestsRef = fb.child("requests");

window.addEventListener("load", function(e) {
	list = document.getElementById("list");
});


loading = true;
requestsRef.on("child_added", function(s) {
	if (loading) {
		list.innerHTML = "";
		loading = false;
	}
	list.innerHTML += '<div class="reqdiv"><p class="reqtitle">'+s.val().title+'</p><br><p class="reqdesc">'+s.val().desc+'</p></div>';
});