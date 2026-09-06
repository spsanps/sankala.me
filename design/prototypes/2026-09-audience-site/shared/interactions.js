// These static prototypes work from file:// as well as a local web server.
// Forms never send or store an address. Platform links lead to existing work.
const filterButtons = document.querySelectorAll("[data-filter]");
const entries = document.querySelectorAll("[data-kind]");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    let count = 0;
    entries.forEach((entry) => {
      const visible = filter === "all" || entry.dataset.kind === filter;
      entry.hidden = !visible;
      if (visible) count += 1;
    });
    const status = document.querySelector("[data-filter-count]");
    if (status)
      status.textContent = `${count} ${count === 1 ? "piece" : "pieces"} shown`;
  });
});

document.querySelectorAll("[data-preview-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector('[role="status"]').textContent =
      "Preview only — nothing was submitted. The free newsletter has not been created yet.";
    form.reset();
  });
});

const previewSelect = document.querySelector("[data-preview-select]");
const previewFrame = document.querySelector("[data-preview-frame]");
const openPreview = document.querySelector("[data-open-preview]");
if (previewSelect && previewFrame) {
  previewSelect.addEventListener("change", () => {
    previewFrame.src = previewSelect.value;
    previewFrame.title = `Website prototype: ${previewSelect.selectedOptions[0].textContent}`;
    if (openPreview) openPreview.href = previewSelect.value;
  });
}

document.querySelectorAll("[data-device-button]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-device-button]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    document.querySelector("[data-preview-stage]").dataset.device =
      button.dataset.deviceButton;
  });
});
