define([
    'engine/jsmidi',
    'engine/dsp'
], function() {
    'use strict';
    
    var audio = new Audio();
    var wave = new RIFFWAVE();
    wave.header.sampleRate = 44100;
    var data = [];
    
    var osc = new Oscillator(DSP.SQUARE, 440, 127, wave.header.sampleRate * 0.5, 22050);
    osc.generate();
    data = data.concat(Array.prototype.slice.call(osc.signal).map(function(a) { return a + 128; }));
    
    var osc = new Oscillator(DSP.SQUARE, 220, 127, wave.header.sampleRate  * 0.25, 22050);
    osc.generate();
    data = data.concat(Array.prototype.slice.call(osc.signal).map(function(a) { return a + 128; }));
    
    console.log(data);
    wave.Make(data);
    audio.src = wave.dataURI;
    audio.play();
    
    
});