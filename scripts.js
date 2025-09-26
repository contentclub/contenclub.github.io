// Functie voor het typemachine-effect
/**
 * Voert een typemachine-effect uit op een HTML-element.
 * @param {HTMLElement} element - Het element om de tekst in te typen.
 * @param {string} text - De tekst die getypt moet worden.
 * @param {number} speed - De snelheid van het typen in milliseconden per teken (standaard: 50).
 */
function typeEffect(element, text, speed = 50) {
    let i = 0;
    const textNode = document.createTextNode('');
    const cursorSpan = document.createElement('span');
    cursorSpan.classList.add('typing-cursor');

    // **BELANGRIJKE AANPASSING:**
    // Vervang de volledige inhoud door de oorspronkelijke tekst in een onzichtbare container.
    // Dit zorgt ervoor dat de H2 zijn volledige hoogte behoudt voordat het typen begint.
    element.innerHTML = `<span style="visibility: hidden; position: absolute;">${text}</span>`;
    
    // Voeg de textNode en cursor toe, maar de textNode zal onder de onzichtbare tekst staan
    element.appendChild(textNode);
    element.appendChild(cursorSpan);

    const interval = setInterval(() => {
        if (i < text.length) {
            textNode.nodeValue += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            // Verwijder de onzichtbare tekst en de cursor na het typen
            const hiddenSpan = element.querySelector('span[style*="visibility: hidden"]');
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
            const response = await fetch("/header.html");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const headerContent = await response.text();
            headerPlaceholder.innerHTML = headerContent;

            // Logica voor mobiel menu toggle
            const mobileMenuButton = document.getElementById("mobile-menu-button");
            const mobileMenu = document.getElementById("mobile-menu");

            if (mobileMenuButton && mobileMenu) {
                // De hidden klasse is niet meer nodig, maar we zorgen dat translate-y-full actief is.

                mobileMenuButton.addEventListener("click", () => {
                    // 1. Schakelen van de slide-animatie voor het menu (Verticaal)
                    mobileMenu.classList.toggle("-translate-y-full"); // Slide out
                    mobileMenu.classList.toggle("translate-y-0");    // Toon menu (schuift naar 0 positie)

                    // 2. Schakelen van de X-animatie voor de knop
                    mobileMenuButton.classList.toggle("menu-open");
                });
            }
        } catch (error) {
            console.error("Failed to load header:", error);
            headerPlaceholder.innerHTML = "<p>Failed to load header.</p>";
        }
    }
}

/**
 * Hoofdfunctie die wordt uitgevoerd na het laden van de DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialiseer elementen
    const navLinks = document.querySelectorAll('nav .nav-link');
    const sections = document.querySelectorAll('.scroll-section');
    // Selecteer input en textarea, select wordt uitgesloten omdat zwevende labels meestal niet gelden voor selects
    const formInputs = document.querySelectorAll('form input, form textarea'); 
    const blockedInfo = document.getElementById("blockedInfo");
    const afspraakInput = document.getElementById("afspraak");

    // Start het laden van de header onmiddellijk
    loadHeader();

    // 2. Navigatielink markeren op basis van URL (voor volledige pagina's)
    navLinks.forEach(link => {
        // Een link is actief als de href overeenkomt met de huidige URL,
        // of als de hash leeg is en de URL overeenkomt (wat 'home' kan zijn)
        const linkHref = link.getAttribute('href').replace(window.location.origin, '');
        const currentPath = window.location.pathname + window.location.hash;

        if (currentPath.includes(linkHref) && linkHref !== '#') {
            link.classList.add('active');
        } else if (linkHref === '/' && window.location.pathname === '/') {
             // Specifieke check voor de homepage (indien van toepassing)
             link.classList.add('active');
        }
    });

    // 3. Zwevende labels (Floating Labels)
    const toggleFloatingLabel = (input, forceActivate = false) => {
        const label = input.closest('div').querySelector('label');

        // Voorkom fouten als de label niet gevonden wordt
        if (!label) return;

        const isActive = input.value !== '' || forceActivate;
        const activeClasses = ['-top-4', 'scale-75'];
        const inactiveClasses = ['top-2', 'scale-100'];

        if (isActive) {
            label.classList.add(...activeClasses);
            label.classList.remove(...inactiveClasses);
        } else {
            label.classList.remove(...activeClasses);
            label.classList.add(...inactiveClasses);
        }
    };

    formInputs.forEach(input => {
        // Initial controleren bij het laden van de pagina voor ingevulde velden
        toggleFloatingLabel(input); 

        // Eventlisteners
        input.addEventListener('focus', () => toggleFloatingLabel(input, true));
        input.addEventListener('blur', () => toggleFloatingLabel(input));
        // Luister ook naar input-event voor dynamische updates
        input.addEventListener('input', () => toggleFloatingLabel(input));
    });

    // 4. Intersection Observer voor secties (animaties en actieve navigatie)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50% 0px', // Pas de rootMargin aan om te activeren wanneer de sectie bovenaan staat
        threshold: 0 // Werkt beter met een grote rootMargin
    };

    const observer = new IntersectionObserver((entries) => {
        // Vind de meest recente sectie die de viewport ingaat
        const intersectingEntry = entries.find(entry => entry.isIntersecting);

        // Als er een sectie de viewport binnengaat
        if (intersectingEntry) {
            const entry = intersectingEntry;
            const sectionId = entry.target.id;
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);

            // Verwijder 'active' van alle links en voeg deze toe aan de huidige sectie
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                 // Verwijder de URL-gebaseerde actieve status voor ankerlinks
                 navLink.classList.remove('active'); 
                 navLink.classList.add('active');
            }

            // Eenmalige fade-in animatie
            if (!entry.target.classList.contains('is-visible')) {
                entry.target.classList.add('is-visible');
            }

            // Typemachine-effect activeren
            const titleElement = entry.target.querySelector('h2');
            const introSubtitle = document.getElementById('intro-subtitle');

            if (titleElement && !titleElement.hasAttribute('data-typed')) {
                const originalText = titleElement.textContent.trim();
                typeEffect(titleElement, originalText);
                titleElement.setAttribute('data-typed', 'true');
            } else if (introSubtitle && entry.target.id === 'intro' && !introSubtitle.hasAttribute('data-typed')) {
                const originalText = introSubtitle.textContent.trim();
                typeEffect(introSubtitle, originalText);
                introSubtitle.setAttribute('data-typed', 'true');
            }
        }
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 5. Flatpickr-initialisatie en data-ophalen
    if (afspraakInput) {
        const disableDates = [];
        fetch('/data/blocked-times.json')
            .then(response => {
                if (!response.ok) throw new Error("Could not fetch blocked dates.");
                return response.json();
            })
            .then(data => {
                const blockedDates = data.blocked || [];

                blockedDates.forEach(item => {
                    // Voeg bereiken en individuele datums toe aan disableDates
                    if (item.date.includes(' to ')) {
                        const [start, end] = item.date.split(' to ').map(d => d.trim());
                        disableDates.push({ from: start, to: end });
                    } else {
                        disableDates.push(item.date);
                    }
                });

                // Toon geblokkeerde info op de pagina
                if (blockedDates.length > 0 && blockedInfo) {
                    blockedInfo.innerHTML = `
                        <p class="font-semibold mb-2">Volgende bezette dagen:</p>
                        <ul class="list-disc pl-4 space-y-1">
                            ${blockedDates.map(item => `
                                <li><strong>${item.date}</strong>: ${item.reason || 'Geen reden gespecificeerd'}</li>
                            `).join('')}
                        </ul>
                    `;
                }
            })
            .catch(error => {
                console.error("Error fetching blocked dates:", error);
                if (blockedInfo) {
                    blockedInfo.innerHTML = `<p class="text-red-500">Fout bij het laden van bezette dagen.</p>`;
                }
            })
            .finally(() => {
                // Initialiseer Flatpickr na het ophalen van de datums
                flatpickr(afspraakInput, {
                    dateFormat: "Y-m-d",
                    minDate: "today",
                    disable: disableDates, // Gebruik de verzamelde array
                    locale: "nl",
                    onClose: function (selectedDates, dateStr, instance) {
                        console.log('Selected date:', dateStr);
                        // Trigger de zwevende label toggle na selectie
                        toggleFloatingLabel(afspraakInput); 
                    }
                });
            });
    }
});