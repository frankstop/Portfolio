import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const embedSource = await readFile(
  new URL("../assets/js/embed-analytics.js", import.meta.url),
  "utf8"
);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadEmbed({ gtag, existingLoader = false, configuredFlag = false } = {}) {
  const appended = [];
  const documentHandlers = {};
  const windowHandlers = {};
  const document = {
    title: "Test Game",
    visibilityState: "visible",
    querySelector() {
      return existingLoader ? {} : null;
    },
    createElement(tag) {
      return { tag };
    },
    head: {
      appendChild(node) {
        appended.push(node);
      }
    },
    addEventListener(name, handler) {
      documentHandlers[name] = handler;
    }
  };
  const window = {
    location: { pathname: "/TestGame/", origin: "https://frankstop.github.io" },
    addEventListener(name, handler) {
      windowHandlers[name] = handler;
    },
    ...(configuredFlag ? { __embedAnalyticsConfigured: true } : {}),
    ...(gtag ? { gtag } : {})
  };

  vm.runInNewContext(embedSource, { document, window });
  return { window, document, appended, documentHandlers, windowHandlers };
}

test("bootstrap injects the gtag loader and config exactly once", () => {
  const calls = [];
  const { window, appended } = loadEmbed({ gtag: (...args) => calls.push(args) });

  assert.equal(appended.length, 1);
  assert.match(appended[0].src, /googletagmanager\.com\/gtag\/js\?id=G-RSVR6Y389R$/);
  assert.equal(appended[0].async, true);
  assert.equal(calls.filter(([command]) => command === "config").length, 1);
  const configCall = calls.find(([command]) => command === "config");
  assert.equal(configCall[1], "G-RSVR6Y389R");
  assert.equal(configCall[2].page_path, "/TestGame/");
  assert.equal(window.__embedAnalyticsConfigured, true);
});

test("bootstrap skips loader injection and config when already present", () => {
  const calls = [];
  const { appended } = loadEmbed({
    gtag: (...args) => calls.push(args),
    existingLoader: true,
    configuredFlag: true
  });

  assert.equal(appended.length, 0);
  assert.equal(calls.filter(([command]) => command === "config").length, 0);
});

test("bootstrap defines gtag as a dataLayer push when absent", () => {
  const { window } = loadEmbed();
  assert.equal(typeof window.gtag, "function");
  window.gtag("event", "probe");
  assert.ok(window.dataLayer.length >= 3, "js + config + probe entries expected");
});

test("track removes unapproved parameters and keeps the schema set", () => {
  const calls = [];
  const { window } = loadEmbed({ gtag: (...args) => calls.push(args) });

  assert.equal(
    window.embedAnalytics.track("game_end", {
      game_name: "TestGame",
      outcome: "win",
      score: 42,
      duration_seconds: 7,
      secret_field: "do-not-send"
    }),
    true
  );
  const eventCall = calls.find(([command]) => command === "event");
  assert.deepEqual(plain(eventCall), [
    "event",
    "game_end",
    { game_name: "TestGame", outcome: "win", score: 42, duration_seconds: 7 }
  ]);
});

test("startRun fires game_start and endRun fires one game_end with duration", () => {
  const calls = [];
  const { window } = loadEmbed({ gtag: (...args) => calls.push(args) });
  const events = () => calls.filter(([command]) => command === "event");

  assert.equal(window.embedAnalytics.startRun("TestGame"), true);
  assert.deepEqual(plain(events()[0]), ["event", "game_start", { game_name: "TestGame" }]);

  assert.equal(window.embedAnalytics.endRun("win", 42), true);
  const [, name, parameters] = events()[1];
  assert.equal(name, "game_end");
  assert.equal(parameters.outcome, "win");
  assert.equal(parameters.score, 42);
  assert.equal(typeof parameters.duration_seconds, "number");
  assert.ok(parameters.duration_seconds >= 0);

  assert.equal(window.embedAnalytics.endRun("lose"), false, "second endRun must be a no-op");
  assert.equal(events().length, 2);
});

test("pagehide sends exactly one quit beacon with the getScore value", () => {
  const calls = [];
  const { window, windowHandlers, documentHandlers, document } = loadEmbed({
    gtag: (...args) => calls.push(args)
  });
  const events = () => calls.filter(([command]) => command === "event");

  window.embedAnalytics.startRun("TestGame", () => 17);
  windowHandlers.pagehide();
  document.visibilityState = "hidden";
  documentHandlers.visibilitychange();

  const gameEnds = events().filter(([, name]) => name === "game_end");
  assert.equal(gameEnds.length, 1, "pagehide + visibilitychange must yield one quit event");
  const parameters = gameEnds[0][2];
  assert.equal(parameters.outcome, "quit");
  assert.equal(parameters.score, 17);
  assert.equal(parameters.transport_type, "beacon");
});

test("quit beacon stays silent when the run already ended", () => {
  const calls = [];
  const { window, windowHandlers } = loadEmbed({ gtag: (...args) => calls.push(args) });
  const events = () => calls.filter(([command]) => command === "event");

  window.embedAnalytics.startRun("TestGame");
  window.embedAnalytics.endRun("lose", 3);
  windowHandlers.pagehide();

  assert.equal(events().filter(([, name]) => name === "game_end").length, 1);
});

test("run helpers are safe no-ops without an active run or gtag", () => {
  const { window, windowHandlers } = loadEmbed();
  assert.equal(window.embedAnalytics.endRun("win"), false);
  windowHandlers.pagehide();
  assert.equal(window.embedAnalytics.startRun(""), false);
});
