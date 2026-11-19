// Única camada que toca no DOM (além do canvas).
const $ = (id) => document.getElementById(id);
const el = Object.fromEntries(
  ['score', 'best', 'overlay', 'title', 'text', 'options', 'difficulty', 'walls', 'play', 'totals']
    .map((id) => [id, $(id)]),
);

export function bind({ onPlay, onSettings }) {
  // Clique de mouse/toque solta o foco; navegação por teclado mantém.
  const release = (e) => { if (e.detail) document.activeElement?.blur(); };

  el.play.addEventListener('click', (e) => { release(e); onPlay(); });
  el.difficulty.addEventListener('click', (e) => {
    const b = e.target.closest('[data-diff]');
    if (!b) return;
    release(e);
    onSettings({ difficulty: b.dataset.diff });
  });
  el.walls.addEventListener('click', (e) => {
    release(e);
    onSettings({ walls: el.walls.getAttribute('aria-pressed') !== 'true' });
  });
}

export function renderSettings({ difficulty, walls }) {
  for (const b of el.difficulty.children) b.setAttribute('aria-pressed', b.dataset.diff === difficulty);
  el.walls.setAttribute('aria-pressed', walls);
  el.walls.textContent = walls ? 'Paredes: sim' : 'Paredes: não';
}

export function show({ title, text = '', button, options = false, totals = '' }) {
  el.title.textContent = title;
  el.text.textContent = text;
  el.play.textContent = button;
  el.options.hidden = !options;
  el.totals.textContent = totals;
  el.totals.hidden = !totals;
  el.overlay.hidden = false;
}

export const hide = () => { el.overlay.hidden = true; };
export const setBest = (n) => { el.best.textContent = n; };

export function setScore(n, animate = false) {
  el.score.textContent = n;
  if (!animate) return;
  el.score.classList.remove('bump');
  void el.score.offsetWidth; // reinicia a animação
  el.score.classList.add('bump');
}
