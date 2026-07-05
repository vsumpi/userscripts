// ==UserScript==
// @name         Zoom Level Indicator - GeoGuessr
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Injecting zoom level for parties. Black 1-6: Global-Country; Yellow: 7-14 County, State; Red: 15+ Street;
// @author       vsumpi
// @match        https://www.geoguessr.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let apiHooked = false;
    const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps?.Map && !apiHooked) {
            apiHooked = true;
            clearInterval(checkGoogleMaps);

            const OriginalMap = window.google.maps.Map;
            window.google.maps.Map = class extends OriginalMap {
                constructor(...args) {
                    super(...args);
                    this.addListener('zoom_changed', () => {
                        const zoom = this.getZoom();
                        updateZoomUI(zoom);
                    });
                }
            };
        }
    }, 500);

    function updateZoomUI(zoom) {
        let zoomPill = document.getElementById('custom-zoom-level');

        if (!zoomPill) {
            injectUI();
            zoomPill = document.getElementById('custom-zoom-level');
            if (!zoomPill) return;
        }

        zoomPill.innerText = `Lvl: ${zoom}`;
        if (zoom >= 15) {
            zoomPill.style.color = '#d32f2f';
        } else if (zoom >= 7) {
            zoomPill.style.color = '#f9a825';
        } else {
            zoomPill.style.color = '#000000';
        }
    }

    function injectUI() {
        if (document.getElementById('custom-zoom-level')) return;

        const controlsWrapper = document.querySelector('[class*="guess-map_controls"]');
        if (!controlsWrapper) return;

        // Ensure the parent wrapper can anchor our absolute positioned element
        if (getComputedStyle(controlsWrapper).position === 'static') {
            controlsWrapper.style.position = 'relative';
        }

        const zoomPill = document.createElement('div');
        zoomPill.id = 'custom-zoom-level';

        Object.assign(zoomPill.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 10px',
            height: '24px',
            backgroundColor: 'oklch(0.999994 0.0000497986 23.7884)',
            color: '#000000',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: '99999',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            position: 'absolute',
            bottom: 'calc(100% + 3px)',
            left: '30%',
            transform: 'translateX(-50%)'
        });

        zoomPill.innerText = `Lvl: ?`;

        controlsWrapper.appendChild(zoomPill);
    }

    const observer = new MutationObserver(() => {
        injectUI();
    });

    const startObserving = setInterval(() => {
        const gameContainer = document.querySelector('#__next');
        if (gameContainer) {
            observer.observe(gameContainer, { childList: true, subtree: true });
            clearInterval(startObserving);
        }
    }, 1000);

})();
