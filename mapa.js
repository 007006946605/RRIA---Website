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
    let isTraveling = false;

    popup.style.display = 'none';

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

    // Store original and fullscreen positions for dynamic movement
    const originalPositions = {
        1: { x: 90, y: 60 },
        2: { x: 710, y: 75 },
        3: { x: 70, y: 530 },
        4: { x: 730, y: 540 }
    };

    const fullscreenPositions = {
        1: { x: 250, y: 150 },
        2: { x: 550, y: 150 },
        3: { x: 250, y: 450 },
        4: { x: 550, y: 450 }
    };

    const originalRoutes = {
        // Route 1: Center → Diagonal NW → Point 1
        1: "M400,300 L350,250 L90,60",
        // Route 2: Center → Diagonal NE → Point 2
        2: "M400,300 L450,300 L710,75",
        // Route 3: Center → Diagonal SW → Point 3
        3: "M400,300 L350,250 L70,530",
        // Route 4: Center → Diagonal SE → Point 4
        4: "M400,300 L450,300 L730,540"
    };

    const fullscreenRoutes = {
        // Route 1: Center → Up (Center St) → Left (Top St)
        1: "M400,300 L400,150 L250,150",
        // Route 2: Center → Up (Center St) → Right (Top St)
        2: "M400,300 L400,150 L550,150",
        // Route 3: Center → Down (Center St) → Left (Bottom St)
        3: "M400,300 L400,450 L250,450",
        // Route 4: Center → Down (Center St) → Right (Bottom St)
        4: "M400,300 L400,450 L550,450"
    };

    // Function to smoothly move points to fullscreen positions
    function movePointsToFullscreen() {
        points.forEach(point => {
            const id = point.getAttribute('data-id');
            const newPos = fullscreenPositions[id];

            // Add transition for smooth animation
            point.style.transition = 'transform 0.5s ease-in-out';
            point.setAttribute('transform', `translate(${newPos.x}, ${newPos.y})`);
        });

        // Update route paths
        Object.keys(fullscreenRoutes).forEach(id => {
            const routeElement = document.getElementById(`route-${id}`);
            if (routeElement) {
                routeElement.setAttribute('d', fullscreenRoutes[id]);
            }
        });
    }

    // Function to restore points to original positions
    function restorePointsToNormal() {
        points.forEach(point => {
            const id = point.getAttribute('data-id');
            const origPos = originalPositions[id];

            // Add transition for smooth animation
            point.style.transition = 'transform 0.5s ease-in-out';
            point.setAttribute('transform', `translate(${origPos.x}, ${origPos.y})`);
        });

        // Restore original route paths
        Object.keys(originalRoutes).forEach(id => {
            const routeElement = document.getElementById(`route-${id}`);
            if (routeElement) {
                routeElement.setAttribute('d', originalRoutes[id]);
            }
        });
    }

    points.forEach(point => {
        point.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTraveling) return;

            const id = point.getAttribute('data-id');
            selectedDestinationId = id;

            popupTitle.textContent = sectionData[id].title;
            popupDesc.textContent = sectionData[id].desc;

            // Reset popup to get dimensions
            popup.className = '';
            popup.style.display = 'block';
            popup.style.transform = 'none';

            // Add wide class for point 1
            if (id === '1') {
                popup.classList.add('wide');
            }

            // Get dimensions for precise positioning
            const pointRect = point.getBoundingClientRect();
            const mapRect = mapWrapper.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();

            // Calculate point center relative to map wrapper
            const pointCenterX = pointRect.left - mapRect.left + (pointRect.width / 2);
            const pointCenterY = pointRect.top - mapRect.top + (pointRect.height / 2);

            // Constants
            const spacing = 15; // Space between point and popup
            const tailOffset = 20; // Distance from edge to tail

            // Logic to determine position (prioritize top, then bottom, then sides)
            let top, left, tailClass;

            // Check if fits on top
            if (pointCenterY - popupRect.height - spacing > 0) {
                // Position Top
                top = pointCenterY - popupRect.height - spacing;

                // Horizontal alignment (try center, then shift if needed)
                if (pointCenterX + (popupRect.width / 2) < mapRect.width && pointCenterX - (popupRect.width / 2) > 0) {
                    // Center horizontally
                    left = pointCenterX - (popupRect.width / 2);
                    tailClass = 'tail-bottom-center'; // We need to add this class or adjust existing
                    // For now reusing existing logic, let's stick to left/right logic for tails
                    // Actually, let's use the logic: if left side of map, popup goes right. If right side, popup goes left.
                }
            }

            // SIMPLIFIED ROBUST LOGIC:
            // Split map into quadrants to decide direction
            const isLeftHalf = pointCenterX < mapRect.width / 2;
            const isTopHalf = pointCenterY < mapRect.height / 2;

            if (isTopHalf) {
                // Point is in top half -> Popup goes BOTTOM
                top = pointCenterY + spacing + (pointRect.height / 2);
                if (isLeftHalf) {
                    // Top-Left Quadrant -> Popup Bottom-Right relative to point (tail top-left)
                    left = pointCenterX - tailOffset;
                    tailClass = 'tail-top-left';
                } else {
                    // Top-Right Quadrant -> Popup Bottom-Left relative to point (tail top-right)
                    left = pointCenterX - popupRect.width + tailOffset;
                    tailClass = 'tail-top-right';
                }
            } else {
                // Point is in bottom half -> Popup goes TOP
                top = pointCenterY - popupRect.height - spacing - (pointRect.height / 2);
                if (isLeftHalf) {
                    // Bottom-Left Quadrant -> Popup Top-Right relative to point (tail bottom-left)
                    left = pointCenterX - tailOffset;
                    tailClass = 'tail-bottom-left';
                } else {
                    // Bottom-Right Quadrant -> Popup Top-Left relative to point (tail bottom-right)
                    left = pointCenterX - popupRect.width + tailOffset;
                    tailClass = 'tail-bottom-right';
                }
            }

            // Apply calculated positions
            popup.style.top = `${top}px`;
            popup.style.left = `${left}px`;
            popup.classList.add(tailClass);
        });
    });

    btnFechar.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.style.display = 'none';
        selectedDestinationId = null;
    });

    mapWrapper.addEventListener('click', () => {
        if (isTraveling) return;
        popup.style.display = 'none';
    });

    popup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    btnViajar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!selectedDestinationId) return;

        isTraveling = true;
        popup.style.display = 'none';

        const routeId = `route-${selectedDestinationId}`;
        const routeElement = document.getElementById(routeId);
        const pathData = routeElement.getAttribute('d');

        activeRoutePath.setAttribute('d', pathData);

        const length = activeRoutePath.getTotalLength();
        activeRoutePath.style.strokeDasharray = length;
        activeRoutePath.style.strokeDashoffset = length;

        activeRoutePath.getBoundingClientRect();

        activeRoutePath.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        activeRoutePath.style.strokeDashoffset = '0';

        setTimeout(() => {
            animatePointer(routeElement);
        }, 1500);
    });

    function animatePointer(routePath) {
        carMarker.style.transition = 'none';

        const length = routePath.getTotalLength();
        const duration = 2500;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const point = routePath.getPointAtLength(progress * length);

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

            carMarker.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle}) scale(0.8)`);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                showArrival();
            }
        }

        requestAnimationFrame(step);
    }

    function showArrival() {
        arrivalOverlay.classList.add('visible');

        setTimeout(() => {
            const url = sectionData[selectedDestinationId].url;
            window.location.href = url;
        }, 2000);
    }

    // Fullscreen
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const mainMap = document.getElementById('main-map');

    fullscreenBtn.addEventListener('click', () => {
        if (mapWrapper.requestFullscreen) {
            mapWrapper.requestFullscreen();
        } else if (mapWrapper.webkitRequestFullscreen) {
            mapWrapper.webkitRequestFullscreen();
        } else if (mapWrapper.msRequestFullscreen) {
            mapWrapper.msRequestFullscreen();
        }
    });

    exitFullscreenBtn.addEventListener('click', () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'inline-flex';
            // Change preserveAspectRatio to fill the screen
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            // Move points closer to center
            movePointsToFullscreen();
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
            // Restore original preserveAspectRatio
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            // Restore points to original positions
            restorePointsToNormal();
        }
    });

    document.addEventListener('webkitfullscreenchange', () => {
        if (document.webkitFullscreenElement) {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'inline-flex';
            // Change preserveAspectRatio to fill the screen
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            // Move points closer to center
            movePointsToFullscreen();
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
            // Restore original preserveAspectRatio
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            // Restore points to original positions
            restorePointsToNormal();
        }
    });
});
