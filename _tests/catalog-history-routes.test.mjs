import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

for (const [retailer, path, embeddedUrl] of [
  ["Stop & Shop", "projects/stopshopresearch/catalog-history/index.html", "https://frankstop.github.io/StopShopResearch/catalog-history.html"],
  ["King Kullen", "projects/kingkullenresearch/catalog-history/index.html", "https://frankstop.github.io/KingKullenResearch/catalog-history.html"]
]) {
  test(`${retailer} catalog history has a published portfolio wrapper`, async () => {
    const source = await readFile(new URL(path, root), "utf8");
    assert.match(source, /^---\nlayout: project\n/);
    assert.match(source, /project_published: true/);
    assert.ok(source.includes(`project_url: ${embeddedUrl}`));
    assert.match(source, /canonical_path: \/projects\/.+\/catalog-history\//);
  });
}
