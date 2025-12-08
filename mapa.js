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
            title: "Motor de Decisão",
            desc: "Veja como o sistema escolhe rotas e reage ao ambiente.",
            url: "paginas/html/motorDecisao.html"
        },
        2: {
            title: "Arquitetura dos Dados",
            desc: "Entenda como as informações são organizadas e ligadas.",
            url: "paginas/html/arquiteturaDados.html"
        },
        3: {
            title: "Interface Operacional",
            desc: "Observe como as telas representam o funcionamento real.",
            url: "paginas/html/interfaceOperacional.html"
        },
        4: {
            title: "Psicologia do Usuário",
            desc: "Veja como emoções influenciam a tomada de decisão no app.",
            url: "paginas/html/psicologiaUsuario.html"
        }

    };

    const originalPositions = {
        1: { x: 90, y: 60 },
        2: { x: 710, y: 75 },
        3: { x: 70, y: 530 },
        4: { x: 730, y: 540 }
    };

    const originalRoutes = {
        1: "M400,300 L350,250 L90,60",
        2: "M400,300 L450,300 L710,75",
        3: "M400,300 L350,250 L70,530",
        4: "M400,300 L450,300 L730,540"
    };

    // Move points to fullscreen - EXTREMELY close for 430x932
    function movePointsToFullscreen() {
        const aspectRatio = window.innerWidth / window.innerHeight;

        let positions;

        if (aspectRatio < 0.5) {
            // ULTRA TALL (mobile portrait like 430x932, aspectRatio = 0.46)
            // Visible range: ~262 to ~538
            positions = {
                1: { x: 300, y: 300 },
                2: { x: 500, y: 300 },
                3: { x: 400, y: 150 },
                4: { x: 400, y: 450 }
            };
        } else if (aspectRatio < 0.75) {
            // TALL screens (tablets portrait)
            positions = {
                1: { x: 280, y: 300 },
                2: { x: 520, y: 300 },
                3: { x: 400, y: 180 },
                4: { x: 400, y: 420 }
            };
        } else if (aspectRatio < 1.2) {
            // SQUARE-ISH screens (tablets, some monitors)
            positions = {
                1: { x: 250, y: 150 },
                2: { x: 550, y: 150 },
                3: { x: 250, y: 450 },
                4: { x: 550, y: 450 }
            };
        } else {
            // WIDE screens (PC/desktop, aspectRatio > 1.2 like 1920x1080 = 1.77)
            // More spread out since more horizontal space visible
            positions = {
                1: { x: 200, y: 150 },
                2: { x: 600, y: 150 },
                3: { x: 200, y: 450 },
                4: { x: 600, y: 450 }
            };
        }

        points.forEach(point => {
            const id = point.getAttribute('data-id');
            const newPos = positions[id];
            point.style.transition = 'transform 0.5s ease-in-out';
            point.setAttribute('transform', `translate(${newPos.x}, ${newPos.y})`);
        });

        Object.keys(positions).forEach(id => {
            const routeElement = document.getElementById(`route-${id}`);
            const pos = positions[id];

            if (routeElement) {
                const route = `M400,300 L400,${pos.y} L${pos.x},${pos.y}`;
                routeElement.setAttribute('d', route);
            }
        });
    }

    function restorePointsToNormal() {
        points.forEach(point => {
            const id = point.getAttribute('data-id');
            const origPos = originalPositions[id];
            point.style.transition = 'transform 0.5s ease-in-out';
            point.setAttribute('transform', `translate(${origPos.x}, ${origPos.y})`);
        });

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

            popup.className = '';
            popup.style.display = 'block';
            popup.style.transform = 'none';

            if (id === '1') {
                popup.classList.add('wide');
            }

            const pointRect = point.getBoundingClientRect();
            const mapRect = mapWrapper.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();

            const pointCenterX = pointRect.left - mapRect.left + (pointRect.width / 2);
            const pointCenterY = pointRect.top - mapRect.top + (pointRect.height / 2);

            const spacing = 15;
            const tailOffset = 20;

            let top, left, tailClass;

            const isLeftHalf = pointCenterX < mapRect.width / 2;
            const isTopHalf = pointCenterY < mapRect.height / 2;

            if (isTopHalf) {
                top = pointCenterY + spacing + (pointRect.height / 2);
                if (isLeftHalf) {
                    left = pointCenterX - tailOffset;
                    tailClass = 'tail-top-left';
                } else {
                    left = pointCenterX - popupRect.width + tailOffset;
                    tailClass = 'tail-top-right';
                }
            } else {
                top = pointCenterY - popupRect.height - spacing - (pointRect.height / 2);
                if (isLeftHalf) {
                    left = pointCenterX - tailOffset;
                    tailClass = 'tail-bottom-left';
                } else {
                    left = pointCenterX - popupRect.width + tailOffset;
                    tailClass = 'tail-bottom-right';
                }
            }

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

        // Make carMarker visible and start animation
        carMarker.setAttribute('transform', 'translate(400, 300) scale(1)');

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
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            movePointsToFullscreen();
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            restorePointsToNormal();
        }
    });

    document.addEventListener('webkitfullscreenchange', () => {
        if (document.webkitFullscreenElement) {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'inline-flex';
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            movePointsToFullscreen();
        } else {
            fullscreenBtn.style.display = 'inline-flex';
            exitFullscreenBtn.style.display = 'none';
            mainMap.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            restorePointsToNormal();
        }
    });
});
