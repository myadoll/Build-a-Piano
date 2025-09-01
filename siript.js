 // Click-only WebAudio piano (no keyboard listeners)
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain();
master.gain.value = 0.7;
master.connect(ctx.destination);

const waveSel = document.getElementById('wave'); // optional; defaults to 'sine' if missing
const vol = document.getElementById('volume');
if (vol) vol.addEventListener('input', e => master.gain.value = parseFloat(e.target.value));

const NOTES = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
};

function playNote(note) {
  // Resume audio context inside the user gesture (fixes autoplay restrictions)
  if (ctx.state !== 'running') {
    // If resume fails (rare), just bail silently to avoid errors
    ctx.resume().catch(() => {});
  }

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  // Use selected wave if present, otherwise default 'sine'
  osc.type = waveSel ? waveSel.value : 'sine';
  osc.frequency.value = NOTES[note];

  const now = ctx.currentTime;
  // Simple pluck-like envelope (short click sound)
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.9, now + 0.01);     // quick attack
  g.gain.exponentialRampToValueAtTime(0.0008, now + 0.35); // short decay

  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.4); // stop after envelope ends
}

function blinkKey(el) {
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 120);
}

document.querySelectorAll('.key').forEach(btn => {
  const note = btn.dataset.note;
  btn.addEventListener('click', () => {
    playNote(note);
    blinkKey(btn);
  });

  // Optional: make touch feel snappy too
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    playNote(note);
    blinkKey(btn);
  }, { passive: false });
});
