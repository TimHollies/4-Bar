'use strict';

var midiGen = require('./midi');

var dispatcher = require('../dispatcher');

var context = new AudioContext();
var source = 0;
var audioBufferSize = 8192;
var waveBuffer;
var midiFileBuffer;
var read_wave_bytes = 0;
var song = 0;
var midijs_url = "";

var num_missing = 0;
var midiFileArray;
var stream;
var rval;

function get_next_wave(ev) {
    // collect new wave data from libtimidity into waveBuffer
    read_wave_bytes = Module.ccall('mid_song_read_wave', 'number', ['number', 'number', 'number', 'number'], [song, waveBuffer, audioBufferSize * 2, false]);
    if (0 == read_wave_bytes) {
        dispatcher.send("end_of_tune");
        stop();
        return;
    }

    var max_i16 = Math.pow(2, 15);
    for (var i = 0; i < audioBufferSize; i++) {
        if (i < read_wave_bytes) {
            // convert PCM data from C sint16 to JavaScript number (range -1.0 .. +1.0)
            ev.outputBuffer.getChannelData(0)[i] = Module.getValue(waveBuffer + 2 * i, 'i16') / max_i16;
        } else {

            ev.outputBuffer.getChannelData(0)[i] = 0; // fill end of buffer with zeroes, may happen at the end of a piece
        }
    }
}

function loadMissingPatch(url, path, filename) {

    var request = new XMLHttpRequest();
    request.open('GET', path + filename, true);
    request.responseType = 'arraybuffer';

    request.onerror = function() {
        // MIDIjs.message_callback("Error: Cannot retrieve patch file " + path + filename);
    }

    request.onload = function() {
        if (200 != request.status) {
            //MIDIjs.message_callback("Error: Cannot retrieve patch filee " + path + filename + " : " + request.status);
            return;
        }

        num_missing--;
        FS.createDataFile('pat/', filename, new Int8Array(request.response), true, true);
        //MIDIjs.message_callback("Loading instruments: " + num_missing);
        if (num_missing == 0) {
            stream = Module.ccall('mid_istream_open_mem', 'number', ['number', 'number', 'number'], [midiFileBuffer, midiFileArray.length, false]);
            var MID_AUDIO_S16LSB = 0x8010; // signed 16-bit samples
            var options = Module.ccall('mid_create_options', 'number', ['number', 'number', 'number', 'number'], [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
            song = Module.ccall('mid_song_load', 'number', ['number', 'number'], [stream, options]);
            rval = Module.ccall('mid_istream_close', 'number', ['number'], [stream]);
            Module.ccall('mid_song_start', 'void', ['number'], [song]);

            // create script Processor with buffer of size audioBufferSize and a single output channel
            source = context.createScriptProcessor(audioBufferSize, 0, 1);
            waveBuffer = Module._malloc(audioBufferSize * 2);
            source.onaudioprocess = get_next_wave; // add eventhandler for next buffer full of audio data
            source.connect(context.destination); // connect the source to the context's destination (the speakers)
        }
    }
    request.send();
}

var play = function (base64) {

    midiFileArray = base64;
    midiFileBuffer = Module._malloc(midiFileArray.length);
    Module.writeArrayToMemory(midiFileArray, midiFileBuffer);

    rval = Module.ccall('mid_init', 'number', [], []);
    stream = Module.ccall('mid_istream_open_mem', 'number', ['number', 'number', 'number'], [midiFileBuffer, midiFileArray.length, false]);
    var MID_AUDIO_S16LSB = 0x8010; // signed 16-bit samples
    var options = Module.ccall('mid_create_options', 'number', ['number', 'number', 'number', 'number'], [context.sampleRate, MID_AUDIO_S16LSB, 1, audioBufferSize * 2]);
    song = Module.ccall('mid_song_load', 'number', ['number', 'number'], [stream, options]);
    rval = Module.ccall('mid_istream_close', 'number', ['number'], [stream]);

    num_missing = Module.ccall('mid_song_get_num_missing_instruments', 'number', ['number'], [song]);
    if (0 < num_missing) {
        for (var i = 0; i < num_missing; i++) {
            var missingPatch = Module.ccall('mid_song_get_missing_instrument', 'string', ['number', 'number'], [song, i]);
            loadMissingPatch("", "/pat/", missingPatch);
        }
    } else {
        Module.ccall('mid_song_start', 'void', ['number'], [song]);
        // create script Processor with auto buffer size and a single output channel
        source = context.createScriptProcessor(audioBufferSize, 0, 1);
        waveBuffer = Module._malloc(audioBufferSize * 2);
        source.onaudioprocess = get_next_wave; // add eventhandler for next buffer full of audio data
        source.connect(context.destination); // connect the source to the context's destination (the speakers)
    }

}

var stop = function () {
    if (source) {
        // terminate playback
        source.disconnect();

        // hack: without this, Firfox 25 keeps firing the onaudioprocess callback
        source.onaudioprocess = 0;

        source = 0;

        // free libtimitdiy ressources
        Module._free(waveBuffer);
        Module._free(midiFileBuffer);
        Module.ccall('mid_song_free', 'void', ['number'], [song]);
        song = 0;
        Module.ccall('mid_exit', 'void', [], []);
        source = 0;
    }
}

var playTune = function (tuneData) {
    var noteEvents = [];
    tuneData.forEach(function(note) {
        noteEvents.push(midiGen.MidiEvent.noteOn( { pitch: note[0], duration: 16 }));
        noteEvents.push(midiGen.MidiEvent.noteOff( { pitch: note[0], duration: note[1] }));
    });

    // Create a track that contains the events to play the notes above
    var track = new midiGen.MidiTrack({ events: noteEvents });

    var song  = midiGen.MidiWriter({ tracks: [track] });

    var convertDataURIToBinary = function (raw) {
      var rawLength = raw.length;
      var array = new Uint8Array(new ArrayBuffer(rawLength));
     
      for(var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
      }
      return array;
    }

    // Creates an object that contains the final MIDI track in base64 and some
    // useful methods.
    var song = convertDataURIToBinary(song);

    play(song);
};


module.exports = {
    play: playTune,
    stop: stop
}