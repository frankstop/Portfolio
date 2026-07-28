(() => {
  const output = document.querySelector("[data-local-datetime]");

  if (!output) {
    return;
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function updateLocalDateTime() {
    const now = new Date();

    output.dateTime = now.toISOString();
    output.textContent = formatter.format(now);
    output.title = timeZone || "Visitor local time";
  }

  updateLocalDateTime();
  window.setInterval(updateLocalDateTime, 1000);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateLocalDateTime();
    }
  });
})();
