var Base64 = require('base64-arraybuffer');
var _ = require('lodash');
var Timer = require('clockmaker').Timer;

var note = {};

var notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

var context = new AudioContext();

fetch("/pat/acoustic_grand_piano-mp3.json")
.then(function(response) {
  return response.json()
}).then(function(res) {

  _.forOwn(res, function(val, key){
    var base64 = val.split(",")[1];
    var buffer = Base64.decode(base64);    
    context.decodeAudioData(buffer, function(decodedData) {
     note[key] = decodedData;
   });
  });  
});

var RhythmSample = {
};

RhythmSample.play = function(tuneData) {

  var sources = [];

  function playSound(buffer, time, length) {
    var source = context.createBufferSource();
    var gainNode = context.createGain();
    gainNode.gain.linearRampToValueAtTime(0.5, time+length);
    gainNode.gain.linearRampToValueAtTime(0, time+length+0.5);
    source.buffer = buffer;
    // Connect the source to the gain node.
    source.connect(gainNode);
    // Connect the gain node to the destination.
    gainNode.connect(context.destination);
    if (!source.start)
      source.start = source.noteOn;
    source.start(time);

    sources.push(source);
  }

  var kick = note.A4;
  var snare = note.A5;
  var hihat = note.C4;

  // We'll start playing the rhythm 100 milliseconds from "now"
  var startTime = context.currentTime + 0.100;
  var tempo = 80; // BPM (beats per minute)
  var eighthNoteTime = (60 / tempo) / 2;

  var offset = 0;

  // Play 2 bars of the following:
  for (var bar = 0; bar < tuneData.length; bar++) {

    var octave = Math.floor((tuneData[bar][0]-24)/12);
    var noteId = tuneData[bar][0] - 24 - (octave * 12);

    playSound(note[notes[noteId] + (octave+1)], startTime + offset, tuneData[bar][1] /120);
    offset += tuneData[bar][1] /120;
    /*var time = startTime + bar * 8 * eighthNoteTime;
    console.log("TIME", time)
    // Play the bass (kick) drum on beats 1, 5
    playSound(kick, time);
    playSound(kick, time + 4 * eighthNoteTime);

    // Play the snare drum on beats 3, 7
    playSound(snare, time + 2 * eighthNoteTime);
    playSound(snare, time + 6 * eighthNoteTime);

    // Play the hi-hat every eighthh note.
    for (var i = 0; i < 8; ++i) {
      playSound(hihat, time + i * eighthNoteTime);
    }*/
  }

  var currentPosition = 0;
  var firstNote = document.getElementById("note_0");
  firstNote.classList.add("selected-note");
  var lastHighlightedNote = firstNote;
  var timer = new Timer(function(timer) {
    currentPosition++;
    //console.log("woo note", tuneData[currentPosition][2]);
    
    if(lastHighlightedNote !== null)lastHighlightedNote.classList.remove("selected-note");
    var thisNote = document.getElementById("note_" + tuneData[currentPosition][2]);
    thisNote.classList.add("selected-note");
    lastHighlightedNote = thisNote;

    if(currentPosition >= tuneData.length) {
      timer.stop();
      return;
    }
    timer.setDelay(tuneData[currentPosition][1] * 1000 / 120);
  }, tuneData[0], {
    repeat: true
  }).start();

  return function() {
    timer.stop();
    if(lastHighlightedNote !== null)lastHighlightedNote.classList.remove("selected-note");
    sources.forEach(function(source) {
      source.stop();
    });
  }
};

var playTune = function(tuneData) {



  console.log(tuneData);
  
  var currentPosition = 0;
/*
  console.log(buffer);


  var offset = 0;
  for(var i = 0; i<1; i++) {

    var source = context.createBufferSource(); // creates a sound source
    //var gainNode = context.createGain();
    source.connect(context.destination);
      //gainNode.gain.linearRampToValueAtTime(0, 0.2);
    source.buffer = note;                    // tell the source which sound to play
    //gainNode.connect();       // connect the source to the context's destination (the speakers)
    source.start(offset);
    offset += tuneData[i][1] * 10;
  }
                          // play the source now
                          */
                          return RhythmSample.play(tuneData);

                        }

                        module.exports = playTune;