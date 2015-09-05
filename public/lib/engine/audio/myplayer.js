import Base64 from 'base64-arraybuffer';
import _ from 'lodash';
import ClockMaker from 'clockmaker';
import siz from 'sizzle';

let Timer = ClockMaker.Timer;

var note = {};
var loadedNoteData = false;

var notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

var context = new AudioContext();

export function TunePlayer(dispatcher) {

  if (!loadedNoteData) {
    fetch('pat/acoustic_grand_piano-mp3.json')
    .then(function(response) {
          return response.json();
        }).then(function(res) {

          _.forOwn(res, function(val, key) {
            var base64 = val.split(',')[1];
            var buffer = Base64.decode(base64);
            context.decodeAudioData(buffer, function(decodedData) {
              note[key] = decodedData;
            });
          });

          dispatcher.set('playbackReady', true);
          loadedNoteData = true;

        });
  } else {
    dispatcher.set('playbackReady', true);
  }

  var sources = [];

  var timer = null;
  var lastHighlightedNote = null;

  var playTune = function(tuneData, tempo) {

    tempo = tempo || 120;

    function playSound(buffer, time, length) {
      var source = context.createBufferSource();
      var gainNode = context.createGain();
      gainNode.gain.linearRampToValueAtTime(0.5, time + length);
      gainNode.gain.linearRampToValueAtTime(0, time + length + 0.5);
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

    var offset = 0;

    // Play 2 bars of the following:
    for (var bar = 0; bar < tuneData.length; bar++) {

      var octave = Math.floor((tuneData[bar][0] - 24) / 12);
      var noteId = tuneData[bar][0] - 24 - (octave * 12);

      playSound(note[notes[noteId] + (octave + 1)], startTime + offset,
          tuneData[bar][1] / tempo);

      offset += tuneData[bar][1] / tempo;

    }

    var currentPosition = 0;
    var firstNote = siz('.tune-body .noteHead')[0];
    firstNote.classList.add('selected-note');
    lastHighlightedNote = firstNote;
    timer = new Timer(function(timer) {

      if (lastHighlightedNote !== null)
        lastHighlightedNote.classList.remove('selected-note');

      var thisNote =
          document.getElementById('note_' + tuneData[currentPosition][2]);

      thisNote.classList.add('selected-note');
      lastHighlightedNote = thisNote;

      if (currentPosition >= tuneData.length - 1) {
        timer.stop();
        dispatcher.fire('play-tune-end');
        window.setTimeout(function() {
          if (lastHighlightedNote !== null)
            lastHighlightedNote.classList.remove('selected-note');

        }, tuneData[currentPosition][1] * 1000 / tempo);
      }

      timer.setDelay(tuneData[currentPosition][1] * 1000 / tempo);
      currentPosition++;

    }, tuneData[0], {
      repeat: true
    }).start();
  };

  var stopTune = function() {
    timer.stop();
    if (lastHighlightedNote !== null)
      lastHighlightedNote.classList.remove('selected-note');

    sources.forEach(function(source) {
      source.stop();
    });
  };

  return {
    playTune,
    stopTune
  };
};