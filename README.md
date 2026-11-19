# Snake

Um jogo da cobrinha minimalista, feito em JavaScript puro, que roda direto no navegador e guarda os seus recordes.

Sem frameworks, sem build, sem backend: abra no GitHub Pages e jogue.

> Demo: `https://<seu-usuario>.github.io/<repositorio>/`

---

## A proposta

Este projeto nasceu com três objetivos:

1. **Ser simples de verdade.** Um jogo que dá para ler do início ao fim em uma tarde. Nenhuma dependência, nenhuma etapa de compilação.
2. **Ser bonito sem ser enfeitado.** Visual monocromático em que a cobra é feita de tinta e a maçã é a única cor da tela. Tudo o que não ajuda a jogar foi cortado.
3. **Servir de base de estudo.** O código separa regras, desenho, entrada, armazenamento e interface em módulos pequenos, com responsabilidades claras. É um bom ponto de partida para quem quer aprender a estruturar um jogo em JavaScript.

O foco é a experiência **single player**: abrir, jogar, tentar bater o próprio recorde.

---

## Como jogar

Conduza a cobra até a maçã. Cada maçã comida vale 1 ponto e faz a cobra crescer. A partida termina quando ela bate nela mesma ou, com as paredes ligadas, na borda do tabuleiro. Se a cobra preencher o tabuleiro inteiro, você vence.

### Controles

| Ação | Teclado | Celular |
| --- | --- | --- |
| Mover | Setas ou `W` `A` `S` `D` | Deslizar o dedo na tela |
| Começar, pausar e continuar | `Espaço` ou `Enter` | Botão na tela |
| Pausar e continuar | `P` ou `Esc` | Botão na tela |

Detalhes que ajudam na jogabilidade:

- Dá para encadear duas curvas rápidas dentro do mesmo passo. Elas entram numa fila e são executadas em ordem.
- Virar 180° (por exemplo, de direita para esquerda) é ignorado, então apertar duas teclas ao mesmo tempo não derruba a cobra por acidente.
- O jogo pausa sozinho se você trocar de aba ou minimizar o navegador.
- Depois de perder, o reinício por teclado só responde após 0,4 s, para que um toque de tecla no susto não comece outra partida.

---

## Modos de jogo

Antes de cada partida você escolhe duas coisas no menu.

### Dificuldade

| Dificuldade | Intervalo inicial entre passos |
| --- | --- |
| Fácil | 150 ms |
| Normal | 110 ms |
| Difícil | 75 ms |

Em qualquer dificuldade o jogo acelera aos poucos: a cada 5 maçãs, o intervalo diminui 4 ms, até o limite de 50 ms.

### Paredes

- **Paredes: sim.** Bater na borda encerra a partida.
- **Paredes: não.** A cobra atravessa a borda e reaparece do lado oposto. Só o próprio corpo é um perigo.

---

## Recordes e dados salvos

Tudo é guardado no `localStorage` do navegador, na chave `snake:v1`. Não há conta, servidor nem rastreamento.

O que é salvo:

- **Recorde por modo.** Cada combinação de dificuldade e paredes tem o seu próprio recorde, para que uma vitória no fácil não "esconda" uma boa partida no difícil.
- **Total de maçãs comidas** e **partidas jogadas**, somando todas as sessões.
- **Suas configurações** (dificuldade e paredes), que voltam do jeito que você deixou.

Formato dos dados:

```json
{
  "v": 1,
  "totalApples": 42,
  "gamesPlayed": 6,
  "best": { "normal:walls": 12, "hard:wrap": 7 },
  "settings": { "difficulty": "normal", "walls": true }
}
```

Algumas observações:

- Os dados ficam **por navegador e por dispositivo**. Jogar no celular e no computador gera recordes separados.
- Limpar os dados do site apaga os recordes.
- Se o `localStorage` estiver indisponível (por exemplo, em algumas janelas anônimas), o jogo continua funcionando normalmente, apenas sem salvar.
- O campo `v` identifica a versão do formato, o que permite migrar os dados no futuro sem perder o que já foi salvo.

---

## Tecnologias e decisões

| Escolha | Por quê |
| --- | --- |
| **JavaScript puro** | O jogo é pequeno. Um framework traria mais peso do que benefício. |
| **HTML5 Canvas** | Ferramenta certa para um tabuleiro em grade: leve e fácil de desenhar. |
| **ES Modules** | Permitem dividir o código em arquivos sem precisar de bundler. |
| **`localStorage`** | Persistência suficiente para recordes locais, sem backend. |
| **CSS com variáveis** | Os mesmos tokens de cor alimentam a página e o canvas, e o tema claro ou escuro segue o sistema. |
| **GitHub Pages** | Hospedagem estática e gratuita. Basta publicar os arquivos como estão. |

---

## Estrutura do projeto

```
snake/
├── index.html
├── css/
│   └── style.css      # tema, layout e componentes
├── src/
│   ├── main.js        # game loop e fases (menu, jogando, pausado, fim)
│   ├── config.js      # constantes: grade, velocidades, chave do storage
│   ├── game.js        # regras: estado, passo, colisões, maçã
│   ├── renderer.js    # desenho no canvas
│   ├── input.js       # teclado e deslize
│   ├── storage.js     # leitura e escrita no localStorage
│   └── ui.js          # HUD, menu e mensagens
└── README.md
```

### Como as peças se conectam

```
input.js ──► main.js ──► game.js        regras e estado
                │
                ├──► renderer.js        desenha o estado no canvas
                ├──► ui.js              HUD e menus
                └──► storage.js         recordes e configurações
```

O `main.js` é o único módulo que conhece todos os outros. Os demais não dependem entre si.

### Decisões de arquitetura

- **Lógica separada do desenho.** O `game.js` não sabe que existe um canvas, um DOM ou um storage. Ele recebe uma direção e atualiza o estado. Isso facilita testar, depurar e trocar o visual sem mexer nas regras. O gerador de números aleatórios é injetável, então as partidas podem ser reproduzidas em testes.
- **Passo fixo no game loop.** O desenho acontece a cada frame (`requestAnimationFrame`), mas a cobra só anda quando um acumulador de tempo atinge o intervalo da dificuldade. Assim a velocidade não depende da taxa de atualização do monitor. O tempo entre frames é limitado a 100 ms para evitar saltos ao voltar de outra aba.
- **Fila de entrada.** As curvas são enfileiradas (no máximo 2) e consumidas uma por passo. Isso resolve dois problemas clássicos: a curva "perdida" quando se aperta rápido demais e a morte por 180° acidental.
- **Rabo livre.** Quando a cobra não come, a ponta do rabo sai do lugar no mesmo passo, então a cabeça pode ocupar essa célula sem colidir. Quando come, o rabo fica e a colisão é considerada.
- **Maçã sempre válida.** A maçã é sorteada apenas entre as células livres. Quando não sobra nenhuma, a partida termina em vitória.
- **Fases explícitas.** O jogo é uma pequena máquina de estados (`menu`, `playing`, `paused`, `over`), o que evita condições espalhadas pelo código.
- **Armazenamento isolado.** Toda leitura e escrita passa pelo `storage.js`, com `try/catch` e validação dos dados lidos. Um valor corrompido nunca derruba o jogo.

---

## Rodando localmente

Os ES Modules não funcionam ao abrir o `index.html` direto no navegador (`file://`). Use um servidor estático:

```bash
npx serve .
```

Ou use a extensão **Live Server** do VS Code.

## Publicando no GitHub Pages

1. Envie os arquivos para um repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, com a branch `main` e a pasta `/ (root)`.
4. Aguarde alguns instantes. O endereço aparece na própria página de configuração.

---

## Personalizando

A maior parte dos ajustes está em `src/config.js`:

| Constante | O que controla |
| --- | --- |
| `GRID` | Tamanho do tabuleiro (células por lado) |
| `SPEEDS` | Intervalo inicial de cada dificuldade, em ms |
| `MIN_MS` | Velocidade máxima, ou seja, o menor intervalo possível |
| `SPEEDUP_EVERY` e `SPEEDUP_MS` | Quantas maçãs para acelerar e quanto acelera |
| `STORAGE_KEY` | Chave usada no `localStorage` |

As cores ficam nas variáveis do início de `css/style.css`. O canvas lê esses mesmos valores, então mudar uma cor ali atualiza a página e o tabuleiro juntos.

---

## Ideias para o futuro

Nada disso é necessário para o jogo funcionar, mas são evoluções naturais:

- Efeitos sonoros com opção de silenciar.
- Controles direcionais na tela para quem não gosta de deslizar.
- Mais temas de cor.
- Testes automatizados para o `game.js` (por exemplo, com Vitest).
- Migração para Vite e TypeScript, se o projeto crescer.
- Ranking global, o que exigiria um serviço externo como Supabase ou Firebase.
