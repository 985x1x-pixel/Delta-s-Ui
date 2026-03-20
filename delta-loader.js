// ==========================================
// DELTA UI LOADER v2.0
// Handles game detection, script loading, initialization
// ==========================================

(function() {
    "use strict";

    // Prevent double initialization
    if (window.DeltaLoader) {
        return;
    }

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const BASE_URL = "https://985x1x-pixel.github.io/Delta-s-Ui";

    // Script load order (dependencies first)
    const SCRIPTS = [
        "config.js",          // Must be first - configuration
        "delta-lib.js",       // Must be second - utilities
        "fame-notifier.js",   // Independent module
        "chat-resizer.js",    // Independent module
        "canvas-scaler.js",   // Independent module
        "mouseover.js",       // Independent module
        "party-arranger.js",  // Independent module
        "delta-main.js",      // Main UI - depends on config
        "delta-settings.js"   // Settings UI - depends on main
    ];

    const CSS_FILE = "styles.css";

    const TIMING = {
        GAME_CHECK_INTERVAL: 200,
        GAME_CHECK_TIMEOUT: 30000,
        SCRIPT_LOAD_DELAY: 100,
        DEPENDENCY_WAIT: 50,
        TOAST_SUCCESS: 2500,
        TOAST_ERROR: 4000
    };

    // ==========================================
    // STATE
    // ==========================================

    let isInitialized = false;
    let loadedScripts = new Set();
    let failedScripts = new Set();

    // ==========================================
    // TOAST STYLES
    // ==========================================

    const TOAST_CSS = `
        #delta-loader-toast {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999999;
            background: rgba(20, 24, 35, 0.95);
            border: 1px solid rgba(245, 194, 71, 0.4);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 13px;
            color: #e5e7eb;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
        }

        #delta-loader-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }

        #delta-loader-toast.success {
            border-color: rgba(74, 222, 128, 0.4);
        }

        #delta-loader-toast.error {
            border-color: rgba(248, 113, 113, 0.4);
        }

        #delta-loader-toast .delta-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(245, 194, 71, 0.3);
            border-top-color: #F5C247;
            border-radius: 50%;
            animation: delta-loader-spin 0.8s linear infinite;
        }

        @keyframes delta-loader-spin {
            to { transform: rotate(360deg); }
        }

        #delta-loader-toast .delta-icon {
            font-size: 16px;
            line-height: 1;
        }

        #delta-loader-toast .delta-icon.success {
            color: #4ade80;
        }

        #delta-loader-toast .delta-icon.error {
            color: #f87171;
        }

        #delta-loader-toast .delta-logo {
            color: #F5C247;
            font-weight: bold;
            font-size: 16px;
        }

        #delta-loader-toast .delta-text {
            color: #e5e7eb;
        }

        #delta-loader-toast .delta-subtext {
            color: #9ca3af;
            font-size: 11px;
            margin-left: 4px;
        }
    `;

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Inject loader styles
     */
    function injectStyles() {
        if (document.getElementById("delta-loader-css")) return;
        
        const style = document.createElement("style");
        style.id = "delta-loader-css";
        style.textContent = TOAST_CSS;
        document.head.appendChild(style);
    }

    /**
     * Remove loader styles
     */
    function removeStyles() {
        const style = document.getElementById("delta-loader-css");
        if (style) style.remove();
    }

    /**
     * Get or create toast element
     * @returns {HTMLElement}
     */
    function getToast() {
        let toast = document.getElementById("delta-loader-toast");
        
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "delta-loader-toast";
            document.body.appendChild(toast);
        }
        
        return toast;
    }

    /**
     * Show toast message
     * @param {string} message - Main message
     * @param {string} type - "loading" | "success" | "error"
     * @param {string} subtext - Optional subtext
     */
    function showToast(message, type = "loading", subtext = "") {
        const toast = getToast();
        
        // Reset classes
        toast.className = "";
        
        // Build icon
        let iconHTML = "";
        if (type === "loading") {
            iconHTML = '<div class="delta-spinner"></div>';
        } else if (type === "success") {
            iconHTML = '<span class="delta-icon success">✓</span>';
            toast.classList.add("success");
        } else if (type === "error") {
            iconHTML = '<span class="delta-icon error">✕</span>';
            toast.classList.add("error");
        }

        // Build subtext
        const subtextHTML = subtext ? `<span class="delta-subtext">${subtext}</span>` : "";

        toast.innerHTML = `
            <span class="delta-logo">Δ</span>
            ${iconHTML}
            <span class="delta-text">${message}${subtextHTML}</span>
        `;

        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add("visible");
        });
    }

    /**
     * Hide toast with animation
     * @param {number} delay - Delay before hiding
     */
    function hideToast(delay = 0) {
        setTimeout(() => {
            const toast = document.getElementById("delta-loader-toast");
            if (toast) {
                toast.classList.remove("visible");
                // Remove after animation
                setTimeout(() => {
                    toast.remove();
                    // Also remove styles after everything is done
                    setTimeout(removeStyles, 100);
                }, 300);
            }
        }, delay);
    }

    /**
     * Show success toast and auto-hide
     * @param {string} message - Message to show
     * @param {string} subtext - Optional subtext
     */
    function toastSuccess(message, subtext = "") {
        showToast(message, "success", subtext);
        hideToast(TIMING.TOAST_SUCCESS);
    }

    /**
     * Show error toast and auto-hide
     * @param {string} message - Message to show
     * @param {string} subtext - Optional subtext
     */
    function toastError(message, subtext = "") {
        showToast(message, "error", subtext);
        hideToast(TIMING.TOAST_ERROR);
    }

    // ==========================================
    // GAME DETECTION
    // ==========================================

    /**
     * Check if the game UI is ready
     * @returns {boolean}
     */
    function isGameReady() {
        // Check for essential game elements
        const hasSkillbar = document.querySelector("#skillbar");
        const hasChat = document.querySelector("#chat");
        const hasCorner = document.querySelector(".l-corner-ur");
        const hasBtnBar = document.querySelector(".btnbar");
        
        // At least one main UI element must exist
        const hasUI = hasSkillbar || hasChat || hasCorner || hasBtnBar;
        
        // Check loading screen is gone
        const loadingEl = document.querySelector(".loading");
        const isLoading = loadingEl && 
            window.getComputedStyle(loadingEl).display !== "none" &&
            window.getComputedStyle(loadingEl).visibility !== "hidden";

        return hasUI && !isLoading;
    }

    /**
     * Wait for game to be ready
     * @returns {Promise<boolean>}
     */
    function waitForGame() {
        return new Promise((resolve) => {
            // Check immediately
            if (isGameReady()) {
                resolve(true);
                return;
            }

            const startTime = Date.now();
            let checkCount = 0;

            const check = () => {
                checkCount++;
                
                if (isGameReady()) {
                    resolve(true);
                    return;
                }

                // Timeout - proceed anyway (game might be on character select)
                if (Date.now() - startTime > TIMING.GAME_CHECK_TIMEOUT) {
                    resolve(false);
                    return;
                }

                setTimeout(check, TIMING.GAME_CHECK_INTERVAL);
            };

            setTimeout(check, TIMING.GAME_CHECK_INTERVAL);
        });
    }

    // ==========================================
    // SCRIPT LOADING
    // ==========================================

    /**
     * Load a single script
     * @param {string} filename - Script filename
     * @returns {Promise<boolean>}
     */
    async function loadScript(filename) {
        // Skip if already loaded
        if (loadedScripts.has(filename)) {
            return true;
        }

        const fullUrl = `${BASE_URL}/${filename}?v=${Date.now()}`;

        try {
            const response = await fetch(fullUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const code = await response.text();
            
            // Create and execute script
            const script = document.createElement("script");
            script.textContent = code;
            script.dataset.deltaScript = filename;
            document.head.appendChild(script);

            loadedScripts.add(filename);
            return true;

        } catch (error) {
            failedScripts.add(filename);
            return false;
        }
    }

    /**
     * Load CSS file
     * @param {string} filename - CSS filename
     * @returns {Promise<boolean>}
     */
    async function loadCSS(filename) {
        const fullUrl = `${BASE_URL}/${filename}?v=${Date.now()}`;

        try {
            const response = await fetch(fullUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const css = await response.text();

            // Create or update style element
            let style = document.getElementById("delta-external-css");
            if (!style) {
                style = document.createElement("style");
                style.id = "delta-external-css";
                document.head.appendChild(style);
            }
            style.textContent = css;

            return true;

        } catch (error) {
            return false;
        }
    }

    /**
     * Wait for a dependency to be available
     * @param {string} globalName - Name of global variable to wait for
     * @param {number} timeout - Maximum wait time in ms
     * @returns {Promise<boolean>}
     */
    function waitForDependency(globalName, timeout = 5000) {
        return new Promise((resolve) => {
            if (window[globalName]) {
                resolve(true);
                return;
            }

            const startTime = Date.now();

            const check = () => {
                if (window[globalName]) {
                    resolve(true);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    resolve(false);
                    return;
                }

                setTimeout(check, TIMING.DEPENDENCY_WAIT);
            };

            setTimeout(check, TIMING.DEPENDENCY_WAIT);
        });
    }

    /**
     * Load all scripts in order
     * @returns {Promise<{success: number, failed: number}>}
     */
    async function loadAllScripts() {
        let successCount = 0;
        let failedCount = 0;

        for (const script of SCRIPTS) {
            // Update toast
            showToast("Loading...", "loading", script);

            const success = await loadScript(script);
            
            if (success) {
                successCount++;

                // Wait for critical dependencies before continuing
                if (script === "config.js") {
                    await waitForDependency("DELTA_CONFIG", 3000);
                } else if (script === "delta-lib.js") {
                    await waitForDependency("DeltaLib", 3000);
                }

                // Small delay between scripts
                await new Promise(r => setTimeout(r, TIMING.SCRIPT_LOAD_DELAY));
            } else {
                failedCount++;
            }
        }

        return { success: successCount, failed: failedCount };
    }

    // ==========================================
    // MAIN INITIALIZATION
    // ==========================================

    /**
     * Main initialization function
     */
    async function init() {
        if (isInitialized) {
            return;
        }
        isInitialized = true;

        // Inject loader styles
        injectStyles();

        // Show initial toast
        showToast("Waiting for game...", "loading");

        try {
            // Wait for game to be ready
            const gameReady = await waitForGame();

            if (!gameReady) {
                showToast("Loading anyway...", "loading");
                // Still proceed - might be on character select
            }

            // Load CSS first
            showToast("Loading styles...", "loading");
            const cssLoaded = await loadCSS(CSS_FILE);

            if (!cssLoaded) {
                // CSS is critical, show warning but continue
                showToast("Styles may be missing", "loading");
            }

            // Load all scripts
            const result = await loadAllScripts();

            // Show final result
            const total = SCRIPTS.length;
            
            if (result.failed === 0) {
                toastSuccess("Delta UI loaded!", `${result.success} modules`);
            } else if (result.success > 0) {
                toastSuccess(
                    "Delta UI loaded", 
                    `${result.success}/${total} modules (${result.failed} failed)`
                );
            } else {
                toastError("Failed to load Delta UI");
            }

        } catch (error) {
            toastError("Initialization failed");
        }
    }

    /**
     * Reload all Delta UI scripts
     */
    async function reload() {
        // Clear loaded state
        loadedScripts.clear();
        failedScripts.clear();

        // Remove existing scripts
        document.querySelectorAll("script[data-delta-script]").forEach(s => s.remove());

        // Remove existing styles
        document.getElementById("delta-external-css")?.remove();

        // Clear global references
        delete window.DELTA_CONFIG;
        delete window.DeltaLib;
        delete window.DeltaUI;
        delete window.DeltaSettings;
        delete window.DeltaMouseover;
        delete window.DeltaPartyArranger;
        delete window.DeltaCanvasScaler;
        delete window.FameNotifier;

        // Reset init flag
        isInitialized = false;

        // Re-initialize
        await init();
    }

    /**
     * Get loader status
     * @returns {Object}
     */
    function getStatus() {
        return {
            initialized: isInitialized,
            loaded: Array.from(loadedScripts),
            failed: Array.from(failedScripts),
            total: SCRIPTS.length
        };
    }

    // ==========================================
    // EXPOSE API
    // ==========================================

    window.DeltaLoader = Object.freeze({
        // Methods
        reload,
        getStatus,
        
        // Toast utilities (for other modules)
        showToast,
        hideToast,
        toastSuccess,
        toastError,

        // Constants
        BASE_URL,
        SCRIPTS
    });

    // ==========================================
    // START
    // ==========================================

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
