# Game routes

The canonical public pattern is:

```text
https://frankiejvaldez.com/games/<lowercase-game-slug>/
```

Each canonical route uses the `game` layout to present an independently
deployed GitHub Pages game without moving the portfolio's custom domain.
Title-case and mixed-case requests are normalized by `404.html`.

## Add a game

1. Publish the game repository at `https://frankstop.github.io/<RepoName>/`.
2. Add its metadata to `_data/games.yml`.
3. Add `games/<lowercase-game-slug>/index.html` using the `game` layout.
4. Verify the canonical, title-case, and mixed-case URLs after Pages deploys.

## Catalog

`/games/` renders the public catalog from `_data/games.yml`. Each entry supplies
its canonical slug, deployed game URL, screenshot, description, and display
position. The same metadata drives route normalization and sitemap entries.
