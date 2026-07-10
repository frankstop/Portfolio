const http = require('http');
const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');

const engine = new Liquid({
  root: ['.', '_includes', '_layouts'],
  extname: '.html',
  dynamicPartials: false
});

// Register Jekyll filters used in the portfolio templates
engine.registerFilter('relative_url', (v) => v);

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(__dirname, urlPath);

  // Serve index.html if a directory is requested
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  // Handle HTML files (with Liquid template rendering)
  if (filePath.endsWith('.html')) {
    try {
      const { page, body } = parsePage(filePath);
      
      // Load and parse games.yml and projects.yml
      const games = parseGamesYml();
      const projects = parseProjectsYml();
      const site = { data: { games, projects } };
      
      // Render template using LiquidJS engine (supporting layout wrapping)
      let rendered;
      if (page.layout) {
        const layoutPath = path.join(__dirname, '_layouts', `${page.layout}.html`);
        if (fs.existsSync(layoutPath)) {
          const layoutContent = fs.readFileSync(layoutPath, 'utf8');
          const bodyRendered = await engine.parseAndRender(body, { page, site });
          rendered = await engine.parseAndRender(layoutContent, { page, site, content: bodyRendered });
        } else {
          rendered = await engine.parseAndRender(body, { page, site });
        }
      } else {
        rendered = await engine.parseAndRender(body, { page, site });
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(rendered);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error: ' + err.message);
    }
    return;
  }

  // Handle static assets
  const ext = path.extname(filePath);
  let contentType = 'text/plain';
  if (ext === '.css') contentType = 'text/css';
  else if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.jpeg' || ext === '.jpg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.json') contentType = 'application/json';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

// Parse Jekyll YAML Front Matter from the top of the files
function parsePage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const yaml = match[1];
    const body = match[2];
    const page = {};
    yaml.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        page[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });
    return { page, body };
  }
  return { page: {}, body: content };
}

function parseGamesYml() {
  const ymlContent = fs.readFileSync(path.join(__dirname, '_data', 'games.yml'), 'utf8');
  const games = [];
  const entries = ymlContent.split(/\r?\n\r?\n/);
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const game = {};
    const lines = entry.split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/^- /, '');
        let val = parts.slice(1).join(':').trim();
        // Remove quotes
        val = val.replace(/^['"]|['"]$/g, '');
        // Convert boolean/number
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val) && val !== '') val = Number(val);
        game[key] = val;
      }
    }
    if (Object.keys(game).length > 0) {
      games.push(game);
    }
  }
  return games;
}

function parseProjectsYml() {
  const projectsYmlPath = path.join(__dirname, '_data', 'projects.yml');
  if (!fs.existsSync(projectsYmlPath)) return [];
  const ymlContent = fs.readFileSync(projectsYmlPath, 'utf8');
  const projects = [];
  const entries = ymlContent.split(/\r?\n\r?\n/);
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const project = {};
    const lines = entry.split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/^- /, '');
        let val = parts.slice(1).join(':').trim();
        // Remove quotes
        val = val.replace(/^['"]|['"]$/g, '');
        // Convert boolean/number
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val) && val !== '') val = Number(val);
        project[key] = val;
      }
    }
    if (Object.keys(project).length > 0) {
      projects.push(project);
    }
  }
  return projects;
}

server.listen(PORT, () => {
  console.log(`Local development server running at http://localhost:${PORT}`);
});
