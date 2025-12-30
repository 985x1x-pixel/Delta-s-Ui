// ==========================================
// DELTA UI LOADER v1.0
// Handles game detection, script loading, initialization
// ==========================================

(function() {
    "use strict";

    // Prevent double initialization
    if (window.DeltaLoader) {
        console.log("[Delta] Loader already running");
        return;
    }

    console.log("[Delta] Loader starting...");

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const BASE_URL = "https://985x1x-pixel.github.io/Delta-s-Ui";
    
    const SCRIPTS = [
        "config.js",
        "fame-notifier.js",
        "chat-resizer.js",
        "delta-main.js",
        "delta-settings.js",
        "mouseover.js",
    ];

    const CSS_FILE = "styles.css";

    const TIMING = {
        GAME_CHECK_INTERVAL: 200,
        GAME_CHECK_TIMEOUT: 30000,
        SCRIPT_DELAY: 50,
        TOAST_SUCCESS_DURATION: 2500,
        TOAST_ERROR_DURATION: 4000
    };

    // ==========================================
    // TOAST STYLES
    // ==========================================

    const LOADER_CSS = `
        #delta-toast {
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
            animation: deltaToastIn 0.3s ease-out;
        }

        @keyframes deltaToastIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #delta-toast.hiding {
            animation: deltaToastOut 0.2s ease-in forwards;
        }

        @keyframes deltaToastOut {
            to { opacity: 0; transform: translateY(20px); }
        }

        #delta-toast .delta-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(245, 194, 71, 0.3);
            border-top-color: #F5C247;
            border-radius: 50%;
            animation: deltaSpin 0.8s linear infinite;
        }

        @keyframes deltaSpin {
            to { transform: rotate(360deg); }
        }

        #delta-toast .delta-icon {
            font-size: 16px;
            line-height: 1;
        }

        #delta-toast.success {
            border-color: rgba(74, 222, 128, 0.4);
        }

        #delta-toast.success .delta-icon {
            color: #4ade80;
        }

        #delta-toast.error {
            border-color: rgba(248, 113, 113, 0.4);
        }

        #delta-toast.error .delta-icon {
            color: #f87171;
        }

        #delta-toast .delta-logo {
            color: #F5C247;
            font-weight: bold;
            font-size: 16px;
            margin-right: 4px;
        }
    `;

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function injectStyles() {
        if (document.getElementById("delta-loader-css")) return;
        
        const style = document.createElement("style");
        style.id = "delta-loader-css";
        style.textContent = LOADER_CSS;
        document.head.appendChild(style);
    }

    function showToast(message, type = "loading") {
        let toast = document.getElementById("delta-toast");
        
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "delta-toast";
            document.body.appendChild(toast);
        }

        toast.className = type === "loading" ? "" : type;

        let iconHTML = "";
        if (type === "loading") {
            iconHTML = '<div class="delta-spinner"></div>';
        } else if (type === "success") {
            iconHTML = '<span class="delta-icon">✓</span>';
        } else if (type === "error") {
            iconHTML = '<span class="delta-icon">✕</span>';
        }

        toast.innerHTML = `
            <span class="delta-logo">Δ</span>
            ${iconHTML}
            <span>${message}</span>
        `;

        return toast;
    }

    function hideToast(delay = 0) {
        setTimeout(() => {
            const toast = document.getElementById("delta-toast");
            if (toast) {
                toast.classList.add("hiding");
                setTimeout(() => toast.remove(), 200);
            }
        }, delay);
    }

    function toastSuccess(message) {
        showToast(message, "success");
        hideToast(TIMING.TOAST_SUCCESS_DURATION);
    }

    function toastError(message) {
        showToast(message, "error");
        hideToast(TIMING.TOAST_ERROR_DURATION);
    }

    // ==========================================
    // GAME DETECTION
    // ==========================================

    function isGameReady() {
        // Check for key game UI elements
        const hasSkillbar = document.querySelector("#skillbar");
        const hasChat = document.querySelector("#chat");
        const hasTopBar = document.querySelector(".l-corner-ur");
        
        // Check loading screen is gone
        const loadingEl = document.querySelector(".loading");
        const isLoading = loadingEl && getComputedStyle(loadingEl).display !== "none";

        return (hasSkillbar || hasChat || hasTopBar) && !isLoading;
    }

    function waitForGame() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function check() {
                if (isGameReady()) {
                    console.log("[Delta] Game is ready");
                    resolve();
                    return;
                }

                if (Date.now() - startTime > TIMING.GAME_CHECK_TIMEOUT) {
                    console.warn("[Delta] Game detection timeout, proceeding anyway");
                    resolve();
                    return;
                }

                setTimeout(check, TIMING.GAME_CHECK_INTERVAL);
            }

            check();
        });
    }

    // ==========================================
    // SCRIPT LOADING
    // ==========================================

    function loadScript(url) {
        return new Promise((resolve) => {
            const fullUrl = url.startsWith("http") ? url : `${BASE_URL}/${url}`;
            
            fetch(`${fullUrl}?v=${Date.now()}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.text();
                })
                .then(code => {
                    const script = document.createElement("script");
                    script.textContent = code;
                    document.head.appendChild(script);
                    console.log(`[Delta] ✓ Loaded: ${url}`);
                    resolve(true);
                })
                .catch(error => {
                    console.error(`[Delta] ✗ Failed: ${url}`, error.message);
                    resolve(false);
                });
        });
    }

    function loadCSS(url) {
        return new Promise((resolve) => {
            const fullUrl = url.startsWith("http") ? url : `${BASE_URL}/${url}`;
            
            fetch(`${fullUrl}?v=${Date.now()}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.text();
                })
                .then(css => {
                    let style = document.getElementById("delta-external-css");
                    if (!style) {
                        style = document.createElement("style");
                        style.id = "delta-external-css";
                        document.head.appendChild(style);
                    }
                    style.textContent = css;
                    console.log(`[Delta] ✓ CSS loaded: ${url}`);
                    resolve(true);
                })
                .catch(error => {
                    console.error(`[Delta] ✗ CSS failed: ${url}`, error.message);
                    resolve(false);
                });
        });
    }

    async function loadAllScripts() {
        let successCount = 0;
        let failCount = 0;

        for (const script of SCRIPTS) {
            const success = await loadScript(script);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
            // Small delay between scripts to ensure proper initialization order
            await new Promise(r => setTimeout(r, TIMING.SCRIPT_DELAY));
        }

        return { successCount, failCount, total: SCRIPTS.length };
    }

    // ==========================================
    // MAIN INITIALIZATION
    // ==========================================

    async function init() {
        // Inject loader styles first
        injectStyles();

        // Show loading toast
        showToast("Waiting for game...");

        try {
            // Wait for game to be ready
            await waitForGame();

            // Update toast
            showToast("Loading Delta UI...");

            // Load CSS first
            await loadCSS(CSS_FILE);

            // Load all scripts
            const result = await loadAllScripts();

            // Show result
            if (result.failCount === 0) {
                toastSuccess(`Delta UI loaded! (${result.successCount} modules)`);
            } else if (result.successCount > 0) {
                toastSuccess(`Delta UI loaded with warnings (${result.failCount} failed)`);
            } else {
                toastError("Failed to load Delta UI");
            }

        } catch (error) {
            console.error("[Delta] Initialization error:", error);
            toastError("Delta UI failed to initialize");
        }
    }

    // ==========================================
    // EXPOSE API
    // ==========================================

    window.DeltaLoader = {
        reload: init,
        showToast,
        toastSuccess,
        toastError,
        hideToast
    };

    // ==========================================
    // START
    // ==========================================

    init();

})();
