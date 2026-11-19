// Lógica pura: não conhece canvas, DOM nem storage.
import { GRID, DIRS, OPPOSITE, MIN_MS, SPEEDUP_EVERY, SPEEDUP_MS } from './config.js';

const same = (a, b) => a.x === b.x && a.y === b.y;

export function createGame({ walls = true } = {}, rng = Math.random) {
  const m = GRID >> 1;
  const game = {
    snake: [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }],
    dir: 'right',
    queue: [],          // curvas pendentes (máx. 2)
    apple: null,
    score: 0,
    walls,              // true: parede mata / false: atravessa
    status: 'running',  // running | dead | won
  };
  game.apple = spawnApple(game, rng);
  return game;
}

export function spawnApple(game, rng = Math.random) {
  const taken = new Set(game.snake.map((p) => p.y * GRID + p.x));
  const free = [];
  for (let i = 0; i < GRID * GRID; i++) {
    if (!taken.has(i)) free.push({ x: i % GRID, y: (i / GRID) | 0 });
  }
  return free.length ? free[Math.floor(rng() * free.length)] : null;
}

// Enfileira a curva, ignorando repetição e 180° (considerando a curva anterior da fila).
export function queueTurn(game, dir) {
  const last = game.queue.at(-1) ?? game.dir;
  if (dir === last || dir === OPPOSITE[last] || game.queue.length >= 2) return;
  game.queue.push(dir);
}

// Avança um passo. Retorna: 'moved' | 'ate' | 'dead' | 'won'.
export function step(game, rng = Math.random) {
  if (game.status !== 'running') return game.status;
  if (game.queue.length) game.dir = game.queue.shift();

  const { x: dx, y: dy } = DIRS[game.dir];
  let x = game.snake[0].x + dx;
  let y = game.snake[0].y + dy;

  if (game.walls) {
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return (game.status = 'dead');
  } else {
    x = (x + GRID) % GRID;
    y = (y + GRID) % GRID;
  }

  const head = { x, y };
  const eating = same(head, game.apple);
  // Se não comeu, a ponta do rabo sai do lugar neste passo, então pode ser pisada.
  const body = eating ? game.snake : game.snake.slice(0, -1);
  if (body.some((p) => same(p, head))) return (game.status = 'dead');

  game.snake.unshift(head);
  if (!eating) {
    game.snake.pop();
    return 'moved';
  }

  game.score++;
  game.apple = spawnApple(game, rng);
  return game.apple ? 'ate' : (game.status = 'won');
}

// Intervalo entre passos: acelera aos poucos conforme a pontuação.
export const tickMs = (base, score) =>
  Math.max(MIN_MS, base - Math.floor(score / SPEEDUP_EVERY) * SPEEDUP_MS);
