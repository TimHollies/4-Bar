 //select many:
 var Rx = require('scripts/rx.helper'),
     enums = require('./types'),
     JsDiff = require('vendor').jsDiff;

 module.exports = function(change) {

     var diff = JsDiff.diffLines(change.oldValue, change.newValue);

     for (var i = 0; i < diff.length; i++) {

         if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
             var swap = diff[i];
             diff[i] = diff[i + 1];
             diff[i + 1] = swap;
         }
     }

     var line_count = 0;
     var output = [];


     for (var i = 0; i < diff.length; i++) {
         var item = diff[i],
             newlines = 0,
             split = [];

         split = item.value.split('\n');

         if (split[split.length - 1] === "") {
             split = split.slice(0, split.length - 1);
         }

         newlines = split.length;

         item.lineno = line_count;

         if (!item.removed) {
             line_count += newlines;
         }

         var splitLines = _.map(split, function(val) {
             return {
                 raw: val
             };
         });

         output.push({
             lineno: item.lineno,
             raw: item.value,
             action: item.added ? "ADD" : item.removed ? "DEL" : "NONE",
             lineLength: newlines,
             split: splitLines
         });
     }
     
     return output;
 }