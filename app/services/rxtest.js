 +(function(Rx) {

     console.log("hi");

     function searchWikipedia(term) {
         var cleanTerm = encodeURIComponent(term);
         var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + cleanTerm + '&callback=JSONPCallback';
         return Rx.DOM.Request.jsonpRequestCold(url);
     }

     var textInput = document.getElementById('textInput');
     var throttledInput = Rx.DOM.fromEvent(textInput, 'keyup')
         .map(function(ev) {
             return textInput.value;
         })
         .filter(function(text) {
             return text.length > 2;
         })
         .throttle(500)
         .distinctUntilChanged();

     var suggestions = throttledInput.flatMapLatest(function(text) {
         return searchWikipedia(text);
     });

     var resultList = document.getElementById('results');

     function clearSelector(element) {
         while (element.firstChild) {
             element.removeChild(element.firstChild);
         }
     }

     function createLineItem(text) {
         var li = document.createElement('li');
         li.innerHTML = text;
         return li;
     }

     suggestions.subscribe(function(data) {
         var results = data[1];

         clearSelector(resultList);

         for (var i = 0; i < results.length; i++) {
             resultList.appendChild(createLineItem(results[i]));
         }
     }, function(e) {
         clearSelector(resultList);
         resultList.appendChild(createLineItem('Error: ' + e));
     });
 })(Rx);