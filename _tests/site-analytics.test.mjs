import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const pageTemplates = [
  "404.html",
  "_layouts/game.html",
  "about.html",
  "contact.html",
  "education.html",
  "experience.html",
  "gala-fresh.html",
  "games/index.html",
  "index.html",
  "projects.html",
  "skills.html"
];
const expectedEvents = [
  "certificate_click",
  "contact_click",
  "game_open",
  "page_not_found",
  "project_link_click",
  "project_preview_open",
  "resume_view"
];

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("every public page template loads the shared analytics include once", async () => {
  for (const path of pageTemplates) {
    const html = await source(path);
    const includes = html.match(/{%\s*include analytics\.html\s*%}/g) || [];
    assert.equal(includes.length, 1, `${path} must include analytics.html once`);
  }
});

test("only the shared include contains raw gtag configuration", async () => {
  const include = await source("_includes/analytics.html");
  assert.match(include, /G-RSVR6Y389R/);
  assert.match(include, /page_title:\s*document\.title/);
  assert.match(include, /page_path:\s*window\.location\.pathname/);
  assert.match(
    include,
    /page_location:\s*window\.location\.origin \+ window\.location\.pathname/
  );

  for (const path of pageTemplates) {
    const html = await source(path);
    assert.doesNotMatch(html, /googletagmanager\.com|gtag\s*\(/, path);
  }
});

test("the source markup covers the complete event contract", async () => {
  const combinedSource = (
    await Promise.all(pageTemplates.map((path) => source(path)))
  ).join("\n");

  for (const eventName of expectedEvents) {
    assert.match(
      combinedSource,
      new RegExp(`data-analytics-(?:page-)?event=["']${eventName}["']`),
      `${eventName} must be represented in page markup`
    );
  }
});

test("all game routes use the analytics-enabled game layout", async () => {
  const games = [
    "2048",
    "metrodash",
    "minesweeper",
    "pressurematch",
    "sudoku",
    "wingsprint"
  ];

  for (const game of games) {
    assert.match(
      await source(`games/${game}/index.html`),
      /^---\nlayout: game\n/,
      `${game} must use the shared game layout`
    );
  }
});
