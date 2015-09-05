
import JsDiff from 'diff';
import LineCollection from './types/LineCollection';

export function Diff(change) {

     var diff = JsDiff.diffLines(change.oldValue, change.newValue);

     //ensure deletions are before additions in changes
     for (var i = 0; i < diff.length; i++) {

         if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
             var swap = diff[i];
             diff[i] = diff[i + 1];
             diff[i + 1] = swap;
         }
     }

     var lineCount = 0;
     var output = [];

     for (var i = 0; i < diff.length; i++) {
         var item = diff[i],
             newlines = 0,
             split = [];

         split = item.value.split(/\r\n|\r|\n/);

         if (split[split.length - 1] === '') {
             split = split.slice(0, split.length - 1);
         }

         newlines = split.length;

         item.lineno = lineCount;

         var newLineCollection = new LineCollection(item.lineno, item.value,
            item.added ? 'ADD' : item.removed ? 'DEL' : 'NONE');

         if (!item.removed) {
             lineCount += newlines;
         }

         if(newLineCollection.action != 'NONE')output.push(newLineCollection);
     }

     return output;
 };
