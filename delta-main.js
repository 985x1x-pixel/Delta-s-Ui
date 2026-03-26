// ==========================================
// DELTA UI MAIN v3.0.0
// Core UI enhancements for Hordes.io
// ==========================================

(function() {
    "use strict";

    // ==========================================
    // GUARD: Prevent double initialization
    // ==========================================
    if (window.DeltaUI) {
        console.warn("[DeltaUI] Already initialized");
        return;
    }

    // ==========================================
    // CONSTANTS
    // ==========================================

    const MODULE_NAME = "DeltaUI";
    const MODULE_VERSION = "3.0.0";

    // Dependency wait settings
    const DEP_MAX_WAIT = 10000;
    const DEP_CHECK_INTERVAL = 50;

    // Update intervals (in frames, ~60fps)
    const FRAMES = {
        FACTION_UPDATE: 30,
        TIME_UPDATE: 60,
        SLOW_SCAN: 120
    };

    // ==========================================
    // CRITICAL CSS
    // ==========================================

    const CRITICAL_CSS = `
        /* Hide default exp bar */
        #expbar { display: none !important; }

        /* Session stats container */
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

        /* Settings window positioning */
        #delta-settings-window {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 99999 !important;
        }

        /* Delta button in toolbar */
        #sysdelta { position: relative; }

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
    // STATE
    // ==========================================

    let isInitialized = false;
    let isDestroyed = false;
    let cleanup = null;
    let CONFIG = null;
    let DeltaLib = null;

    // Feature states
    const state = {
        fullscreenKey: "o",
        sessionStart: Date.now(),
        totalPlaytime: 0,
        frameCount: 0
    };

    // DOM references
    let dynamicStyle = null;
    let factionPanel = null;

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
        log(LogLevel.INFO, `Debug mode ${enabled ? "enabled" : "disabled"}`);
    }

    // ==========================================
    // DOM UTILITIES (with fallbacks)
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

    function getToggle(key, defaultVal) {
        if (DeltaLib) return DeltaLib.storage.getToggle(key, defaultVal);
        const saved = localStorage.getItem("deltaUI_" + key);
        if (saved !== null) return saved === "true";
        return CONFIG?.defaults?.toggles?.[key] ?? defaultVal;
    }

    function setStyleImportant(el, prop, value) {
        if (DeltaLib) {
            DeltaLib.setStyleImportant(el, prop, value);
            return;
        }
        if (!el?.style) return;
        try { el.style.setProperty(prop, value, "important"); }
        catch (e) { el.style[prop] = value; }
    }

    // ==========================================
    // FORMATTING UTILITIES
    // ==========================================

    function formatTime(s) {
        if (DeltaLib) return DeltaLib.format.time(s);
        if (s < 0) s = 0;
        s = Math.floor(s);
        if (s < 60) return s + "s";
        if (s < 3600) return Math.floor(s / 60) + "m " + (s % 60) + "s";
        if (s < 86400) return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
        return Math.floor(s / 86400) + "d " + Math.floor((s % 86400) / 3600) + "h";
    }

    function formatNumber(n) {
        if (DeltaLib) return DeltaLib.format.number(n);
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
        return String(n);
    }

    // ==========================================
    // CSS INJECTION
    // ==========================================

    function injectCriticalCSS() {
        if (DeltaLib) {
            DeltaLib.injectStyle("delta-critical-css", CRITICAL_CSS);
        } else {
            if (document.getElementById("delta-critical-css")) return;
            const style = document.createElement("style");
            style.id = "delta-critical-css";
            style.textContent = CRITICAL_CSS;
            document.head.appendChild(style);
        }
        log(LogLevel.DEBUG, "Critical CSS injected");
    }

    /**
     * Generate dynamic CSS based on config
     * @returns {string}
     */
    function generateDynamicStyles() {
        if (!CONFIG) return "";

        let css = "";

        // Skillbar colors
        for (const [id, color] of Object.entries(CONFIG.skillbarColors || {})) {
            const extraGlow = id === "skr" ? `, 0 0 10px ${color}` : "";
            css += `#${id} {
                border: 3px solid ${color} !important;
                box-shadow: 0 0 6px ${color}${extraGlow} !important;
            }\n`;
        }

        return css;
    }

    function updateDynamicStyles() {
        if (!dynamicStyle) {
            dynamicStyle = document.getElementById("delta-dynamic-styles");
            if (!dynamicStyle) {
                dynamicStyle = document.createElement("style");
                dynamicStyle.id = "delta-dynamic-styles";
                document.head.appendChild(dynamicStyle);
            }
        }
        dynamicStyle.textContent = generateDynamicStyles();
        log(LogLevel.DEBUG, "Dynamic styles updated");
    }

    // ==========================================
    // CONFIG MANAGEMENT
    // ==========================================

    function buildRuntimeConfig() {
        const baseConfig = window.DELTA_CONFIG;
        if (!baseConfig) {
            log(LogLevel.ERROR, "DELTA_CONFIG not found");
            return null;
        }

        CONFIG = {
            ...baseConfig,
            skillbarColors: { ...baseConfig.defaults.skillbarColors }
        };

        window.DELTA_CONFIG = CONFIG;

        loadSkillbarColors();

        log(LogLevel.INFO, `Config built, version ${CONFIG.version}`);
        return CONFIG;
    }

    function loadSkillbarColors() {
        try {
            const key = CONFIG.storageKeys.SKILLBAR_COLORS;
            const saved = DeltaLib
                ? DeltaLib.storage.getJSON(key)
                : JSON.parse(localStorage.getItem(key) || "{}");
            if (saved && typeof saved === "object") {
                Object.assign(CONFIG.skillbarColors, saved);
            }
        } catch (e) {
            log(LogLevel.WARN, "Failed to load skillbar colors:", e);
        }
    }

    // ==========================================
    // TOGGLE SYSTEM
    // ==========================================

    function applyToggle(toggleId, isEnabled) {
        // Save to storage
        if (DeltaLib) {
            DeltaLib.storage.setToggle(toggleId, isEnabled);
        } else {
            localStorage.setItem("deltaUI_" + toggleId, String(isEnabled));
        }

        log(LogLevel.DEBUG, `Toggle ${toggleId} = ${isEnabled}`);

        switch (toggleId) {
            case "chatTweaks":
                const chatControls = $("#chat-controls");
                if (chatControls) {
                    chatControls.style.display = isEnabled ? "flex" : "none";
                }
                break;

            case "playtimeLabels":
                const playtimeEl = $("#totalPlaytimeUI");
                const sessionEl = $("#sessionTimeUI");
                if (playtimeEl) playtimeEl.style.display = isEnabled ? "flex" : "none";
                if (sessionEl) sessionEl.style.display = isEnabled ? "flex" : "none";
                break;

            case "fameLabels":
                const fameGainedEl = $("#fameGainedUI");
                const fameLostEl = $("#fameLostUI");
                if (fameGainedEl) fameGainedEl.style.display = isEnabled ? "flex" : "none";
                if (fameLostEl) fameLostEl.style.display = isEnabled ? "flex" : "none";
                break;

            case "mouseover":
                if (window.DeltaMouseover) {
                    isEnabled ? window.DeltaMouseover.enable() : window.DeltaMouseover.disable();
                }
                break;

            case "partyUIEditor":
                if (window.DeltaPartyArranger) {
                    isEnabled ? window.DeltaPartyArranger.enable() : window.DeltaPartyArranger.disable();
                }
                break;

            case "canvasScaler":
                if (window.DeltaCanvasScaler) {
                    isEnabled ? window.DeltaCanvasScaler.enable() : window.DeltaCanvasScaler.disable();
                }
                break;

            default:
                log(LogLevel.WARN, `Unknown toggle: ${toggleId}`);
        }
    }

    function applyAllSavedToggles() {
        const toggles = ["chatTweaks", "playtimeLabels", "fameLabels", "mouseover", "partyUIEditor", "canvasScaler"];

        toggles.forEach(id => {
            const defaultValue = CONFIG.defaults.toggles[id] ?? false;
            applyToggle(id, getToggle(id, defaultValue));
        });
    }

    // ==========================================
    // UI UPDATES
    // ==========================================

    /**
     * Apply skill colors to skill window
     */
    function applySkillColors() {
        $$(".skillbox.svelte-1e0alkc .slot.filled").forEach(slot => {
            try {
                if (slot.dataset.colorApplied) return;

                const img = slot.querySelector("img.icon.slotskill");
                if (!img) return;

                const match = img.src.match(/skills\/(\d+)/);
                if (!match) return;

                const color = (CONFIG.skillColors || {})[match[1]];
                if (color) {
                    slot.style.setProperty("border-color", color, "important");
                    slot.style.setProperty("box-shadow", `0 0 10px ${color}66, 0 0 5px ${color}44`, "important");
                    slot.dataset.colorApplied = "true";
                }
            } catch (error) {
                log(LogLevel.ERROR, "applySkillColors error:", error);
            }
        });
    }

    /**
     * Add class icons to damage bars
     */
    function scanDamageBars() {
        $$(".window.panel-black.svelte-1f1v3u3 .wrapper .bar .progressBar").forEach(bar => {
            try {
                const left = bar.querySelector("span.left");
                if (!left || left.querySelector("img.dmg-class-icon")) return;

                for (const [cls, src] of Object.entries(CONFIG.classIconByBg || {})) {
                    if (bar.classList.contains(cls)) {
                        const img = document.createElement("img");
                        img.className = "dmg-class-icon";
                        img.src = src;
                        img.style.cssText = "width:16px;height:16px;margin-right:4px;border-radius:3px;";
                        left.prepend(img);
                        break;
                    }
                }
            } catch (error) {
                log(LogLevel.ERROR, "scanDamageBars error:", error);
            }
        });
    }

    /**
     * Color war statistics table rows
     */
    function colorWarStatisticsTable() {
        $$(".window.panel-black.svelte-1f1v3u3").forEach(win => {
            try {
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
            } catch (error) {
                log(LogLevel.ERROR, "colorWarStatisticsTable error:", error);
            }
        });
    }

    /**
     * Fix battleboard window class assignment
     */
    function fixBattleboardWindow() {
        $$(".window.panel-black.svelte-1f1v3u3").forEach(win => {
            const titleDiv = win.querySelector(".title > div");
            const isBattleboard = titleDiv?.textContent.trim() === "War Statistics";
            win.classList.toggle("battleboard-window", isBattleboard);
        });
    }

    // ==========================================
    // SESSION STATS
    // ==========================================

    function createSessionStats() {
        if (document.getElementById("sessionStatsContainer")) return;

        const container = document.createElement("div");
        container.id = "sessionStatsContainer";
        container.innerHTML = `
            <div class="stat-box" id="totalPlaytimeUI">
                Total playtime: <span class="value">0s</span>
            </div>
            <div class="stat-box" id="sessionTimeUI">
                Session time: <span class="value">0s</span>
            </div>
            <div class="stat-box" id="fameGainedUI">
                Fame Gained:
                <span class="fame-value">
                    <img src="/data/ui/currency/fame.svg" class="fame-icon">
                    <span id="fameGainedAmount">0</span>
                </span>
            </div>
            <div class="stat-box" id="fameLostUI">
                Fame Lost:
                <span class="fame-value">
                    <img src="/data/ui/currency/fame.svg" class="fame-icon">
                    <span id="fameLostAmount">0</span>
                </span>
            </div>
        `;

        document.body.appendChild(container);
        log(LogLevel.DEBUG, "Session stats container created");
    }

    function updateTimeUI() {
        const elapsed = Math.floor((Date.now() - state.sessionStart) / 1000);

        const sessionEl = $("#sessionTimeUI .value");
        const totalEl = $("#totalPlaytimeUI .value");

        if (sessionEl) sessionEl.textContent = formatTime(elapsed);
        if (totalEl) totalEl.textContent = formatTime(state.totalPlaytime + elapsed);
    }

    function updateFameUI() {
        const gainedEl = $("#fameGainedAmount");
        const lostEl = $("#fameLostAmount");

        if (window.FameNotifier) {
            if (gainedEl) gainedEl.textContent = window.FameNotifier.getGained().toLocaleString();
            if (lostEl) lostEl.textContent = window.FameNotifier.getLost().toLocaleString();
        } else {
            const gained = parseInt(localStorage.getItem(CONFIG.storageKeys.FAME_GAINED) || "0", 10);
            const lost = parseInt(localStorage.getItem(CONFIG.storageKeys.FAME_LOST) || "0", 10);
            if (gainedEl) gainedEl.textContent = gained.toLocaleString();
            if (lostEl) lostEl.textContent = lost.toLocaleString();
        }
    }

    // ==========================================
    // FACTION PANEL
    // ==========================================

    function updateFactionPanel() {
        const warStats = $(".battleboard-window");

        if (!warStats) {
            if (factionPanel) {
                factionPanel.remove();
                factionPanel = null;
            }
            return;
        }

        try {
            if (!factionPanel || !document.contains(factionPanel)) {
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

            // Parse stats from table
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
                            <img src="${ICONS[f] || ""}">
                            <span class="fs-name ${f}">${f.toUpperCase()}</span>
                            <span class="fs-count"><strong>${data.length}</strong></span>
                        </div>
                        <div class="fs-classes">
                            <span class="fs-class"><img src="${ICONS.warrior || ""}"><span>${classCounts.warrior}</span></span>
                            <span class="fs-class"><img src="${ICONS.mage || ""}"><span>${classCounts.mage}</span></span>
                            <span class="fs-class"><img src="${ICONS.shaman || ""}"><span>${classCounts.shaman}</span></span>
                            <span class="fs-class"><img src="${ICONS.archer || ""}"><span>${classCounts.archer}</span></span>
                        </div>
                        <div class="fs-stats">
                            <div class="fs-stat">
                                <span class="fs-label">⚔</span>
                                <span class="fs-value ${cmp(totalKills, otherKills)}">${formatNumber(totalKills)}</span>
                            </div>
                            <div class="fs-stat">
                                <span class="fs-label">💥</span>
                                <span class="fs-value ${cmp(totalDmg, otherDmg)}">${formatNumber(totalDmg)}</span>
                            </div>
                            <div class="fs-stat">
                                <span class="fs-label">💚</span>
                                <span class="fs-value ${cmp(totalHeal, otherHeal)}">${formatNumber(totalHeal)}</span>
                            </div>
                            <div class="fs-stat">
                                <span class="fs-label"><img src="${ICONS.fame || ""}"></span>
                                <span class="fs-value ${cmp(totalFame, otherFame)}">${formatNumber(totalFame)}</span>
                            </div>
                        </div>
                    `;
                }
            });

        } catch (error) {
            log(LogLevel.ERROR, "updateFactionPanel error:", error);
        }
    }

    // ==========================================
    // DELTA BUTTON
    // ==========================================

    function injectDeltaButton() {
        if ($("#sysdelta")) return;

        const btnbar = $(".l-corner-ur .btnbar");
        if (!btnbar) return;

        const syschar = $("#syschar", btnbar);
        if (!syschar) return;

        const btn = document.createElement("div");
        btn.id = "sysdelta";
        btn.className = "btn border black";
        btn.title = "Delta UI Settings";
        btn.innerHTML = '<span class="delta-icon">Δ</span>';

        btn.addEventListener("click", () => {
            if (window.DeltaSettings) {
                window.DeltaSettings.toggle();
            }
        });

        btnbar.insertBefore(btn, syschar);
        log(LogLevel.DEBUG, "Delta button injected");
    }

    // ==========================================
    // MUTATION OBSERVER
    // ==========================================

    function setupObserver() {
        const callback = (mutations) => {
            let needsDamageBars = false;
            let needsWindows = false;

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    if (node.classList?.contains("progressBar") || node.querySelector?.(".progressBar")) {
                        needsDamageBars = true;
                    }

                    if (node.classList?.contains("window") || node.querySelector?.(".window")) {
                        needsWindows = true;
                    }
                }
            }

            if (needsDamageBars) {
                requestAnimationFrame(scanDamageBars);
            }

            if (needsWindows) {
                requestAnimationFrame(() => {
                    fixBattleboardWindow();
                    colorWarStatisticsTable();
                    applySkillColors();
                });
            }
        };

        if (DeltaLib && cleanup) {
            const observerId = DeltaLib.observers.create(document.body, callback, {
                childList: true,
                subtree: true,
                debounce: 50
            });
            cleanup.trackObserver(observerId);
        } else {
            const observer = new MutationObserver(callback);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            if (cleanup) {
                cleanup.trackCustom(() => observer.disconnect());
            }
        }

        log(LogLevel.DEBUG, "MutationObserver setup complete");
    }

    // ==========================================
    // UPDATE LOOP
    // ==========================================

    function setupUpdateLoop() {
        function tick() {
            if (isDestroyed) return;

            state.frameCount++;

            // Faction panel update
            if (state.frameCount % FRAMES.FACTION_UPDATE === 0) {
                if ($(".battleboard-window")) {
                    updateFactionPanel();
                }
            }

            // Time updates
            if (state.frameCount % FRAMES.TIME_UPDATE === 0) {
                updateTimeUI();
                updateFameUI();
            }

            // Reset frame counter
            if (state.frameCount >= FRAMES.SLOW_SCAN) {
                state.frameCount = 0;
            }

            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);

        // Slow interval for scanning
        const intervalId = setInterval(() => {
            if (isDestroyed) return;

            fixBattleboardWindow();

            if (!$("#sysdelta")) {
                injectDeltaButton();
            }

        }, CONFIG.timing.SLOW_UPDATE);

        if (cleanup) {
            cleanup.trackCustom(() => clearInterval(intervalId));
        }

        log(LogLevel.DEBUG, "Update loop started");
    }

    // ==========================================
    // KEYBOARD HANDLER
    // ==========================================

    function setupKeyboardHandler() {
        const handler = (e) => {
            const active = document.activeElement;
            const isTyping = active?.tagName === "INPUT" ||
                            active?.tagName === "TEXTAREA" ||
                            active?.isContentEditable;

            if (active?.classList?.contains("keybind-input")) return;

            // Fullscreen toggle
            if (!isTyping && e.key.toLowerCase() === state.fullscreenKey) {
                const isFS = document.fullscreenElement || document.webkitFullscreenElement;

                if (isFS) {
                    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
                } else {
                    document.documentElement.requestFullscreen?.();
                }
            }
        };

        if (DeltaLib && cleanup) {
            cleanup.trackEvent(DeltaLib.events.on(window, "keydown", handler));
        } else {
            window.addEventListener("keydown", handler);
            if (cleanup) {
                cleanup.trackCustom(() => window.removeEventListener("keydown", handler));
            }
        }

        log(LogLevel.DEBUG, "Keyboard handler setup complete");
    }

    // ==========================================
    // BEFORE UNLOAD
    // ==========================================

    function setupBeforeUnload() {
        const handler = () => {
            const elapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
            localStorage.setItem(CONFIG.storageKeys.PLAYTIME, String(state.totalPlaytime + elapsed));
        };

        window.addEventListener("beforeunload", handler);

        if (cleanup) {
            cleanup.trackCustom(() => window.removeEventListener("beforeunload", handler));
        }
    }

    // ==========================================
    // DEPENDENCY WAITING
    // ==========================================

    function waitForDependencies() {
        return new Promise((resolve) => {
            let waited = 0;

            const check = () => {
                if (window.DELTA_CONFIG && window.DeltaLib) {
                    DeltaLib = window.DeltaLib;
                    log(LogLevel.INFO, "Dependencies ready");
                    resolve(true);
                    return;
                }

                if (window.DELTA_CONFIG && waited > DEP_MAX_WAIT / 2) {
                    log(LogLevel.WARN, "DeltaLib not found, running without it");
                    resolve(true);
                    return;
                }

                waited += DEP_CHECK_INTERVAL;

                if (waited >= DEP_MAX_WAIT) {
                    log(LogLevel.ERROR, "Dependency timeout after", DEP_MAX_WAIT, "ms");
                    resolve(false);
                    return;
                }

                setTimeout(check, DEP_CHECK_INTERVAL);
            };

            check();
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init() {
        if (isInitialized) {
            log(LogLevel.WARN, "Already initialized");
            return;
        }

        log(LogLevel.INFO, `Initializing ${MODULE_NAME} v${MODULE_VERSION}`);

        const depsReady = await waitForDependencies();
        if (!depsReady) {
            log(LogLevel.ERROR, "Failed to load dependencies");
            return;
        }

        isInitialized = true;
        isDestroyed = false;

        // Setup cleanup tracker
        if (DeltaLib) {
            cleanup = DeltaLib.createCleanup();
        } else {
            const customCleanups = [];
            cleanup = {
                trackEvent: () => {},
                trackObserver: () => {},
                trackInterval: () => {},
                trackCustom: (fn) => customCleanups.push(fn),
                run: () => customCleanups.forEach(fn => { try { fn(); } catch (e) {} }),
                getCount: () => ({ custom: customCleanups.length })
            };
        }

        // Build config
        if (!buildRuntimeConfig()) {
            log(LogLevel.ERROR, "Failed to build config");
            setTimeout(init, 100);
            return;
        }

        // Inject CSS
        injectCriticalCSS();

        // Load saved state
        state.fullscreenKey = localStorage.getItem("deltaUI_fullscreenKey") || "o";
        state.totalPlaytime = Number(localStorage.getItem(CONFIG.storageKeys.PLAYTIME) || "0") || 0;

        // Initialize systems
        updateDynamicStyles();
        createSessionStats();
        setupObserver();
        setupUpdateLoop();
        setupKeyboardHandler();
        setupBeforeUnload();

        // Remove default party button
        $("div.btn.party")?.remove();

        // Initial UI updates
        fixBattleboardWindow();
        updateFameUI();
        colorWarStatisticsTable();
        injectDeltaButton();
        applySkillColors();

        // Delayed initialization
        setTimeout(() => {
            scanDamageBars();
            colorWarStatisticsTable();
            injectDeltaButton();
            applyAllSavedToggles();
        }, CONFIG.timing.INIT_DELAY);

        log(LogLevel.INFO, "Initialization complete");
    }

    function destroy() {
        if (!isInitialized) return;

        log(LogLevel.INFO, "Destroying...");

        isDestroyed = true;
        isInitialized = false;

        if (cleanup) {
            cleanup.run();
            cleanup = null;
        }

        if (factionPanel) {
            factionPanel.remove();
            factionPanel = null;
        }

        log(LogLevel.INFO, "Destroyed");
    }

    function reinit() {
        destroy();
        setTimeout(init, 100);
    }

    // ==========================================
    // SAVE FUNCTIONS
    // ==========================================

    function saveSkillbarColors() {
        const key = CONFIG.storageKeys.SKILLBAR_COLORS;
        if (DeltaLib) {
            DeltaLib.storage.setJSON(key, CONFIG.skillbarColors);
        } else {
            localStorage.setItem(key, JSON.stringify(CONFIG.skillbarColors));
        }
    }

    function resetToDefaults() {
        CONFIG.skillbarColors = { ...CONFIG.defaults.skillbarColors };
        saveSkillbarColors();
        log(LogLevel.INFO, "Colors reset to defaults");
    }

    function setFullscreenKey(key) {
        state.fullscreenKey = key.toLowerCase();
    }

    // ==========================================
    // DEBUG
    // ==========================================

    function getDebugInfo() {
        return {
            version: MODULE_VERSION,
            initialized: isInitialized,
            destroyed: isDestroyed,
            state: { ...state },
            cleanup: cleanup?.getCount() || null
        };
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

    window.DeltaUI = Object.freeze({
        version: MODULE_VERSION,

        // Toggle system (used by settings)
        applyToggle,

        // Style management (used by settings)
        updateDynamicStyles,

        // Color management (used by settings)
        saveSkillbarColors,
        resetToDefaults,

        // Keybinds (used by settings)
        setFullscreenKey,

        // Lifecycle
        destroy,
        reinit,

        // Debug
        setDebugMode,
        getDebugInfo
    });

})();
