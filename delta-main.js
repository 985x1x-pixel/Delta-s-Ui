// ==========================================
// DELTA UI MAIN v3.8
// Loaded by delta-loader.js
// ==========================================

(function() {
    "use strict";

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const BASE_URL = "https://985x1x-pixel.github.io/Delta-s-Ui";

    const EXTERNAL_SCRIPTS = [
        `${BASE_URL}/config.js`,
        `${BASE_URL}/fame-notifier.js`,
        `${BASE_URL}/chat-resizer.js`,
        `${BASE_URL}/delta-settings.js`,
    ];

    const CSS_URL = `${BASE_URL}/styles.css`;

    // Fallback config if external load fails
    const FALLBACK_CONFIG = {
        version: "3.8-fallback",
        timing: {
            INIT_DELAY: 300,
            SETTINGS_LOAD: 2000,
            SLOW_POLL: 2000,
            ELEMENT_WAIT: 250
        },
        replacements: {},
        ccEffects: [],
        buffIcons: { warrior: [], archer: [], mage: [], shaman: [] },
        fpsOptions: [],
        defaults: {
            skillbarColors: {},
            charmColors: {},
            petColor: "#0aa2af",
            toggles: {},
            hiddenBuffs: {},
            ccSettings: {},
            fpsSettings: {}
        },
        charmNames: {},
        classIcons: {},
        factionIcons: {},
        qualityColors: {
            RED: "#ff0000",
            ORANGE: "#ff7600",
            PURPLE: "#9E3BF9",
            BLUE: "#0681ea",
            GREEN: "#34CB49",
            GREY: "#5b858e",
            UPGRADE: "#eab379"
        },
        storageKeys: {
            FAME_GAINED: "totalFameGained",
            FAME_LOST: "totalFameLost",
            PLAYTIME: "totalPlaytime",
            SKILLBAR_COLORS: "deltaUI_skillbarColors",
            CHARM_COLORS: "deltaUI_charmColors",
            PET_COLOR: "deltaUI_petColor",
            HIDDEN_BUFFS: "deltaUI_hiddenBuffs",
            CC_SETTINGS: "deltaUI_ccSettings",
            FPS_SETTINGS: "deltaUI_fpsSettings"
        },
        skillColors: {},
        utilityBuffs: []
    };

    // ==========================================
    // CRITICAL CSS
    // ==========================================

    const CRITICAL_CSS = `
        #expbar { display: none !important; }
        .slot.filled { position: relative !important; overflow: visible !important; }

        #sessionStatsContainer {
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 9999;
            pointer-events: none;
        }

        .stat-box {
            background: rgba(0, 0, 0, 0.5);
            padding: 4px 8px;
            margin-bottom: 5px;
            border-radius: 6px;
            color: white;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .stat-box .fame-icon {
            width: 14px;
            height: 14px;
        }

        #delta-settings-window {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 99999 !important;
        }

        .cc-hp-border-overlay {
            position: absolute;
            inset: 0;
            border-radius: 4px;
            pointer-events: none;
            z-index: 10;
            display: none;
            box-sizing: border-box;
            box-shadow: inset 0 0 0 6px red;
        }

        /* FPS Mode - Dynamic selectors applied via JS */
        body.delta-fps-mode .delta-fps-hide { display: none !important; }

        /* Item recolor styles */
        body:not(.delta-item-recolor) .border.purp {
            border-color: #9E3BF9 !important;
            box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important;
        }

        body:not(.delta-item-recolor) .border.purp:hover {
            box-shadow: 0 0 12px rgba(158, 59, 249, 0.7) !important;
        }

        body.delta-item-recolor .border.purp:not([data-premium-box="true"]):not([data-charm="true"]):not([data-pet="true"]) {
            border: 3px solid #ff7600 !important;
            box-shadow: 0 0 6px #ff7600 !important;
        }

        body.delta-item-recolor .border.purp:not([data-premium-box="true"]):not([data-charm="true"]):not([data-pet="true"]):hover {
            box-shadow: 0 0 12px #ff7600, 0 0 20px rgba(255, 118, 0, 0.3) !important;
        }

        /* Charm colors */
        body:not(.delta-charm-colors) .slot.filled[data-charm="true"],
        body:not(.delta-charm-colors) .slot.filled[data-pet="true"] {
            border-color: #9E3BF9 !important;
            box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important;
        }

        body:not(.delta-charm-colors) .slot.filled[data-charm="true"]:hover,
        body:not(.delta-charm-colors) .slot.filled[data-pet="true"]:hover {
            box-shadow: 0 0 12px rgba(158, 59, 249, 0.7) !important;
        }

        /* Premium box decorations */
        .premium-crown {
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background: url('/data/ui/icons/crown.svg') center/contain no-repeat;
            filter: drop-shadow(0 0 4px gold);
            z-index: 20;
        }

        .premium-sparkles {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 15;
        }

        .premium-sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: gold;
            border-radius: 50%;
            animation: sparkle 1.5s ease-in-out infinite;
        }

        .sparkle-0 { top: 10%; left: 10%; animation-delay: 0s; }
        .sparkle-1 { top: 10%; right: 10%; animation-delay: 0.4s; }
        .sparkle-2 { bottom: 10%; left: 10%; animation-delay: 0.8s; }
        .sparkle-3 { bottom: 10%; right: 10%; animation-delay: 1.2s; }

        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }

        /* Delta button */
        #sysdelta {
            position: relative;
        }

        #sysdelta .delta-icon {
            font-size: 16px;
            font-weight: bold;
            color: #F5C247;
        }

        #sysdelta:hover .delta-icon {
            text-shadow: 0 0 8px rgba(245, 194, 71, 0.6);
        }
    `;

    // ==========================================
    // INJECT CRITICAL CSS
    // ==========================================

    function injectCriticalCSS() {
        if (document.getElementById("delta-critical-css")) return;
        const style = document.createElement("style");
        style.id = "delta-critical-css";
        style.textContent = CRITICAL_CSS;
        document.head.appendChild(style);
    }

    injectCriticalCSS();

    // ==========================================
    // SCRIPT LOADER
    // ==========================================

    async function loadScript(url) {
        try {
            const response = await fetch(`${url}?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const code = await response.text();
            const script = document.createElement("script");
            script.textContent = code;
            document.head.appendChild(script);

            console.log(`✅ Loaded: ${url.split("/").pop()}`);
            return true;
        } catch (error) {
            console.warn(`⚠️ Script failed: ${url}`, error.message);
            return false;
        }
    }

    async function loadCSS(url, id) {
        try {
            const response = await fetch(`${url}?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const cssText = await response.text();
            
            let style = document.getElementById(id);
            if (!style) {
                style = document.createElement("style");
                style.id = id;
                document.head.appendChild(style);
            }
            style.textContent = cssText;

            console.log(`✅ CSS loaded: ${url.split("/").pop()}`);
            return true;
        } catch (error) {
            console.warn(`⚠️ CSS failed: ${url}`, error.message);
            return false;
        }
    }

    async function loadAllScripts() {
        for (const url of EXTERNAL_SCRIPTS) {
            await loadScript(url);
            await new Promise(r => setTimeout(r, 50));
        }
    }

    // ==========================================
    // CONFIG BUILDER
    // ==========================================

    function buildRuntimeConfig() {
        const CONFIG = window.DELTA_CONFIG || FALLBACK_CONFIG;

        // Initialize mutable properties
        CONFIG.skillbarColors = { ...CONFIG.defaults.skillbarColors };
        CONFIG.charmColors = { ...CONFIG.defaults.charmColors };
        CONFIG.petColor = CONFIG.defaults.petColor;
        CONFIG.colors = CONFIG.qualityColors;
        CONFIG.hiddenBuffs = [];
        CONFIG.fpsHideSelectors = [];

        // Load saved settings
        loadSavedSettings(CONFIG);

        window.DELTA_CONFIG = CONFIG;
        return CONFIG;
    }

    function loadSavedSettings(CONFIG) {
        // Load skillbar colors
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.SKILLBAR_COLORS);
            if (saved) Object.assign(CONFIG.skillbarColors, JSON.parse(saved));
        } catch (e) { console.warn("[Delta UI] Failed to load skillbar colors:", e); }

        // Load charm colors
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.CHARM_COLORS);
            if (saved) Object.assign(CONFIG.charmColors, JSON.parse(saved));
        } catch (e) { console.warn("[Delta UI] Failed to load charm colors:", e); }

        // Load pet color
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.PET_COLOR);
            if (saved) CONFIG.petColor = saved;
        } catch (e) { console.warn("[Delta UI] Failed to load pet color:", e); }

        // Load hidden buffs
        loadHiddenBuffsFromStorage(CONFIG);

        // Load CC settings
        loadCCSettingsFromStorage(CONFIG);

        // Load FPS settings
        loadFPSSettingsFromStorage(CONFIG);
    }

    function loadHiddenBuffsFromStorage(CONFIG) {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.HIDDEN_BUFFS);
            if (!saved) return;

            const hiddenBuffsObj = JSON.parse(saved);
            const hiddenBuffs = [];

            for (const [buffId, isHidden] of Object.entries(hiddenBuffsObj)) {
                if (!isHidden) continue;

                // Search class buffs
                for (const className of Object.keys(CONFIG.buffIcons || {})) {
                    const buff = CONFIG.buffIcons[className].find(b => b.id === buffId);
                    if (buff) {
                        hiddenBuffs.push(buff.src);
                        break;
                    }
                }

                // Search utility buffs
                const utilBuff = (CONFIG.utilityBuffs || []).find(b => b.id === buffId);
                if (utilBuff) {
                    hiddenBuffs.push(utilBuff.src);
                }
            }

            CONFIG.hiddenBuffs = hiddenBuffs;
        } catch (e) {
            console.warn("[Delta UI] Failed to load hidden buffs:", e);
        }
    }

    function loadCCSettingsFromStorage(CONFIG) {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.CC_SETTINGS);
            if (!saved) return;

            const ccSettings = JSON.parse(saved);

            (CONFIG.ccEffects || []).forEach(cc => {
                const settings = ccSettings[cc.id];
                if (settings) {
                    cc.color = settings.color;
                    cc.priority = settings.priority;
                }
            });
        } catch (e) {
            console.warn("[Delta UI] Failed to load CC settings:", e);
        }
    }

    function loadFPSSettingsFromStorage(CONFIG) {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.FPS_SETTINGS);
            const fpsSettings = saved ? JSON.parse(saved) : {};

            const hideSelectors = [];

            (CONFIG.fpsOptions || []).forEach(opt => {
                const isEnabled = fpsSettings[opt.id] ?? opt.default;
                if (isEnabled) {
                    hideSelectors.push(opt.selector);
                }
            });

            CONFIG.fpsHideSelectors = hideSelectors;
        } catch (e) {
            console.warn("[Delta UI] Failed to load FPS settings:", e);
        }
    }

    // ==========================================
    // MAIN INITIALIZATION
    // ==========================================

    async function init() {
        console.log("[Delta UI] Main script initializing...");

        await loadAllScripts();
        await new Promise(r => setTimeout(r, 100));

        const CONFIG = buildRuntimeConfig();

        await loadCSS(CSS_URL, "delta-external-css");

        initializeDeltaUI(CONFIG);
    }

    function initializeDeltaUI(CONFIG) {
        // ==========================================
        // HELPER FUNCTIONS
        // ==========================================

        const $ = (sel, root = document) => {
            try {
                return root?.querySelector(sel) || null;
            } catch (e) {
                return null;
            }
        };

        const $$ = (sel, root = document) => {
            try {
                return Array.from(root?.querySelectorAll(sel) || []);
            } catch (e) {
                return [];
            }
        };

        const storage = {
            get: (k, d) => {
                try { return localStorage.getItem(k) || d; } 
                catch { return d; }
            },
            set: (k, v) => {
                try { localStorage.setItem(k, v); } 
                catch (e) { console.warn("[Delta UI] Storage error:", e); }
            },
            getJSON: (k, d) => {
                try { 
                    const val = localStorage.getItem(k);
                    return val ? JSON.parse(val) : d; 
                } catch { return d; }
            },
            setJSON: (k, v) => {
                try { localStorage.setItem(k, JSON.stringify(v)); } 
                catch (e) { console.warn("[Delta UI] Storage error:", e); }
            },
            getToggle: (k, d) => {
                const v = localStorage.getItem(`deltaUI_${k}`);
                return v !== null ? v === "true" : d;
            },
            setToggle: (k, v) => {
                localStorage.setItem(`deltaUI_${k}`, String(v));
            }
        };

        const format = {
            time: (s) => {
                if (s < 0) s = 0;
                if (s < 60) return `${s}s`;
                if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
                if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
                return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
            },
            number: (n) => {
                if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
                if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
                return String(n);
            }
        };

        const colors = {
            fromPercent: (pct) => {
                if (pct >= 109) return CONFIG.colors.RED || "#ff0000";
                if (pct >= 99) return CONFIG.colors.ORANGE || "#ff7600";
                if (pct >= 90) return CONFIG.colors.PURPLE || "#9E3BF9";
                if (pct >= 70) return CONFIG.colors.BLUE || "#0681ea";
                if (pct >= 50) return CONFIG.colors.GREEN || "#34CB49";
                return CONFIG.colors.GREY || "#5b858e";
            }
        };

        const TIMING = CONFIG.timing;

        // ==========================================
        // UTILITY FUNCTIONS
        // ==========================================

        function getPathFromSrc(src) {
            if (!src) return "";
            try {
                return new URL(src, window.location.origin).pathname;
            } catch {
                return src.split("?")[0];
            }
        }

        function setStyleImportant(el, prop, value) {
            if (!el?.style) return;
            try {
                el.style.setProperty(prop, value, "important");
            } catch {
                el.style[prop] = value;
            }
        }

        function getToggle(key, defaultVal) {
            const saved = storage.getToggle(key, null);
            if (saved !== null) return saved;
            return CONFIG.defaults.toggles[key] ?? defaultVal;
        }

        // ==========================================
        // SETTINGS MANAGER
        // ==========================================

        const SettingsManager = {
            saveSkillbarColors() {
                storage.setJSON(CONFIG.storageKeys.SKILLBAR_COLORS, CONFIG.skillbarColors);
            },

            saveCharmColors() {
                storage.setJSON(CONFIG.storageKeys.CHARM_COLORS, CONFIG.charmColors);
            },

            savePetColor() {
                storage.set(CONFIG.storageKeys.PET_COLOR, CONFIG.petColor);
            },

            resetToDefaults() {
                CONFIG.skillbarColors = { ...CONFIG.defaults.skillbarColors };
                CONFIG.charmColors = { ...CONFIG.defaults.charmColors };
                CONFIG.petColor = CONFIG.defaults.petColor;
                this.saveSkillbarColors();
                this.saveCharmColors();
                this.savePetColor();
            }
        };

        // ==========================================
        // DYNAMIC STYLE GENERATOR
        // ==========================================

        let dynamicStyle = document.getElementById("delta-dynamic-styles");
        if (!dynamicStyle) {
            dynamicStyle = document.createElement("style");
            dynamicStyle.id = "delta-dynamic-styles";
            document.head.appendChild(dynamicStyle);
        }

        function generateDynamicStyles() {
            let css = "";

            // Skillbar colors
            for (const [id, color] of Object.entries(CONFIG.skillbarColors)) {
                const extraGlow = id === "skr" ? `, 0 0 10px ${color}` : "";
                css += `#${id} { border: 3px solid ${color} !important; box-shadow: 0 0 6px ${color}${extraGlow} !important; }\n`;
            }

            // Charm colors
            for (const [charm, color] of Object.entries(CONFIG.charmColors)) {
                css += `
                    body.delta-charm-colors .slot.filled[data-${charm}="true"] {
                        border-color: ${color} !important;
                        box-shadow: 0 0 8px ${color} !important;
                    }
                    body.delta-charm-colors .slot.filled[data-${charm}="true"] > .slotdescription {
                        border-color: ${color} !important;
                        box-shadow: 0 0 12px ${color}cc !important;
                    }
                    body.delta-charm-colors .slot.filled[data-${charm}="true"] > .slotdescription .slottitle {
                        color: ${color} !important;
                    }
                `;
            }

            // Pet color
            css += `
                body.delta-charm-colors .slot.filled[data-pet="true"] {
                    border-color: ${CONFIG.petColor} !important;
                    box-shadow: 0 0 8px ${CONFIG.petColor} !important;
                }
                body.delta-charm-colors .slot.filled[data-pet="true"] > .slotdescription {
                    border-color: ${CONFIG.petColor} !important;
                    box-shadow: 0 0 12px ${CONFIG.petColor}cc !important;
                }
                body.delta-charm-colors .slot.filled[data-pet="true"] > .slotdescription .slottitle {
                    color: ${CONFIG.petColor} !important;
                }
            `;

            // Fallback styles
            css += `
                body:not(.delta-charm-colors) .slot.filled[data-charm="true"],
                body:not(.delta-charm-colors) .slot.filled[data-pet="true"] {
                    border-color: #9E3BF9 !important;
                    box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important;
                }
            `;

            // FPS Mode dynamic selectors
            if (CONFIG.fpsHideSelectors && CONFIG.fpsHideSelectors.length > 0) {
                css += `body.delta-fps-mode :is(${CONFIG.fpsHideSelectors.join(", ")}) { display: none !important; }\n`;
            }

            return css;
        }

        function updateDynamicStyles() {
            dynamicStyle.textContent = generateDynamicStyles();
        }

        updateDynamicStyles();

        // ==========================================
        // IMAGE PRELOADER
        // ==========================================

        const ImagePreloader = {
            cache: new Map(),
            preloaded: false,

            preload() {
                if (this.preloaded) return;
                this.preloaded = true;

                const replacements = CONFIG.replacements || {};
                for (const [original, replacement] of Object.entries(replacements)) {
                    const img = new Image();
                    img.src = replacement;
                    this.cache.set(original, img);
                }

                console.log(`✅ Preloaded ${Object.keys(replacements).length} replacement images`);
            },

            get(original) {
                return this.cache.get(original);
            }
        };

        ImagePreloader.preload();

        // ==========================================
        // CC INDICATOR
        // ==========================================

        let ccEnabled = getToggle("ccIndicator", true);

        function updateCCOverlays() {
            if (!ccEnabled) {
                $$(".cc-hp-border-overlay").forEach(o => o.style.display = "none");
                return;
            }

            $$(".partyframes .grid.left").forEach(frame => {
                const barsInner = frame.querySelector(".panel-black.barsInner.targetable");
                if (!barsInner) return;

                const parent = barsInner.parentElement;
                if (!parent) return;

                if (getComputedStyle(parent).position === "static") {
                    parent.style.position = "relative";
                }

                let overlay = parent.querySelector(".cc-hp-border-overlay");
                if (!overlay) {
                    overlay = document.createElement("div");
                    overlay.className = "cc-hp-border-overlay";
                    parent.appendChild(overlay);
                }

                let highestCC = null;
                const buffIcons = frame.querySelectorAll(".buffarray.party img.icon");

                buffIcons.forEach(buff => {
                    for (const cc of (CONFIG.ccEffects || [])) {
                        if (cc.priority === 0) continue;
                        if (buff.src.includes(cc.src)) {
                            if (!highestCC || cc.priority > highestCC.priority) {
                                highestCC = cc;
                            }
                        }
                    }
                });

                if (highestCC) {
                    overlay.style.display = "block";
                    overlay.style.boxShadow = `inset 0 0 0 6px ${highestCC.color}`;
                } else {
                    overlay.style.display = "none";
                }
            });
        }

        // ==========================================
        // HIDE BUFFS
        // ==========================================

        let hideBuffsEnabled = getToggle("hideBuffs", false);

        function updateHiddenBuffs() {
            const containers = $$(".partyframes .buffarray .container, #ufplayer .buffarray .container");

            if (!hideBuffsEnabled) {
                containers.forEach(c => c.style.display = "");
                return;
            }

            containers.forEach(container => {
                const icon = container.querySelector(".slot > img.icon");
                if (!icon) return;

                const shouldHide = (CONFIG.hiddenBuffs || []).some(buff => icon.src.includes(buff));
                container.style.display = shouldHide ? "none" : "";
            });
        }

        function updateHiddenBuffsConfig(hiddenBuffsObj) {
            const newHiddenBuffs = [];

            for (const [buffId, isHidden] of Object.entries(hiddenBuffsObj)) {
                if (!isHidden) continue;

                for (const className of Object.keys(CONFIG.buffIcons || {})) {
                    const buff = CONFIG.buffIcons[className].find(b => b.id === buffId);
                    if (buff) {
                        newHiddenBuffs.push(buff.src);
                        break;
                    }
                }

                const utilBuff = (CONFIG.utilityBuffs || []).find(b => b.id === buffId);
                if (utilBuff) {
                    newHiddenBuffs.push(utilBuff.src);
                }
            }

            CONFIG.hiddenBuffs = newHiddenBuffs;
            updateHiddenBuffs();
        }

        // ==========================================
        // CC CONFIG UPDATE
        // ==========================================

        function updateCCConfig(ccSettings) {
            (CONFIG.ccEffects || []).forEach(cc => {
                const settings = ccSettings[cc.id];
                if (settings) {
                    cc.color = settings.color;
                    cc.priority = settings.priority;
                }
            });
            updateCCOverlays();
        }

        // ==========================================
        // FPS CONFIG UPDATE
        // ==========================================

        function updateFPSConfig(fpsSettings) {
            const hideSelectors = [];

            (CONFIG.fpsOptions || []).forEach(opt => {
                const isEnabled = fpsSettings[opt.id] ?? opt.default;
                if (isEnabled) {
                    hideSelectors.push(opt.selector);
                }
            });

            CONFIG.fpsHideSelectors = hideSelectors;
            updateDynamicStyles();
        }

        // ==========================================
        // TOGGLE APPLICATOR
        // ==========================================

        function applyToggle(toggleId, isEnabled) {
            switch (toggleId) {
                case "ccIndicator":
                    ccEnabled = isEnabled;
                    updateCCOverlays();
                    break;

                case "hideBuffs":
                    hideBuffsEnabled = isEnabled;
                    updateHiddenBuffs();
                    break;

                case "fpsMode":
                    document.body.classList.toggle("delta-fps-mode", isEnabled);
                    break;

                case "chatTweaks": {
                    const chatControls = $("#chat-controls");
                    if (chatControls) chatControls.style.display = isEnabled ? "flex" : "none";
                    break;
                }

                case "itemRecolor":
                    document.body.classList.toggle("delta-item-recolor", isEnabled);
                    if (isEnabled) {
                        SlotProcessor.scanAll();
                    } else {
                        SlotProcessor.revertAllImages();
                        SlotProcessor.scanAll();
                    }
                    break;

                case "charmColors":
                    document.body.classList.toggle("delta-charm-colors", isEnabled);
                    break;

                case "playtimeLabels": {
                    const p = $("#totalPlaytimeUI");
                    const s = $("#sessionTimeUI");
                    if (p) p.style.display = isEnabled ? "flex" : "none";
                    if (s) s.style.display = isEnabled ? "flex" : "none";
                    break;
                }

                case "fameLabels": {
                    const g = $("#fameGainedUI");
                    const l = $("#fameLostUI");
                    if (g) g.style.display = isEnabled ? "flex" : "none";
                    if (l) l.style.display = isEnabled ? "flex" : "none";
                    break;
                }
            }
        }

        function applyAllSavedToggles() {
            const toggleIds = [
                "ccIndicator", "hideBuffs", "fpsMode", "chatTweaks",
                "itemRecolor", "charmColors", "playtimeLabels", "fameLabels"
            ];

            toggleIds.forEach(id => {
                const enabled = getToggle(id, CONFIG.defaults.toggles[id] || false);
                applyToggle(id, enabled);
            });
        }

        // ==========================================
        // PREMIUM BOX MANAGER
        // ==========================================

        const PremiumBoxManager = {
            addDecorations(slot) {
                if (!slot.querySelector(".premium-crown")) {
                    const crown = document.createElement("div");
                    crown.className = "premium-crown";
                    slot.appendChild(crown);
                }

                if (!slot.querySelector(".premium-sparkles")) {
                    const sparkles = document.createElement("div");
                    sparkles.className = "premium-sparkles";
                    sparkles.innerHTML = `
                        <div class="premium-sparkle sparkle-0"></div>
                        <div class="premium-sparkle sparkle-1"></div>
                        <div class="premium-sparkle sparkle-2"></div>
                        <div class="premium-sparkle sparkle-3"></div>
                    `;
                    slot.appendChild(sparkles);
                }
            }
        };

        // ==========================================
        // SLOT PROCESSOR
        // ==========================================

        const SlotProcessor = {
            processedSlots: new WeakMap(),

            getReplacementKey(srcPath) {
                return srcPath.replace("_grey.avif", "_q3.avif");
            },

            process(slot) {
                if (!slot || !(slot instanceof Element)) return;

                const img = slot.querySelector("img.icon") || slot.querySelector("img");
                if (!img?.src) return;

                const srcPath = getPathFromSrc(img.src);
                const normalizedPath = this.getReplacementKey(srcPath);
                const itemRecolorEnabled = document.body.classList.contains("delta-item-recolor");
                const isAlreadyReplacement = img.src.includes("githubusercontent") || img.src.includes("github");

                // Handle image replacement
                if (itemRecolorEnabled && !isAlreadyReplacement) {
                    for (const [original, replacement] of Object.entries(CONFIG.replacements || {})) {
                        if (normalizedPath.includes(original) || srcPath.includes(original)) {
                            if (!img.dataset.originalSrc) {
                                img.dataset.originalSrc = img.src;
                            }

                            const preloaded = ImagePreloader.get(original);
                            img.src = (preloaded?.complete) ? preloaded.src : replacement;
                            img.dataset.replaced = "true";
                            break;
                        }
                    }
                }

                // Revert if recolor disabled
                if (!itemRecolorEnabled && img.dataset.replaced === "true" && img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                    delete img.dataset.replaced;
                    delete img.dataset.originalSrc;
                }

                // Clear previous data attributes
                delete slot.dataset.pet;
                delete slot.dataset.charm;

                // Classify slot type
                if (normalizedPath.includes("/pet/") && (normalizedPath.includes("_q3") || srcPath.includes("_grey"))) {
                    slot.dataset.pet = "true";
                } else if (normalizedPath.includes("/charm/") || srcPath.includes("/charm/")) {
                    slot.dataset.charm = "true";

                    for (const charmKey of Object.keys(CONFIG.charmColors || {})) {
                        if (normalizedPath.includes(charmKey) || srcPath.includes(charmKey)) {
                            slot.dataset[charmKey] = "true";
                            break;
                        }
                    }
                } else if (srcPath.includes("box/box1_q3") || srcPath.includes("box/box2_q3")) {
                    if (!slot.dataset.premiumBox) {
                        slot.dataset.premiumBox = "true";
                        PremiumBoxManager.addDecorations(slot);
                    }
                }

                this.processedSlots.set(slot, img.src);
            },

            processBatch(slots) {
                const arr = Array.isArray(slots) ? slots : Array.from(slots);
                arr.forEach(slot => this.process(slot));
            },

            invalidate(slot) {
                this.processedSlots.delete(slot);
            },

            revertAllImages() {
                const images = document.querySelectorAll('img[data-replaced="true"][data-original-src]');
                images.forEach(img => {
                    img.src = img.dataset.originalSrc;
                    delete img.dataset.replaced;
                    delete img.dataset.originalSrc;
                });
                this.processedSlots = new WeakMap();
            },

            scanAll() {
                const slots = document.querySelectorAll(".slot.filled, .container.border.purp");
                this.processBatch(slots);
            }
        };

        // ==========================================
        // SKILL COLORS (Skills Window)
        // ==========================================

        function applySkillColors() {
            $$(".skillbox.svelte-1e0alkc .slot.filled").forEach(slot => {
                if (slot.dataset.colorApplied) return;

                const img = slot.querySelector("img.icon.slotskill");
                if (!img) return;

                const match = img.src.match(/skills\/(\d+)/);
                if (!match) return;

                const skillId = match[1];
                const color = (CONFIG.skillColors || {})[skillId];

                if (color) {
                    slot.style.setProperty("border-color", color, "important");
                    slot.style.setProperty("box-shadow", `0 0 10px ${color}66, 0 0 5px ${color}44`, "important");
                    slot.dataset.colorApplied = "true";
                }
            });
        }

        // ==========================================
        // DAMAGE BAR PROCESSING
        // ==========================================

        function processDamageBar(progressBar) {
            if (!progressBar) return;

            const left = progressBar.querySelector("span.left");
            if (!left || left.querySelector("img.dmg-class-icon")) return;

            for (const [cls, src] of Object.entries(CONFIG.classIcons || {})) {
                if (progressBar.classList.contains(cls)) {
                    const img = document.createElement("img");
                    img.className = "dmg-class-icon";
                    img.src = src;
                    img.alt = "";
                    img.style.marginRight = "4px";
                    left.prepend(img);
                    break;
                }
            }
        }

        function scanDamageBars() {
            $$(".window.panel-black.svelte-1f1v3u3 .wrapper .bar .progressBar").forEach(processDamageBar);
        }

        // ==========================================
        // TOOLTIP PROCESSING
        // ==========================================

        function updateTooltipUI(tooltip) {
            if (!tooltip) return;

            const typeEl = tooltip.querySelector(".type.textwhite");
            if (typeEl?.textContent.toLowerCase().includes("charm")) return;

            const parentSlot = tooltip.closest(".slot.filled");
            if (parentSlot) {
                for (const charmKey of Object.keys(CONFIG.charmColors || {})) {
                    if (parentSlot.dataset[charmKey] === "true") return;
                }
                if (parentSlot.dataset.pet === "true") return;
            }

            const percentSpan = tooltip.querySelector(".type span");
            if (!percentSpan) return;

            const rawPercent = percentSpan.textContent.replace("%", "").trim();
            const percent = parseInt(rawPercent, 10);
            if (isNaN(percent)) return;

            const color = colors.fromPercent(percent);

            const title = tooltip.querySelector(".slottitle");
            if (title) setStyleImportant(title, "color", color);

            setStyleImportant(tooltip, "border-color", color);
            setStyleImportant(tooltip, "box-shadow", `0 0 12px ${color}cc`);
        }

        function updateCharmTooltipColors() {
            $$(".slotdescription").forEach(tooltip => {
                const titleEl = tooltip.querySelector(".slottitle");
                if (!titleEl) return;

                const titleText = titleEl.textContent.trim().toLowerCase();

                for (const [charmKey, color] of Object.entries(CONFIG.charmColors || {})) {
                    const charmName = (CONFIG.charmNames || {})[charmKey]?.toLowerCase();
                    if (!charmName) continue;

                    if (titleText.includes(charmName)) {
                        setStyleImportant(titleEl, "color", color);
                        setStyleImportant(tooltip, "border-color", color);
                        setStyleImportant(tooltip, "box-shadow", `0 0 12px ${color}cc`);
                        break;
                    }
                }
            });
        }

        function recolorStatLines(container) {
            container.querySelectorAll(".textpurp span, .textblue span").forEach(span => {
                const parent = span.parentElement;
                const match = span.textContent.match(/(\d+)%/);
                if (!match) return;

                const pct = parseInt(match[1], 10);
                const color = colors.fromPercent(pct);
                setStyleImportant(parent, "color", color);
                setStyleImportant(parent, "text-shadow", "none");
            });
        }

        function recolorSingleItemWindow() {
            $$(".window-pos").forEach(windowPos => {
                const icon = windowPos.querySelector('.titleframe img.titleicon[src*="char.svg"]');
                const title = windowPos.querySelector(".textprimary.title > div");

                if (icon && title?.textContent.trim() === "Item") {
                    const slot = windowPos.querySelector(".slot");
                    if (!slot) return;

                    const pctSpan = slot.querySelector(".type.textwhite span");
                    let titleColor = null;

                    if (pctSpan) {
                        const match = pctSpan.textContent.match(/(\d+)%/);
                        if (match) titleColor = colors.fromPercent(parseInt(match[1], 10));
                    }

                    recolorStatLines(slot);

                    if (titleColor) {
                        const borderPanel = slot.querySelector(".panel-black.border.purp");
                        if (borderPanel) {
                            setStyleImportant(borderPanel, "border-color", titleColor);
                            setStyleImportant(borderPanel, "box-shadow", `${titleColor} 0 0 6px`);
                        }

                        const slotTitle = slot.querySelector(".slottitle");
                        if (slotTitle) setStyleImportant(slotTitle, "color", titleColor);
                    }
                }
            });
        }

        // ==========================================
        // CHAT ITEM COLORING
        // ==========================================

        function recolorChatItems() {
            $$("#chat .chatItem:not([data-fully-colored])").forEach(item => {
                const percentSpan = item.querySelector(".textpurp-l, .textblue-l");
                if (!percentSpan) return;

                const match = percentSpan.textContent.trim().match(/(\d+)%/);
                if (!match) return;

                const pct = parseInt(match[1], 10);
                const color = colors.fromPercent(pct);
                if (!color) return;

                item.style.backgroundColor = `${color}33`;
                setStyleImportant(percentSpan, "color", color);
                setStyleImportant(item, "color", color);

                const upgradeSpan = item.querySelector(".textprimary");
                if (upgradeSpan) {
                    setStyleImportant(upgradeSpan, "color", "#40edff");
                }

                item.dataset.fullyColored = "true";
            });
        }

        // ==========================================
        // WAR STATISTICS
        // ==========================================

        function colorWarStatisticsTable() {
            $$(".window.panel-black.svelte-1f1v3u3").forEach(win => {
                const titleDiv = win.querySelector(".title > div");
                if (titleDiv?.textContent.trim() !== "War Statistics") return;

                const table = win.querySelector("table.panel-black");
                if (!table) return;

                $$("tbody tr", table).forEach(row => {
                    const cells = $$("td", row);
                    if (cells.length >= 5) {
                        cells[1].style.setProperty("color", "#ee960b", "important");
                        cells[2].style.setProperty("color", "#6acc6a", "important");
                        cells[3].style.setProperty("color", "#c32929", "important");
                        cells[4].style.setProperty("color", "#fe48fc", "important");
                    }
                });
            });
        }

        // ==========================================
        // FACTION STATS PANEL
        // ==========================================

        let factionPanel = null;

        function createFactionPanel(warStats) {
            if (factionPanel) factionPanel.remove();

            factionPanel = document.createElement("div");
            factionPanel.id = "faction-stats-panel";
            factionPanel.innerHTML = `
                <div class="fs-section vg" id="vg-stats"></div>
                <div class="fs-vs">VS</div>
                <div class="fs-section bl" id="bl-stats"></div>
            `;

            const parent = warStats.parentElement;
            if (parent) {
                parent.style.display = "flex";
                parent.style.alignItems = "flex-start";
                parent.appendChild(factionPanel);
            }
        }

        function updateFactionPanel() {
            const warStats = $(".battleboard-window");

            if (!warStats) {
                if (factionPanel) {
                    factionPanel.remove();
                    factionPanel = null;
                }
                return;
            }

            if (!factionPanel || !document.contains(factionPanel)) {
                createFactionPanel(warStats);
            }

            if (!factionPanel) return;

            const rows = warStats.querySelectorAll("tbody tr");
            const factions = { vg: [], bl: [] };

            rows.forEach(row => {
                const fameCell = row.querySelector(".textfame");
                if (!fameCell) return;

                const fame = parseInt(fameCell.textContent.replace(/,/g, "")) || 0;
                if (fame === 0) return;

                const nameEl = row.querySelector(".name");
                if (!nameEl) return;

                const factionClass = nameEl.classList.contains("textf0") ? "vg" : "bl";
                const clsImg = row.querySelector("img.icon")?.src || "";
                const damage = parseInt(row.cells[1]?.textContent.replace(/,/g, "")) || 0;
                const healing = parseInt(row.cells[2]?.textContent.replace(/,/g, "")) || 0;
                const kills = parseInt(row.cells[3]?.textContent.replace(/,/g, "")) || 0;

                factions[factionClass].push({ classIcon: clsImg, dmg: damage, heal: healing, kills, fame });
            });

            const ICONS = CONFIG.factionIcons || {};

            ["vg", "bl"].forEach(f => {
                const data = factions[f];
                const numPlayers = data.length;

                const classCounts = { warrior: 0, mage: 0, shaman: 0, archer: 0 };
                let totalDmg = 0, totalHeal = 0, totalKills = 0, totalFame = 0;

                data.forEach(p => {
                    if (p.classIcon.includes("0.avif")) classCounts.warrior++;
                    else if (p.classIcon.includes("1.avif")) classCounts.mage++;
                    else if (p.classIcon.includes("2.avif")) classCounts.archer++;
                    else if (p.classIcon.includes("3.avif")) classCounts.shaman++;

                    totalDmg += p.dmg;
                    totalHeal += p.heal;
                    totalKills += p.kills;
                    totalFame += p.fame;
                });

                const other = f === "vg" ? "bl" : "vg";
                const otherData = factions[other];

                const otherKills = otherData.reduce((a, p) => a + p.kills, 0);
                const otherDmg = otherData.reduce((a, p) => a + p.dmg, 0);
                const otherHeal = otherData.reduce((a, p) => a + p.heal, 0);
                const otherFame = otherData.reduce((a, p) => a + p.fame, 0);

                const cmp = (a, b) => a > b ? "win" : a < b ? "lose" : "tie";

                const statsDiv = factionPanel.querySelector(`#${f}-stats`);
                if (statsDiv) {
                    statsDiv.innerHTML = `
                        <div class="fs-header ${f}">
                            <img src="${ICONS[f] || ""}" alt="">
                            <span class="fs-name ${f}">${f.toUpperCase()}</span>
                            <span class="fs-count"><strong>${numPlayers}</strong></span>
                        </div>
                        <div class="fs-classes">
                            <span class="fs-class"><img src="${ICONS.warrior || ""}"><span>${classCounts.warrior}</span></span>
                            <span class="fs-class"><img src="${ICONS.mage || ""}"><span>${classCounts.mage}</span></span>
                            <span class="fs-class"><img src="${ICONS.shaman || ""}"><span>${classCounts.shaman}</span></span>
                            <span class="fs-class"><img src="${ICONS.archer || ""}"><span>${classCounts.archer}</span></span>
                        </div>
                        <div class="fs-stats">
                            <div class="fs-stat"><span class="fs-label">⚔</span><span class="fs-value ${cmp(totalKills, otherKills)}">${format.number(totalKills)}</span></div>
                            <div class="fs-stat"><span class="fs-label">💥</span><span class="fs-value ${cmp(totalDmg, otherDmg)}">${format.number(totalDmg)}</span></div>
                            <div class="fs-stat"><span class="fs-label">💚</span><span class="fs-value ${cmp(totalHeal, otherHeal)}">${format.number(totalHeal)}</span></div>
                            <div class="fs-stat"><span class="fs-label"><img src="${ICONS.fame || ""}"></span><span class="fs-value ${cmp(totalFame, otherFame)}">${format.number(totalFame)}</span></div>
                        </div>
                    `;
                }
            });
        }

        // ==========================================
        // UI ELEMENTS
        // ==========================================

        function removePartyBtn() {
            const partyBtn = $("div.btn.party");
            if (partyBtn) partyBtn.remove();
        }

        function fixBattleboardWindow() {
            $$(".window.panel-black.svelte-1f1v3u3").forEach(win => {
                const titleDiv = win.querySelector(".title > div");
                const isWarStats = titleDiv?.textContent.trim() === "War Statistics";
                win.classList.toggle("battleboard-window", isWarStats);
            });
        }

        // Session stats container
        function createSessionStats() {
            if (document.getElementById("sessionStatsContainer")) return;

            const fameContainer = document.createElement("div");
            fameContainer.id = "sessionStatsContainer";
            fameContainer.innerHTML = `
                <div class="stat-box" id="totalPlaytimeUI">Total playtime: <span class="value">0s</span></div>
                <div class="stat-box" id="sessionTimeUI">Session time: <span class="value">0s</span></div>
                <div class="stat-box" id="fameGainedUI">Fame Gained: <span class="fame-value">
                    <img src="/data/ui/currency/fame.svg" class="fame-icon">
                    <span id="fameGainedAmount">0</span>
                </span></div>
                <div class="stat-box" id="fameLostUI">Fame Lost: <span class="fame-value">
                    <img src="/data/ui/currency/fame.svg" class="fame-icon">
                    <span id="fameLostAmount">0</span>
                </span></div>
            `;
            document.body.appendChild(fameContainer);
        }

        createSessionStats();

        const sessionTimeUI = $("#sessionTimeUI .value");
        const totalPlaytimeUI = $("#totalPlaytimeUI .value");
        const fameGainedAmount = $("#fameGainedAmount");
        const fameLostAmount = $("#fameLostAmount");

        const sessionStart = Date.now();
        let totalPlaytime = Number(storage.get(CONFIG.storageKeys.PLAYTIME, "0")) || 0;

        function updateTimeUI() {
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            if (sessionTimeUI) sessionTimeUI.textContent = format.time(elapsed);
            if (totalPlaytimeUI) totalPlaytimeUI.textContent = format.time(totalPlaytime + elapsed);
        }

        function updateFameUI() {
            if (window.FameNotifier) {
                if (fameGainedAmount) fameGainedAmount.textContent = window.FameNotifier.getGained().toLocaleString();
                if (fameLostAmount) fameLostAmount.textContent = window.FameNotifier.getLost().toLocaleString();
            } else {
                const gained = parseInt(storage.get(CONFIG.storageKeys.FAME_GAINED, "0"), 10) || 0;
                const lost = parseInt(storage.get(CONFIG.storageKeys.FAME_LOST, "0"), 10) || 0;
                if (fameGainedAmount) fameGainedAmount.textContent = gained.toLocaleString();
                if (fameLostAmount) fameLostAmount.textContent = lost.toLocaleString();
            }
        }

        window.addEventListener("beforeunload", () => {
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            storage.set(CONFIG.storageKeys.PLAYTIME, String(totalPlaytime + elapsed));
        });

        // ==========================================
        // FULLSCREEN TOGGLE
        // ==========================================

        let fullscreenKey = storage.get("deltaUI_fullscreenKey", "o");

        function setFullscreenKey(key) {
            fullscreenKey = key.toLowerCase();
        }

        window.addEventListener("keydown", (e) => {
            const active = document.activeElement;
            const isTyping = active?.tagName === "INPUT" ||
                           active?.tagName === "TEXTAREA" ||
                           active?.isContentEditable;

            if (active?.classList?.contains("keybind-input")) return;

            if (!isTyping && e.key.toLowerCase() === fullscreenKey) {
                const isFS = document.fullscreenElement || document.webkitFullscreenElement;
                if (isFS) {
                    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
                } else {
                    document.documentElement.requestFullscreen?.();
                }
            }
        });

        // ==========================================
        // DELTA BUTTON
        // ==========================================

        function injectDeltaButton() {
            if ($("#sysdelta")) return;

            const cornerBtnbar = $(".l-corner-ur .btnbar");
            if (!cornerBtnbar) return;

            const syschar = $("#syschar", cornerBtnbar);
            if (!syschar) return;

            const deltaBtn = document.createElement("div");
            deltaBtn.id = "sysdelta";
            deltaBtn.className = "btn border black";
            deltaBtn.title = "Delta's UI Settings";
            deltaBtn.innerHTML = '<span class="delta-icon">Δ</span>';

            deltaBtn.addEventListener("click", () => {
                window.DeltaSettings?.toggle();
            });

            cornerBtnbar.insertBefore(deltaBtn, syschar);
        }

        // ==========================================
        // MUTATION OBSERVER
        // ==========================================

        const mainObserver = new MutationObserver((mutations) => {
            let shouldUpdateTooltips = false;
            let shouldUpdateDamageBars = false;
            let shouldUpdateWindows = false;
            const slotsToProcess = new Set();

            for (const mutation of mutations) {
                if (mutation.type === "attributes" && mutation.attributeName === "src") {
                    const target = mutation.target;
                    if (target.tagName === "IMG") {
                        const slot = target.closest(".slot.filled, .container.border.purp");
                        if (slot) {
                            SlotProcessor.invalidate(slot);
                            slotsToProcess.add(slot);
                        }
                    }
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    if (node.classList?.contains("slot") && node.classList?.contains("filled")) {
                        slotsToProcess.add(node);
                    }

                    if (node.querySelectorAll) {
                        node.querySelectorAll(".slot.filled").forEach(slot => slotsToProcess.add(slot));
                    }

                    if (node.classList?.contains("slotdescription") || node.querySelector?.(".slotdescription")) {
                        shouldUpdateTooltips = true;
                    }

                    if (node.classList?.contains("progressBar") || node.querySelector?.(".progressBar")) {
                        shouldUpdateDamageBars = true;
                    }

                    if (node.classList?.contains("window") || node.querySelector?.(".window")) {
                        shouldUpdateWindows = true;
                    }
                }
            }

            if (slotsToProcess.size > 0) {
                slotsToProcess.forEach(slot => SlotProcessor.process(slot));
            }

            if (shouldUpdateTooltips) {
                $$(".slotdescription").forEach(updateTooltipUI);
                updateCharmTooltipColors();
            }

            if (shouldUpdateDamageBars) {
                requestAnimationFrame(scanDamageBars);
            }

            if (shouldUpdateWindows) {
                requestAnimationFrame(() => {
                    fixBattleboardWindow();
                    colorWarStatisticsTable();
                    recolorSingleItemWindow();
                    applySkillColors();
                });
            }
        });

        mainObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src"]
        });

        // ==========================================
        // UPDATE LOOPS
        // ==========================================

        function createUpdateLoop() {
            let frameCount = 0;

            function tick() {
                frameCount++;

                if (frameCount % 30 === 0) {
                    const warStats = $(".battleboard-window");
                    if (warStats) updateFactionPanel();
                    updateCCOverlays();
                    updateHiddenBuffs();
                }

                if (frameCount % 60 === 0) {
                    updateTimeUI();
                    updateFameUI();
                    frameCount = 0;
                }

                requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        }

        createUpdateLoop();

        setInterval(() => {
            fixBattleboardWindow();
            if (!$("#sysdelta")) injectDeltaButton();
            SlotProcessor.scanAll();
            recolorChatItems();
        }, TIMING.SLOW_POLL);

        // ==========================================
        // EXPOSE API
        // ==========================================

        window.DeltaUI = {
            applyToggle,
            updateDynamicStyles,
            saveSkillbarColors: () => SettingsManager.saveSkillbarColors(),
            saveCharmColors: () => SettingsManager.saveCharmColors(),
            savePetColor: () => SettingsManager.savePetColor(),
            resetToDefaults: () => SettingsManager.resetToDefaults(),
            setFullscreenKey,
            updateHiddenBuffsConfig,
            updateCCConfig,
            updateFPSConfig,
            version: CONFIG.version
        };

        // ==========================================
        // INITIAL SETUP
        // ==========================================

        removePartyBtn();
        fixBattleboardWindow();
        updateFameUI();
        SlotProcessor.scanAll();
        colorWarStatisticsTable();
        injectDeltaButton();
        applySkillColors();

        setTimeout(() => {
            SlotProcessor.scanAll();
            scanDamageBars();
            colorWarStatisticsTable();
            injectDeltaButton();
            applyAllSavedToggles();
        }, TIMING.INIT_DELAY);

        function waitForElement(selector, callback, maxAttempts = 20) {
            let attempts = 0;
            const check = () => {
                const el = document.querySelector(selector);
                if (el) {
                    callback(el);
                } else if (++attempts < maxAttempts) {
                    setTimeout(check, TIMING.ELEMENT_WAIT);
                }
            };
            check();
        }

        waitForElement(".l-corner-ur .btnbar", injectDeltaButton);

        console.log(`✅ Delta UI v${CONFIG.version} initialized`);
    }

    // ==========================================
    // START
    // ==========================================

    init();

})();
