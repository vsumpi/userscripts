// ==UserScript==
// @name         Zoom Level Indicator - GeoGuessr
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Injecting zoom level for parties. Black 1-6: Global-Country; Yellow: 7-14 County, State; Red: 15+ Street;
// @author       vsumpi, Gemini Pro 3.1, Flash-Lite(Extended)
// @match        https://www.geoguessr.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let globalMapZoom = 0;

    // --- 1. Map Hook: Intercept Google Maps API Safely ---
    let apiHooked = false;
    const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map && !apiHooked) {
            apiHooked = true;
            clearInterval(checkGoogleMaps);

            const OriginalMap = window.google.maps.Map;

            window.google.maps.Map = class extends OriginalMap {
                constructor(...args) {
                    super(...args);

                    const updateZoom = () => {
                        const path = window.location.pathname;
                        const activeGamePaths = [
                            '/game/', '/duels/', '/multiplayer/', '/challenge/',
                            '/bullseye/', '/live-challenge/', '/singleplayer/expedition', '/party'
                        ];
                        const isGame = activeGamePaths.some(gamePath => path.includes(gamePath));

                        if (!isGame || path.includes('/result')) return;

                        let currentZoom = this.getZoom();
                        if (currentZoom === undefined || currentZoom === null) currentZoom = 0;

                        globalMapZoom = currentZoom;

                        const zoomPill = document.getElementById('custom-zoom-level');
                        if (zoomPill) {
                            zoomPill.innerText = `Lvl: ${globalMapZoom}`;

                            if (currentZoom >= 15) {
                                zoomPill.style.color = '#d32f2f';
                            } else if (currentZoom >= 7) {
                                zoomPill.style.color = '#f9a825';
                            } else {
                                zoomPill.style.color = '#000000';
                            }
                        }
                    };

                    this.addListener('zoom_changed', updateZoom);
                    setTimeout(updateZoom, 500);
                }
            };
        }
    }, 10);

    // --- 2. DOM Injection: Efficient MutationObserver ---
const injectUI = () => {
    const controlsWrapper = document.querySelector('[class*="guess-map_controls"]');
    if (!controlsWrapper || document.getElementById('custom-zoom-level')) return;

    const buttonContainer = controlsWrapper.querySelector('div') || controlsWrapper;

    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'row';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '6px';
    buttonContainer.style.width = 'max-content';

    const zoomPill = document.createElement('div');
    zoomPill.id = 'custom-zoom-level';

    Object.assign(zoomPill.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        height: '20px',
        margin: '4px',
        flexShrink: '0',
        backgroundColor: 'oklch(0.999994 0.0000497986 23.7884)',
        color: '#ffffff',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
    });

    zoomPill.innerText = `Lvl: ${globalMapZoom}`;
    buttonContainer.appendChild(zoomPill);
};

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                injectUI();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
