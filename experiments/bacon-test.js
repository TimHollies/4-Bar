var Bacon = require('baconjs');

function addsLetterGenerator() {
	var sum = 0;

	return function(a, b) {
		sum += (a+b);
		return sum;
	}
}

var trans = addsLetterGenerator();

function doTheThing() {

	//var stream = Bacon.fromArray([1,2,3]);
	var stream = Bacon.fromBinder(function(sink) {
	  sink(1);
	  sink(2);
	  sink(new Bacon.End());

	  return function() {
	     // unsub functionality here, this one's a no-op
	  }
	})

	var out = stream.fold(0, trans);

	// var stream2 = stream.map(function(a) {
	// 	return a * 2;
	// });
	out.log();
}

doTheThing();
doTheThing();
doTheThing();


console.log("done");