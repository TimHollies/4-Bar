/* description: Parses end evaluates mathematical expressions. */
%{
  
  function cat() {
    return "Cat";
  }  

%}

/* lexical grammar */ 
%lex
%%
\s+                     return 'SPACE'
[0-9]+                  return 'INTEGER'
<<EOF>>                 return 'EOF'
\[[0-9]+                return 'TIME_BAR'
|[0-9]+                return 'TIME_BAR'

![^!]+!                 return 'DECORATION'

"z"                     return 'REST'
"Z"                     return 'REST_BAR'

"x"                     return 'REST_INVISIBLE'
"X"                     return 'REST_INVISIBLE_BAR'

"y"                     return 'SPACER'
"-"                     return 'TIE'
"["                     return 'CHORD_START'
"]"                     return 'CHORD_END'
"^^"                    return 'DOUBLE_SHARP'
"^"                     return 'SHARP'
"__"                    return 'DOUBLE_FLAT'
"_"                     return 'FLAT'
"="                     return 'NATURAL'
","                     return 'OCTAVE_LOWER'
"'"                     return 'OCTAVE_HIGHER'
"/"                     return '/'

"("[0-9]+               return 'SLUR_TUPLET'

"("                     return 'SLUR_START'
")"                     return 'SLUR_END'

"\""                    return '"'
"["                     return "CHORD_START"
"]"                     return "CHORD_END"

"||"                    return 'DOUBLE_BARLINE'
"|:"                    return 'BARLINE_OPEN_REPEAT'
"[|"                    return 'BARLINE_BOLD_START'
"|]"                    return 'BARLINE_BOLD_CLOSE'
":|"                    return 'BARLINE_CLOSE_REPEAT'
"::"                    return 'BARLINE_REOPEN_REPEAT'
"|"                     return 'BARLINE'

">"                     return 'RHYTHM_BREAK_RIGHT'
"<"                     return 'RHYTHM_BREAK_LEFT'
"`"                     /* ignore backticks */

"A"                     return 'A'
"B"                     return 'B'
"C"                     return 'C'
"D"                     return 'D'
"E"                     return 'E'
"F"                     return 'F'
"G"                     return 'G'
"a"                     return 'a'
"b"                     return 'b'
"c"                     return 'c'
"d"                     return 'd'
"f"                     return 'f'
"g"                     return 'g'

/lex

%start expressions

%% /* language grammar */

expressions    
    : e EOF
        {return $1;}
    | EOF
        {return "";}
    ;

e
    : scope_symbol e
        {$$ = [$1].concat($2); }
    | scope_symbol
        { $$ = [$1]; }
    ;

scope_symbol
    : note_letter
        {$$ = $1; }
    | barline
        { $$ = $1; }
    | SPACE
        { $$ = {type: " "}; }
    | chord
        { $$ = {type: "chord", note: $1}; }
    | TIME_BAR
        { $$ = {type: "timebar", time: $1.substring(1)}; }
    | TIE
        { $$ = {type: "-"}; }
    ;

/* CORE */

chord
    : '"' NOTE_LOWER '"'
        { $$ = $2; }
    ;

integer
    : INTEGER 
        { $$ = parseInt($1); }
    ;

/* NOTES */
duration
    : integer'/'integer
        { $$ = $1/2; }
    | integer
        { $$ = $1; }
    ;

octave_modifier_part
    : OCTAVE_HIGHER
        { $$ = 1; }
    | OCTAVE_LOWER
        { $$ = -1; }
    ;

octave_modifer 
    : octave_modifier_part octave_modifer
        { $$ = $1 + $2; }
    | octave_modifier_part
        { $$ = $1; }
    ;

note_accidental
    : SHARP
        { $$ = 1; }
    | DOUBLE_SHARP
        { $$ = 2; }
    | FLAT
        { $$ = -1; }
    | DOUBLE_FLAT
        { $$ = -2; }
    | NATURAL
        { $$ = 3; }
    ;

note_letter
    : 'A' { $$ = { pitch: $1, actualPitch: 57, octave: 4}; }
    | 'B' { $$ = { pitch: $1, actualPitch: 59, octave: 4}; }
    | 'C' { $$ = { pitch: $1, actualPitch: 60, octave: 4}; }
    | 'D' { $$ = { pitch: $1, actualPitch: 62, octave: 4}; }
    | 'E' { $$ = { pitch: $1, actualPitch: 64, octave: 4}; }
    | 'F' { $$ = { pitch: $1, actualPitch: 65, octave: 4}; }
    | 'G' { $$ = { pitch: $1, actualPitch: 67, octave: 4}; }
    | 'a' { $$ = { pitch: $1.toUpperCase(), actualPitch: 69, octave: 5}; }
    | 'b' { $$ = { pitch: $1.toUpperCase(), actualPitch: 71, octave: 5}; }
    | 'c' { $$ = { pitch: $1.toUpperCase(), actualPitch: 72, octave: 5}; }
    | 'd' { $$ = { pitch: $1.toUpperCase(), actualPitch: 74, octave: 5}; }
    | 'f' { $$ = { pitch: $1.toUpperCase(), actualPitch: 77, octave: 5}; }
    | 'g' { $$ = { pitch: $1.toUpperCase(), actualPitch: 79, octave: 5}; }
    ;        

note_with_octave
    : note_letter octave_modifer
        { $1["octave"] += $2; $$ = $1; }
    | note_letter
        { $$ = $1; }
    ;

note_with_duration
    : note_with_octave duration
        { $$ = { note: $1, duration: $2}; }
    | note_with_octave
        { $$ = { note: $1, duration: 1}; }
    ;

note   
    : note_with_duration
        { $1["type"] = "note", $$ = $1; }
    | note_accidental note_with_duration
        { $2["accidental"] = $1; $2["type"] = "note"; $$ = $2; }
    ;

/* SYMBOLS */

barline
    : DOUBLE_BARLINE
        { $$ = { type: "barline", symbol: $1 }; }
    | BARLINE_OPEN_REPEAT
        { $$ = { type: "barline", symbol: $1 }; }
    | BARLINE_CLOSE_REPEAT
        { $$ = { type: "barline", symbol: $1 }; }
    | BARLINE
        { $$ = { type: "barline", symbol: $1 }; }
    ;