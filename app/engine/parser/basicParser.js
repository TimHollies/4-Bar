  define([
      "../../vendor/lodash/dist/lodash"
  ], function(_) {

      var service = {};

      var keys = {
          basicNote: "ABCDEFGabcdefg",
          accidental: "^_",
          number: "0123456789",
          octaveModifer: ",'",
          bar: "|",
          colon: ":"
      };

      var parserPrototype = {

          parse: function(inputString) {
              var currentState = 0;
              var currentObject = {};
              var currentParserID = null;
              var self = this;

              noteParser = self.states;

              function emit(item) {
                  console.log("EMIT: " + item);
                  currentObject = {};
              }

              _.each(inputString, function(char) {

                  var currentStateTransition = noteParser[currentState][char];

                  if (currentParserID != null && currentStateTransition.id != currentParserID) {

                      if (_(self.endStates).contains(currentState)) {
                          currentState = self.startState;
                          emit(currentObject);
                      }

                      currentStateTransition = noteParser[currentState][char];
                  }

                  currentState = currentStateTransition.n;

                  currentParserID = currentStateTransition.id;

                  if (currentStateTransition.p)
                      currentObject = currentStateTransition.p(currentObject, char);


              });

              emit(currentObject);

              return currentState;
          }
      };

      function combineParsers(parserA, parserB) {
          var builtParser = Object.create(parserPrototype);

          builtParser.alphabet = _.union(parserA.alphabet, parserB.alphabet);

          builtParser.states = [];

          builtParser.endStates = [];

          for (var i = 0; i < parserA.states.length; i++) {

              for (var j = 0; j < parserB.states.length; j++) {

                  if (i === parserA.startState && j === parserB.startState)
                      builtParser.startState = builtParser.states.length;

                  if (_(parserA.endStates).contains(i) || _(parserB.endStates).contains(j))
                      builtParser.endStates.push(builtParser.states.length);

              	 _(_.keys(parserA.states[i])).each(function(property) {
              	 	parserA.states[i][property]["id"] = "A";
              	 });

              	_(_.keys(parserB.states[j])).each(function(property) {
              	 	parserB.states[j][property]["id"] = "B";
              	 });

              	var newStateObject = {};

              	for(var attrname in parserA.states[i]) newStateObject[attrname] = parserA.states[i][attrname];
		for(var attrname in parserB.states[j]) newStateObject[attrname] = parserB.states[j][attrname];

                  builtParser.states.push(newStateObject);

              }
          }

          return builtParser;
      }

      window.combineParsers = combineParsers;

      function buildParser(builder, keys) {

          var builtParser = Object.create(parserPrototype);
          builtParser.states = [];
          builtParser.endStates = [];
          builtParser.alphabet = [];
          var cache = [];

          _(builder).each(function(builderState) {

              var builtParserState = {};

              _(_.keys(builderState)).each(function(property) {

                  var values = keys[property];
                  var gotoState = builderState[property];

                  switch (property) {
                      case "_node":
                          {
                              if (builderState["_node"] == 0 || builderState["_node"] == 3) builtParser.startState = builtParser.states.length;
                              if (builderState["_node"] == 2 || builderState["_node"] == 3) builtParser.endStates.push(builtParser.states.length);
                              break;
                          }
                      default:
                          {
                              _(values).each(function(symbol) {
                                  if (!_(builtParser.alphabet).contains(symbol)) builtParser.alphabet.push(symbol);
                                  builtParserState[symbol] = gotoState;
                              });
                          }
                  }
              });

              builtParser.states.push(builtParserState);
          });

          return builtParser;
      }

      service.createParser = _.partialRight(buildParser, keys);

      return service;
  });