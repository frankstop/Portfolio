import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the hidden resume route redirects to the published resume", async () => {
  const [route, header, sitemap] = await Promise.all([
    readFile(new URL("resume/index.html", root), "utf8"),
    readFile(new URL("_includes/header.html", root), "utf8"),
    readFile(new URL("sitemap.xml", root), "utf8")
  ]);

  assert.match(route, /^---\npermalink: \/resume\/\n---/);
  assert.match(
    route,
    /window\.location\.replace\(destination\.href\)/
  );
  assert.ok(route.includes("https://frankstop.github.io/Resume/"));
  assert.ok(!header.includes("/resume"));
  assert.ok(!sitemap.includes("/resume"));
});
