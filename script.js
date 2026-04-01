const revealElements = Array.from(document.querySelectorAll(".reveal"));

const markVisible = (element) => {
  const delay = element.dataset.delay;
  if (delay) {
    element.style.transitionDelay = `${delay}ms`;
  }
  element.classList.add("is-visible");
};

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealElements.forEach(markVisible);
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        markVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}
