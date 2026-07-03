# Game routes

The canonical public pattern is:

```text
https://frankiejvaldez.com/games/<lowercase-game-slug>/
```

Each canonical route uses the `game` layout to present an independently
deployed GitHub Pages game without moving the portfolio's custom domain.
Mixed-case requests are normalized by `404.html`. Exact title-case aliases are
generated from source files under `aliases/` for old or shared links.

## Add a game

1. Publish the game repository at `https://frankstop.github.io/<RepoName>/`.
2. Add its metadata to `_data/games.yml`.
3. Add `games/<lowercase-game-slug>/index.html` using the `game` layout.
4. Add an exact title-case alias under `aliases/` with a
   `/Games/<RepoName>/` permalink.
5. Verify the canonical, title-case, and mixed-case URLs after Pages deploys.

## Deferred

Build `/games/` as a proper landing page once the first set of game routes is
settled. Until then, game URLs are intentionally direct links.
