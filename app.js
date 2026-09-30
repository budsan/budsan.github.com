(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Examples
  // ---------------------------------------------------------------------------

  const TETRIS_CODE = `// Tetris theme (Korobeiniki) - 8-bit signed samples
//
// t    : sample count (0, 1, 2, ...)
// rate : samples per second
// Math functions/constants are available directly (sin, floor, ...), TAU = 2 * PI
// 8-bit signed: return -128 .. 127 (values outside the range wrap around)

// Notes are semitones away from A4 (440 Hz): 0 = A, 3 = C, -1 = G#, ...
const __   = -108;                          // rest
const STEP = round(rate * 2500 / 44100);    // samples per step: same tempo at any rate

const melody = [
   4,  4,  4,  4,  4,  4,  4,  4,
  -1, -1, -1, -1,  0,  0,  0,  0,
   2,  2,  2,  2,  2,  2,  2,  2,
   0,  0,  0,  0, -1, -1, -1, -1,

  -3, -3, -3, -3, -3, -3, -3, __,
  -3, -3, -3, -3,  0,  0,  0,  0,
   4,  4,  4,  4,  4,  4,  4,  4,
   2,  2,  2,  2,  0,  0,  0,  0,

  -1, -1, -1, -1, -1, -1, -1, __,
  -1, -1, -1, -1,  0,  0,  0,  0,
   2,  2,  2,  2,  2,  2, __, __,
   4,  4,  4,  4,  4,  4, __, __,

   0,  0,  0,  0,  0,  0, __, __,
  -3, -3, -3, -3, -3, -3, __, __,
  -3, -3, -3, -3, -3, -3, __, __,
  __, __, __, __, __, __, __, __,

   2,  2,  2,  2,  2,  2,  2,  2,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  9,  9,  9,  9,
   7,  7,  7,  7,  5,  5,  5,  5,

   4,  4,  4,  4,  4,  4,  4,  4,
  __, __, __, __,  0,  0,  0,  0,
   4,  4,  4,  4,  4,  4,  4,  4,
   2,  2,  2,  2,  0,  0,  0,  0,

  -1, -1, -1, -1, -1, -1, -1, __,
  -1, -1, -1, -1,  0,  0,  0,  0,
   2,  2,  2,  2,  2,  2, __, __,
   4,  4,  4,  4,  4,  4, __, __,

   0,  0,  0,  0,  0,  0, __, __,
  -3, -3, -3, -3, -3, -3, __, __,
  -3, -3, -3, -3, -3, -3, __, __,
  __, __, __, __, __, __, __, __,
];

// One bass note per melody row (8 steps); each line matches a melody block.
const bass = [
  -20, -20, -20, -20,
  -15, -15, -15, -15,
  -16, -16, -20, -20,
  -15, -15, -15, -15,
  -22, -22, -22, -22,
  -24, -24, -24, -24,
  -16, -16, -20, -20,
  -15, -15, -15, -15,
];

// Which of \`length\` slots we're in, advancing every \`speed\` samples.
function seq(speed, length) {
  return floor(t / speed) % length;
}

// Slow sine sweep between min and max.
function wobble(min, max, freq) {
  return (min + max) / 2 + (min - max) / 2 * sin(TAU * freq * t / rate);
}

// Square-ish pulse whose duty cycle drifts with wobble(): chip-tune shimmer.
function pulse(note, amp) {
  if (note === __) return 0;
  const period = rate / (440 * 2 ** (note / 12));
  const phase  = t % period;
  return phase / period * amp + phase / 2 > period / wobble(3, 8, 3) ? amp : -amp;
}

function main() {
  const note = melody[seq(STEP, melody.length)];
  const root = bass[seq(STEP * 8, bass.length)];

  const lead = note === __ ? 0 : pulse(note, 40) + pulse(note + 12, 40);   // melody + octave
  const arp  = pulse(root + 12 * seq(STEP, 3) - 12, 60)                     // 3-step arpeggio
             + pulse(root + 12 * seq(STEP, 4) - 24, 40);                    // 4-step arpeggio

  return max(-127, min(127, lead + arp));
}

function left()  { return main(); }
function right() { return main(); }
`;

  const STILL_ALIVE_CODE = `// Still Alive (Portal) - 8-bit signed samples
//
// t    : sample count (0, 1, 2, ...)
// rate : samples per second
// Math functions/constants are available directly (sin, floor, ...), TAU = 2 * PI
// 8-bit signed: return -128 .. 127 (values outside the range wrap around)

// Notes are semitones away from A4 (440 Hz): 0 = A, 3 = C, -1 = G#, ...
const __   = -108;                          // rest
const STEP = round(rate * 2500 / 44100);    // samples per step: same tempo at any rate
const ECHO = round(rate * 0.42);            // echo delay: 0.42 s

const melody = [
  __, __, __, __,  9,  9,  9,  9,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,

  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,
  10, 10, 10, 10,  9,  9,  9,  9,
   7,  7,  7, __,  7,  7,  7,  7,

  __, __, __, __,  9,  9,  9,  9,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,

  __, __, __, __, __, __, __, __,
  __, __, __, __,  0,  0,  0,  0,
  10, 10, 10, 10,  9,  9,  9,  9,
   7,  7,  7, __,  7,  7,  7,  7,

  __, __, __, __, __, __, __, __,
   9,  9,  9,  9,  5,  5,  5,  5,
  __, __, __, __, __, __, __, __,
   7,  7,  7,  7,  0,  0,  0,  0,

  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,
  __, __, __, __, __, __, __, __,

   7,  7,  7,  7,  7,  7,  7,  7,
   9,  9,  9,  9, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10, 10, 10,
   7,  7,  7,  7,  7,  7,  7,  7,

   4,  4,  4,  4,  4,  4,  4,  4,
   5,  5,  5,  5,  7,  7,  7,  7,
   7,  7,  7,  7,  7,  7,  7,  7,
   0,  0,  0, __,  0,  0,  0,  0,
];

// Broken-chord accompaniment, one entry per melody step.
const accomp = [
   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   0,  0,  0,  0,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,
   2,  2,  2,  2,  5,  5,  5,  5,
   9,  9,  9,  9,  5,  5,  5,  5,

   2,  2,  2,  2,  7,  7,  7,  7,
  10, 10, 10, 10,  7,  7,  7,  7,
   2,  2,  2,  2,  7,  7,  7,  7,
  10, 10, 10, 10,  7,  7,  7,  7,

   0,  0,  0,  0,  7,  7,  7,  7,
  10, 10, 10, 10,  7,  7,  7,  7,
   0,  0,  0,  0,  7,  7,  7,  7,
  10, 10, 10, 10,  7,  7,  7,  7,
];

// The helpers take the time (in samples) explicitly instead of reading \`t\`,
// so the whole song can be evaluated a second time for the echo.

// Which of \`length\` slots we're in at \`time\`, advancing every \`speed\` samples.
function seq(time, speed, length) {
  return floor(time / speed) % length;
}

// Slow sine sweep between min and max.
function wobble(time, min, max, freq) {
  return (min + max) / 2 + (min - max) / 2 * sin(TAU * freq * time / rate);
}

// Square-ish pulse whose duty cycle drifts with wobble(): chip-tune shimmer.
function pulse(time, note, amp) {
  if (note === __) return 0;
  const period = rate / (440 * 2 ** (note / 12));
  const phase  = time % period;
  return phase / period * amp + phase / 2 > period / wobble(time, 3, 8, 3) ? amp : -amp;
}

// Everything playing at \`time\`.
function song(time) {
  if (time < 0) return 0;
  const step  = seq(time, STEP, melody.length);
  const note  = melody[step];
  const chord = accomp[step];

  const lead = note === __ ? 0 : pulse(time, note, 16) + pulse(time, note + 12, 16);  // melody + octave
  const harm = pulse(time, chord - 12, 16) + pulse(time, chord, 16);                   // accompaniment + octave below

  return lead + harm;
}

function main() {
  return max(-127, min(127, song(t) + 0.5 * song(t - ECHO)));   // song + half-volume echo
}

function left()  { return main(); }
function right() { return main(); }
`;

  const SKOLAVSLUTNING_CODE = `// Skolavslutning '90 Intro - float samples
//
// t    : sample count (0, 1, 2, ...)
// rate : samples per second
// Math functions/constants are available directly (sin, floor, ...), TAU = 2 * PI
// Float: return -1.0 .. 1.0 (values outside the range are clamped)
//
// Unlike a pure formula, this synth has state: its oscillators and envelope
// advance one sample per call. left() drives it and right() reuses the result.

// Notes are semitones above C0 (16.35 Hz): 65 = F5, 67 = G5, 69 = A5, 72 = C6
const __   = -1;                               // release the note
const BPM  = 95;
const STEP = rate * 60 / (8 * BPM);            // samples per step: 8 steps per beat

const sequence = [
  72, 72, 72, 72, 72, 72, 72, 72,
  72, 72, 72, 72, 72, 72, 72, 72,
  69, 69, __, __, 67, 67, __, __,
  65, 65, __, __, 67, 67, __, __,

  69, 69, 69, 69, 69, 69, 69, 69,
  69, 69, 69, 69, 69, 69, 69, 69,
  67, 67, __, __, 69, 69, __, __,
  67, 67, __, __, 69, 69, __, __,

  65, 65, 65, 65, 65, 65, 65, 65,
  65, 65, 65, 65, 65, 65, 65, 65,
  72, 72, __, __, 69, 69, __, __,
  67, 67, __, __, 65, 65, __, __,

  67, 67, __, __, 69, 69, __, __,
  67, 67, __, __, 65, 65, __, __,
  67, 67, __, __, 69, 69, __, __,
  72, 72, __, __, 69, 69, __, __,
];

const PHASE_STEP = 2 / rate;                   // square phase runs 0..2 once per cycle
const GLIDE      = 1 - 0.995 ** (44100 / rate); // portamento: 0.5 % per sample at 44.1 kHz

function noteToFreq(note) {
  return 16.35 * 2 ** (note / 12);
}

// Square wave: -1 for the first half of each cycle, +1 for the second.
class Square {
  constructor() { this.phase = 0; }

  sample(freq) {
    this.phase += PHASE_STEP * freq;
    if (this.phase > 2) this.phase -= 2;
    return floor(this.phase) * 2 - 1;
  }
}

const ATTACK = 0, DECAY = 1, SUSTAIN = 2, RELEASE = 3, OFF = 4;

// Seconds -> amount of change per sample (0 s = instant).
const perSample = seconds => seconds > 0 ? 1 / (rate * seconds) : 1;

// Monophonic voice: square oscillator, ADSR envelope, portamento between
// notes, and a 10 Hz vibrato that fades in while the note decays.
class Voice {
  constructor(attack, decay, sustain, release) {
    this.attackRate  = perSample(attack);
    this.decayRate   = perSample(decay);
    this.sustain     = min(1, max(0, sustain));
    this.releaseRate = perSample(release);

    this.stage  = OFF;
    this.amp    = 0;
    this.freq   = 0;
    this.target = 0;
    this.osc    = new Square();
    this.lfo    = new Square();
  }

  press(note) {
    this.stage  = ATTACK;
    this.amp    = 0;
    this.target = noteToFreq(note);
    if (this.freq === 0) this.freq = this.target;   // first note: no glide
  }

  release() {
    this.stage = RELEASE;
  }

  sample() {
    this.freq = this.freq * (1 - GLIDE) + this.target * GLIDE;

    // Each stage can finish and hand over to the next within the same sample.
    let vibrato = 0;                                // depth in Hz
    if (this.stage === ATTACK) {
      this.amp += this.attackRate;
      if (this.amp >= 1) { this.amp = 1; this.stage = DECAY; }
    }
    if (this.stage === DECAY) {
      this.amp -= this.decayRate;
      vibrato = 4 * ((1 - this.amp) / (1 - this.sustain));
      if (this.amp < this.sustain) { this.amp = this.sustain; this.stage = SUSTAIN; }
    }
    if (this.stage === SUSTAIN) {
      vibrato = 4;
    } else if (this.stage === RELEASE) {
      this.amp -= this.releaseRate;
      if (this.amp < 0) { this.amp = 0; this.stage = OFF; }
    }

    return this.amp * this.osc.sample(this.freq + vibrato * this.lfo.sample(10));
  }
}

const synth = new Voice(0, 4, 0.8, 0);         // instant attack, 4 s decay to 80 %, instant release
let lastNote = 0;

function main() {
  const note = sequence[floor(t / STEP) % sequence.length];
  if (note === __) synth.release();
  else if (note !== lastNote) synth.press(note);  // repeated notes are held, not retriggered
  lastNote = note;
  return synth.sample();
}

let current = 0;
function left()  { current = main(); return current; }  // left runs first: advance the synth
function right() { return current; }                     // same sample on the right
`;

  const MANIC_MINER_CODE = `// Manic Miner (1983) - "In the Hall of the Mountain King" (Grieg) - float samples
//
// t    : sample count (0, 1, 2, ...)
// rate : samples per second
// Math functions/constants are available directly (sin, floor, ...), TAU = 2 * PI
// Float: return -1.0 .. 1.0 (values outside the range are clamped)
//
// Same synth as Skolavslutning '90 Intro, now with two voices: a staccato
// lead and a bouncing bass. The synth has state, so left() advances both
// voices and right() reuses their output with a different stereo mix.

// Notes are semitones above C0 (16.35 Hz): 33 = A2, 57 = A4, 60 = C5, 69 = A5
const __   = -1;                               // release the note
const BPM  = 150;
const STEP = rate * 60 / (2 * BPM);            // samples per step: 2 steps per beat

// The theme, one bar per row. Staccato: most notes release right away.
const melody = [
  57, __, 59, __, 60, __, 62, __,
  64, __, 60, __, 64, 64, 64, __,
  63, __, 59, __, 63, 63, 63, __,
  62, __, 58, __, 62, 62, 62, __,

  57, __, 59, __, 60, __, 62, __,
  64, __, 60, __, 64, __, 69, __,
  67, __, 64, __, 60, __, 64, __,
  67, 67, 67, __, __, __, __, __,
];

// One bass root per bar, bouncing between two octaves on every beat.
const bassRoots   = [33, 33, 35, 34, 33, 33, 36, 31];
const bassPattern = [ 0, __, 12, __,  0, __, 12, __];

const PHASE_STEP = 2 / rate;                   // square phase runs 0..2 once per cycle
const GLIDE      = 1 - 0.995 ** (44100 / rate); // portamento: 0.5 % per sample at 44.1 kHz

function noteToFreq(note) {
  return 16.35 * 2 ** (note / 12);
}

// Square wave: -1 for the first half of each cycle, +1 for the second.
class Square {
  constructor() { this.phase = 0; }

  sample(freq) {
    this.phase += PHASE_STEP * freq;
    if (this.phase > 2) this.phase -= 2;
    return floor(this.phase) * 2 - 1;
  }
}

const ATTACK = 0, DECAY = 1, SUSTAIN = 2, RELEASE = 3, OFF = 4;

// Seconds -> amount of change per sample (0 s = instant).
const perSample = seconds => seconds > 0 ? 1 / (rate * seconds) : 1;

// Monophonic voice: square oscillator, ADSR envelope, portamento between
// notes, and a 10 Hz vibrato (depth in Hz) that fades in while the note decays.
class Voice {
  constructor(attack, decay, sustain, release, vibratoDepth) {
    this.attackRate   = perSample(attack);
    this.decayRate    = perSample(decay);
    this.sustain      = min(1, max(0, sustain));
    this.releaseRate  = perSample(release);
    this.vibratoDepth = vibratoDepth;

    this.stage  = OFF;
    this.amp    = 0;
    this.freq   = 0;
    this.target = 0;
    this.osc    = new Square();
    this.lfo    = new Square();
  }

  press(note) {
    this.stage  = ATTACK;
    this.amp    = 0;
    this.target = noteToFreq(note);
    if (this.freq === 0) this.freq = this.target;   // first note: no glide
  }

  release() {
    this.stage = RELEASE;
  }

  sample() {
    this.freq = this.freq * (1 - GLIDE) + this.target * GLIDE;

    // Each stage can finish and hand over to the next within the same sample.
    let vibrato = 0;                                // depth in Hz
    if (this.stage === ATTACK) {
      this.amp += this.attackRate;
      if (this.amp >= 1) { this.amp = 1; this.stage = DECAY; }
    }
    if (this.stage === DECAY) {
      this.amp -= this.decayRate;
      vibrato = this.vibratoDepth * ((1 - this.amp) / (1 - this.sustain));
      if (this.amp < this.sustain) { this.amp = this.sustain; this.stage = SUSTAIN; }
    }
    if (this.stage === SUSTAIN) {
      vibrato = this.vibratoDepth;
    } else if (this.stage === RELEASE) {
      this.amp -= this.releaseRate;
      if (this.amp < 0) { this.amp = 0; this.stage = OFF; }
    }

    return this.amp * this.osc.sample(this.freq + vibrato * this.lfo.sample(10));
  }
}

// A voice following a sequence: a new note presses, __ releases, and a
// repeated note is held rather than retriggered.
class Part {
  constructor(voice) {
    this.voice = voice;
    this.last  = __;
  }

  play(note) {
    if (note === __) this.voice.release();
    else if (note !== this.last) this.voice.press(note);
    this.last = note;
    return this.voice.sample();
  }
}

const lead = new Part(new Voice(0, 0.3, 0.4, 0.03, 4));   // plucky, a little vibrato
const bass = new Part(new Voice(0, 0.15, 0.3, 0.02, 0));  // short and dry

let leadOut = 0, bassOut = 0;

function main() {
  const step = floor(t / STEP);
  const pass = floor(step / melody.length) % 2;           // every other pass: an octave up

  const note = melody[step % melody.length];
  leadOut = lead.play(note === __ ? __ : note + 12 * pass);

  const root   = bassRoots[floor(step / 8) % bassRoots.length];
  const offset = bassPattern[step % bassPattern.length];
  bassOut = bass.play(offset === __ ? __ : root + offset);
}

function left()  { main(); return 0.35 * leadOut + 0.25 * bassOut; }  // left runs first: advance the synth
function right() { return 0.25 * leadOut + 0.35 * bassOut; }          // same samples, mirrored mix
`;

  const DEFAULT_CODE = TETRIS_CODE;

  const SINE_CODE = `// t    : sample count (0, 1, 2, ...)
// rate : samples per second (44100 or 22050)
// Math functions/constants are available directly: sin, cos, PI, ...
// TAU = 2 * PI
//
// Return one sample per call, in the range of the selected depth:
//   float  : -1.0 .. 1.0      (clamped)
//   16-bit : -32768 .. 32767  (wraps around)
//   8-bit  : -128 .. 127      (wraps around)

function left() {
  return 0.5 * sin(TAU * 440 * t / rate);
}

function right() {
  return 0.5 * sin(TAU * 660 * t / rate);
}
`;

  const PRESETS = {
    'Tetris (8-bit)': { rate: 44100, depth: 's8', code: TETRIS_CODE },

    'Still Alive (8-bit)': { rate: 44100, depth: 's8', code: STILL_ALIVE_CODE },

    "Skolavslutning '90 Intro (float)": { rate: 44100, depth: 'float', code: SKOLAVSLUTNING_CODE },

    'Manic Miner (float)': { rate: 44100, depth: 'float', code: MANIC_MINER_CODE },

    'Sine duet (float)': { rate: 44100, depth: 'float', code: SINE_CODE },

    'Classic bytebeat (8-bit)': { rate: 22050, depth: 's8', code: `// Classic one-liners: integer math, the result wraps to 8 bits.
// Try other depths to hear how the same formula gets reinterpreted.

function left() {
  const T = t >> 2;            // slow t down: bytebeat is usually 8 kHz
  return T * (T >> 5 | T >> 8);
}

function right() {
  const T = t >> 2;
  return T * (T >> 7 | T >> 9) & T >> 3;
}
` },

    'Chord (16-bit)': { rate: 44100, depth: 's16', code: `// A minor chord as 16-bit integers, with a slow tremolo.
const notes = [220, 261.63, 329.63];

function voice(f) {
  return sin(TAU * f * t / rate);
}

function left() {
  const trem = 0.75 + 0.25 * sin(TAU * 3 * t / rate);
  return 7000 * trem * (voice(notes[0]) + voice(notes[1]) + voice(notes[2]));
}

function right() {
  const trem = 0.75 + 0.25 * sin(TAU * 3 * t / rate + PI);
  return 7000 * trem * (voice(notes[0] * 2) + voice(notes[1]) + voice(notes[2]));
}
` },

    'Kick + hats (float)': { rate: 44100, depth: 'float', code: `// Four-on-the-floor at 120 BPM.
const bpm = 120;

function kick() {
  const beat = rate * 60 / bpm;
  const p = (t % beat) / rate;                     // seconds since the beat
  // pitch drops from 200 Hz to 50 Hz: integrate frequency to get the phase
  const phase = 50 * p + 5 * (1 - exp(-30 * p));
  return sin(TAU * phase) * exp(-p * 6);
}

function hat() {
  const beat = rate * 60 / bpm;
  const p = ((t + beat / 2) % beat) / rate;       // off-beat
  return (random() * 2 - 1) * exp(-p * 60) * 0.3;
}

function left()  { return 0.7 * kick() + hat(); }
function right() { return 0.7 * kick() + 0.6 * hat(); }
` },

    'Stereo sweep (float)': { rate: 44100, depth: 'float', code: `// A saw wave through a sweeping "wavefolder", panned by an LFO.
let phase = 0;

function saw() {
  return 2 * (phase - floor(phase)) - 1;
}

function sample() {
  const f = 110 * (1 + 0.5 * sin(TAU * 0.1 * t / rate));
  phase += f / rate;
  const drive = 1 + 3 * (0.5 + 0.5 * sin(TAU * 0.25 * t / rate));
  return 0.4 * sin(saw() * drive);
}

let current = 0;
function left() {
  current = sample();                 // left runs first, so compute here
  const pan = 0.5 + 0.5 * sin(TAU * 0.5 * t / rate);
  return current * (1 - pan);
}
function right() {
  const pan = 0.5 + 0.5 * sin(TAU * 0.5 * t / rate);
  return current * pan;
}
` },
  };

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------

  const $ = id => document.getElementById(id);
  const rateSel = $('rate'), depthSel = $('depth'), presetSel = $('preset');
  const playBtn = $('play'), volume = $('volume'), volval = $('volval');
  const statusEl = $('status'), tval = $('tval'), secs = $('secs'), peakEl = $('peak');
  const canvas = $('spectrum'), g2d = canvas.getContext('2d');

  const store = {
    get(k) { try { return localStorage.getItem('funk.' + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('funk.' + k, v); } catch { /* ignore */ } },
  };

  for (const name of Object.keys(PRESETS)) {
    const o = document.createElement('option');
    o.value = o.textContent = name;
    presetSel.appendChild(o);
  }

  rateSel.value = store.get('rate') || '44100';
  depthSel.value = store.get('depth') || 's8';
  volume.value = store.get('volume') || '50';
  volval.textContent = volume.value + '%';

  // ---------------------------------------------------------------------------
  // Editor (CodeMirror when the CDN is reachable, plain textarea otherwise)
  // ---------------------------------------------------------------------------

  const textarea = $('code');
  textarea.value = store.get('code') || DEFAULT_CODE;

  let getCode, setCode;
  if (window.CodeMirror) {
    const cm = CodeMirror.fromTextArea(textarea, {
      mode: 'javascript',
      theme: 'material-darker',
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      extraKeys: {
        'Ctrl-Enter': () => togglePlay(),
        'Cmd-Enter': () => togglePlay(),
        Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('  '),
      },
    });
    getCode = () => cm.getValue();
    setCode = v => cm.setValue(v);
    cm.on('change', onCodeChange);
    cm.focus();
  } else {
    getCode = () => textarea.value;
    setCode = v => { textarea.value = v; onCodeChange(); };
    textarea.addEventListener('input', onCodeChange);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        textarea.setRangeText('  ', textarea.selectionStart, textarea.selectionEnd, 'end');
        onCodeChange();
      }
    });
  }

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      togglePlay();
    }
  });

  // ---------------------------------------------------------------------------
  // Compiling user code
  // ---------------------------------------------------------------------------

  const MATH_NAMES = Object.getOwnPropertyNames(Math).filter(n => /^[A-Za-z_$][\w$]*$/.test(n));

  // Builds a generator: gen(n, out) sets t = n and writes [left, right] into out.
  // User code lives in its own function scope so it may shadow any Math name.
  function compile(src, rate) {
    const body = `
const {${MATH_NAMES.join(', ')}} = Math;
const TAU = 2 * PI;
const rate = ${rate};
let t = 0;
const __fns = (function () {
${src}
;return {
    left:  typeof left  === 'function' ? left  : null,
    right: typeof right === 'function' ? right : null,
  };
})();
if (!__fns.left && !__fns.right) throw new Error('Define a function named left() and/or right()');
const L = __fns.left || __fns.right;
const R = __fns.right || __fns.left;
return function (n, out) {
  t = n;
  out[0] = L(t, rate);
  out[1] = R(t, rate);
};`;
    return new Function(body)();
  }

  // ---------------------------------------------------------------------------
  // Sample conversion
  // ---------------------------------------------------------------------------

  // Returns a float in [-1, 1] for the Web Audio buffer.
  function toFloat(v, depth) {
    v = +v;                                   // booleans, strings -> numbers
    if (v !== v || v === Infinity || v === -Infinity) return 0;
    if (depth === 's8')  return (((v | 0) << 24) >> 24) / 128;    // wrap to int8
    if (depth === 's16') return (((v | 0) << 16) >> 16) / 32768;  // wrap to int16
    return v > 1 ? 1 : v < -1 ? -1 : v;                           // clamp float
  }

  // ---------------------------------------------------------------------------
  // Audio engine
  // ---------------------------------------------------------------------------

  let ctx = null, proc = null, gainNode = null, anL = null, anR = null;
  let gen = null;            // current compiled generator
  let t = 0;                 // global sample counter
  let playing = false;
  let runtimeError = null;   // set from the audio callback, shown by the UI loop
  let depth = depthSel.value;

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.className = isError ? 'err' : 'ok';
    statusEl.title = msg;
  }

  function currentRate() {
    return ctx ? ctx.sampleRate : +rateSel.value;
  }

  // Compile and, if valid, swap in the new generator (t keeps running).
  function rebuild() {
    let next;
    try {
      next = compile(getCode(), currentRate());
      next(t, new Float64Array(2));   // smoke test: catches ReferenceErrors etc.
    } catch (err) {
      setStatus('✗ ' + err.name + ': ' + err.message + (playing ? '  (still playing previous version)' : ''), true);
      return false;
    }
    gen = next;
    runtimeError = null;
    setStatus('✓ Compiled' + (playing ? ' — live' : ''), false);
    return true;
  }

  let debounce = 0;
  function onCodeChange() {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      store.set('code', getCode());
      rebuild();
    }, 350);
  }

  function start() {
    const rate = +rateSel.value;
    try {
      ctx = new AudioContext({ sampleRate: rate });
    } catch (err) {
      setStatus('✗ This browser cannot open an audio context at ' + rate + ' Hz: ' + err.message, true);
      return;
    }
    if (!rebuild()) { ctx.close(); ctx = null; return; }

    const BUF = 4096;
    proc = ctx.createScriptProcessor(BUF, 0, 2);
    const out = new Float64Array(2);

    proc.onaudioprocess = e => {
      const l = e.outputBuffer.getChannelData(0);
      const r = e.outputBuffer.getChannelData(1);
      const n = l.length, fn = gen, d = depth;
      let i = 0;
      try {
        for (; i < n; i++) {
          fn(t + i, out);
          l[i] = toFloat(out[0], d);
          r[i] = toFloat(out[1], d);
        }
      } catch (err) {
        runtimeError = err;
        for (; i < n; i++) l[i] = r[i] = 0;
      }
      t += n;
    };

    gainNode = ctx.createGain();
    gainNode.gain.value = volumeGain();

    // Analysers tap the signal before the volume, so the graph ignores volume.
    const split = ctx.createChannelSplitter(2);
    anL = makeAnalyser(ctx);
    anR = makeAnalyser(ctx);
    proc.connect(split);
    split.connect(anL, 0);
    split.connect(anR, 1);

    proc.connect(gainNode);
    gainNode.connect(ctx.destination);

    playing = true;
    playBtn.textContent = '■ Stop';
    playBtn.classList.add('playing');
    setStatus('✓ Playing at ' + ctx.sampleRate + ' Hz, ' + depthSel.selectedOptions[0].textContent, false);
  }

  function stop(resetT = true) {
    if (proc) { proc.onaudioprocess = null; proc.disconnect(); }
    if (ctx) ctx.close();
    ctx = proc = gainNode = anL = anR = null;
    playing = false;
    if (resetT) t = 0;
    playBtn.textContent = '▶ Play';
    playBtn.classList.remove('playing');
  }

  function togglePlay() {
    if (playing) { stop(); setStatus('Stopped', false); }
    else start();
  }

  function makeAnalyser(c) {
    const a = c.createAnalyser();
    a.fftSize = 8192;
    a.smoothingTimeConstant = 0.75;
    a.minDecibels = -110;
    a.maxDecibels = 0;
    return a;
  }

  // Perceptual volume curve: slider position squared.
  function volumeGain() {
    const v = volume.value / 100;
    return v * v;
  }

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------

  playBtn.addEventListener('click', togglePlay);

  volume.addEventListener('input', () => {
    volval.textContent = volume.value + '%';
    store.set('volume', volume.value);
    if (gainNode) gainNode.gain.setTargetAtTime(volumeGain(), ctx.currentTime, 0.02);
  });

  depthSel.addEventListener('change', () => {
    depth = depthSel.value;
    store.set('depth', depth);
  });

  rateSel.addEventListener('change', () => {
    store.set('rate', rateSel.value);
    if (playing) {
      // Restart at the new rate, keeping the same position in seconds.
      const seconds = t / ctx.sampleRate;
      stop(false);
      t = Math.round(seconds * +rateSel.value);
      start();
    } else {
      rebuild();
    }
  });

  presetSel.addEventListener('change', () => {
    const p = PRESETS[presetSel.value];
    presetSel.value = '';
    if (!p) return;
    const code = getCode();
    const isPreset = Object.values(PRESETS).some(x => x.code === code);
    if (!isPreset && !confirm('Replace the current code with this example?')) return;
    depthSel.value = depth = p.depth;
    store.set('depth', depth);
    if (+rateSel.value !== p.rate) {
      rateSel.value = String(p.rate);
      rateSel.dispatchEvent(new Event('change'));
    }
    setCode(p.code);
    store.set('code', p.code);
    t = 0;
    rebuild();
  });

  // ---------------------------------------------------------------------------
  // Spectrum graph
  // ---------------------------------------------------------------------------

  const COLORS = {
    left: getComputedStyle(document.documentElement).getPropertyValue('--left').trim(),
    right: getComputedStyle(document.documentElement).getPropertyValue('--right').trim(),
  };
  const F_MIN = 20;
  const DB_MIN = -110, DB_MAX = 0;
  let bufL = null, bufR = null;

  function fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return dpr;
  }

  function drawGrid(w, h, dpr, fMax) {
    g2d.fillStyle = '#0d0d10';
    g2d.fillRect(0, 0, w, h);
    g2d.lineWidth = 1;
    g2d.font = `${10 * dpr}px ui-monospace, Consolas, monospace`;
    g2d.textBaseline = 'top';

    const xOf = f => Math.log(f / F_MIN) / Math.log(fMax / F_MIN) * w;
    for (const f of [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]) {
      if (f >= fMax) break;
      const x = Math.round(xOf(f)) + 0.5;
      g2d.strokeStyle = '#1f1f26';
      g2d.beginPath(); g2d.moveTo(x, 0); g2d.lineTo(x, h); g2d.stroke();
      g2d.fillStyle = '#5a5a66';
      g2d.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), x + 3 * dpr, h - 13 * dpr);
    }
    for (let db = -20; db > DB_MIN + 10; db -= 20) {
      const y = Math.round((db - DB_MAX) / (DB_MIN - DB_MAX) * h) + 0.5;
      g2d.strokeStyle = '#1f1f26';
      g2d.beginPath(); g2d.moveTo(0, y); g2d.lineTo(w, y); g2d.stroke();
      g2d.fillStyle = '#5a5a66';
      g2d.fillText(db + ' dB', 3 * dpr, y + 2 * dpr);
    }
  }

  // Plots one channel on a log-frequency axis. Each pixel column shows the
  // loudest FFT bin it covers, so narrow high-frequency peaks don't vanish.
  function plot(data, w, h, nyquist, color) {
    const bins = data.length;
    const ratio = Math.log(nyquist / F_MIN);
    g2d.beginPath();
    g2d.moveTo(0, h);
    for (let x = 0; x < w; x++) {
      const f0 = F_MIN * Math.exp(ratio * x / w);
      const f1 = F_MIN * Math.exp(ratio * (x + 1) / w);
      let b0 = Math.floor(f0 / nyquist * bins);
      const b1 = Math.min(bins - 1, Math.max(b0, Math.floor(f1 / nyquist * bins)));
      let db = -Infinity;
      for (; b0 <= b1; b0++) if (data[b0] > db) db = data[b0];
      if (!(db > DB_MIN)) db = DB_MIN;
      const y = (Math.min(db, DB_MAX) - DB_MAX) / (DB_MIN - DB_MAX) * h;
      g2d.lineTo(x, y);
    }
    g2d.lineTo(w, h);
    g2d.closePath();
    g2d.globalAlpha = 0.18;
    g2d.fillStyle = color;
    g2d.fill();
    g2d.globalAlpha = 1;
    g2d.strokeStyle = color;
    g2d.lineWidth = 1.5;
    g2d.stroke();
  }

  function peakFrequency(data, nyquist) {
    let best = 1, bestDb = -Infinity;
    for (let i = 1; i < data.length; i++) if (data[i] > bestDb) { bestDb = data[i]; best = i; }
    if (bestDb < -80) return null;
    return best * nyquist / data.length;
  }

  function frame() {
    const dpr = fitCanvas();
    const w = canvas.width, h = canvas.height;
    const rate = currentRate();
    const nyquist = rate / 2;
    drawGrid(w, h, dpr, nyquist);

    if (anL) {
      if (!bufL || bufL.length !== anL.frequencyBinCount) {
        bufL = new Float32Array(anL.frequencyBinCount);
        bufR = new Float32Array(anR.frequencyBinCount);
      }
      anL.getFloatFrequencyData(bufL);
      anR.getFloatFrequencyData(bufR);
      plot(bufR, w, h, nyquist, COLORS.right);
      plot(bufL, w, h, nyquist, COLORS.left);
      const pk = peakFrequency(bufL, nyquist);
      peakEl.textContent = pk ? pk.toFixed(0) + ' Hz' : '—';
    } else {
      peakEl.textContent = '—';
    }

    tval.textContent = t;
    secs.textContent = (t / rate).toFixed(2);

    if (runtimeError) {
      setStatus('✗ Runtime ' + runtimeError.name + ': ' + runtimeError.message + '  (at t ≈ ' + t + ')', true);
      runtimeError = null;
    }
    requestAnimationFrame(frame);
  }

  rebuild();
  requestAnimationFrame(frame);
})();
