document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.getElementById("primaryNav");
  const navLinks = document.querySelectorAll(".nav-links a");
  const progressBar = document.getElementById("progressBar");
  const backToTop = document.getElementById("backToTop");
  const yearSpan = document.getElementById("year");

  // Theme
  const savedTheme = localStorage.getItem("dpdp-theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("dpdp-theme", next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // Mobile menu
  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Active nav on scroll
  const sections = document.querySelectorAll("section[id]");

  function setActiveNav() {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 130;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  // Scroll progress + back to top
  function handleScroll() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = height > 0 ? (scrollTop / height) * 100 : 0;
    progressBar.style.width = `${scrolled}%`;

    if (scrollTop > 400) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }

    setActiveNav();
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reveal animation
  const revealItems = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  // Animated counters
  const counters = document.querySelectorAll("[data-count]");

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  // Checklist
  const checklistContainer = document.getElementById("checklistContainer");
  const checklistItems = Array.from(document.querySelectorAll(".check-item"));
  const checkboxes = checklistItems.map((item) => item.querySelector("input[type='checkbox']"));
  const progressText = document.getElementById("progressText");
  const progressPercent = document.getElementById("progressPercent");
  const checklistProgress = document.getElementById("checklistProgress");
  const ringProgress = document.getElementById("ringProgress");
  const searchInput = document.getElementById("checklistSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const emptyState = document.getElementById("emptyState");
  const resetChecklist = document.getElementById("resetChecklist");

  const STORAGE_KEY = "dpdp-checklist-state-v2";
  const CIRCUMFERENCE = 2 * Math.PI * 52;

  function loadChecklistState() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    checklistItems.forEach((item, index) => {
      const input = item.querySelector("input[type='checkbox']");
      if (saved[index]) {
        input.checked = true;
        item.classList.add("completed");
      }
    });
    updateProgress();
  }

  function saveChecklistState() {
    const state = {};
    checklistItems.forEach((item, index) => {
      const input = item.querySelector("input[type='checkbox']");
      state[index] = input.checked;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateProgress() {
    const total = checklistItems.length;
    const completed = checklistItems.filter((item) => item.classList.contains("completed")).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} of ${total} completed`;
    progressPercent.textContent = `${percent}%`;
    checklistProgress.style.width = `${percent}%`;

    const offset = CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;
    ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
    ringProgress.style.strokeDashoffset = `${offset}`;
  }

  checkboxes.forEach((box, index) => {
    box.addEventListener("change", () => {
      const item = checklistItems[index];
      item.classList.toggle("completed", box.checked);
      saveChecklistState();
      updateProgress();
    });
  });

  function filterChecklist() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
    let visibleCount = 0;

    checklistItems.forEach((item) => {
      const text = item.innerText.toLowerCase();
      const category = item.dataset.category;

      const matchesSearch = text.includes(searchTerm);
      const matchesFilter = activeFilter === "all" || category === activeFilter;

      if (matchesSearch && matchesFilter) {
        item.hidden = false;
        visibleCount++;
      } else {
        item.hidden = true;
      }
    });

    emptyState.hidden = visibleCount !== 0;
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterChecklist();
    });
  });

  searchInput.addEventListener("input", filterChecklist);

  resetChecklist.addEventListener("click", () => {
    checklistItems.forEach((item) => {
      const input = item.querySelector("input[type='checkbox']");
      input.checked = false;
      item.classList.remove("completed");
    });
    localStorage.removeItem(STORAGE_KEY);
    updateProgress();
    filterChecklist();
  });

  loadChecklistState();
  filterChecklist();

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("open");
        otherItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        otherItem.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Footer year
  yearSpan.textContent = new Date().getFullYear();
});