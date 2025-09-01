// Simple click-only Web Piano
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain();
master.gain.value = 0.7;
master.connect(ctx.destination);

const NOTES = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
};

function playNote(note) {
  if (ctx.state !== 'running') {
    ctx.resume().catch(() => {});
  }

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';  // pure tone
  osc.frequency.value = NOTES[note];

  const now = ctx.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.9, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.6);
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
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    playNote(note);
    blinkKey(btn);
  }, { passive:false });
});