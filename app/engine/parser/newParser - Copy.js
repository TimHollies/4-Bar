define([
    "vendor/lodash/dist/lodash"
], function(_) {

    var service = {};

   var keys = {
        basicNote: "ABCDEFGabcdefg",
        accidental: "^_",
        number: "0123456789",
        octaveModifer: ",'"
    };

    var intParserBuilder = [
        {
            "number": {
                n: 0,
                p: function(a, s) {
                    if(_.isObject(a))return s;
                    return a + s;
                }
            }
        }
    ];

    var noteParserBuilder = [
    {
        "basicNote":  {
            n: 2,
            p: function(a, s) {
                a["note"] = s;
                return a;
            }
        },
        "accidental":  {
            n: 1,
            p: function(a, s) {
                if(s == "^")a["accidental"] = 1;
                if(s == "_")a["accidental"] = -1;
                return a;
            }
        },
        "_emit": true
    },
    {
        "basicNote": {
            n: 2,
            p: function(a, s) {
                a["note"] = s;
                return a;
            }
        }
    },
    {        
        "number":  {
            n: 2,
            p: function(a, s) {
                if(!a["duration"])a["duration"] = "";
                a["duration"] += s;
                return a;
            }
        },
        "octaveModifer":  {
            n: 3
        },
        "_theta": 0
    },
    {        
        "octaveModifer":  {
            n: 3
        },
        "_theta": 0
    }];

    function buildParser(builder, keys) {

        var builtParser = [];
        var cache = [];

        _(builder).each(function(builderState) {

            var builtParserState = {};

            _(_(builderState).keys()).each(function(property){

                var values = keys[property];
                var gotoState = builderState[property];

                switch(property)
                {
                    case "_emit": {
                        builtParserState["_emit"] = builderState["_emit"];
                        break;
                    }
                    case "_theta": {
                        /*_(builderState["_theta"]).each(function(t) {
                            builtParserState = _.merge(builtParserState, builtParser[t]);
                        });*/
                        builtParserState["_theta"] = builderState["_theta"];
                        break;
                    }
                    default: {
                        _(values).each(function(symbol) {  
                            builtParserState[symbol] = gotoState;
                        });
                    }
                }                
            });

            builtParser.push(builtParserState);
        });

        return builtParser;
    }

    function processString(parserBuilder, inputString) {
        var currentState = 0;
        var currentObject = {};

        noteParser = buildParser(parserBuilder, keys, keys, keys);

        function emit(item) {
            console.log(item);
        }

        _(inputString).each(function(char) {
            var currentStateTransition = noteParser[currentState][char];
            if(!currentStateTransition && noteParser[currentState]._theta != undefined) {
                currentState = noteParser[currentState]._theta;
                
                currentStateTransition = noteParser[currentState][char];

                if(noteParser[currentState]._emit) {
                    emit(currentObject);
                    currentObject = {};
                }

            }

            currentState = currentStateTransition.n;

            if(currentStateTransition.p)currentObject = currentStateTransition.p(currentObject, char);

            if(noteParser[currentState]._emit) {
                emit(currentObject);
                currentObject = {};
            }

        });

        emit(currentObject);

        return currentState;
    }

    return service;
});