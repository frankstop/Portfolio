(function (window, document) {
  "use strict";

  const ALLOWED_PARAMETERS = new Set([
    "certificate_name",
    "game_name",
    "link_type",
    "method",
    "page_path",
    "placement",
    "project_name"
  ]);

  function sanitizeParameters(parameters) {
    return Object.fromEntries(
      Object.entries(parameters || {}).filter(([name, value]) => {
        return ALLOWED_PARAMETERS.has(name) &&
          ["string", "number", "boolean"].includes(typeof value);
      })
    );
  }

  function track(eventName, parameters) {
    if (typeof eventName !== "string" || !eventName || typeof window.gtag !== "function") {
      return false;
    }

    try {
      window.gtag("event", eventName, sanitizeParameters(parameters));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function parametersFromElement(element) {
    const parameters = {};

    for (const attribute of element.attributes) {
      if (!attribute.name.startsWith("data-analytics-") ||
          attribute.name === "data-analytics-event") {
        continue;
      }

      const parameterName = attribute.name
        .slice("data-analytics-".length)
        .replaceAll("-", "_");

      if (ALLOWED_PARAMETERS.has(parameterName)) {
        parameters[parameterName] = attribute.value;
      }
    }

    return parameters;
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest?.("[data-analytics-event]");
    if (!target) return;

    track(
      target.getAttribute("data-analytics-event"),
      parametersFromElement(target)
    );
  });

  window.portfolioAnalytics = Object.freeze({ track });

  const pageEvent = document.body?.getAttribute("data-analytics-page-event");
  if (pageEvent) {
    track(pageEvent, { page_path: window.location.pathname });
  }
}(window, document));
