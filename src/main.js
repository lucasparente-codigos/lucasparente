import { SPEEDS } from './config.js';
import { createGame, queueTurn, step, tickMs } from './game.js';
import { createRenderer } from './renderer.js';
import { bindInput } from './input.js';
import * as store from './storage.js';
import * as ui from './ui.js';

const data = store.load();
const renderer = createRenderer(document.getElementById('canvas'));

let game;
let phase = 'menu'; // menu | playing | paused | over
let acc = 0, last = performance.now(), overAt = 0;

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const apples = (n) => count(n, 'maçã', 'maçãs');
const best = () => data.best[store.modeKey(data.settings)] ?? 0;
const totals = () => data.gamesPlayed
  ? `Total: ${apples(data.totalApples)} em ${count(data.gamesPlayed, 'partida', 'partidas')}.`
  : '';

function hud(animate = false) {
  ui.setScore(game.score, animate);
  ui.setBest(Math.max(best(), game.score));
}
function fresh() {
  game = createGame(data.settings);
  hud();
}

function showMenu() {
  ui.show({ title: 'Snake', text: 'Setas, WASD ou deslize na tela.', button: 'Jogar', options: true, totals: totals() });
}
function start() {
  fresh();
  phase = 'playing';
  acc = 0;
  ui.hide();
}
function pause() {
  phase = 'paused';
  ui.show({ title: 'Pausado', text: 'Espaço ou P para continuar.', button: 'Continuar' });
}
function resume() {
  phase = 'playing';
  acc = 0;
  ui.hide();
}
const togglePause = () => (phase === 'playing' ? pause() : phase === 'paused' ? resume() : undefined);

function finish() {
  phase = 'over';
  overAt = performance.now();
  const prev = best();
  const record = game.score > prev;
  if (record) data.best[store.modeKey(data.settings)] = game.score;
  data.totalApples += game.score;
  data.gamesPlayed++;
  store.save(data);
  hud();
  ui.show({
    title: game.status === 'won' ? 'Você venceu!' : 'Fim de jogo',
    text: record ? `${apples(game.score)}. Novo recorde!` : `${apples(game.score)}. Seu recorde é ${prev}.`,
    button: 'Jogar de novo',
    options: true,
    totals: totals(),
  });
}

// Passo fixo: a lógica anda a cada `ms`, o desenho roda a cada frame.
function frame(t) {
  const dt = Math.min(t - last, 100);
  last = t;

  if (phase === 'playing') {
    acc += dt;
    const ms = tickMs(SPEEDS[data.settings.difficulty], game.score);
    while (acc >= ms && phase === 'playing') {
      acc -= ms;
      const result = step(game);
      if (result === 'ate') hud(true);
      else if (result === 'dead' || result === 'won') finish();
    }
  }

  renderer.draw(game, t);
  requestAnimationFrame(frame);
}

bindInput(document.getElementById('board'), {
  onTurn: (dir) => phase === 'playing' && queueTurn(game, dir),
  onPause: togglePause,
  onPrimary: () => {
    if (phase === 'playing' || phase === 'paused') return togglePause();
    if (performance.now() - overAt > 400) start(); // evita reiniciar sem querer ao bater
  },
});

ui.bind({
  onPlay: () => (phase === 'paused' ? resume() : start()),
  onSettings: (patch) => {
    Object.assign(data.settings, patch);
    store.save(data);
    ui.renderSettings(data.settings);
    fresh();
  },
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && phase === 'playing') pause();
});

ui.renderSettings(data.settings);
fresh();
showMenu();
requestAnimationFrame(frame);
