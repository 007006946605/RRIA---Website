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

    points.forEach(point => {
        point.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTraveling) return;

            const id = point.getAttribute('data-id');
            selectedDestinationId = id;

            popupTitle.textContent = sectionData[id].title;
            popupDesc.textContent = sectionData[id].desc;

            const transform = point.getAttribute('transform');
            const matches = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);

            if (matches) {
                const x = parseFloat(matches[1]);
                const y = parseFloat(matches[2]);

                let leftPercent = (x / 800) * 100;
                let topPercent = (y / 600) * 100;

                // Reset popup
                popup.className = '';
                popup.style.display = 'block';

                // Get popup dimensions
                const popupRect = popup.getBoundingClientRect();
                const mapRect = mapWrapper.getBoundingClientRect();
                const popupWidth = popupRect.width;
                const popupHeight = popupRect.height;

                let isRight = false;
                let tailClass = '';

                // Determine horizontal positioning
                if (leftPercent > 50) {
                    // Position to the left of point
                    popup.style.left = `${leftPercent}%`;
                    popup.style.right = 'auto';
                    popup.style.transform = `translate(calc(-100% - 20px), -50%)`;
                    isRight = true; // tail будет справа от popup (указывает на точку)
                } else {
                    // Position to the right of point
                    popup.style.left = `${leftPercent}%`;
                    popup.style.right = 'auto';
                    popup.style.transform = `translate(20px, -50%)`;
                    isRight = false; // tail слева от popup
                }

                // Set vertical position
                popup.style.top = `${topPercent}%`;

                // Check if popup goes off screen vertically after positioning
                const updatedRect = popup.getBoundingClientRect();

                if (updatedRect.top < mapRect.top + 50) {
                    // Position below the point
                    popup.style.top = `${topPercent}%`;
                    if (isRight) {
                        popup.style.transform = `translate(calc(-100% - 20px), 20px)`;
                    } else {
                        popup.style.transform = `translate(20px, 20px)`;
                    }
                    tailClass = isRight ? 'tail-top-right' : 'tail-top-left';
                } else if (updatedRect.bottom > mapRect.bottom - 20) {
                    // Position above the point
                    popup.style.top = `${topPercent}%`;
                    if (isRight) {
                        popup.style.transform = `translate(calc(-100% - 20px), calc(-100% - 20px))`;
                    } else {
                        popup.style.transform = `translate(20px, calc(-100% - 20px))`;
                    }
                    tailClass = isRight ? 'tail-bottom-right' : 'tail-bottom-left';
                } else {
                    // Default centered vertically
                    tailClass = isRight ? 'tail-bottom-right' : 'tail-bottom-left';
                }

                // Add wide class for point 1
                if (id === '1') {
                    popup.classList.add('wide');
                }

                // Apply tail class
                popup.classList.add(tailClass);
            }
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
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
        }
    });

    document.addEventListener('webkitfullscreenchange', () => {
        if (document.webkitFullscreenElement) {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'inline-flex';
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
        }
    });
});
