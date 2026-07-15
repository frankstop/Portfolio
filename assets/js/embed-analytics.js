(function (window, document) {
  "use strict";

  // Shared analytics for game pages embedded on frankiejvaldez.com.
  // Each game loads this file with one synchronous script tag before its own
  // scripts, instead of carrying its own gtag snippet.
  //
  // Event contract:
  //   game_start { game_name }
  //   game_end   { game_name, outcome: win|lose|complete|quit, score, duration_seconds }
  //
  // send_page_view stays enabled: each embedded page is a real document on
  // frankstop.github.io, distinguishable from portfolio page_views by hostname.
  // Leaving the page or backgrounding the tab mid-run reports outcome "quit";
  // a run that already ended reports nothing further.

  const MEASUREMENT_ID = "G-RSVR6Y389R";

  const ALLOWED_PARAMETERS = new Set([
    "duration_seconds",
    "game_name",
    "link_type",
    "method",
    "outcome",
    "page_path",
    "placement",
    "score"
  ]);

  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const loader = document.createElement("script");
    loader.async = true;
    loader.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(loader);
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  if (!window.__embedAnalyticsConfigured) {
    window.__embedAnalyticsConfigured = true;
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      anonymize_ip: true,
      page_title: document.title,
      page_path: window.location.pathname,
      page_location: window.location.origin + window.location.pathname
    });
  }

  function sanitizeParameters(parameters) {
    return Object.fromEntries(
      Object.entries(parameters || {}).filter(([name, value]) => {
        return ALLOWED_PARAMETERS.has(name) &&
          ["string", "number", "boolean"].includes(typeof value);
      })
    );
  }

  function send(eventName, parameters) {
    if (typeof eventName !== "string" || !eventName || typeof window.gtag !== "function") {
      return false;
    }

    try {
      window.gtag("event", eventName, parameters);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function track(eventName, parameters) {
    return send(eventName, sanitizeParameters(parameters));
  }

  let runGameName = null;
  let runStartMs = 0;
  let runEnded = true;
  let runGetScore = null;

  function currentScore(explicitScore) {
    if (explicitScore !== undefined) {
      return explicitScore;
    }

    if (typeof runGetScore === "function") {
      try {
        return runGetScore();
      } catch (_error) {
        return undefined;
      }
    }

    return undefined;
  }

  function startRun(gameName, getScore) {
    if (typeof gameName !== "string" || !gameName) {
      return false;
    }

    runGameName = gameName;
    runStartMs = Date.now();
    runEnded = false;
    runGetScore = typeof getScore === "function" ? getScore : null;
    return track("game_start", { game_name: gameName });
  }

  function finishRun(outcome, score, useBeacon) {
    if (!runGameName || runEnded) {
      return false;
    }

    runEnded = true;
    const parameters = sanitizeParameters({
      game_name: runGameName,
      outcome,
      score: currentScore(score),
      duration_seconds: Math.round((Date.now() - runStartMs) / 1000)
    });

    if (useBeacon) {
      parameters.transport_type = "beacon";
    }

    return send("game_end", parameters);
  }

  function endRun(outcome, score) {
    return finishRun(outcome, score, false);
  }

  function flushQuit() {
    finishRun("quit", undefined, true);
  }

  window.addEventListener("pagehide", flushQuit);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushQuit();
    }
  });

  window.embedAnalytics = Object.freeze({ track, startRun, endRun });
}(window, document));
