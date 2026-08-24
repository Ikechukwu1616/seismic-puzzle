// Generates the SEISMIC audio pack, writes .wav files directly, no deps.
// Outputs a loopable ambient background track and five short sound effects.

const fs = require('fs');
const path = require('path');

const SR = 44100;

function writeWav(filename, samples, sampleRate = SR) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32000), 44 + i * 2);
  }
  fs.writeFileSync(filename, buf);
  console.log('wrote', filename, `(${(buf.length / 1024).toFixed(1)} KB)`);
}

// ---------- background music ----------
// A slow ambient synth pad, seismic mood: minor arpeggio in Am with a warm
// low drone underneath. 32 seconds, loops perfectly.

function buildMusic() {
  const dur = 32;
  const N = SR * dur;
  const out = new Float32Array(N);

  // A minor: A2, C3, E3, G3 arpeggio at 55 hz base
  const rootHz = 110; // A2
  const chord = [1, 6 / 5, 3 / 2, 9 / 5]; // rough minor-7 shape
  const arpHz = chord.map((r) => rootHz * r);
  const stepDur = 0.75; // seconds per note

  // Warm low drone under everything
  const droneFreq = 55; // A1
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let s = 0;
    // Drone with slow vibrato
    s += 0.14 * Math.sin(2 * Math.PI * droneFreq * t + 0.3 * Math.sin(2 * Math.PI * 0.12 * t));
    s += 0.09 * Math.sin(2 * Math.PI * droneFreq * 2 * t);
    // High shimmer
    s += 0.03 * Math.sin(2 * Math.PI * droneFreq * 4 * t) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t));

    // Arpeggio pad
    const step = Math.floor(t / stepDur) % arpHz.length;
    const localT = (t % stepDur) / stepDur;
    // Soft attack-release envelope
    const env = Math.sin(Math.PI * localT) * 0.9;
    const f = arpHz[step];
    // Two detuned sines per note = warmer
    s += 0.11 * env * Math.sin(2 * Math.PI * f * t);
    s += 0.09 * env * Math.sin(2 * Math.PI * f * 1.005 * t);
    // Octave up softer
    s += 0.04 * env * Math.sin(2 * Math.PI * f * 2 * t);

    out[i] = s;
  }

  // Crossfade the last half-second into the start for a seamless loop
  const fadeSamples = SR * 0.5;
  for (let i = 0; i < fadeSamples; i++) {
    const mix = i / fadeSamples;
    out[i] = out[i] * mix + out[N - fadeSamples + i] * (1 - mix);
  }
  // Then trim the fade region off the end
  const trimmed = out.slice(0, N - fadeSamples);

  // Gentle master gain
  for (let i = 0; i < trimmed.length; i++) trimmed[i] *= 0.55;
  return trimmed;
}

// ---------- sound effects ----------

function sineTone(freq, dur, amp = 0.6, attack = 0.005, release = 0.05) {
  const N = Math.floor(SR * dur);
  const out = new Float32Array(N);
  const atk = Math.floor(SR * attack);
  const rel = Math.floor(SR * release);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = 1;
    if (i < atk) env = i / atk;
    else if (i > N - rel) env = (N - i) / rel;
    out[i] = amp * env * Math.sin(2 * Math.PI * freq * t);
  }
  return out;
}

function mix(...tracks) {
  const N = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(N);
  for (const tr of tracks) {
    for (let i = 0; i < tr.length; i++) out[i] += tr[i];
  }
  return out;
}

function concat(...tracks) {
  const N = tracks.reduce((a, t) => a + t.length, 0);
  const out = new Float32Array(N);
  let off = 0;
  for (const tr of tracks) { out.set(tr, off); off += tr.length; }
  return out;
}

// Click: short, high, crisp
function buildClick() {
  return sineTone(1200, 0.05, 0.5, 0.001, 0.04);
}

// Pickup: rising two-tone chirp
function buildPickup() {
  const a = sineTone(500, 0.06, 0.45, 0.003, 0.05);
  const b = sineTone(750, 0.06, 0.45, 0.003, 0.05);
  return concat(a, b);
}

// Correct placement: warm major-third arpeggio
function buildPlace() {
  const a = sineTone(523, 0.09, 0.5, 0.003, 0.06); // C5
  const b = sineTone(659, 0.09, 0.5, 0.003, 0.06); // E5
  const c = sineTone(784, 0.14, 0.5, 0.003, 0.08); // G5
  return concat(a, b, c);
}

// Wrong: short low buzz
function buildWrong() {
  const N = Math.floor(SR * 0.14);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Slight downward sweep, square-ish
    const f = 200 - t * 300;
    const s = Math.sign(Math.sin(2 * Math.PI * Math.max(80, f) * t)) * 0.35;
    let env = 1;
    const atk = Math.floor(SR * 0.005);
    const rel = Math.floor(SR * 0.06);
    if (i < atk) env = i / atk;
    else if (i > N - rel) env = (N - i) / rel;
    out[i] = s * env;
  }
  return out;
}

// Level complete: triumphant ascending arpeggio
function buildComplete() {
  const notes = [
    [523, 0.14], // C5
    [659, 0.14], // E5
    [784, 0.14], // G5
    [1047, 0.35], // C6
  ];
  const parts = notes.map(([f, d]) => sineTone(f, d, 0.5, 0.005, 0.09));
  // Layer the final C6 with an octave-lower and a fifth on top
  const finalLen = parts[parts.length - 1].length;
  const finalHarm = mix(
    parts[parts.length - 1],
    sineTone(523, 0.35, 0.35, 0.005, 0.09), // C5
    sineTone(1568, 0.35, 0.25, 0.005, 0.09), // G6
  ).slice(0, finalLen);
  return concat(parts[0], parts[1], parts[2], finalHarm);
}

// ---------- write everything ----------
const outDir = path.resolve(__dirname);

writeWav(path.join(outDir, 'music-theme.wav'), buildMusic());
writeWav(path.join(outDir, 'sfx-click.wav'), buildClick());
writeWav(path.join(outDir, 'sfx-pickup.wav'), buildPickup());
writeWav(path.join(outDir, 'sfx-place.wav'), buildPlace());
writeWav(path.join(outDir, 'sfx-wrong.wav'), buildWrong());
writeWav(path.join(outDir, 'sfx-complete.wav'), buildComplete());
