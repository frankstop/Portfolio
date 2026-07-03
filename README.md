# Frank Valdez Portfolio

A multi-page experimental portfolio built from custom browser graphics, shared Jekyll components, and independently deployed GitHub projects.

The site treats the portfolio as a composition layer: other repositories can become live visual and interactive parts of the experience instead of appearing only as screenshots or outbound links.

**[Explore the live website](https://frankiejvaldez.com/)**

## Interactive Experiences

| Page | Experience | How it works |
| --- | --- | --- |
| **Home** | Particle vortex | An HTML canvas renders 12,000 particles moving through four mathematical vortex fields in a continuous animation loop. |
| **Skills** | Fireworks display | A full-window canvas creates launches, trails, explosions, and a generated star field. It scales for high-density displays and adapts when reduced motion is preferred. |
| **Projects** | Live Matrix Rain background | The independently deployed [MatrixRain](https://github.com/frankstop/MatrixRain) project is embedded as the page's animated hero background. |
| **Projects** | In-page project previews | A reusable modal loads deployed applications on demand, allowing visitors to explore them without leaving the portfolio. |
| **About** | Live resume viewer | The separately deployed [Resume](https://github.com/frankstop/Resume) site is embedded directly into an accessible modal. |

## Cross-Repository Composition

The portfolio can use independently maintained GitHub Pages sites as components:

- **MatrixRain** provides the animated environment behind the Projects heading.
- **Resume** supplies the live document shown in the About page's resume viewer.
- **Project previews** load deployed applications inside a shared iframe-based modal.

Each project remains independently deployable while the portfolio brings them together into one experience.

## Site Architecture

```text
Portfolio/
├── _includes/
│   ├── header.html        # Shared responsive navigation
│   └── footer.html        # Shared site footer
├── _layouts/
│   └── game.html          # Full-screen wrapper for independently deployed games
├── games/
│   └── <game>/index.html  # Lowercase canonical game routes
├── aliases/
│   └── <game>.html        # Title-case compatibility aliases
├── assets/js/
│   └── navigation.js     # Mobile menu and keyboard behavior
├── 404.html               # Mixed-case game-route normalization
├── index.html             # Canvas vortex
├── skills.html            # Canvas fireworks
├── projects.html          # MatrixRain hero and live previews
├── about.html             # Embedded resume viewer
├── experience.html
├── education.html
├── contact.html
└── gala-fresh.html        # Purpose-built case-study page
```

GitHub Pages processes the shared header and footer through Jekyll includes. Individual pages remain free to define their own visual systems and interactive behavior.

Games keep their own repositories and deployments. The portfolio exposes them
at lowercase canonical URLs such as
`https://frankiejvaldez.com/games/metrodash/`; title-case and mixed-case links
normalize to the same route. See [`docs/GAMES.md`](docs/GAMES.md) for the
small add-a-game checklist.

## Technology

- HTML5 and CSS3
- Vanilla JavaScript
- Canvas 2D API
- Tailwind CSS
- Jekyll and Liquid includes
- Responsive iframe integrations
- GitHub Pages
- Google Fonts

## Interaction and Accessibility

- Escape-key dismissal for responsive navigation and modal dialogs
- Focus placement for opened dialogs and focus return in the resume viewer
- Responsive navigation shared across the site
- Reduced-motion adaptation for the fireworks effect
- High-density display scaling for canvas graphics
- Lazy-loaded external experiences
- Descriptive iframe titles and decorative-background isolation

## Local Development

The pages use Jekyll includes, so preview the site through Jekyll rather than opening the HTML files directly:

```bash
jekyll serve
```

Then visit `http://localhost:4000`.

Changes pushed to `main` are published through GitHub Pages at [frankiejvaldez.com](https://frankiejvaldez.com/).
