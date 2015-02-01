 
var data_tables = require('./data_tables.js');

//transforms a tune into an array that can be played by the audio system
var audioRender = (tune) => {
	var outTune = [];

	var 
		keyModifier = data_tables.getKeyModifiers(tune.tuneSettings.key);

	tune.scoreLines.forEach((line) => {

		line.symbols
		.filter((symbol) => symbol.type === "note")
		.forEach((note) => {
			var pitch = note.pitch + ((note.octave - 4) * 12);
			if(_.indexOf(keyModifier.notes, note.note) !== -1) pitch += keyModifier.mod;
			outTune.push([pitch, note.noteLength * 16])
		});
	});

	return outTune;
}

module.exports = audioRender;