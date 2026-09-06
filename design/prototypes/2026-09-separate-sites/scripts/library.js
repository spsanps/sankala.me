const form = document.querySelector("#library-filters");
if (form) {
  const topic = form.elements.namedItem("topic");
  const format = form.elements.namedItem("format");
  const search = form.elements.namedItem("q");
  const entries = [...document.querySelectorAll("[data-work]")];
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");
  const readLocation = () => {
    const params = new URLSearchParams(location.search);
    for (const field of [topic, format]) {
      const value = params.get(field.name) || "all";
      field.value = [...field.options].some((option) => option.value === value)
        ? value
        : "all";
    }
    search.value = params.get("q") || "";
  };
  const apply = (updateUrl = true) => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const entry of entries) {
      const match =
        (topic.value === "all" ||
          entry.dataset.topics.split(" ").includes(topic.value)) &&
        (format.value === "all" ||
          entry.dataset.formats.split(" ").includes(format.value)) &&
        (!query || entry.dataset.search.includes(query));
      entry.hidden = !match;
      if (match) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? "piece" : "pieces"}`;
    empty.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      for (const field of [topic, format, search]) {
        const value = field.value.trim();
        if (value && value !== "all") url.searchParams.set(field.name, value);
        else url.searchParams.delete(field.name);
      }
      try {
        history.replaceState(null, "", url);
      } catch {
        /* File previews can restrict history updates. Filtering still works. */
      }
    }
  };
  document.querySelector("[data-library-tools]").hidden = false;
  readLocation();
  apply(false);
  form.addEventListener("input", () => apply());
  form.addEventListener("change", () => apply());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    apply();
  });
  form.addEventListener("reset", () => {
    requestAnimationFrame(() => apply());
  });
  document.querySelector("[data-clear]").addEventListener("click", () => {
    form.reset();
    topic.focus();
  });
  window.addEventListener("popstate", () => {
    readLocation();
    apply(false);
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const menu = document.querySelector(".mobile-menu[open]");
  if (menu) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});
