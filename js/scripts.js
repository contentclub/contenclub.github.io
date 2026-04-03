// Functie voor het typemachine-effect
/**
 * Voert een typemachine-effect uit op een HTML-element.
 */
function typeEffect(element, text, speed = 50) {
  let i = 0;
  const textNode = document.createTextNode("");
  const cursorSpan = document.createElement("span");
  cursorSpan.classList.add("typing-cursor");

  element.innerHTML = `<span style="visibility: hidden; position: absolute;">${text}</span>`;
  element.appendChild(textNode);
  element.appendChild(cursorSpan);

  const interval = setInterval(() => {
    if (i < text.length) {
      textNode.nodeValue += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
      const hiddenSpan = element.querySelector(
        'span[style*="visibility: hidden"]',
      );
      if (hiddenSpan) {
        element.removeChild(hiddenSpan);
      }
      setTimeout(() => {
        if (element.contains(cursorSpan)) {
          element.removeChild(cursorSpan);
        }
      }, 500);
    }
  }, speed);
}

// Asynchrone functie om de header te laden
async function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    try {
      const response = await fetch("header.html");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const headerContent = await response.text();
      headerPlaceholder.innerHTML = headerContent;

      const mobileMenuButton = document.getElementById("mobile-menu-button");
      const mobileMenu = document.getElementById("mobile-menu");

      if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener("click", () => {
          mobileMenu.classList.toggle("-translate-y-full");
          mobileMenu.classList.toggle("translate-y-0");
          mobileMenuButton.classList.toggle("menu-open");
        });
      }
    } catch (error) {
      console.error("Failed to load header:", error);
    }
  }
}

// Asynchrone functie om de footer te laden
async function loadFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    try {
      const response = await fetch("footer.html");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      footerPlaceholder.innerHTML = await response.text();
    } catch (error) {
      console.error("Failed to load footer:", error);
    }
  }
}

/**
 * Hoofdfunctie die wordt uitgevoerd na het laden van de DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialiseer elementen
  const navLinks = document.querySelectorAll("nav .nav-link");
  const sections = document.querySelectorAll(".scroll-section");
  const formInputs = document.querySelectorAll("form input, form textarea");
  const blockedInfo = document.getElementById("blockedInfo");
  const afspraakInput = document.getElementById("afspraak");

  loadHeader();
  loadFooter();

  // --- NIEUW: Timer voor bedankt-pagina ---
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    let seconds = 6;
    const countdown = setInterval(() => {
      seconds--;
      timerElement.innerText = `(${seconds})`;
      if (seconds <= 0) {
        clearInterval(countdown);
        window.location.href = "index.html";
      }
    }, 1000);
  }

  // --- NIEUW: Pagina herkomst voor formulier ---
  const originInput = document.getElementById("page-origin");
  if (originInput) {
    originInput.value = window.location.href;
  }

  // 2. Navigatielink markeren
  navLinks.forEach((link) => {
    const linkHref = link
      .getAttribute("href")
      .replace(window.location.origin, "");
    const currentPath = window.location.pathname + window.location.hash;
    if (currentPath.includes(linkHref) && linkHref !== "#") {
      link.classList.add("active");
    } else if (linkHref === "/" && window.location.pathname === "/") {
      link.classList.add("active");
    }
  });

  // 3. Zwevende labels
  const toggleFloatingLabel = (input, forceActivate = false) => {
    const label = input.closest("div").querySelector("label");
    if (!label) return;
    const isActive = input.value !== "" || forceActivate;
    if (isActive) {
      label.classList.add("-top-4", "scale-75");
      label.classList.remove("top-2", "scale-100");
    } else {
      label.classList.remove("-top-4", "scale-75");
      label.classList.add("top-2", "scale-100");
    }
  };

  formInputs.forEach((input) => {
    toggleFloatingLabel(input);
    input.addEventListener("focus", () => toggleFloatingLabel(input, true));
    input.addEventListener("blur", () => toggleFloatingLabel(input));
    input.addEventListener("input", () => toggleFloatingLabel(input));
  });

  // 4. Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50% 0px",
    threshold: 0,
  };
  const observer = new IntersectionObserver((entries) => {
    const intersectingEntry = entries.find((entry) => entry.isIntersecting);
    if (intersectingEntry) {
      const entry = intersectingEntry;
      const sectionId = entry.target.id;
      const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
      navLinks.forEach((link) => link.classList.remove("active"));
      if (navLink) navLink.classList.add("active");

      if (!entry.target.classList.contains("is-visible")) {
        entry.target.classList.add("is-visible");
      }

      const titleElement = entry.target.querySelector("h2");
      const introSubtitle = document.getElementById("intro-subtitle");

      if (titleElement && !titleElement.hasAttribute("data-typed")) {
        typeEffect(titleElement, titleElement.textContent.trim());
        titleElement.setAttribute("data-typed", "true");
      } else if (
        introSubtitle &&
        entry.target.id === "intro" &&
        !introSubtitle.hasAttribute("data-typed")
      ) {
        typeEffect(introSubtitle, introSubtitle.textContent.trim());
        introSubtitle.setAttribute("data-typed", "true");
      }
    }
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // 5. Flatpickr
  if (afspraakInput) {
    const disableDates = [];
    fetch("/data/blocked-times.json")
      .then((response) => response.json())
      .then((data) => {
        const blockedDates = data.blocked || [];
        blockedDates.forEach((item) => {
          if (item.date.includes(" to ")) {
            const [start, end] = item.date.split(" to ").map((d) => d.trim());
            disableDates.push({ from: start, to: end });
          } else {
            disableDates.push(item.date);
          }
        });

        if (blockedDates.length > 0 && blockedInfo) {
          blockedInfo.innerHTML = `<p class="font-semibold mb-2">Volgende bezette dagen:</p><ul class="list-disc pl-4 space-y-1">
            ${blockedDates.map((item) => `<li><strong>${item.date}</strong>: ${item.reason || "Geen reden"}</li>`).join("")}</ul>`;
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        flatpickr(afspraakInput, {
          dateFormat: "Y-m-d",
          minDate: "today",
          disable: disableDates,
          locale: "nl",
          onClose: (sd, ds) => toggleFloatingLabel(afspraakInput),
        });
      });
  }
});

/**
 * Contentplatform Pakket Configurator
 */
const basePrice = 1000;
const totalPriceElement = document.getElementById("total-price");
const packageContainer = document.getElementById("extra-items");
const extraOptionsContainer = document.getElementById("extra-options");
const extraSection = document.getElementById("extra-section");
const contactLink = document.getElementById("contact-link");
const basePriceDisplay = document.getElementById("base-price-display");

if (basePriceDisplay) basePriceDisplay.textContent = `€${basePrice}`;

function updatePrice() {
  if (!totalPriceElement) return;
  let total = basePrice;
  let addedLabels = [];
  document.querySelectorAll("#extra-items .added").forEach((item) => {
    const price = item.dataset.price;
    if (price !== "P.O.A.") total += parseInt(price);
    addedLabels.push(item.dataset.label);
  });
  totalPriceElement.textContent = `€${total}`;
  if (contactLink) {
    const encodedLabels = addedLabels
      .map((l) => encodeURIComponent(l))
      .join(",");
    contactLink.href = `contact.html?base=${basePrice}&total=${total}&extras=${encodedLabels}`;
  }
}

function addItem(label, price) {
  if (label.includes("Drupal CMS") && price === "P.O.A.") {
    const extras = Array.from(document.querySelectorAll("#extra-items .added"))
      .map((i) => encodeURIComponent(i.dataset.label))
      .join(",");
    window.location.href = `contact.html?base=${basePrice}&total=${totalPriceElement.textContent.replace("€", "")}&extras=${extras}&drupal=true`;
    return;
  }

  if (!document.querySelector(`#extra-items [data-label="${label}"].added`)) {
    const extraItem = document.querySelector(
      `#extra-options [data-label="${label}"]`,
    );
    if (extraItem) {
      extraItem.classList.add("fade-out");
      setTimeout(() => extraItem.remove(), 300);
    }

    const newItem = document.createElement("li");
    newItem.className =
      "flex items-center gap-2 font-semibold added px-4 py-2 rounded-full bg-white border border-black border-1 fade-in";
    newItem.dataset.label = label;
    newItem.dataset.price = price;
    newItem.innerHTML = `🗸 ${label} <button onclick="removeItem(this)" class="ml-auto cursor-pointer">🗑️</button>`;
    if (packageContainer) packageContainer.appendChild(newItem);
    if (extraSection) extraSection.classList.remove("hidden");
    updatePrice();
  }
}

function removeItem(button) {
  const item = button.parentElement;
  const label = item.dataset.label;
  const price = item.dataset.price;
  item.classList.add("fade-out");
  setTimeout(() => {
    item.remove();
    updatePrice();
  }, 300);

  const newExtraItem = document.createElement("li");
  const isDrupal = label.includes("Drupal CMS");
  newExtraItem.className = `draggable-item px-3 py-2 border-black rounded-full bg-white hover:bg-mint transition-colors duration-200 ${isDrupal ? "bg-pink" : "bg-white"} cursor-pointer fade-in`;
  newExtraItem.dataset.label = label;
  newExtraItem.dataset.price = price;
  newExtraItem.draggable = true;
  newExtraItem.innerHTML = isDrupal
    ? `💻 **Drupal CMS** (**Op aanvraag**)`
    : `${label} (+ €${price})`;

  newExtraItem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text", e.target.dataset.label);
    e.dataTransfer.setData("price", e.target.dataset.price);
  });
  newExtraItem.addEventListener("click", () => addItem(label, price));
  if (extraOptionsContainer) extraOptionsContainer.appendChild(newExtraItem);
}

// Event listeners voor drag/click op bestaande items
document.querySelectorAll(".draggable-item").forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text", e.target.dataset.label);
    e.dataTransfer.setData("price", e.target.dataset.price);
  });
  item.addEventListener("click", () =>
    addItem(item.dataset.label, item.dataset.price),
  );
});

// CSS Animaties
const style = document.createElement("style");
style.innerHTML = `.draggable-item { cursor: pointer; transition: all 0.2s ease-in-out; border-width: 1px; }
.draggable-item:hover { transform: scale(1.02); }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
.fade-out { animation: fadeOut 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", updatePrice);
