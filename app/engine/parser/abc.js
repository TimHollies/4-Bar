

define([], function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"scope_symbol":6,"note_letter":7,"barline":8,"SPACE":9,"chord":10,"TIME_BAR":11,"TIE":12,"\"":13,"NOTE_LOWER":14,"integer":15,"INTEGER":16,"duration":17,"/":18,"octave_modifier_part":19,"OCTAVE_HIGHER":20,"OCTAVE_LOWER":21,"octave_modifer":22,"note_accidental":23,"SHARP":24,"DOUBLE_SHARP":25,"FLAT":26,"DOUBLE_FLAT":27,"NATURAL":28,"A":29,"B":30,"C":31,"D":32,"E":33,"F":34,"G":35,"a":36,"b":37,"c":38,"d":39,"f":40,"g":41,"note_with_octave":42,"note_with_duration":43,"note":44,"DOUBLE_BARLINE":45,"BARLINE_OPEN_REPEAT":46,"BARLINE_CLOSE_REPEAT":47,"BARLINE":48,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",9:"SPACE",11:"TIME_BAR",12:"TIE",13:"\"",14:"NOTE_LOWER",16:"INTEGER",18:"/",20:"OCTAVE_HIGHER",21:"OCTAVE_LOWER",24:"SHARP",25:"DOUBLE_SHARP",26:"FLAT",27:"DOUBLE_FLAT",28:"NATURAL",29:"A",30:"B",31:"C",32:"D",33:"E",34:"F",35:"G",36:"a",37:"b",38:"c",39:"d",40:"f",41:"g",45:"DOUBLE_BARLINE",46:"BARLINE_OPEN_REPEAT",47:"BARLINE_CLOSE_REPEAT",48:"BARLINE"},
productions_: [0,[3,2],[3,1],[4,2],[4,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[10,3],[15,1],[17,3],[17,1],[19,1],[19,1],[22,2],[22,1],[23,1],[23,1],[23,1],[23,1],[23,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[42,2],[42,1],[43,2],[43,1],[44,1],[44,2],[8,1],[8,1],[8,1],[8,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:return "";
break;
case 3:this.$ = [$$[$0-1]].concat($$[$0]); 
break;
case 4: this.$ = [$$[$0]]; 
break;
case 5:this.$ = $$[$0]; 
break;
case 6: this.$ = $$[$0]; 
break;
case 7: this.$ = {type: " "}; 
break;
case 8: this.$ = {type: "chord", note: $$[$0]}; 
break;
case 9: this.$ = {type: "timebar", time: $$[$0].substring(1)}; 
break;
case 10: this.$ = {type: "-"}; 
break;
case 11: this.$ = $$[$0-1]; 
break;
case 12: this.$ = parseInt($$[$0]); 
break;
case 13: this.$ = $$[$0-2]/2; 
break;
case 14: this.$ = $$[$0]; 
break;
case 15: this.$ = 1; 
break;
case 16: this.$ = -1; 
break;
case 17: this.$ = $$[$0-1] + $$[$0]; 
break;
case 18: this.$ = $$[$0]; 
break;
case 19: this.$ = 1; 
break;
case 20: this.$ = 2; 
break;
case 21: this.$ = -1; 
break;
case 22: this.$ = -2; 
break;
case 23: this.$ = 3; 
break;
case 24: this.$ = { pitch: $$[$0], actualPitch: 57, octave: 4}; 
break;
case 25: this.$ = { pitch: $$[$0], actualPitch: 59, octave: 4}; 
break;
case 26: this.$ = { pitch: $$[$0], actualPitch: 60, octave: 4}; 
break;
case 27: this.$ = { pitch: $$[$0], actualPitch: 62, octave: 4}; 
break;
case 28: this.$ = { pitch: $$[$0], actualPitch: 64, octave: 4}; 
break;
case 29: this.$ = { pitch: $$[$0], actualPitch: 65, octave: 4}; 
break;
case 30: this.$ = { pitch: $$[$0], actualPitch: 67, octave: 4}; 
break;
case 31: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 69, octave: 5}; 
break;
case 32: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 71, octave: 5}; 
break;
case 33: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 72, octave: 5}; 
break;
case 34: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 74, octave: 5}; 
break;
case 35: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 77, octave: 5}; 
break;
case 36: this.$ = { pitch: $$[$0].toUpperCase(), actualPitch: 79, octave: 5}; 
break;
case 37: $$[$0-1]["octave"] += $$[$0]; this.$ = $$[$0-1]; 
break;
case 38: this.$ = $$[$0]; 
break;
case 39: this.$ = { note: $$[$0-1], duration: $$[$0]}; 
break;
case 40: this.$ = { note: $$[$0], duration: 1}; 
break;
case 41: $$[$0]["type"] = "note", this.$ = $$[$0]; 
break;
case 42: $$[$0]["accidental"] = $$[$0-1]; $$[$0]["type"] = "note"; this.$ = $$[$0]; 
break;
case 43: this.$ = { type: "barline", symbol: $$[$0] }; 
break;
case 44: this.$ = { type: "barline", symbol: $$[$0] }; 
break;
case 45: this.$ = { type: "barline", symbol: $$[$0] }; 
break;
case 46: this.$ = { type: "barline", symbol: $$[$0] }; 
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:5,8:6,9:[1,7],10:8,11:[1,9],12:[1,10],13:[1,28],29:[1,11],30:[1,12],31:[1,13],32:[1,14],33:[1,15],34:[1,16],35:[1,17],36:[1,18],37:[1,19],38:[1,20],39:[1,21],40:[1,22],41:[1,23],45:[1,24],46:[1,25],47:[1,26],48:[1,27]},{1:[3]},{5:[1,29]},{1:[2,2]},{4:30,5:[2,4],6:4,7:5,8:6,9:[1,7],10:8,11:[1,9],12:[1,10],13:[1,28],29:[1,11],30:[1,12],31:[1,13],32:[1,14],33:[1,15],34:[1,16],35:[1,17],36:[1,18],37:[1,19],38:[1,20],39:[1,21],40:[1,22],41:[1,23],45:[1,24],46:[1,25],47:[1,26],48:[1,27]},{5:[2,5],9:[2,5],11:[2,5],12:[2,5],13:[2,5],29:[2,5],30:[2,5],31:[2,5],32:[2,5],33:[2,5],34:[2,5],35:[2,5],36:[2,5],37:[2,5],38:[2,5],39:[2,5],40:[2,5],41:[2,5],45:[2,5],46:[2,5],47:[2,5],48:[2,5]},{5:[2,6],9:[2,6],11:[2,6],12:[2,6],13:[2,6],29:[2,6],30:[2,6],31:[2,6],32:[2,6],33:[2,6],34:[2,6],35:[2,6],36:[2,6],37:[2,6],38:[2,6],39:[2,6],40:[2,6],41:[2,6],45:[2,6],46:[2,6],47:[2,6],48:[2,6]},{5:[2,7],9:[2,7],11:[2,7],12:[2,7],13:[2,7],29:[2,7],30:[2,7],31:[2,7],32:[2,7],33:[2,7],34:[2,7],35:[2,7],36:[2,7],37:[2,7],38:[2,7],39:[2,7],40:[2,7],41:[2,7],45:[2,7],46:[2,7],47:[2,7],48:[2,7]},{5:[2,8],9:[2,8],11:[2,8],12:[2,8],13:[2,8],29:[2,8],30:[2,8],31:[2,8],32:[2,8],33:[2,8],34:[2,8],35:[2,8],36:[2,8],37:[2,8],38:[2,8],39:[2,8],40:[2,8],41:[2,8],45:[2,8],46:[2,8],47:[2,8],48:[2,8]},{5:[2,9],9:[2,9],11:[2,9],12:[2,9],13:[2,9],29:[2,9],30:[2,9],31:[2,9],32:[2,9],33:[2,9],34:[2,9],35:[2,9],36:[2,9],37:[2,9],38:[2,9],39:[2,9],40:[2,9],41:[2,9],45:[2,9],46:[2,9],47:[2,9],48:[2,9]},{5:[2,10],9:[2,10],11:[2,10],12:[2,10],13:[2,10],29:[2,10],30:[2,10],31:[2,10],32:[2,10],33:[2,10],34:[2,10],35:[2,10],36:[2,10],37:[2,10],38:[2,10],39:[2,10],40:[2,10],41:[2,10],45:[2,10],46:[2,10],47:[2,10],48:[2,10]},{5:[2,24],9:[2,24],11:[2,24],12:[2,24],13:[2,24],29:[2,24],30:[2,24],31:[2,24],32:[2,24],33:[2,24],34:[2,24],35:[2,24],36:[2,24],37:[2,24],38:[2,24],39:[2,24],40:[2,24],41:[2,24],45:[2,24],46:[2,24],47:[2,24],48:[2,24]},{5:[2,25],9:[2,25],11:[2,25],12:[2,25],13:[2,25],29:[2,25],30:[2,25],31:[2,25],32:[2,25],33:[2,25],34:[2,25],35:[2,25],36:[2,25],37:[2,25],38:[2,25],39:[2,25],40:[2,25],41:[2,25],45:[2,25],46:[2,25],47:[2,25],48:[2,25]},{5:[2,26],9:[2,26],11:[2,26],12:[2,26],13:[2,26],29:[2,26],30:[2,26],31:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],37:[2,26],38:[2,26],39:[2,26],40:[2,26],41:[2,26],45:[2,26],46:[2,26],47:[2,26],48:[2,26]},{5:[2,27],9:[2,27],11:[2,27],12:[2,27],13:[2,27],29:[2,27],30:[2,27],31:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],37:[2,27],38:[2,27],39:[2,27],40:[2,27],41:[2,27],45:[2,27],46:[2,27],47:[2,27],48:[2,27]},{5:[2,28],9:[2,28],11:[2,28],12:[2,28],13:[2,28],29:[2,28],30:[2,28],31:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],37:[2,28],38:[2,28],39:[2,28],40:[2,28],41:[2,28],45:[2,28],46:[2,28],47:[2,28],48:[2,28]},{5:[2,29],9:[2,29],11:[2,29],12:[2,29],13:[2,29],29:[2,29],30:[2,29],31:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],37:[2,29],38:[2,29],39:[2,29],40:[2,29],41:[2,29],45:[2,29],46:[2,29],47:[2,29],48:[2,29]},{5:[2,30],9:[2,30],11:[2,30],12:[2,30],13:[2,30],29:[2,30],30:[2,30],31:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],37:[2,30],38:[2,30],39:[2,30],40:[2,30],41:[2,30],45:[2,30],46:[2,30],47:[2,30],48:[2,30]},{5:[2,31],9:[2,31],11:[2,31],12:[2,31],13:[2,31],29:[2,31],30:[2,31],31:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],37:[2,31],38:[2,31],39:[2,31],40:[2,31],41:[2,31],45:[2,31],46:[2,31],47:[2,31],48:[2,31]},{5:[2,32],9:[2,32],11:[2,32],12:[2,32],13:[2,32],29:[2,32],30:[2,32],31:[2,32],32:[2,32],33:[2,32],34:[2,32],35:[2,32],36:[2,32],37:[2,32],38:[2,32],39:[2,32],40:[2,32],41:[2,32],45:[2,32],46:[2,32],47:[2,32],48:[2,32]},{5:[2,33],9:[2,33],11:[2,33],12:[2,33],13:[2,33],29:[2,33],30:[2,33],31:[2,33],32:[2,33],33:[2,33],34:[2,33],35:[2,33],36:[2,33],37:[2,33],38:[2,33],39:[2,33],40:[2,33],41:[2,33],45:[2,33],46:[2,33],47:[2,33],48:[2,33]},{5:[2,34],9:[2,34],11:[2,34],12:[2,34],13:[2,34],29:[2,34],30:[2,34],31:[2,34],32:[2,34],33:[2,34],34:[2,34],35:[2,34],36:[2,34],37:[2,34],38:[2,34],39:[2,34],40:[2,34],41:[2,34],45:[2,34],46:[2,34],47:[2,34],48:[2,34]},{5:[2,35],9:[2,35],11:[2,35],12:[2,35],13:[2,35],29:[2,35],30:[2,35],31:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],36:[2,35],37:[2,35],38:[2,35],39:[2,35],40:[2,35],41:[2,35],45:[2,35],46:[2,35],47:[2,35],48:[2,35]},{5:[2,36],9:[2,36],11:[2,36],12:[2,36],13:[2,36],29:[2,36],30:[2,36],31:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],36:[2,36],37:[2,36],38:[2,36],39:[2,36],40:[2,36],41:[2,36],45:[2,36],46:[2,36],47:[2,36],48:[2,36]},{5:[2,43],9:[2,43],11:[2,43],12:[2,43],13:[2,43],29:[2,43],30:[2,43],31:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],37:[2,43],38:[2,43],39:[2,43],40:[2,43],41:[2,43],45:[2,43],46:[2,43],47:[2,43],48:[2,43]},{5:[2,44],9:[2,44],11:[2,44],12:[2,44],13:[2,44],29:[2,44],30:[2,44],31:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],37:[2,44],38:[2,44],39:[2,44],40:[2,44],41:[2,44],45:[2,44],46:[2,44],47:[2,44],48:[2,44]},{5:[2,45],9:[2,45],11:[2,45],12:[2,45],13:[2,45],29:[2,45],30:[2,45],31:[2,45],32:[2,45],33:[2,45],34:[2,45],35:[2,45],36:[2,45],37:[2,45],38:[2,45],39:[2,45],40:[2,45],41:[2,45],45:[2,45],46:[2,45],47:[2,45],48:[2,45]},{5:[2,46],9:[2,46],11:[2,46],12:[2,46],13:[2,46],29:[2,46],30:[2,46],31:[2,46],32:[2,46],33:[2,46],34:[2,46],35:[2,46],36:[2,46],37:[2,46],38:[2,46],39:[2,46],40:[2,46],41:[2,46],45:[2,46],46:[2,46],47:[2,46],48:[2,46]},{14:[1,31]},{1:[2,1]},{5:[2,3]},{13:[1,32]},{5:[2,11],9:[2,11],11:[2,11],12:[2,11],13:[2,11],29:[2,11],30:[2,11],31:[2,11],32:[2,11],33:[2,11],34:[2,11],35:[2,11],36:[2,11],37:[2,11],38:[2,11],39:[2,11],40:[2,11],41:[2,11],45:[2,11],46:[2,11],47:[2,11],48:[2,11]}],
defaultActions: {3:[2,2],29:[2,1],30:[2,3]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  
  function cat() {
    return "Cat";
  }  


/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 9
break;
case 1:return 16
break;
case 2:return 5
break;
case 3:return 11
break;
case 4:return 'REST'
break;
case 5:return 'REST_BAR'
break;
case 6:return 'REST_INVISIBLE'
break;
case 7:return 'REST_INVISIBLE_BAR'
break;
case 8:return 'SPACER'
break;
case 9:return 12
break;
case 10:return 'CHORD_START'
break;
case 11:return 'CHORD_END'
break;
case 12:return 25
break;
case 13:return 24
break;
case 14:return 27
break;
case 15:return 26
break;
case 16:return 28
break;
case 17:return 21
break;
case 18:return 20
break;
case 19:return 18
break;
case 20:return 'SLUR_START'
break;
case 21:return 'SLUR_END'
break;
case 22:return 13
break;
case 23:return "CHORD_START"
break;
case 24:return "CHORD_END"
break;
case 25:return 45
break;
case 26:return 46
break;
case 27:return 47
break;
case 28:return 'BARLINE_REOPEN_REPEAT'
break;
case 29:return 48
break;
case 30:return 'RYTHMN_BREAK_RIGHT'
break;
case 31:return 'RYTHMN_BREAK_LEFT'
break;
case 32:/* ignore backticks */
break;
case 33:return 29
break;
case 34:return 30
break;
case 35:return 31
break;
case 36:return 32
break;
case 37:return 33
break;
case 38:return 34
break;
case 39:return 35
break;
case 40:return 36
break;
case 41:return 37
break;
case 42:return 38
break;
case 43:return 39
break;
case 44:return 40
break;
case 45:return 41
break;
}
},
rules: [/^(?:\s+)/,/^(?:[0-9]+)/,/^(?:$)/,/^(?:\[[0-9]+)/,/^(?:z\b)/,/^(?:Z\b)/,/^(?:x\b)/,/^(?:X\b)/,/^(?:y\b)/,/^(?:-)/,/^(?:\[)/,/^(?:\])/,/^(?:\^\^)/,/^(?:\^)/,/^(?:__\b)/,/^(?:_\b)/,/^(?:=)/,/^(?:,)/,/^(?:')/,/^(?:\/)/,/^(?:\()/,/^(?:\))/,/^(?:")/,/^(?:\[)/,/^(?:\])/,/^(?:\|\|)/,/^(?:\|:)/,/^(?::\|)/,/^(?:::)/,/^(?:\|)/,/^(?:>)/,/^(?:>)/,/^(?:`)/,/^(?:A\b)/,/^(?:B\b)/,/^(?:C\b)/,/^(?:D\b)/,/^(?:E\b)/,/^(?:F\b)/,/^(?:G\b)/,/^(?:a\b)/,/^(?:b\b)/,/^(?:c\b)/,/^(?:d\b)/,/^(?:f\b)/,/^(?:g\b)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
return parser;
});