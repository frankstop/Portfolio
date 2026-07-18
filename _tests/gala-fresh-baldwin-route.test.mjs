import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Gala Fresh Baldwin replaces KingKullenResearch on the homepage", async () => {
  const [projectsData, projectRoute] = await Promise.all([
    readFile(new URL("_data/projects.yml", root), "utf8"),
    readFile(new URL("projects/galafreshbaldwin/index.html", root), "utf8")
  ]);

  const galaFreshPosition = Number(
    projectsData.match(/- slug: galafreshbaldwin[\s\S]*?position: (\d+)/)?.[1]
  );
  const kingKullenPosition = Number(
    projectsData.match(/- slug: kingkullenresearch[\s\S]*?position: (\d+)/)?.[1]
  );

  assert.equal(galaFreshPosition, 4);
  assert.ok(galaFreshPosition < kingKullenPosition);
  assert.match(
    projectsData,
    /- slug: galafreshbaldwin[\s\S]*?live_url: https:\/\/frankstop\.github\.io\/GalaFreshBaldwin\/[\s\S]*?repo_url: https:\/\/github\.com\/frankstop\/GalaFreshBaldwin/
  );
  assert.match(projectRoute, /project_url: https:\/\/frankstop\.github\.io\/GalaFreshBaldwin\//);
});
