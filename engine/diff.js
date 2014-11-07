 //select many:
 var Rx = require('scripts/rx.helper'),
  enums = require('./types');

 module.exports = function(change) {

     return Rx.Observable.create(function(observer) {

         var
             newSplit = (change.newValue || "").split('\n'),
             oldSplit = (change.oldValue || "").split('\n'),
             newLength = Math.max(newSplit.length, oldSplit.length);

         function get_diff(matrix, a1, a2, x, y) {
             if (x > 0 && y > 0 && a1[y - 1] === a2[x - 1]) {
                 get_diff(matrix, a1, a2, x - 1, y - 1);
                 //make_row(x, y, ' ', a1[y-1]);
                 if (x !== y)
                     observer.onNext({
                         action: enums.line_actions.move,
                         i: x - 1,
                         j: y - 1,
                         newLength: newLength
                     });
             } else {
                 if (x > 0 && (y === 0 || matrix[y][x - 1] >= matrix[y - 1][x])) {
                     get_diff(matrix, a1, a2, x - 1, y);
                     //make_row(x, '', '+', a2[x-1]);
                     observer.onNext({
                         raw: a2[x - 1],
                         i: x - 1,
                         action: enums.line_actions.add,
                         newLength: newLength
                     });
                 } else if (y > 0 && (x === 0 || matrix[y][x - 1] < matrix[y - 1][x])) {
                     get_diff(matrix, a1, a2, x, y - 1);
                     //make_row('', y, '-', a1[y-1]);
                     observer.onNext({
                         raw: a1[y - 1],
                         i: y - 1,
                         action: enums.line_actions.delete,
                         newLength: newLength
                     });
                 } else {
                     return;
                 }
             }
         }

         function diff(a1, a2) {
             var matrix = new Array(a1.length + 1);
             var x, y;

             for (y = 0; y < matrix.length; y++) {
                 matrix[y] = new Array(a2.length + 1);

                 for (x = 0; x < matrix[y].length; x++) {
                     matrix[y][x] = 0;
                 }
             }

             for (y = 1; y < matrix.length; y++) {
                 for (x = 1; x < matrix[y].length; x++) {
                     if (a1[y - 1] === a2[x - 1]) {
                         matrix[y][x] = 1 + matrix[y - 1][x - 1];
                     } else {
                         matrix[y][x] = Math.max(matrix[y - 1][x], matrix[y][x - 1]);
                     }
                 }
             }

             get_diff(matrix, a1, a2, x - 1, y - 1);
         }

         diff(oldSplit, newSplit);
         //observer.onNext({ action: "endofinput" });
     });
 }