# Snake

Jogo da cobrinha em JavaScript puro (Canvas + ES Modules), sem build.

## Rodar localmente
ES Modules não funcionam via `file://`. Use um servidor estático:

```
npx serve .
```

ou a extensão Live Server do VS Code.

## Publicar no GitHub Pages
Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Estrutura
- `src/game.js` lógica pura (estado, passo, colisões, maçã)
- `src/renderer.js` desenho no canvas
- `src/input.js` teclado e deslize
- `src/storage.js` recordes e configurações no `localStorage` (`snake:v1`)
- `src/ui.js` HUD e menus
- `src/main.js` game loop e fases (menu, jogando, pausado, fim)
