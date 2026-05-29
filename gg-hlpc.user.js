// ==UserScript==
// @name         GeoGuessr - Hide Live Player Count
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides the live players count container on GeoGuessr maps.
// @author       vsumpi
// @match        https://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        [class*="live-players-count_container"] {
            display: none !important;
        }
    `;

    // Inject as early as possible
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            document.head.appendChild(style);
        });
    }
})();
