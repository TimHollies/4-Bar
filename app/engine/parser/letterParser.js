  define([
      "../../vendor/lodash/dist/lodash",
      "engine/parser/basicParser"
  ], function(_, parserFactory) {

      var service = {};

      var letterParser = [{
          "basicNote": {
              n: 1,
              p: function(a, s) {
                    return s;
              }
          },
          _node: 0
      }, {
          "basicNote": {
              n: 1,
              p: function(a, s) {
                    return a + s;
              }
          },
          _node: 2
      }];


      service.parser = parserFactory.createParser(letterParser);

      window.letterParser = service.parser;

      return service;
  });