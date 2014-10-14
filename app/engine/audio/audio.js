define([
    'midijs'
], function() {
    'use strict';

	MIDI.loadPlugin({
		soundfontUrl: "./soundfonts/",
		instrument: "acoustic_grand_piano",
		callback: function() {
			var delay = 0; // play one note every quarter second
			var note =90; // the MIDI note
			var velocity = 50; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
		}
	});
    
});