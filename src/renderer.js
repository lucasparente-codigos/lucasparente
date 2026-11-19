import { GRID, DIRS } from './config.js';

const TAU = Math.PI * 2;

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const color = {};
  let px = 0, cell = 0;

  const readColors = () => {
    const css = getComputedStyle(document.documentElement);
    for (const k of ['board', 'dot', 'ink', 'apple']) color[k] = css.getPropertyValue(`--${k}`).trim();
  };
  const resize = () => {
    px = Math.round(canvas.clientWidth * (window.devicePixelRatio || 1));
    canvas.width = canvas.height = px;
    cell = px / GRID;
  };

  new ResizeObserver(resize).observe(canvas);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
  resize();
  readColors();

  const circle = (gx, gy, r) => {
    ctx.beginPath();
    ctx.arc((gx + .5) * cell, (gy + .5) * cell, r, 0, TAU);
    ctx.fill();
  };

  function draw(game, t) {
    ctx.clearRect(0, 0, px, px);

    // grade de pontos
    ctx.fillStyle = color.dot;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) circle(x, y, cell * .06);

    // maçã, a única cor da cena
    if (game.apple) {
      ctx.fillStyle = color.apple;
      circle(game.apple.x, game.apple.y, cell * (.3 + .03 * Math.sin(t / 220)));
    }

    // cobra: do rabo à cabeça, esmaecendo para o rabo
    const n = game.snake.length, pad = cell * .07;
    for (let i = n - 1; i >= 0; i--) {
      const p = game.snake[i];
      ctx.globalAlpha = 1 - .65 * (i / n);
      ctx.fillStyle = i === 0 && game.status === 'dead' ? color.apple : color.ink;
      ctx.beginPath();
      ctx.roundRect(p.x * cell + pad, p.y * cell + pad, cell - 2 * pad, cell - 2 * pad, cell * .28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // olhos
    const h = game.snake[0], d = DIRS[game.dir];
    ctx.fillStyle = color.board;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        (h.x + .5 + d.x * .12 - d.y * k * .18) * cell,
        (h.y + .5 + d.y * .12 + d.x * k * .18) * cell,
        cell * .07, 0, TAU,
      );
      ctx.fill();
    }
  }

  return { draw };
}
