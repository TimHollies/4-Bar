define([], function() {

    var service = {};

    service.metadataKeys = "XTCOAMLQPZNGHKRBDFSImrsUVW";
    service.notes = "ABCDEFGabcdefg";
    service.accidentals = "#^";
    service.numbers = "0123456789";

    service.ornaments = [
        "trill",
        "lowermordent",
        "uppermordent",
        "mordent",
        "pralltriller",
        "accent",
        ">",
        "emphasis",
        "fermata",
        "invertedfermata",
        "tenuto",
        "trem1/2/3/4"

    ];

    service.int_to_note = function(note_int) {
        if (!_.range(0, 12).hasObject(note_int)) {
            throw "RangeError: int out of bounds (0-11):" + note_int;
        }
        n = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return n[note_int];
    }

    return service;

});