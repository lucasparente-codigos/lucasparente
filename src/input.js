const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
};
const SWIPE_MIN = 24; // px

export function bindInput(area, { onTurn, onPrimary, onPause }) {
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (Object.hasOwn(KEYS, k)) {
      e.preventDefault();
      onTurn(KEYS[k]);
      return;
    }
    if (e.repeat) return;
    // Em botões, Espaço e Enter mantêm o comportamento nativo (clique).
    if ((k === ' ' || k === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      onPrimary();
    } else if (k === 'p' || k === 'Escape') {
      onPause();
    }
  });

  // Deslizar: dispara assim que passa do limite e reinicia a origem,
  // então dá para encadear curvas sem tirar o dedo da tela.
  let sx = 0, sy = 0;
  area.addEventListener('touchstart', (e) => {
    ({ clientX: sx, clientY: sy } = e.touches[0]);
  }, { passive: true });
  area.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
    onTurn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    sx = t.clientX;
    sy = t.clientY;
  }, { passive: true });
}
