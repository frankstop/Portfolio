import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Shop Fair Research is published with a first-party wrapper route", async () => {
  const [projectsData, projectRoute] = await Promise.all([
    readFile(new URL("_data/projects.yml", root), "utf8"),
    readFile(new URL("projects/shopfairresearch/index.html", root), "utf8")
  ]);

  assert.match(
    projectsData,
    /- slug: shopfairresearch[\s\S]*?name: Shop Fair Research[\s\S]*?live_url: https:\/\/frankstop\.github\.io\/ShopFairResearch\/[\s\S]*?repo_url: https:\/\/github\.com\/frankstop\/ShopFairResearch[\s\S]*?published: true/
  );
  assert.match(projectRoute, /^---\nlayout: project\n/);
  assert.match(projectRoute, /project_url: https:\/\/frankstop\.github\.io\/ShopFairResearch\//);
  assert.match(projectRoute, /project_published: true/);
});
