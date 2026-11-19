export const GRID = 20;                                   // células por lado
export const SPEEDS = { easy: 150, normal: 110, hard: 75 }; // ms por passo
export const MIN_MS = 50;                                 // limite de velocidade
export const SPEEDUP_EVERY = 5;                           // a cada N maçãs...
export const SPEEDUP_MS = 4;                              // ...ganha esse tanto de velocidade
export const STORAGE_KEY = 'snake:v1';

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
