// ==========================================
// CANVAS SCALER MODULE
// ==========================================

(function() {
    'use strict';

    const STORAGE_KEY = 'deltaUI_canvasScale';
    const DEFAULT_SCALE = 1.0;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 2.0;
    const STEP = 0.1;

    let currentScale = parseFloat(localStorage.getItem(STORAGE_KEY)) || DEFAULT_SCALE;
    let isEnabled = false;

    function applyScale() {
        const canvasElements = document.getElementsByClassName('l-canvas');
        if (canvasElements.length < 2) return;

        const mainCanvas = canvasElements[0];
        const UICanvas = canvasElements[1];

        const w = mainCanvas.getAttribute('width');
        const h = mainCanvas.getAttribute('height');

        if (w && h) {
            UICanvas.setAttribute('width', parseInt(w) / currentScale);
            UICanvas.setAttribute('height', parseInt(h) / currentScale);
        }
    }

    function setScale(newScale) {
        currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, parseFloat(newScale) || DEFAULT_SCALE));
        localStorage.setItem(STORAGE_KEY, currentScale.toString());
        
        if (isEnabled) {
            applyScale();
        }
        
        console.log('[Canvas Scaler] Scale set to:', currentScale);
    }

    function onResize() {
        if (isEnabled) {
            setTimeout(applyScale, 1);
        }
    }

    function enable() {
        if (isEnabled) return;
        isEnabled = true;

        applyScale();
        window.addEventListener('resize', onResize);

        console.log('[Canvas Scaler] Enabled with scale:', currentScale);
    }

    function disable() {
        if (!isEnabled) return;
        isEnabled = false;

        window.removeEventListener('resize', onResize);

        // Reset to default scale
        const canvasElements = document.getElementsByClassName('l-canvas');
        if (canvasElements.length >= 2) {
            const mainCanvas = canvasElements[0];
            const UICanvas = canvasElements[1];

            const w = mainCanvas.getAttribute('width');
            const h = mainCanvas.getAttribute('height');

            if (w && h) {
                UICanvas.setAttribute('width', w);
                UICanvas.setAttribute('height', h);
            }
        }

        console.log('[Canvas Scaler] Disabled');
    }

    // Init
    function init() {
        const savedSetting = localStorage.getItem('deltaUI_canvasScaler');
        if (savedSetting === 'true') {
            const waitForCanvas = () => {
                if (document.getElementById('chat')) {
                    enable();
                } else {
                    setTimeout(waitForCanvas, 100);
                }
            };
            waitForCanvas();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.DeltaCanvasScaler = {
        enable: enable,
        disable: disable,
        isEnabled: function() { return isEnabled; },
        setScale: setScale,
        getScale: function() { return currentScale; },
        getMin: function() { return MIN_SCALE; },
        getMax: function() { return MAX_SCALE; },
        getStep: function() { return STEP; }
    };

    console.log('[Canvas Scaler] Module loaded');
})();
