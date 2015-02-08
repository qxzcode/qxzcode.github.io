var fb = new Firebase("https://qxzcode1.firebaseio.com/");
fb.once("value", function(s) {
	console.log(s.val());
});