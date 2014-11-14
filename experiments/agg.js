var Rx = require('Rx');

var source = Rx.Observable.range(1, 3)
    .reduce(function (acc, x) {
        acc.push(x);
        return acc;
    }, [])


var subscription = source.subscribe(
    function (x) {
        console.log('Next: ' + x);
    },
    function (err) {
        console.log('Error: ' + err);
    },
    function () {
        console.log('Completed');
    });

console.log("done");