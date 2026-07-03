import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const analyticsSource = await readFile(
  new URL("../assets/js/analytics.js", import.meta.url),
  "utf8"
);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadAnalytics({ gtag, bodyEvent, pathname = "/projects.html" } = {}) {
  let clickHandler;
  const document = {
    addEventListener(name, handler) {
      if (name === "click") clickHandler = handler;
    },
    body: {
      getAttribute(name) {
        return name === "data-analytics-page-event" ? bodyEvent || null : null;
      }
    }
  };
  const window = {
    location: { pathname },
    ...(gtag ? { gtag } : {})
  };

  vm.runInNewContext(analyticsSource, { document, window });
  return { clickHandler, window };
}

test("track is a safe no-op when gtag is unavailable", () => {
  const { window } = loadAnalytics();
  assert.equal(window.portfolioAnalytics.track("resume_view"), false);
});

test("track sends one event and removes unapproved parameters", () => {
  const calls = [];
  const { window } = loadAnalytics({
    gtag: (...args) => calls.push(args)
  });

  assert.equal(
    window.portfolioAnalytics.track("contact_click", {
      method: "email",
      placement: "homepage",
      email_address: "do-not-send@example.com",
      destination_url: "https://example.com/private"
    }),
    true
  );
  assert.deepEqual(plain(calls), [[
    "event",
    "contact_click",
    { method: "email", placement: "homepage" }
  ]]);
});

test("delegated analytics markers produce one sanitized event", () => {
  const calls = [];
  const { clickHandler } = loadAnalytics({
    gtag: (...args) => calls.push(args)
  });
  const element = {
    attributes: [
      { name: "data-analytics-event", value: "project_link_click" },
      { name: "data-analytics-project-name", value: "JobBoard" },
      { name: "data-analytics-link-type", value: "live_site" },
      { name: "data-analytics-destination-url", value: "https://example.com" }
    ],
    getAttribute(name) {
      return this.attributes.find((attribute) => attribute.name === name)?.value || null;
    }
  };

  clickHandler({ target: { closest: () => element } });

  assert.deepEqual(plain(calls), [[
    "event",
    "project_link_click",
    { project_name: "JobBoard", link_type: "live_site" }
  ]]);
});

test("page events omit query strings", () => {
  const calls = [];
  loadAnalytics({
    bodyEvent: "page_not_found",
    gtag: (...args) => calls.push(args),
    pathname: "/missing-page"
  });

  assert.deepEqual(plain(calls), [[
    "event",
    "page_not_found",
    { page_path: "/missing-page" }
  ]]);
});
