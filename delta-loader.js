// ==========================================
// DELTA UI LOADER v3.1.0
// Script loader for Delta UI modules
// ==========================================

(function() {
    "use strict";

    if (window.DeltaLoader) return;

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const VERSION = "3.1.0";
    const BASE_URL = "https://cdn.jsdelivr.net/gh/985x1x-pixel/Delta-s-Ui@main";

    const SCRIPTS = [
        "config.js",
        "delta-lib.js",
        "fame-notifier.js",
        "chat-resizer.js",
        "canvas-scaler.js",
        "mouseover.js",
        "party-arranger.js",
        "delta-main.js",
        "delta-settings.js"
    ];

    const CSS_FILE = "styles.css";

    const TIMING = {
        GAME_CHECK_INTERVAL: 200,
        GAME_CHECK_TIMEOUT: 30000,
        SCRIPT_LOAD_DELAY: 100,
        DEPENDENCY_WAIT: 50,
        TOAST_SUCCESS: 2500,
        TOAST_ERROR: 4000,
        CSS_REINJECT_INTERVALS: [100, 500, 1000, 2000, 4000, 8000]
    };

    // ==========================================
    // STATE
    // ==========================================

    let isInitialized = false;
    let loadedScripts = new Set();
    let failedScripts = new Set();
    let cssContent = null;
    let cssInjectionCount = 0;

    // ==========================================
    // CRITICAL CSS - Injected immediately with maximum specificity
    // ==========================================

    const CRITICAL_CSS = `
        /* ============================================
           DELTA UI - CRITICAL OVERRIDES
           These styles use maximum specificity
           ============================================ */

        /* Hide default exp bar */
        html body #expbar,
        body #expbar,
        #expbar {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
        }

        /* Session stats container */
        html body #sessionStatsContainer,
        body #sessionStatsContainer,
        #sessionStatsContainer {
            position: fixed !important;
            bottom: 10px !important;
            right: 10px !important;
            z-index: 9999 !important;
            pointer-events: none !important;
            user-select: none !important;
            max-width: 240px !important;
        }

        /* Delta settings window */
        html body #delta-settings-window,
        body #delta-settings-window,
        #delta-settings-window {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 99999 !important;
            pointer-events: all !important;
        }

        /* Delta button in toolbar */
        html body .btnbar #sysdelta,
        body .btnbar #sysdelta,
        .btnbar #sysdelta,
        #sysdelta {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
        }

        #sysdelta .delta-icon {
            font-family: 'Arial Black', Arial, sans-serif !important;
            font-size: 18px !important;
            font-weight: 900 !important;
            color: #fff !important;
            text-shadow: 0 0 6px rgba(255,255,255,0.6), 1px 1px 3px rgba(0,0,0,0.9) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            line-height: 1 !important;
            position: relative !important;
            z-index: 1 !important;
        }

        /* Checkboxes - Maximum specificity */
        html body .btn.checkbox,
        html body .settings .btn.checkbox,
        html body #delta-settings-window .btn.checkbox,
        html body #delta-settings-window .settings .btn.checkbox,
        html body .buff-settings .btn.checkbox,
        html body .fps-settings .btn.checkbox,
        #delta-settings-window .btn.checkbox[data-toggle],
        #delta-settings-window .btn.checkbox[data-buff-id],
        #delta-settings-window .btn.checkbox[data-fps-id] {
            width: 18px !important;
            height: 18px !important;
            min-width: 18px !important;
            max-width: 18px !important;
            min-height: 18px !important;
            max-height: 18px !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 3px !important;
            border: 2px solid #5b858e !important;
            background: rgba(0, 0, 0, 0.4) !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 0 !important;
            line-height: 1 !important;
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
        }

        html body .btn.checkbox:hover,
        #delta-settings-window .btn.checkbox:hover {
            border-color: #7ab8c4 !important;
            background: rgba(91, 133, 142, 0.2) !important;
        }

        html body .btn.checkbox.active,
        #delta-settings-window .btn.checkbox.active {
            background: #5b858e !important;
            border-color: #7ab8c4 !important;
        }

        html body .btn.checkbox.active::after,
        #delta-settings-window .btn.checkbox.active::after {
            content: "✓" !important;
            color: white !important;
            font-size: 11px !important;
            font-weight: bold !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
        }

        /* Hide any text inside checkboxes */
        html body .btn.checkbox *,
        #delta-settings-window .btn.checkbox * {
            display: none !important;
        }

        /* Stat boxes */
        html body .stat-box,
        body .stat-box,
        .stat-box {
            font-family: "hordes" !important;
            background: rgba(0, 0, 0, 0.5) !important;
            padding: 4px 8px !important;
            margin-bottom: 5px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            color: white !important;
            text-shadow: 0 0 2px black, 0 0 4px black, 1px 1px 1px black !important;
            border: 1px solid transparent !important;
        }

        .stat-box span.value {
            margin-left: 8px !important;
            white-space: nowrap !important;
            font-weight: bold !important;
            color: #FFA500 !important;
            text-shadow: 0 0 1px black, 0 0 2px black, 1px 1px 1px black !important;
        }

        .stat-box .fame-value {
            color: #fe48fc !important;
            display: inline-flex !important;
            align-items: center !important;
        }

        .stat-box .fame-icon {
            width: 16px !important;
            height: 16px !important;
            margin-left: 4px !important;
            margin-right: 2px !important;
        }

        /* Settings window layout */
        #delta-settings-window .window.panel-black {
            min-width: 500px !important;
            max-width: 600px !important;
        }

        #delta-settings-window .divide {
            display: flex !important;
            min-height: 450px !important;
            max-height: 70vh !important;
        }

        #delta-settings-window .delta-nav {
            display: flex !important;
            flex-direction: column !important;
            min-width: 100px !important;
            background: rgba(0, 0, 0, 0.2) !important;
            border-right: 1px solid rgba(166, 220, 213, 0.1) !important;
        }

        #delta-settings-window .delta-nav .choice {
            padding: 12px 16px !important;
            cursor: pointer !important;
            color: #5b858e !important;
            font-size: 13px !important;
            border-left: 2px solid transparent !important;
            transition: all 0.15s ease !important;
        }

        #delta-settings-window .delta-nav .choice:hover {
            color: #a6dcd5 !important;
            background: rgba(166, 220, 213, 0.05) !important;
        }

        #delta-settings-window .delta-nav .choice.active {
            color: #F5C247 !important;
            background: rgba(245, 194, 71, 0.08) !important;
            border-left-color: #F5C247 !important;
        }

        #delta-settings-window .menu {
            flex: 1 !important;
            padding: 12px 16px !important;
            overflow-y: auto !important;
        }

        #delta-settings-window .tab-panel {
            display: none !important;
        }

        #delta-settings-window .tab-panel.active {
            display: block !important;
        }

        #delta-settings-window .settings {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            gap: 8px 16px !important;
            align-items: center !important;
        }

        #delta-settings-window h3.textprimary {
            margin: 16px 0 8px 0 !important;
            padding-bottom: 4px !important;
            border-bottom: 1px solid rgba(166, 220, 213, 0.1) !important;
            font-size: 13px !important;
            font-weight: normal !important;
            color: #F5C247 !important;
        }

        #delta-settings-window h3.textprimary:first-child {
            margin-top: 0 !important;
        }

        /* Keybind inputs */
        #delta-settings-window .keybind-input,
        .keybind-input {
            width: 50px !important;
            height: 28px !important;
            background: rgba(0, 0, 0, 0.4) !important;
            border: 1px solid rgba(166, 220, 213, 0.3) !important;
            border-radius: 3px !important;
            color: #F5C247 !important;
            font-size: 14px !important;
            font-weight: bold !important;
            text-align: center !important;
            text-transform: uppercase !important;
            cursor: pointer !important;
        }

        #delta-settings-window .keybind-input:focus {
            outline: none !important;
            border-color: #F5C247 !important;
            box-shadow: 0 0 8px rgba(245, 194, 71, 0.4) !important;
            background: rgba(245, 194, 71, 0.1) !important;
        }

        /* Color inputs */
        #delta-settings-window .color-input-wrapper {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        #delta-settings-window .color-preview {
            width: 18px !important;
            height: 18px !important;
            border-radius: 3px !important;
            border: 2px solid #5b858e !important;
        }

        #delta-settings-window input[type="color"] {
            width: 28px !important;
            height: 22px !important;
            padding: 0 !important;
            border: 1px solid rgba(166, 220, 213, 0.3) !important;
            border-radius: 3px !important;
            background: rgba(0, 0, 0, 0.4) !important;
            cursor: pointer !important;
        }

        /* Slider */
        #delta-settings-window .slider-wrapper {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }

        #delta-settings-window .delta-slider {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: 120px !important;
            height: 6px !important;
            border-radius: 3px !important;
            background: #1a1a2e !important;
            border: 1px solid #5b858e !important;
            outline: none !important;
            cursor: pointer !important;
        }

        #delta-settings-window .delta-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: 16px !important;
            height: 16px !important;
            border-radius: 50% !important;
            background: #F5C247 !important;
            cursor: pointer !important;
            border: 2px solid #1a1a2e !important;
            box-shadow: 0 0 6px rgba(245, 194, 71, 0.5) !important;
        }

        #delta-settings-window .slider-value {
            min-width: 40px !important;
            text-align: center !important;
            color: #F5C247 !important;
            font-weight: bold !important;
            font-size: 13px !important;
        }

        /* About section */
        #delta-settings-window .about-content {
            text-align: center !important;
            padding: 30px 20px !important;
        }

        #delta-settings-window .about-logo {
            font-size: 48px !important;
            color: #F5C247 !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
        }

        #delta-settings-window .about-version {
            color: #5b858e !important;
            font-size: 12px !important;
            margin-bottom: 16px !important;
        }

        #delta-settings-window .about-author {
            color: #a6dcd5 !important;
            font-size: 13px !important;
            margin-bottom: 20px !important;
        }

        #delta-settings-window .about-desc {
            color: #5b858e !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
            max-width: 300px !important;
            margin: 0 auto !important;
        }

        /* Buttons */
        #delta-settings-window .btn.blue {
            background: rgba(59, 130, 246, 0.2) !important;
            border: 1px solid rgba(59, 130, 246, 0.4) !important;
            color: #60a5fa !important;
            padding: 6px 12px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            transition: all 0.15s ease !important;
        }

        #delta-settings-window .btn.blue:hover {
            background: rgba(59, 130, 246, 0.3) !important;
            border-color: rgba(59, 130, 246, 0.6) !important;
        }

        #delta-settings-window .btn.orange {
            background: rgba(249, 115, 22, 0.2) !important;
            border: 1px solid rgba(249, 115, 22, 0.4) !important;
            color: #fb923c !important;
            padding: 6px 12px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            transition: all 0.15s ease !important;
        }

        #delta-settings-window .btn.orange:hover {
            background: rgba(249, 115, 22, 0.3) !important;
            border-color: rgba(249, 115, 22, 0.6) !important;
        }

        #delta-settings-window .btn.small {
            width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 12px !important;
            background: rgba(244, 41, 41, 0.15) !important;
            border: 1px solid rgba(244, 41, 41, 0.3) !important;
            color: #F42929 !important;
            border-radius: 3px !important;
            cursor: pointer !important;
        }

        #delta-settings-window .btn.small:hover {
            background: rgba(244, 41, 41, 0.25) !important;
        }

        /* Keybind wrapper */
        #delta-settings-window .keybind-input-wrapper {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        /* Keybind hint */
        #delta-settings-window .keybind-hint {
            margin-top: 12px !important;
            padding: 8px 12px !important;
            background: rgba(0, 0, 0, 0.2) !important;
            border-radius: 3px !important;
            border-left: 2px solid #5b858e !important;
        }

        /* Close button */
        #delta-settings-window .close-btn {
            cursor: pointer !important;
            opacity: 0.7 !important;
            transition: opacity 0.15s ease, transform 0.15s ease !important;
        }

        #delta-settings-window .close-btn:hover {
            opacity: 1 !important;
            transform: scale(1.1) !important;
        }

        /* Scrollbar */
        #delta-settings-window .menu::-webkit-scrollbar {
            width: 6px !important;
        }

        #delta-settings-window .menu::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2) !important;
            border-radius: 3px !important;
        }

        #delta-settings-window .menu::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15) !important;
            border-radius: 3px !important;
        }

        #delta-settings-window .menu::-webkit-scrollbar-thumb:hover {
            background: #a6dcd5 !important;
        }

        /* Faction stats panel */
        html body #faction-stats-panel,
        #faction-stats-panel {
            position: relative !important;
            z-index: 100 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            margin-left: 8px !important;
            background: rgba(22, 23, 30, 0.95) !important;
            border: 1px solid #2a2b35 !important;
            border-radius: 8px !important;
            color: #ccc !important;
            font-family: inherit !important;
            box-shadow: 0 3px 12px rgba(0,0,0,0.5) !important;
            overflow: hidden !important;
            pointer-events: auto !important;
        }

        /* Title frame draggable */
        #delta-settings-window .titleframe {
            cursor: move !important;
        }

        /* Rainbow animation for delta button */
        @keyframes deltaRainbow {
            0%, 85%, 100% { border-color: #ff6b35; box-shadow: 0 0 8px #ff6b35; }
            14% { border-color: #f7c948; box-shadow: 0 0 8px #f7c948; }
            28% { border-color: #6bcb77; box-shadow: 0 0 8px #6bcb77; }
            42% { border-color: #4d96ff; box-shadow: 0 0 8px #4d96ff; }
            57% { border-color: #9b59b6; box-shadow: 0 0 8px #9b59b6; }
            71% { border-color: #ff6b9d; box-shadow: 0 0 8px #ff6b9d; }
        }

        #sysdelta {
            animation: deltaRainbow 3s linear infinite !important;
        }
    `;

    // ==========================================
    // TOAST CSS
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
        #delta-loader-toast.visible { opacity: 1; transform: translateY(0); }
        #delta-loader-toast.success { border-color: rgba(74, 222, 128, 0.4); }
        #delta-loader-toast.error { border-color: rgba(248, 113, 113, 0.4); }
        #delta-loader-toast .delta-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(245, 194, 71, 0.3);
            border-top-color: #F5C247;
            border-radius: 50%;
            animation: delta-loader-spin 0.8s linear infinite;
        }
        @keyframes delta-loader-spin { to { transform: rotate(360deg); } }
        #delta-loader-toast .delta-icon { font-size: 16px; line-height: 1; }
        #delta-loader-toast .delta-icon.success { color: #4ade80; }
        #delta-loader-toast .delta-icon.error { color: #f87171; }
        #delta-loader-toast .delta-logo { color: #F5C247; font-weight: bold; font-size: 16px; }
        #delta-loader-toast .delta-text { color: #e5e7eb; }
        #delta-loader-toast .delta-subtext { color: #9ca3af; font-size: 11px; margin-left: 4px; }
    `;

    // ==========================================
    // CSS INJECTION
    // ==========================================

    function injectCriticalCSS() {
        // Remove existing
        document.getElementById("delta-critical-css")?.remove();
        document.getElementById("delta-loader-css")?.remove();

        // Create new style element
        const style = document.createElement("style");
        style.id = "delta-critical-css";
        style.setAttribute("data-delta", "critical");
        style.textContent = TOAST_CSS + "\n" + CRITICAL_CSS;

        // Insert at the END of head for highest priority
        document.head.appendChild(style);

        console.log("[DeltaLoader] Critical CSS injected");
    }

    function injectExternalCSS() {
        if (!cssContent) {
            console.warn("[DeltaLoader] No CSS content to inject");
            return false;
        }

        // Remove existing
        document.getElementById("delta-external-css")?.remove();

        // Create style element
        const style = document.createElement("style");
        style.id = "delta-external-css";
        style.setAttribute("data-delta", "external");
        style.textContent = cssContent;

        // Insert at the END of head
        document.head.appendChild(style);

        // Also ensure critical CSS is still at the end (highest priority)
        const criticalCSS = document.getElementById("delta-critical-css");
        if (criticalCSS) {
            document.head.appendChild(criticalCSS);
        }

        cssInjectionCount++;
        console.log(`[DeltaLoader] External CSS injected (count: ${cssInjectionCount})`);

        return true;
    }

    function ensureCSSPriority() {
        // Move delta CSS elements to end of head for maximum priority
        const externalCSS = document.getElementById("delta-external-css");
        const criticalCSS = document.getElementById("delta-critical-css");

        if (externalCSS) {
            document.head.appendChild(externalCSS);
        }
        if (criticalCSS) {
            document.head.appendChild(criticalCSS);
        }
    }

    // ==========================================
    // TOAST FUNCTIONS
    // ==========================================

    function getToast() {
        let toast = document.getElementById("delta-loader-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "delta-loader-toast";
            document.body.appendChild(toast);
        }
        return toast;
    }

    function showToast(message, type = "loading", subtext = "") {
        const toast = getToast();
        toast.className = "";

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

        const subtextHTML = subtext ? `<span class="delta-subtext">${subtext}</span>` : "";
        toast.innerHTML = `<span class="delta-logo">Δ</span>${iconHTML}<span class="delta-text">${message}${subtextHTML}</span>`;

        requestAnimationFrame(() => toast.classList.add("visible"));
    }

    function hideToast(delay = 0) {
        setTimeout(() => {
            const toast = document.getElementById("delta-loader-toast");
            if (toast) {
                toast.classList.remove("visible");
                setTimeout(() => toast.remove(), 300);
            }
        }, delay);
    }

    function toastSuccess(message, subtext = "") {
        showToast(message, "success", subtext);
        hideToast(TIMING.TOAST_SUCCESS);
    }

    function toastError(message, subtext = "") {
        showToast(message, "error", subtext);
        hideToast(TIMING.TOAST_ERROR);
    }

    // ==========================================
    // GAME DETECTION
    // ==========================================

    function isGameReady() {
        const hasSkillbar = document.querySelector("#skillbar");
        const hasChat = document.querySelector("#chat");
        const hasCorner = document.querySelector(".l-corner-ur");
        const hasBtnBar = document.querySelector(".btnbar");
        const hasUI = hasSkillbar || hasChat || hasCorner || hasBtnBar;

        const loadingEl = document.querySelector(".loading");
        const isLoading = loadingEl &&
            getComputedStyle(loadingEl).display !== "none" &&
            getComputedStyle(loadingEl).visibility !== "hidden";

        return hasUI && !isLoading;
    }

    function waitForGame() {
        return new Promise((resolve) => {
            if (isGameReady()) {
                resolve(true);
                return;
            }

            const startTime = Date.now();

            const check = () => {
                if (isGameReady()) {
                    resolve(true);
                    return;
                }
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

    async function loadScript(filename) {
        if (loadedScripts.has(filename)) return true;

        const fullUrl = `${BASE_URL}/${filename}?v=${Date.now()}`;

        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const code = await response.text();
            const script = document.createElement("script");
            script.textContent = code;
            script.dataset.deltaScript = filename;
            document.head.appendChild(script);

            loadedScripts.add(filename);
            return true;
        } catch (error) {
            console.error(`[DeltaLoader] Failed to load ${filename}:`, error);
            failedScripts.add(filename);
            return false;
        }
    }

    async function loadCSS(filename) {
        const fullUrl = `${BASE_URL}/${filename}?v=${Date.now()}`;

        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            cssContent = await response.text();
            console.log(`[DeltaLoader] CSS loaded (${cssContent.length} bytes)`);
            return true;
        } catch (error) {
            console.error(`[DeltaLoader] Failed to load ${filename}:`, error);
            return false;
        }
    }

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

    async function loadAllScripts() {
        let successCount = 0;
        let failedCount = 0;

        for (const script of SCRIPTS) {
            showToast("Loading...", "loading", script);

            const success = await loadScript(script);

            if (success) {
                successCount++;

                // Wait for critical dependencies
                if (script === "config.js") {
                    await waitForDependency("DELTA_CONFIG", 3000);
                } else if (script === "delta-lib.js") {
                    await waitForDependency("DeltaLib", 3000);
                }

                await new Promise(r => setTimeout(r, TIMING.SCRIPT_LOAD_DELAY));
            } else {
                failedCount++;
            }
        }

        return { success: successCount, failed: failedCount };
    }

    // ==========================================
    // CSS MAINTENANCE
    // ==========================================

    function setupCSSMaintenance() {
        // Repeatedly ensure CSS priority at intervals
        TIMING.CSS_REINJECT_INTERVALS.forEach(delay => {
            setTimeout(() => {
                injectExternalCSS();
                ensureCSSPriority();
            }, delay);
        });

        // Watch for new stylesheets being added and ensure our CSS stays on top
        const observer = new MutationObserver((mutations) => {
            let needsReorder = false;

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === "STYLE" || node.tagName === "LINK") {
                        if (!node.dataset?.delta) {
                            needsReorder = true;
                            break;
                        }
                    }
                }
                if (needsReorder) break;
            }

            if (needsReorder) {
                // Debounce reordering
                clearTimeout(observer._timeout);
                observer._timeout = setTimeout(ensureCSSPriority, 100);
            }
        });

        observer.observe(document.head, { childList: true });

        // Also check periodically
        setInterval(ensureCSSPriority, 10000);
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init() {
        if (isInitialized) return;
        isInitialized = true;

        console.log(`[DeltaLoader] v${VERSION} starting...`);

        // Inject critical CSS immediately
        injectCriticalCSS();

        showToast("Waiting for game...", "loading");

        try {
            const gameReady = await waitForGame();
            if (!gameReady) {
                showToast("Loading anyway...", "loading");
            }

            // Load external CSS
            showToast("Loading styles...", "loading");
            const cssLoaded = await loadCSS(CSS_FILE);

            if (cssLoaded) {
                injectExternalCSS();
            }

            // Load scripts
            const result = await loadAllScripts();

            // Setup CSS maintenance to keep styles applied
            setupCSSMaintenance();

            // Final CSS injection
            setTimeout(() => {
                injectExternalCSS();
                ensureCSSPriority();
            }, 100);

            const total = SCRIPTS.length;

            if (result.failed === 0) {
                toastSuccess("Delta UI loaded!", `${result.success} modules`);
                console.log(`[DeltaLoader] Successfully loaded ${result.success} modules`);
            } else if (result.success > 0) {
                toastSuccess("Delta UI loaded", `${result.success}/${total} modules (${result.failed} failed)`);
                console.warn(`[DeltaLoader] Loaded ${result.success}/${total} modules, ${result.failed} failed`);
            } else {
                toastError("Failed to load Delta UI");
                console.error("[DeltaLoader] Failed to load any modules");
            }
        } catch (error) {
            console.error("[DeltaLoader] Initialization failed:", error);
            toastError("Initialization failed");
        }
    }

    // ==========================================
    // RELOAD
    // ==========================================

    async function reload() {
        console.log("[DeltaLoader] Reloading...");

        // Clear state
        loadedScripts.clear();
        failedScripts.clear();
        cssContent = null;
        cssInjectionCount = 0;
        isInitialized = false;

        // Remove injected elements
        document.querySelectorAll("script[data-delta-script]").forEach(s => s.remove());
        document.getElementById("delta-external-css")?.remove();
        document.getElementById("delta-critical-css")?.remove();
        document.getElementById("delta-loader-css")?.remove();

        // Delete globals
        delete window.DELTA_CONFIG;
        delete window.DeltaLib;
        delete window.DeltaUI;
        delete window.DeltaSettings;
        delete window.DeltaMouseover;
        delete window.DeltaPartyArranger;
        delete window.DeltaCanvasScaler;
        delete window.FameNotifier;
        delete window.ChatResizer;

        // Reinitialize
        await init();
    }

    // ==========================================
    // STATUS & DEBUG
    // ==========================================

    function getStatus() {
        return {
            version: VERSION,
            initialized: isInitialized,
            loaded: Array.from(loadedScripts),
            failed: Array.from(failedScripts),
            total: SCRIPTS.length,
            baseUrl: BASE_URL,
            cssInjectionCount,
            cssLoaded: !!cssContent,
            cssLength: cssContent?.length || 0,
            elements: {
                criticalCSS: !!document.getElementById("delta-critical-css"),
                externalCSS: !!document.getElementById("delta-external-css"),
                settingsWindow: !!document.getElementById("delta-settings-window"),
                sessionStats: !!document.getElementById("sessionStatsContainer"),
                deltaButton: !!document.getElementById("sysdelta")
            }
        };
    }

    function reinjectCSS() {
        injectCriticalCSS();
        injectExternalCSS();
        ensureCSSPriority();
        console.log("[DeltaLoader] CSS reinjected manually");
    }

    function debugCSS() {
        const status = getStatus();
        console.log("=== Delta CSS Debug ===");
        console.log("CSS Loaded:", status.cssLoaded);
        console.log("CSS Length:", status.cssLength);
        console.log("Injection Count:", status.cssInjectionCount);
        console.log("Elements:", status.elements);

        // Check style order in head
        const styles = Array.from(document.head.querySelectorAll("style, link[rel='stylesheet']"));
        console.log("Total styles in head:", styles.length);

        const deltaStyles = styles.filter(s => s.id?.includes("delta") || s.dataset?.delta);
        console.log("Delta styles:", deltaStyles.map(s => ({ id: s.id, position: styles.indexOf(s) })));

        // Test if critical styles are actually applied
        const testEl = document.getElementById("expbar");
        if (testEl) {
            const computed = getComputedStyle(testEl);
            console.log("#expbar display:", computed.display);
            console.log("#expbar visibility:", computed.visibility);
        } else {
            console.log("#expbar not found in DOM");
        }

        return status;
    }

    // ==========================================
    // STARTUP
    // ==========================================

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    window.DeltaLoader = Object.freeze({
        version: VERSION,
        reload,
        getStatus,
        reinjectCSS,
        debugCSS,
        showToast,
        hideToast,
        toastSuccess,
        toastError,
        ensureCSSPriority,
        BASE_URL,
        SCRIPTS
    });

})();
