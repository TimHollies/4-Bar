define([
    "vendor/lodash/dist/lodash"
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

    var barParserBuilder = [
        {
            "bar": {
                n: 0,
                p: function(a, s) {
                    if(_.isObject(a))return s;
                    return a + s;
                }
            },
            "colon": {
                n:0,
                p: function(a,s) {
                    return a;
                }
            },
            _node: 0
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
        _node: 0
    },
    {
        "basicNote": {
            n: 2,
            p: function(a, s) {
                a["note"] = s;
                return a;
            }
        },
        _node: 1
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
        _node: 2
    },
    {        
        "octaveModifer":  {
            n: 3
        },
        _node: 2
    }];

    function unionParsers(parserA, parserB) {

    }

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
                    case "_node": {
                        builtParserState["_node"] = builderState["_node"];
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
            if(!currentStateTransition) {

                if(noteParser[currentState]._node === 2) {
                    currentState = 0;
                    emit(currentObject);
                    currentObject = {};
                }

                currentStateTransition = noteParser[currentState][char];
            }

            currentState = currentStateTransition.n;

            if(currentStateTransition.p)
                currentObject = currentStateTransition.p(currentObject, char);


        });

        emit(currentObject);

        return currentState;
    }

    return service;
});