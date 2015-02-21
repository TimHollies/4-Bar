 
var data_tables = require('./data_tables.js');

//transforms a tune into an array that can be played by the audio system
var audioRender = (tune) => {
	var outTune = [];

	var 
		keyModifier = data_tables.getKeyModifiers(tune.tuneSettings.key);

	var allSymbols = tune.parsedLines.filter(function(line) { 
		return line.type === "drawable";
	}).reduce(function(alreadyParsed, line) {
		return alreadyParsed.concat(line.symbols);
	}, []);

	var 
		i = 0,
		repeating = false,
		repeatLocation = -1,
		totalLength = 0;

	while(i < allSymbols.length) {

		var syb = allSymbols[i];

		if(syb.type === "note") {
			var pitch = syb.pitch + ((syb.octave - 4) * 12);
			switch(syb.accidental)
			{
				case "^": {
					pitch += 1;
					break;
				}
				case "^^": {
					pitch += 2;
					break;
				}
				case "_": {
					pitch -= 1;
					break;
				}
				case "__": {
					pitch -= 2;
					break;
				}
			}
			if(syb.accidental !== "=" && _.indexOf(keyModifier.notes, syb.note.toUpperCase()) !== -1) pitch += keyModifier.mod;
			outTune.push([pitch, syb.noteLength * 16, syb.renderNoteId])
			totalLength += syb.noteLength * 16;
		}

		if(syb.type === "barline") {
			if(syb.subType === "repeat_start") {
				repeating = true;
				repeatLocation = i;
			}
			if(syb.subType === "repeat_end") {
				if(repeating) {
					repeating = false;
					i = repeatLocation;
					repeatLocation = -1;
				} else {
					repeating = true;
					repeatLocation = i;
				}
			}
		}

		i++;
	}

	return outTune;
}

module.exports = audioRender;