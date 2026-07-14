import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("project controls use same-tab navigation and JulyDataProject uses its first-party route", async () => {
  const [projectsData, projectsPage] = await Promise.all([
    readFile(new URL("_data/projects.yml", root), "utf8"),
    readFile(new URL("projects.html", root), "utf8")
  ]);

  assert.match(
    projectsData,
    /repo_redirect_url: https:\/\/frankiejvaldez\.com\/projects\/july-data-project\//
  );
  assert.match(
    projectsData,
    /- slug: kingkullenresearch[\s\S]*?live_url: https:\/\/frankstop\.github\.io\/KingKullenResearch\/[\s\S]*?repo_url: https:\/\/github\.com\/frankstop\/KingKullenResearch/
  );
  assert.ok(projectsPage.includes("project.repo_redirect_url | default: project.repo_url"));
  assert.equal((projectsPage.match(/target="_self"/g) || []).length, 3);
  assert.doesNotMatch(projectsPage, /target="_blank"/);
});

test("every published project has a first-party wrapper route", async () => {
  const projectsData = await readFile(new URL("_data/projects.yml", root), "utf8");
  const publishedSlugs = projectsData
    .split(/\n(?=- slug: )/)
    .filter((project) => /\n  published: true\n/.test(project))
    .map((project) => project.match(/^- slug: ([^\n]+)/)?.[1]);

  assert.ok(publishedSlugs.includes("kingkullenresearch"));
  await Promise.all(
    publishedSlugs.map((slug) => access(new URL(`projects/${slug}/index.html`, root)))
  );
});
