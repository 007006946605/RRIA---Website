document.addEventListener('DOMContentLoaded', () => {
    const points = document.querySelectorAll('.map-point');
    const popup = document.getElementById('info-popup');
    const btnFechar = document.getElementById('btn-fechar-popup');
    const btnViajar = document.getElementById('btn-viajar');
    const popupTitle = document.getElementById('popup-title');
    const popupDesc = document.getElementById('popup-desc');
    const activeRoutePath = document.getElementById('active-route');
    const carMarker = document.getElementById('car-marker');
    const arrivalOverlay = document.getElementById('arrival-overlay');
    const mapWrapper = document.querySelector('.map-wrapper');

    let selectedDestinationId = null;
    let isTraveling = false; // Lock interaction during travel

    // Ensure popup is hidden on load
    popup.style.display = 'none';

    // Data for each section
    const sectionData = {
        1: {
            title: "Seção 1: Coleta de Dados",
            desc: "Descubra como os dados de tráfego são coletados em tempo real.",
            url: "secao1.html"
        },
        2: {
            title: "Seção 2: Processamento",
            desc: "Entenda como os algoritmos processam milhões de dados.",
            url: "secao2.html"
        },
        3: {
            title: "Seção 3: Roteamento",
            desc: "Veja como o melhor caminho é calculado.",
            url: "secao3.html"
        },
        4: {
            title: "Seção 4: Comunidade",
            desc: "O papel da comunidade na atualização dos mapas.",
            url: "secao4.html"
        }
    };

    // Handle Point Clicks (and Touch)
    points.forEach(point => {
        point.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click from closing

            if (isTraveling) return; // Ignore if traveling

            const id = point.getAttribute('data-id');
            selectedDestinationId = id;

            // Update Popup Content
            popupTitle.textContent = sectionData[id].title;
            popupDesc.textContent = sectionData[id].desc;

            // Position Popup Logic (Smart Positioning)
            const transform = point.getAttribute('transform');
            const matches = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);

            if (matches) {
                const x = parseFloat(matches[1]);
                const y = parseFloat(matches[2]);

                // Convert SVG coordinates to %
                let leftPercent = (x / 800) * 100;
                let topPercent = (y / 600) * 100;

                // Reset classes and styles
                popup.className = '';
                popup.style.transform = 'translate(0, 0)';
                popup.style.left = `${leftPercent}%`;
                popup.style.top = `${topPercent}%`;
                popup.style.right = 'auto';
                popup.style.bottom = 'auto';
                popup.style.display = 'block'; // Show briefly to measure

                // Boundary Detection
                const popupRect = popup.getBoundingClientRect();
                const mapRect = mapWrapper.getBoundingClientRect();

                let isRight = false;
                let isBottom = false;

                // Check Right Edge
                if (popupRect.right > mapRect.right) {
                    popup.style.left = 'auto';
                    popup.style.right = '10px'; // Fixed margin from right
                    isRight = true;
                } else {
                    // Default: Popup left aligned with point (or slightly centered)
                    popup.style.transform = 'translate(-10%, -115%)'; // Default shift up and slightly left to align tail
                }

                // Check Top Edge (More aggressive check)
                // If the top of the popup is close to the top of the map (within 50px)
                if (popupRect.top < mapRect.top + 50) {
                    // Shift Down
                    popup.style.top = `${topPercent + 5}%`; // Below point
                    popup.style.transform = isRight ? 'translate(0, 0)' : 'translate(-10%, 10%)';
                    isBottom = true;
                } else {
                    // Default: Above point
                    if (isRight) {
                        popup.style.transform = 'translate(0, -115%)';
                    }
                }

                // Apply Tail Class
                if (isBottom) {
                    // Popup is BELOW point. Tail should be TOP.
                    popup.classList.add(isRight ? 'tail-top-right' : 'tail-top-left');
                } else {
                    // Popup is ABOVE point. Tail should be BOTTOM.
                    popup.classList.add(isRight ? 'tail-bottom-right' : 'tail-bottom-left');
                }
            }

            // Show Popup
            popup.style.display = 'block';
        });
    });

    // Close Popup on Close Button
    btnFechar.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.style.display = 'none';
        selectedDestinationId = null;
    });

    // Close popup if clicking empty map area
    mapWrapper.addEventListener('click', () => {
        if (isTraveling) return;
        popup.style.display = 'none';
    });

    // Prevent popup click from closing itself
    popup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle Travel Click
    btnViajar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!selectedDestinationId) return;

        isTraveling = true; // Lock interaction

        // Close popup
        popup.style.display = 'none';

        // Get the route path definition
        const routeId = `route-${selectedDestinationId}`;
        const routeElement = document.getElementById(routeId);
        const pathData = routeElement.getAttribute('d');

        // Draw the route
        activeRoutePath.setAttribute('d', pathData);

        // Prepare Route Animation
        const length = activeRoutePath.getTotalLength();
        activeRoutePath.style.strokeDasharray = length;
        activeRoutePath.style.strokeDashoffset = length;

        // Force reflow
        activeRoutePath.getBoundingClientRect();

        // Animate Line Drawing
        activeRoutePath.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        activeRoutePath.style.strokeDashoffset = '0';

        // Start Pointer Animation after line is drawn
        setTimeout(() => {
            animatePointer(routeElement);
        }, 1500);
    });

    function animatePointer(routePath) {
        // Reset marker
        carMarker.style.transition = 'none';

        const length = routePath.getTotalLength();
        const duration = 2500; // 2.5 seconds travel time
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Get point at current length
            const point = routePath.getPointAtLength(progress * length);

            // Calculate rotation (look ahead)
            let angle = 0;
            if (progress < 0.95) {
                const nextPoint = routePath.getPointAtLength((progress + 0.05) * length);
                const dx = nextPoint.x - point.x;
                const dy = nextPoint.y - point.y;
                angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
            } else {
                const prevPoint = routePath.getPointAtLength((progress - 0.05) * length);
                const dx = point.x - prevPoint.x;
                const dy = point.y - prevPoint.y;
                angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
            }

            // Update marker position (Smaller scale: 0.8)
            carMarker.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle}) scale(0.8)`);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Animation Complete
                showArrival();
            }
        }

        requestAnimationFrame(step);
    }

    function showArrival() {
        // Show Overlay
        arrivalOverlay.classList.add('visible');

        // Redirect after delay
        setTimeout(() => {
            const url = sectionData[selectedDestinationId].url;
            window.location.href = url;
        }, 2000);
    }
});
