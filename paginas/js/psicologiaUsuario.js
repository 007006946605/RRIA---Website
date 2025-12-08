document.addEventListener('DOMContentLoaded', () => {
    initPsychPage();
});

let typingIntervals = {}; // Store intervals to clear them properly

function initPsychPage() {
    setupAnimations();
    setupCards();
    setupFullText();
    setupConclusion();
}

function setupAnimations() {
    const cards = document.querySelectorAll('.psych-card');
    const delayStep = 100; // ms

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * delayStep);
    });
}

function setupCards() {
    const cards = document.querySelectorAll('.psych-card');

    cards.forEach(card => {
        // Accessibility
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');

        // Click Event
        card.addEventListener('click', (e) => {
            // If clicking the "Ver mais" button inside the card, don't toggle card logic
            if (e.target.closest('.card-mini-btn')) return;

            e.stopPropagation();
            toggleCard(card);
        });

        // Keyboard Event (Enter/Space)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard(card);
            }
        });
    });

    // Close cards when clicking outside
    document.addEventListener('click', () => {
        closeAllCards();
    });

    // Esc key closes cards
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllCards();
            closeFullText();
        }
    });
}

function toggleCard(selectedCard) {
    const isActive = selectedCard.classList.contains('active');
    const cardId = selectedCard.id;

    // Close others
    closeAllCards(selectedCard); // Pass the current one to avoid visual glitches if needed, but closeAll handles it.

    if (!isActive) {
        selectedCard.classList.add('active');
        selectedCard.setAttribute('aria-expanded', 'true');

        // Set background color
        const color = selectedCard.dataset.color;
        selectedCard.style.backgroundColor = color;

        // Create Panel if not exists (or reset it)
        createCardPanel(selectedCard);
    }
}

function closeAllCards() {
    const cards = document.querySelectorAll('.psych-card');
    cards.forEach(card => {
        if (card.classList.contains('active')) {
            const cardId = card.id;
            stopTyping(cardId);

            // Remove panel content visally smoothly
            const panel = card.querySelector('.card-content');
            if (panel) {
                panel.style.opacity = '0';
                setTimeout(() => {
                    if (panel.parentNode) panel.parentNode.removeChild(panel);
                }, 150);
            }

            card.classList.remove('active');
            card.setAttribute('aria-expanded', 'false');
            card.style.backgroundColor = '#f9f9f9';
        }
    });
}

function createCardPanel(card) {
    // Remove existing if any (cleanup)
    const existing = card.querySelector('.card-content');
    if (existing) existing.remove();

    const microtext = card.dataset.microtext || "";
    const cardId = card.id;

    // Create DOM structure
    const panel = document.createElement('div');
    panel.className = 'card-content';

    const p = document.createElement('p');
    p.className = 'card-typing-text';
    // Start empty

    const btn = document.createElement('button');
    btn.className = 'card-mini-btn';
    btn.textContent = 'Ver mais detalhes';
    btn.onclick = (e) => {
        e.stopPropagation(); // Prevent card toggle
        openFullText();
    };

    panel.appendChild(p);
    panel.appendChild(btn);
    card.appendChild(panel);

    // Trigger typing after fade in
    setTimeout(() => {
        typeText(cardId, p, microtext);
    }, 250); // wait for card panel fade transition
}

function typeText(id, element, text) {
    stopTyping(id); // Ensure clear state

    let i = 0;
    const speed = 30; // ms per char

    // Create cursor
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    element.appendChild(cursor);

    typingIntervals[id] = setInterval(() => {
        if (i < text.length) {
            // Insert text before cursor
            element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
        } else {
            stopTyping(id);
            cursor.remove(); // Remove cursor at end
        }
    }, speed);
}

function stopTyping(id) {
    if (typingIntervals[id]) {
        clearInterval(typingIntervals[id]);
        delete typingIntervals[id];
    }
}

function setupFullText() {
    const btn = document.getElementById('btn-read-more'); // Main button outside cards
    const btnClose = document.getElementById('btn-close-analysis');
    const overlay = document.getElementById('full-analysis-overlay');

    if (btn) {
        btn.addEventListener('click', openFullText);
    }

    if (btnClose) {
        btnClose.addEventListener('click', closeFullText);
    }

    // Close when clicking background
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeFullText();
            }
        });
    }
}

function openFullText() {
    const overlay = document.getElementById('full-analysis-overlay');
    if (overlay) overlay.classList.add('open');
}

function closeFullText() {
    const overlay = document.getElementById('full-analysis-overlay');
    if (overlay) overlay.classList.remove('open');
}

function setupConclusion() {
    const phrases = [
        "Engajamento através da incerteza...",
        "Recompensa variável libera dopamina...",
        "Redução da carga cognitiva...",
        "Design que cria dependência.",
        "Psicologia aplicada à navegação."
    ];

    const container = document.getElementById('conclusion');
    if (!container) return;

    let index = 0;

    function showNextPhrase() {
        container.style.opacity = 0;

        setTimeout(() => {
            container.textContent = phrases[index];
            container.style.opacity = 1;
            index = (index + 1) % phrases.length;
        }, 500); // Wait for fade out
    }

    // Start loop
    setInterval(showNextPhrase, 4000);

    // Initial call
    container.textContent = "Analisando padrões comportamentais...";
}
