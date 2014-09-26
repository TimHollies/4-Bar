  define([
      "../../vendor/lodash/dist/lodash",
      "engine/parser/basicParser"
  ], function(_, parserFactory) {

      var service = {};

      var numberParser = [{
          "number": {
              n: 1,
              p: function(a, s) {
                    return s;
              }
          },
          _node: 0
      }, {
          "number": {
              n: 1,
              p: function(a, s) {
                    return a + s;
              }
          },
          _node: 2
      }];


      service.parser = parserFactory.createParser(numberParser);

      window.numberParser = service.parser;

      return service;
  });