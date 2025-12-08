/**
 * Global Page Transition System
 * Implements smooth navigation between pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    applyPageTransitions();
    animatePageIn();
});

function applyPageTransitions() {
    // Select all links
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        // Skip links that shouldn't be animated
        if (shouldSkipTransition(link)) {
            return;
        }

        // Add interception listener
        link.addEventListener('click', (e) => {
            const targetUrl = link.href;

            // Ignore clicks to same page or just hash changes
            if (targetUrl === window.location.href ||
                (targetUrl.includes('#') && targetUrl.split('#')[0] === window.location.href.split('#')[0])) {
                return;
            }

            e.preventDefault();
            animatePageOut(targetUrl);
        });

        // Mark as initialized
        link.setAttribute('data-transition-initialized', 'true');
    });

    // Handle Browser Back/Forward Cache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Force re-entry animation if loaded from bfcache
            document.body.classList.remove('exiting');
            setTimeout(animatePageIn, 10);
        }
    });
}

function shouldSkipTransition(link) {
    const href = link.getAttribute('href');

    return (
        !href || // No href
        link.target === '_blank' || // New tab
        href.startsWith('#') || // Anchor
        href.startsWith('mailto:') || // Mail
        href.startsWith('tel:') || // Phone
        href.startsWith('javascript:') || // JS
        link.hasAttribute('data-no-transition') // Explicit opt-out
    );
}

function animatePageIn() {
    // Add class on next frame to ensure transition triggers
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });
}

function animatePageOut(nextUrl) {
    document.body.classList.remove('loaded');
    document.body.classList.add('exiting');

    // Determine duration based on screen size (matching CSS)
    const isMobile = window.innerWidth <= 768;
    const duration = isMobile ? 250 : 350;

    setTimeout(() => {
        window.location.href = nextUrl;
    }, duration);
}
