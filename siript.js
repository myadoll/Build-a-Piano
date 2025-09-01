const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain();
master.gain.value = 0.7;
master.connect(ctx.destination);

const waveSel = document.getElementById('wave');
const vol = document.getElementById('volume');
vol.addEventListener('input', e => master.gain.value = parseFloat(e.target.value));

const NOTES = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
};

const KEYMAP = {
  'a':'C4','w':'C#4','s':'D4','e':'D#4','d':'E4','f':'F4',
  't':'F#4','g':'G4','y':'G#4','h':'A4','u':'A#4','j':'B4'
};

const active = new Map();

function startNote(note){
  if(active.has(note)) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = waveSel.value;
  osc.frequency.value = NOTES[note];
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.01);
  osc.connect(g).connect(master);
  osc.start();
  active.set(note, {osc, g});
  setKeyActive(note, true);
}

function stopNote(note){
  const node = active.get(note);
  if(!node) return;
  node.g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  node.osc.stop(ctx.currentTime + 0.1);
  active.delete(note);
  setKeyActive(note, false);
}

function setKeyActive(note, on){
  const el = [...document.querySelectorAll('.key')].find(k => k.dataset.note === note);
  if(el) el.classList.toggle('active', on);
}

function keyFor(key){ return KEYMAP[key.toLowerCase()]; }

document.querySelectorAll('.key').forEach(btn => {
  const note = btn.dataset.note;
  btn.addEventListener('mousedown', () => startNote(note));
  btn.addEventListener('mouseup',   () => stopNote(note));
  btn.addEventListener('mouseleave',() => stopNote(note));
});

window.addEventListener('keydown', e => {
  if (e.repeat) return;
  const note = keyFor(e.key);
  if(note) startNote(note);
});
window.addEventListener('keyup', e => {
  const note = keyFor(e.key);
  if(note) stopNote(note);
});

// Needed because browsers block audio until interaction
window.addEventListener('click', () => {
  if (ctx.state !== 'running') ctx.resume();
}, {once:true});
