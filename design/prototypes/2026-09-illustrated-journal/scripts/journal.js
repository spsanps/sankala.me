const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Keep scroll native. Only the small reading-progress rule follows the scroll.
let scrollQueued = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty(
    "--read-progress",
    `${distance > 0 ? Math.min(100, (window.scrollY / distance) * 100) : 0}%`,
  );
  scrollQueued = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true },
);
updateProgress();

// The cover tilts very slightly with a fine pointer; it never blocks navigation.
const stage = document.querySelector("[data-paper-stage]");
if (stage && window.matchMedia("(pointer: fine)").matches) {
  let stageFrame = 0;
  stage.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cancelAnimationFrame(stageFrame);
    stageFrame = requestAnimationFrame(() => {
      stage.style.setProperty("--tilt-y", `${x * 3}deg`);
      stage.style.setProperty("--tilt-x", `${-y * 2}deg`);
    });
  });
  stage.addEventListener("pointerleave", () => {
    cancelAnimationFrame(stageFrame);
    stage.style.setProperty("--tilt-x", "0deg");
    stage.style.setProperty("--tilt-y", "0deg");
  });
}

document.querySelectorAll("[data-body-figure]").forEach((figure) => {
  let signalTimer;
  figure.querySelectorAll("[data-body-count]").forEach((button) => {
    button.addEventListener("click", () => {
      const count = Number(button.dataset.bodyCount);
      figure
        .querySelectorAll("[data-body-count]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      figure.querySelectorAll("[data-machine]").forEach((machine, index) => {
        machine.hidden = index >= count;
      });
      figure.querySelector("[data-body-status]").textContent =
        `1 model → ${count} ${count === 1 ? "body" : "bodies"}`;
      clearTimeout(signalTimer);
      figure.classList.remove("is-updating");
      if (!reducedMotion.matches) {
        requestAnimationFrame(() => figure.classList.add("is-updating"));
        signalTimer = setTimeout(
          () => figure.classList.remove("is-updating"),
          1000,
        );
      }
    });
  });
});

// The sky uses 33 actual rendered frames. Load the other frames near the section,
// and let the reader move them with a native, keyboard-operable range control.
document.querySelectorAll("[data-sky-view]").forEach((figure) => {
  const slider = figure.querySelector("[data-sky-slider]");
  const image = figure.querySelector("[data-sky-image]");
  const output = figure.querySelector("[data-sky-output]");
  const angle = figure.querySelector("[data-sky-angle]");
  const descriptions = Array.from({ length: 33 }, (_, index) =>
    index === 0
      ? "Street level"
      : index === 32
        ? "The world overhead"
        : `Tilting upward, view ${index + 1} of 33`,
  );
  const source = (index) =>
    `${slider.dataset.frameBase}${String(index).padStart(2, "0")}.webp`;
  let latestRequest = 0;
  slider.addEventListener("input", () => {
    const index = Number(slider.value);
    const request = ++latestRequest;
    const next = new Image();
    next.src = source(index);
    // Keep the previous frame visible until the requested one is ready.
    next
      .decode()
      .then(() => {
        if (request !== latestRequest) return;
        image.src = next.src;
        image.alt = `${descriptions[index]} inside Another Sky, a cylindrical space habitat.`;
        output.textContent =
          index === 0
            ? "Ground"
            : index === 32
              ? "Overhead"
              : `View ${index + 1}`;
        angle.textContent = `${String(index + 1).padStart(2, "0")} / ${index === 0 ? "GROUND" : index === 32 ? "OVERHEAD" : "LOOKING UP"}`;
      })
      .catch(() => {
        output.textContent = "View unavailable";
      });
    slider.setAttribute("aria-valuetext", descriptions[index]);
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          for (let i = 1; i <= 32; i++) {
            const next = new Image();
            next.src = source(i);
          }
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(figure);
  }
});

const search = document.querySelector("[data-search-input]");
const filterButtons = document.querySelectorAll("[data-filter]");
const works = document.querySelectorAll("[data-work]");
if (search && works.length) {
  const allowed = ["all", "essays", "films", "worlds", "research"];
  const initial = new URLSearchParams(location.search).get("view");
  let activeFilter = allowed.includes(initial) ? initial : "all";
  const reset = document.querySelector("[data-reset]");
  const applyFilter = () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    works.forEach((work) => {
      const visible =
        (activeFilter === "all" ||
          work.dataset.formats.split(" ").includes(activeFilter)) &&
        (!query || work.dataset.search.includes(query));
      work.hidden = !visible;
      if (visible) count++;
    });
    filterButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === activeFilter),
      ),
    );
    document.querySelector("[data-result-count]").textContent =
      `${count} ${count === 1 ? "piece" : "pieces"}`;
    document.querySelector("[data-empty]").hidden = count > 0;
    reset.hidden = !query && activeFilter === "all";
  };
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      applyFilter();
    }),
  );
  search.addEventListener("input", applyFilter);
  reset.addEventListener("click", () => {
    activeFilter = "all";
    search.value = "";
    applyFilter();
    search.focus();
  });
  applyFilter();
}

// Native details provides a working mobile menu and timeline without JavaScript.
document.querySelectorAll(".mobile-menu").forEach((menu) => {
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.open = false;
    }),
  );
});
