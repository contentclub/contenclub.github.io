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
            const response = await fetch("header.html");
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

// Asynchrone functie om de footer te laden
async function loadFooter() {
    const footerPlaceholder = document.getElementById("footer-placeholder");

    if (footerPlaceholder) {
        try {
            const response = await fetch("footer.html");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const footerContent = await response.text();
            footerPlaceholder.innerHTML = footerContent;

        } catch (error) {
            console.error("Failed to load footer:", error);
            footerPlaceholder.innerHTML = "<p>Failed to load footer.</p>";
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
    // Start het laden van de footer onmiddellijk
    loadFooter();

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


/**
 * Contentplatform Pakket Configurator
 */

        // Update de basePrice naar de ondergrens van het nieuwe pakket
        const basePrice = 1000;
        const totalPriceElement = document.getElementById("total-price");
        const packageContainer = document.getElementById("extra-items");
        const packageTitle = document.getElementById("package-title");
        const extraOptionsContainer = document.getElementById("extra-options");
        const extraSection = document.getElementById("extra-section");
        const contactLink = document.getElementById("contact-link");
        const basePriceDisplay = document.getElementById("base-price-display");

        // Zorg ervoor dat de base price altijd correct is bij de start
        basePriceDisplay.textContent = `€${basePrice}`;

        function allowDrop(event) {
            event.preventDefault();
        }

        function drag(event) {
            // Zorg ervoor dat de dataTransfer de juiste informatie bevat voor drop
            event.dataTransfer.setData("text", event.target.dataset.label);
            event.dataTransfer.setData("price", event.target.dataset.price);
        }

        function addItem(label, price) {
            // Speciale navigatie voor Drupal
            if (label.includes('Drupal CMS') && price === 'P.O.A.') {
                // Voeg de momenteel geconfigureerde parameters toe aan de contact link,
                // zodat de gebruiker weet wat hij/zij al heeft geselecteerd.
                const extras = Array.from(document.querySelectorAll("#extra-items .added")).map(item => encodeURIComponent(item.dataset.label)).join(',');
                window.location.href = `contact.html?base=${basePrice}&total=${totalPriceElement.textContent.replace('€', '')}&extras=${extras}&drupal=true`;
                return;
            }

            if (!document.querySelector(`#extra-items [data-label="${label}"].added`)) {
                // Verwijder item uit extra opties (visueel)
                const extraItem = document.querySelector(`#extra-options [data-label="${label}"]`);
                if (extraItem) {
                    extraItem.classList.add("fade-out");
                    setTimeout(() => extraItem.remove(), 300);
                }

                // Voeg item toe aan het pakket
                const newItem = document.createElement("li");
                newItem.className = "flex items-center gap-2 font-semibold added px-4 py-2 rounded-full bg-white border border-black border-1 fade-in";
                newItem.dataset.label = label;
                newItem.dataset.price = price;
                // Aangepaste kleur voor de verwijderknop
                newItem.innerHTML = `🗸 ${label} <button onclick="removeItem(this)" class="ml-auto cursor-pointer">🗑️</button>`;
                packageContainer.appendChild(newItem);

                extraSection.classList.remove("hidden");
                updatePrice();
            }
        }

        function updatePrice() {
            let total = basePrice;
            let addedLabels = [];

            document.querySelectorAll("#extra-items .added").forEach(item => {
                const price = item.dataset.price;
                if (price !== 'P.O.A.') {
                    total += parseInt(price);
                }
                addedLabels.push(item.dataset.label);
            });

            totalPriceElement.textContent = `€${total}`;

            // Update contact link met de geselecteerde opties
            const encodedLabels = addedLabels.map(l => encodeURIComponent(l)).join(',');
            contactLink.href = `contact.html?base=${basePrice}&total=${total}&extras=${encodedLabels}`;
        }

        function removeItem(button) {
            const item = button.parentElement;
            const label = item.dataset.label;
            const price = item.dataset.price;

            // Verwijder het item met een fade-out effect
            item.classList.add("fade-out");
            setTimeout(() => {
                item.remove();
                updatePrice();
            }, 300);

            // Voeg het item terug toe aan de extra opties
            const newExtraItem = document.createElement("li");
            const isDrupal = label.includes('Drupal CMS');

            // Kleuren aangepast: Drupal nu pink, reguliere items wit + dunne grijze rand
            newExtraItem.className = `draggable-item px-3 py-2 border-black rounded-full bg-white hover:bg-mint transition-colors duration-200 ${isDrupal ? 'bg-pink text-black hover:bg-pink-700 hover:text-white' : 'bg-white hover:bg-gray-100'} transition-colors duration-200 cursor-pointer fade-in`;
            newExtraItem.dataset.label = label;
            newExtraItem.dataset.price = price;
            newExtraItem.draggable = true;
            newExtraItem.innerHTML = isDrupal
                ? `💻 **Drupal CMS** (**Op aanvraag**)`
                : `${label} (+ €${price})`;

            // Re-attach event listeners
            newExtraItem.addEventListener("dragstart", drag);
            newExtraItem.addEventListener("click", function () {
                addItem(this.dataset.label, this.dataset.price);
            });

            // Voeg het terug verwijderde item toe op de juiste positie (alfabetisch, of aan het einde)
            const optionsArray = Array.from(extraOptionsContainer.children);
            let inserted = false;

            if (isDrupal) {
                // Drupal-optie blijft onderaan staan
                extraOptionsContainer.appendChild(newExtraItem);
            } else {
                // Sorteer om de nieuwe optie in te voegen op de juiste plek.
                // Dit is een simpele manier om het er niet rommelig te laten uitzien.
                const newLabel = label.split(': ')[1] || label; // Haalt de emoji en tekst vooraan weg
                let inserted = false;
                for (let i = 0; i < optionsArray.length; i++) {
                    const currentLabel = optionsArray[i].dataset.label.split(': ')[1] || optionsArray[i].dataset.label;
                    if (newLabel.localeCompare(currentLabel) < 0) {
                        extraOptionsContainer.insertBefore(newExtraItem, optionsArray[i]);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    extraOptionsContainer.appendChild(newExtraItem);
                }
            }
        }

        function drop(event) {
            event.preventDefault();
            const label = event.dataTransfer.getData("text");
            const price = event.dataTransfer.getData("price");
            addItem(label, price);
        }

        // INITIALISATIE: Maak de extra opties klikbaar en sleepbaar
        document.querySelectorAll(".draggable-item").forEach(item => {
            // De 'drag' functionaliteit moet ook hier worden toegevoegd!
            item.addEventListener("dragstart", drag);
            item.addEventListener("click", function () {
                addItem(this.dataset.label, this.dataset.price);
            });
        });

        // Voeg de CSS-animaties toe (zoals in de originele code)
        const style = document.createElement("style");
        style.innerHTML = `
        .draggable-item {
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            border-width: 1px; /* Stelt een dunnere rand in dan de standaard 'border' */
        }
        .draggable-item:hover {
            transform: scale(1.02);
        }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        .fade-out { animation: fadeOut 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
        `;
        document.head.appendChild(style);

        // Zorg ervoor dat de prijs bij de start correct is
        document.addEventListener('DOMContentLoaded', updatePrice);
