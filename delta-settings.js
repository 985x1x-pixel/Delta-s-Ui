// ==========================================
// DELTA UI SETTINGS v3.0.0
// Settings panel for Delta UI configuration
// ==========================================

(function() {
    "use strict";

    // ==========================================
    // GUARD: Prevent double initialization
    // ==========================================
    if (window.DeltaSettings) {
        console.warn("[DeltaSettings] Already initialized");
        return;
    }

    // ==========================================
    // CONSTANTS
    // ==========================================

    const MODULE_NAME = "DeltaSettings";
    const MODULE_VERSION = "3.0.0";

    const DEP_MAX_WAIT = 10000;
    const DEP_CHECK_INTERVAL = 50;

    const DEBOUNCE_COLOR = 300;
    const DEBOUNCE_SLIDER = 100;

    const TABS = {
        FEATURES: "features",
        CONTROLS: "controls",
        COLORS: "colors",
        ABOUT: "about"
    };

    // ==========================================
    // STATE
    // ==========================================

    let isInitialized = false;
    let CONFIG = null;
    let DeltaUI = null;
    let DeltaLib = null;

    let settingsWindow = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    let eventListeners = [];
    let debouncedSaveSkillbarColors = null;

    // ==========================================
    // LOGGING
    // ==========================================

    const LogLevel = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    let currentLogLevel = LogLevel.WARN;

    function log(level, ...args) {
        if (level > currentLogLevel) return;
        const prefix = `[${MODULE_NAME}]`;
        switch (level) {
            case LogLevel.ERROR: console.error(prefix, ...args); break;
            case LogLevel.WARN: console.warn(prefix, ...args); break;
            case LogLevel.INFO: console.info(prefix, ...args); break;
            case LogLevel.DEBUG: console.log(prefix, "[DEBUG]", ...args); break;
        }
    }

    function setDebugMode(enabled) {
        currentLogLevel = enabled ? LogLevel.DEBUG : LogLevel.WARN;
    }

    // ==========================================
    // DOM UTILITIES
    // ==========================================

    function $(sel, root = document) {
        if (DeltaLib) return DeltaLib.$(sel, root);
        try { return root?.querySelector(sel) || null; }
        catch (e) { return null; }
    }

    function $$(sel, root = document) {
        if (DeltaLib) return DeltaLib.$$(sel, root);
        try { return Array.from(root?.querySelectorAll(sel) || []); }
        catch (e) { return []; }
    }

    // ==========================================
    // VALIDATION UTILITIES
    // ==========================================

    function isValidHexColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    }

    function isValidKeybind(key) {
        if (!key || typeof key !== "string") return false;
        const invalid = ["shift", "control", "alt", "meta", ""];
        return !invalid.includes(key.toLowerCase());
    }

    function sanitizeString(str) {
        if (typeof str !== "string") return "";
        return str.replace(/[<>]/g, "");
    }

    // ==========================================
    // STORAGE UTILITIES
    // ==========================================

    function getToggle(key, defaultVal = false) {
        try {
            if (DeltaLib) return DeltaLib.storage.getToggle(key, defaultVal);
            const saved = localStorage.getItem("deltaUI_" + key);
            if (saved !== null) return saved === "true";
            return CONFIG?.defaults?.toggles?.[key] ?? defaultVal;
        } catch (e) {
            return defaultVal;
        }
    }

    function getStorage(key, defaultValue = "") {
        try {
            if (DeltaLib) return DeltaLib.storage.get(key, defaultValue);
            return localStorage.getItem(key) || defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function setStorage(key, value) {
        try {
            if (DeltaLib) return DeltaLib.storage.set(key, value);
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function getStorageJSON(key, defaultValue = {}) {
        try {
            if (DeltaLib) return DeltaLib.storage.getJSON(key, defaultValue);
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function setStorageJSON(key, value) {
        try {
            if (DeltaLib) return DeltaLib.storage.setJSON(key, value);
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    // ==========================================
    // DEBOUNCE
    // ==========================================

    function debounce(func, wait) {
        if (DeltaLib) return DeltaLib.timers.debounce(func, wait);
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function initDebouncedFunctions() {
        debouncedSaveSkillbarColors = debounce(() => {
            DeltaUI?.saveSkillbarColors?.();
            DeltaUI?.updateDynamicStyles?.();
        }, DEBOUNCE_COLOR);
    }

    // ==========================================
    // SKILLBAR SCANNER
    // ==========================================

    function scanSkillbar() {
        const slots = [];
        try {
            const skillbar = document.querySelector("#skillbar");
            if (!skillbar) return slots;

            skillbar.querySelectorAll(".slot[id]").forEach(slot => {
                const id = slot.id;
                if (id && id.startsWith("sk")) {
                    const keyText = slot.querySelector(".slottext.key");
                    const keybind = keyText ? keyText.textContent.trim() : id.replace("sk", "").toUpperCase();
                    slots.push({
                        id,
                        keybind: sanitizeString(keybind),
                        color: CONFIG.skillbarColors[id] || "#ffffff"
                    });
                }
            });
        } catch (e) {
            log(LogLevel.ERROR, "scanSkillbar failed:", e);
        }
        return slots;
    }

    // ==========================================
    // HTML GENERATORS
    // ==========================================

    function generateSkillbarColorRows(slots) {
        try {
            if (slots.length === 0) {
                return Object.entries(CONFIG.skillbarColors || {}).map(([id, color]) => {
                    const key = id.replace("sk", "").toUpperCase();
                    return `
                        <div>Slot ${sanitizeString(key)}</div>
                        <div class="color-input-wrapper">
                            <div class="color-preview" style="background: ${color};"></div>
                            <input type="color" class="skill-color-input" data-skill-id="${id}" value="${color}">
                        </div>
                    `;
                }).join("");
            }

            return slots.map(slot => `
                <div>Slot <span class="keybind-badge">${sanitizeString(slot.keybind)}</span></div>
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${slot.color};"></div>
                    <input type="color" class="skill-color-input" data-skill-id="${slot.id}" value="${slot.color}">
                </div>
            `).join("");
        } catch (e) {
            log(LogLevel.ERROR, "generateSkillbarColorRows failed:", e);
            return '<div class="textgrey">Failed to load skillbar colors</div>';
        }
    }

    // ==========================================
    // EXPORT/IMPORT
    // ==========================================

    function exportAllSettings() {
        try {
            const data = {
                version: CONFIG.version,
                exportedAt: new Date().toISOString(),
                settings: {
                    toggles: {},
                    skillbarColors: { ...CONFIG.skillbarColors },
                    keybinds: {
                        fullscreen: getStorage("deltaUI_fullscreenKey", "o"),
                        fameReset: getStorage("deltaUI_fameResetKey", "[")
                    },
                    canvasScale: parseFloat(getStorage("deltaUI_canvasScale", "1.0"))
                }
            };

            const toggleKeys = Object.keys(CONFIG.defaults.toggles || {});
            toggleKeys.forEach(key => {
                data.settings.toggles[key] = getToggle(key);
            });

            return data;
        } catch (e) {
            log(LogLevel.ERROR, "exportAllSettings failed:", e);
            return null;
        }
    }

    function importSettings(data) {
        try {
            if (!data || !data.settings) {
                throw new Error("Invalid settings format");
            }

            const { settings } = data;

            // Import toggles
            if (settings.toggles) {
                Object.entries(settings.toggles).forEach(([key, value]) => {
                    setStorage(`deltaUI_${key}`, String(value));
                });
            }

            // Import skillbar colors
            if (settings.skillbarColors) {
                Object.entries(settings.skillbarColors).forEach(([key, value]) => {
                    if (isValidHexColor(value)) {
                        CONFIG.skillbarColors[key] = value;
                    }
                });
                DeltaUI?.saveSkillbarColors?.();
            }

            // Import keybinds
            if (settings.keybinds) {
                if (isValidKeybind(settings.keybinds.fullscreen)) {
                    setStorage("deltaUI_fullscreenKey", settings.keybinds.fullscreen);
                }
                if (isValidKeybind(settings.keybinds.fameReset)) {
                    setStorage("deltaUI_fameResetKey", settings.keybinds.fameReset);
                }
            }

            // Import canvas scale
            if (typeof settings.canvasScale === "number") {
                const scale = Math.max(0.1, Math.min(2.5, settings.canvasScale));
                setStorage("deltaUI_canvasScale", scale.toString());
            }

            DeltaUI?.updateDynamicStyles?.();

            log(LogLevel.INFO, "Settings imported successfully");
            return true;
        } catch (e) {
            log(LogLevel.ERROR, "importSettings failed:", e);
            return false;
        }
    }

    function exportToFile() {
        try {
            const data = exportAllSettings();
            if (!data) {
                alert("Failed to export settings");
                return;
            }

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `delta-ui-settings-${timestamp}.json`;

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            log(LogLevel.INFO, "Settings exported to file");
        } catch (e) {
            log(LogLevel.ERROR, "exportToFile failed:", e);
            alert("Failed to export settings");
        }
    }

    function importFromFile() {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";

            input.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (importSettings(data)) {
                            alert("✅ Settings imported! Reloading...");
                            setTimeout(() => location.reload(), 500);
                        } else {
                            alert("❌ Failed to import settings");
                        }
                    } catch (err) {
                        alert("❌ Invalid JSON file");
                    }
                };
                reader.readAsText(file);
            });

            input.click();
        } catch (e) {
            log(LogLevel.ERROR, "importFromFile failed:", e);
        }
    }

    function exportToClipboard() {
        try {
            const data = exportAllSettings();
            if (!data) return false;

            const json = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(json).catch(() => {
                prompt("Copy these settings:", json);
            });
            return true;
        } catch (e) {
            log(LogLevel.ERROR, "exportToClipboard failed:", e);
            return false;
        }
    }

    function importFromClipboard() {
        const json = prompt("Paste your settings JSON:");
        if (!json) return false;

        try {
            const data = JSON.parse(json);
            return importSettings(data);
        } catch (e) {
            alert("❌ Invalid JSON format");
            return false;
        }
    }

    // ==========================================
    // VALIDATION
    // ==========================================

    function validateSettings() {
        const issues = [];
        const warnings = [];

        try {
            // Check storage usage
            const storageUsed = JSON.stringify(localStorage).length;
            const maxStorage = 5 * 1024 * 1024;
            const usagePercent = (storageUsed / maxStorage) * 100;

            if (usagePercent > 80) {
                warnings.push(`Storage usage at ${usagePercent.toFixed(1)}%`);
            }

            // Validate skillbar colors
            Object.entries(CONFIG.skillbarColors || {}).forEach(([key, color]) => {
                if (!isValidHexColor(color)) {
                    issues.push(`Invalid skillbar color for ${key}: ${color}`);
                }
            });

            // Check duplicate keybinds
            const keybinds = {
                fullscreen: getStorage("deltaUI_fullscreenKey", "o"),
                fameReset: getStorage("deltaUI_fameResetKey", "[")
            };

            const values = Object.values(keybinds);
            if (new Set(values).size !== values.length) {
                warnings.push("Duplicate keybinds detected");
            }

            // Validate canvas scale
            const scale = parseFloat(getStorage("deltaUI_canvasScale", "1.0"));
            if (isNaN(scale) || scale < 0.1 || scale > 2.5) {
                issues.push(`Invalid canvas scale: ${scale}`);
            }
        } catch (e) {
            issues.push("Validation error: " + e.message);
        }

        return { valid: issues.length === 0, issues, warnings };
    }

    // ==========================================
    // EVENT MANAGEMENT
    // ==========================================

    function addTrackedListener(element, event, handler, options = false) {
        if (!element) return;
        try {
            element.addEventListener(event, handler, options);
            eventListeners.push({ element, event, handler, options });
        } catch (e) {
            log(LogLevel.ERROR, "addTrackedListener failed:", e);
        }
    }

    function cleanupEventListeners() {
        eventListeners.forEach(({ element, event, handler, options }) => {
            try { element.removeEventListener(event, handler, options); }
            catch (e) { /* ignore */ }
        });
        eventListeners = [];
    }

    // ==========================================
    // WINDOW MANAGEMENT
    // ==========================================

    function closeWindow() {
        if (settingsWindow) {
            cleanupEventListeners();
            settingsWindow.remove();
            settingsWindow = null;
        }
        isDragging = false;
    }

    function toggleWindow() {
        if (settingsWindow && document.contains(settingsWindow)) {
            closeWindow();
        } else {
            createWindow();
        }
    }

    function openWindow() {
        if (!settingsWindow || !document.contains(settingsWindow)) {
            createWindow();
        }
    }

    function updateColorPreview(input) {
        const preview = input.previousElementSibling;
        if (preview?.classList.contains("color-preview")) {
            preview.style.background = input.value;
        }
    }

    function showButtonFeedback(button, message, duration = 1500) {
        const original = button.textContent;
        button.textContent = message;
        button.classList.add("success");
        setTimeout(() => {
            button.textContent = original;
            button.classList.remove("success");
        }, duration);
    }

    // ==========================================
    // EVENT SETUP
    // ==========================================

    function setupEventListeners() {
        if (!settingsWindow) return;

        // Close button
        const closeBtn = $(".close-btn", settingsWindow);
        if (closeBtn) addTrackedListener(closeBtn, "click", closeWindow);

        // Tab navigation
        $$(".delta-nav .choice", settingsWindow).forEach(choice => {
            addTrackedListener(choice, "click", () => {
                const targetTab = choice.dataset.tab;

                $$(".delta-nav .choice", settingsWindow).forEach(c => c.classList.remove("active"));
                choice.classList.add("active");

                $$(".tab-panel", settingsWindow).forEach(panel => {
                    panel.classList.toggle("active", panel.dataset.panel === targetTab);
                });
            });
        });

        // Toggle checkboxes
        $$(".btn.checkbox[data-toggle]", settingsWindow).forEach(checkbox => {
            addTrackedListener(checkbox, "click", () => {
                const toggleId = checkbox.dataset.toggle;
                const isNowActive = !checkbox.classList.contains("active");

                checkbox.classList.toggle("active");
                setStorage(`deltaUI_${toggleId}`, isNowActive.toString());
                DeltaUI?.applyToggle?.(toggleId, isNowActive);
            });
        });

        // Skillbar color inputs
        $$(".skill-color-input", settingsWindow).forEach(input => {
            addTrackedListener(input, "input", (e) => {
                const skillId = e.target.dataset.skillId;
                const color = e.target.value;

                if (!isValidHexColor(color)) return;

                CONFIG.skillbarColors[skillId] = color;
                updateColorPreview(e.target);
                debouncedSaveSkillbarColors();
            });
        });

        // Keybind inputs
        setupKeybindInput("fullscreen-key-input", "clear-fullscreen-key", "deltaUI_fullscreenKey", "o", DeltaUI?.setFullscreenKey);
        setupKeybindInput("fame-reset-key-input", "clear-fame-reset-key", "deltaUI_fameResetKey", "[", window.FameNotifier?.setResetKey);

        // Canvas scale slider
        const slider = $("#canvas-scale-slider", settingsWindow);
        const sliderValue = $("#canvas-scale-value", settingsWindow);
        if (slider) {
            addTrackedListener(slider, "input", (e) => {
                const value = parseFloat(e.target.value);
                if (isNaN(value) || value < 0.1 || value > 2.5) return;

                if (sliderValue) sliderValue.textContent = value.toFixed(1) + "x";
                setStorage("deltaUI_canvasScale", value.toString());

                if (window.DeltaCanvasScaler?.setScale) {
                    window.DeltaCanvasScaler.setScale(value);
                }
            });
        }

        // Action buttons
        setupActionButtons();

        // Drag functionality
        setupDragFunctionality();
    }

    function setupKeybindInput(inputId, clearId, storageKey, defaultKey, setter) {
        const input = $(`#${inputId}`, settingsWindow);
        const clearBtn = $(`#${clearId}`, settingsWindow);

        if (input) {
            addTrackedListener(input, "click", () => {
                input.value = "";
                input.placeholder = "Press a key...";
                input.classList.add("capturing");
            });

            addTrackedListener(input, "keydown", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const key = e.key.toLowerCase();
                if (!isValidKeybind(key)) return;

                input.value = key.length === 1 ? key.toUpperCase() : key;
                input.classList.remove("capturing");

                setStorage(storageKey, key);
                setter?.(key);
                input.blur();
            });

            addTrackedListener(input, "blur", () => {
                input.classList.remove("capturing");
                const currentKey = getStorage(storageKey, defaultKey);
                if (!input.value) {
                    input.value = currentKey.length === 1 ? currentKey.toUpperCase() : currentKey;
                }
            });
        }

        if (clearBtn) {
            addTrackedListener(clearBtn, "click", () => {
                if (input) input.value = defaultKey.length === 1 ? defaultKey.toUpperCase() : defaultKey;
                setStorage(storageKey, defaultKey);
                setter?.(defaultKey);
            });
        }
    }

    function setupActionButtons() {
        const exportBtn = $("#export-settings", settingsWindow);
        if (exportBtn) {
            addTrackedListener(exportBtn, "click", () => {
                if (exportToClipboard()) showButtonFeedback(exportBtn, "Copied!");
            });
        }

        const importBtn = $("#import-settings", settingsWindow);
        if (importBtn) {
            addTrackedListener(importBtn, "click", () => {
                if (importFromClipboard()) {
                    showButtonFeedback(importBtn, "Imported!");
                    setTimeout(() => createWindow(), 500);
                }
            });
        }

        const exportFileBtn = $("#export-to-file", settingsWindow);
        if (exportFileBtn) {
            addTrackedListener(exportFileBtn, "click", () => {
                exportToFile();
                showButtonFeedback(exportFileBtn, "Downloaded!");
            });
        }

        const importFileBtn = $("#import-from-file", settingsWindow);
        if (importFileBtn) {
            addTrackedListener(importFileBtn, "click", importFromFile);
        }

        const resetBtn = $("#reset-colors", settingsWindow);
        if (resetBtn) {
            addTrackedListener(resetBtn, "click", () => {
                if (confirm("Reset all colors to defaults?")) {
                    DeltaUI?.resetToDefaults?.();
                    DeltaUI?.updateDynamicStyles?.();
                    showButtonFeedback(resetBtn, "Reset!");
                    setTimeout(() => createWindow(), 500);
                }
            });
        }

        const validateBtn = $("#validate-settings", settingsWindow);
        if (validateBtn) {
            addTrackedListener(validateBtn, "click", () => {
                const result = validateSettings();
                let msg = "";

                if (result.valid && result.warnings.length === 0) {
                    msg = "✅ All settings valid!";
                } else {
                    if (result.issues.length > 0) {
                        msg += "❌ Issues:\n" + result.issues.join("\n") + "\n\n";
                    }
                    if (result.warnings.length > 0) {
                        msg += "⚠️ Warnings:\n" + result.warnings.join("\n");
                    }
                }
                alert(msg);
            });
        }
    }

    function setupDragFunctionality() {
        const titleframe = $(".titleframe", settingsWindow);
        if (!titleframe) return;

        addTrackedListener(titleframe, "mousedown", (e) => {
            if (e.target.closest(".close-btn") || e.target.closest(".btn")) return;

            isDragging = true;
            const rect = settingsWindow.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            settingsWindow.style.transform = "none";
            settingsWindow.style.left = rect.left + "px";
            settingsWindow.style.top = rect.top + "px";

            e.preventDefault();
        });

        const mouseMoveHandler = (e) => {
            if (!isDragging || !settingsWindow) return;

            let x = e.clientX - dragOffset.x;
            let y = e.clientY - dragOffset.y;

            const rect = settingsWindow.getBoundingClientRect();
            x = Math.max(0, Math.min(x, window.innerWidth - rect.width));
            y = Math.max(0, Math.min(y, window.innerHeight - rect.height));

            settingsWindow.style.left = x + "px";
            settingsWindow.style.top = y + "px";
        };

        const mouseUpHandler = () => { isDragging = false; };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        eventListeners.push(
            { element: document, event: "mousemove", handler: mouseMoveHandler, options: false },
            { element: document, event: "mouseup", handler: mouseUpHandler, options: false }
        );
    }

    // ==========================================
    // WINDOW CREATION
    // ==========================================

    function createWindow() {
        if (settingsWindow) closeWindow();

        try {
            settingsWindow = document.createElement("div");
            settingsWindow.className = "window-pos";
            settingsWindow.id = "delta-settings-window";
            settingsWindow.style.cssText = "z-index: 100; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);";

            const skillbarSlots = scanSkillbar();
            const fullscreenKey = getStorage("deltaUI_fullscreenKey", "o");
            const fameResetKey = getStorage("deltaUI_fameResetKey", "[");
            const canvasScale = getStorage("deltaUI_canvasScale", "1.0");

            settingsWindow.innerHTML = `
                <div class="window panel-black svelte-1f1v3u3">
                    <div class="titleframe svelte-1f1v3u3" style="cursor: move;">
                        <img src="/data/ui/icons/cog.svg" class="titleicon svgicon svelte-1f1v3u3">
                        <div class="textprimary title svelte-1f1v3u3">
                            <div>Delta UI <small style="color: #5b858e;">v${CONFIG.version}</small></div>
                        </div>
                        <img src="/data/ui/icons/cross.svg" class="btn black svgicon close-btn">
                    </div>
                    <div class="slot svelte-1f1v3u3">
                        <div class="divide svelte-13nnce4">
                            <div class="delta-nav">
                                <div class="choice active" data-tab="${TABS.FEATURES}">Features</div>
                                <div class="choice" data-tab="${TABS.CONTROLS}">Controls</div>
                                <div class="choice" data-tab="${TABS.COLORS}">Colors</div>
                                <div class="choice" data-tab="${TABS.ABOUT}">About</div>
                            </div>
                            <div class="menu panel-black scrollbar svelte-13nnce4">
                                
                                <!-- FEATURES TAB -->
                                <div class="tab-panel active" data-panel="${TABS.FEATURES}">
                                    <h3 class="textprimary">Gameplay</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Mouseover<br><small class="textgrey">Cast skills on mouseover targets</small></div>
                                        <div class="btn checkbox ${getToggle("mouseover", false) ? "active" : ""}" data-toggle="mouseover"></div>
                                        
                                        <div>Party UI Editor<br><small class="textgrey">Drag and reorder party frames</small></div>
                                        <div class="btn checkbox ${getToggle("partyUIEditor", false) ? "active" : ""}" data-toggle="partyUIEditor"></div>
                                    </div>
                                    
                                    <h3 class="textprimary">Chat</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Chat Tweaks<br><small class="textgrey">Resizable chat & controls</small></div>
                                        <div class="btn checkbox ${getToggle("chatTweaks", true) ? "active" : ""}" data-toggle="chatTweaks"></div>
                                    </div>
                                    
                                    <h3 class="textprimary">Stats Display</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Playtime Labels<br><small class="textgrey">Session & total time</small></div>
                                        <div class="btn checkbox ${getToggle("playtimeLabels", true) ? "active" : ""}" data-toggle="playtimeLabels"></div>
                                        
                                        <div>Fame Labels<br><small class="textgrey">Fame gained/lost counters</small></div>
                                        <div class="btn checkbox ${getToggle("fameLabels", true) ? "active" : ""}" data-toggle="fameLabels"></div>
                                    </div>
                                </div>
                                
                                <!-- CONTROLS TAB -->
                                <div class="tab-panel" data-panel="${TABS.CONTROLS}">
                                    <h3 class="textprimary">Keybinds</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Fullscreen Toggle<br><small class="textgrey">Press key to toggle fullscreen</small></div>
                                        <div class="keybind-input-wrapper">
                                            <input type="text" id="fullscreen-key-input" class="keybind-input" 
                                                   value="${fullscreenKey.toUpperCase()}" maxlength="1" readonly placeholder="Press a key">
                                            <div class="btn small" id="clear-fullscreen-key">✕</div>
                                        </div>
                                        
                                        <div>Fame Reset<br><small class="textgrey">Press key to reset fame counters</small></div>
                                        <div class="keybind-input-wrapper">
                                            <input type="text" id="fame-reset-key-input" class="keybind-input" 
                                                   value="${fameResetKey.length === 1 ? fameResetKey.toUpperCase() : fameResetKey}" 
                                                   maxlength="1" readonly placeholder="Press a key">
                                            <div class="btn small" id="clear-fame-reset-key">✕</div>
                                        </div>
                                    </div>
                                    
                                    <div class="keybind-hint">
                                        <small class="textgrey">Click input and press any key to set keybind.</small>
                                    </div>
                                    
                                    <h3 class="textprimary">Canvas Scale</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>UI Scale<br><small class="textgrey">Adjust game UI size</small></div>
                                        <div class="slider-wrapper">
                                            <input type="range" id="canvas-scale-slider" class="delta-slider" 
                                                   min="0.1" max="2.5" step="0.1" value="${canvasScale}">
                                            <span id="canvas-scale-value" class="slider-value">${canvasScale}x</span>
                                        </div>
                                        
                                        <div>Enable Canvas Scaler<br><small class="textgrey">Apply custom UI scale</small></div>
                                        <div class="btn checkbox ${getToggle("canvasScaler", false) ? "active" : ""}" data-toggle="canvasScaler"></div>
                                    </div>
                                </div>
                                
                                <!-- COLORS TAB -->
                                <div class="tab-panel" data-panel="${TABS.COLORS}">
                                    <h3 class="textprimary">Skillbar Colors</h3>
                                    <div class="settings svelte-13nnce4">
                                        ${generateSkillbarColorRows(skillbarSlots)}
                                    </div>
                                    
                                    <h3 class="textprimary">Actions</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Export to Clipboard</div>
                                        <div class="btn blue" id="export-settings">Export</div>
                                        
                                        <div>Import from Clipboard</div>
                                        <div class="btn blue" id="import-settings">Import</div>
                                        
                                        <div>Export to File</div>
                                        <div class="btn blue" id="export-to-file">Download</div>
                                        
                                        <div>Import from File</div>
                                        <div class="btn blue" id="import-from-file">Upload</div>
                                        
                                        <div>Reset to Defaults</div>
                                        <div class="btn orange" id="reset-colors">Reset</div>
                                    </div>
                                </div>
                                
                                <!-- ABOUT TAB -->
                                <div class="tab-panel" data-panel="${TABS.ABOUT}">
                                    <h3 class="textprimary">Delta UI</h3>
                                    <div class="about-content">
                                        <div class="about-logo">Δ</div>
                                        <div class="about-version">Version ${CONFIG.version}</div>
                                        <div class="about-author">Made with ♥ by <span class="textprimary">Delta</span></div>
                                        <div class="about-desc">
                                            A UI enhancement mod for Hordes.io with customizable skillbar colors, 
                                            session stats, faction panels, and more.
                                        </div>
                                    </div>
                                    
                                    <h3 class="textprimary">Diagnostics</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Validate Settings<br><small class="textgrey">Check for issues</small></div>
                                        <div class="btn blue" id="validate-settings">Validate</div>
                                    </div>
                                    
                                    <div class="about-footer">
                                        <small class="textgrey">
                                            Modules: ${getLoadedModules().join(", ")}
                                        </small>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(settingsWindow);
            setupEventListeners();

            log(LogLevel.DEBUG, "Settings window created");
        } catch (e) {
            log(LogLevel.ERROR, "createWindow failed:", e);
        }
    }

    function getLoadedModules() {
        const modules = [];
        if (window.DELTA_CONFIG) modules.push("Config");
        if (window.DeltaLib) modules.push("Lib");
        if (window.DeltaUI) modules.push("Main");
        if (window.DeltaSettings) modules.push("Settings");
        if (window.FameNotifier) modules.push("Fame");
        if (window.ChatResizer) modules.push("Chat");
        if (window.DeltaCanvasScaler) modules.push("Canvas");
        if (window.DeltaMouseover) modules.push("Mouseover");
        if (window.DeltaPartyArranger) modules.push("Party");
        return modules;
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function waitForDependencies() {
        return new Promise((resolve) => {
            let waited = 0;

            const check = () => {
                if (window.DELTA_CONFIG && window.DeltaUI) {
                    CONFIG = window.DELTA_CONFIG;
                    DeltaUI = window.DeltaUI;
                    DeltaLib = window.DeltaLib || null;
                    resolve(true);
                    return;
                }

                waited += DEP_CHECK_INTERVAL;
                if (waited >= DEP_MAX_WAIT) {
                    log(LogLevel.ERROR, "Dependency timeout");
                    resolve(false);
                    return;
                }

                setTimeout(check, DEP_CHECK_INTERVAL);
            };

            check();
        });
    }

    async function init() {
        if (isInitialized) return;

        log(LogLevel.INFO, `Initializing ${MODULE_NAME} v${MODULE_VERSION}`);

        const ready = await waitForDependencies();
        if (!ready) {
            log(LogLevel.ERROR, "Failed to load dependencies");
            return;
        }

        isInitialized = true;
        initDebouncedFunctions();

        log(LogLevel.INFO, "Initialization complete");
    }

    function destroy() {
        closeWindow();
        cleanupEventListeners();
        isInitialized = false;
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
    // PUBLIC API (Minimal)
    // ==========================================

    window.DeltaSettings = Object.freeze({
        version: MODULE_VERSION,

        // Window control
        toggle: toggleWindow,
        open: openWindow,
        close: closeWindow,

        // Export/Import
        exportSettings: exportAllSettings,
        importSettings,
        exportToFile,
        importFromFile,

        // Validation
        validateSettings,

        // Lifecycle
        destroy,

        // Debug
        setDebugMode,
        getLoadedModules
    });

})();
