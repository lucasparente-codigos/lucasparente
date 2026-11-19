import { STORAGE_KEY, SPEEDS } from './config.js';

const defaults = () => ({
  v: 1,
  totalApples: 0,
  gamesPlayed: 0,
  best: {}, // recorde por modo, ex.: { "normal:walls": 12 }
  settings: { difficulty: 'normal', walls: true },
});

// Cada combinação de dificuldade e parede tem o seu próprio recorde.
export const modeKey = ({ difficulty, walls }) => `${difficulty}:${walls ? 'walls' : 'wrap'}`;

export function load() {
  const d = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    const settings = { ...d.settings, ...raw.settings };
    if (!(settings.difficulty in SPEEDS)) settings.difficulty = d.settings.difficulty;
    settings.walls = Boolean(settings.walls);
    return {
      ...d,
      totalApples: Number(raw.totalApples) || 0,
      gamesPlayed: Number(raw.gamesPlayed) || 0,
      best: raw.best && typeof raw.best === 'object' ? raw.best : {},
      settings,
    };
  } catch {
    return d; // storage indisponível ou JSON corrompido
  }
}

export function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* modo privado ou cota cheia: o jogo segue sem salvar */
  }
}
