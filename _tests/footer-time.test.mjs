import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const footerTimeSource = await readFile(
  new URL("../assets/js/footer-time.js", import.meta.url),
  "utf8"
);

test("renders the visitor's local date and time and refreshes every second", () => {
  const output = {};
  let intervalCallback;
  let intervalDelay;
  let visibilityHandler;

  const document = {
    hidden: false,
    querySelector: () => output,
    addEventListener(name, handler) {
      if (name === "visibilitychange") visibilityHandler = handler;
    }
  };
  const window = {
    setInterval(callback, delay) {
      intervalCallback = callback;
      intervalDelay = delay;
    }
  };

  vm.runInNewContext(footerTimeSource, { Date, Intl, document, window });

  assert.match(output.textContent, /\d/);
  assert.equal(Number.isNaN(Date.parse(output.dateTime)), false);
  assert.equal(output.title, Intl.DateTimeFormat().resolvedOptions().timeZone);
  assert.equal(intervalDelay, 1000);
  assert.equal(typeof intervalCallback, "function");
  assert.equal(typeof visibilityHandler, "function");
});

test("exits safely when the footer clock is absent", () => {
  const document = {
    querySelector: () => null
  };
  const window = {
    setInterval() {
      assert.fail("setInterval should not run without a footer clock");
    }
  };

  assert.doesNotThrow(() => {
    vm.runInNewContext(footerTimeSource, { Date, Intl, document, window });
  });
});
