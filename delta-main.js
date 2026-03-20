(function() {
    "use strict";

    if (window.DeltaUI) return;

    function getDeps() {
        return { lib: window.DeltaLib, config: window.DELTA_CONFIG };
    }

    const CRITICAL_CSS = `
        #expbar { display: none !important; }
        .slot.filled { position: relative !important; overflow: visible !important; }
        #sessionStatsContainer { position: fixed; bottom: 10px; right: 10px; z-index: 9999; pointer-events: none; }
        .stat-box { background: rgba(0, 0, 0, 0.5); padding: 4px 8px; margin-bottom: 5px; border-radius: 6px; color: white; display: flex; align-items: center; gap: 4px; }
        .stat-box .fame-icon { width: 14px; height: 14px; }
        #delta-settings-window { position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; z-index: 99999 !important; }
        .cc-hp-border-overlay { position: absolute; inset: 0; border-radius: 4px; pointer-events: none; z-index: 10; display: none; box-sizing: border-box; box-shadow: inset 0 0 0 6px red; }
        body.delta-fps-mode .delta-fps-hide { display: none !important; }
        body:not(.delta-item-recolor) .border.purp { border-color: #9E3BF9 !important; box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important; }
        body:not(.delta-item-recolor) .border.purp:hover { box-shadow: 0 0 12px rgba(158, 59, 249, 0.7) !important; }
        body.delta-item-recolor .border.purp:not([data-premium-box="true"]):not([data-charm="true"]):not([data-pet="true"]) { border: 3px solid #ff7600 !important; box-shadow: 0 0 6px #ff7600 !important; }
        body.delta-item-recolor .border.purp:not([data-premium-box="true"]):not([data-charm="true"]):not([data-pet="true"]):hover { box-shadow: 0 0 12px #ff7600, 0 0 20px rgba(255, 118, 0, 0.3) !important; }
        body:not(.delta-charm-colors) .slot.filled[data-charm="true"], body:not(.delta-charm-colors) .slot.filled[data-pet="true"] { border-color: #9E3BF9 !important; box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important; }
        body:not(.delta-charm-colors) .slot.filled[data-charm="true"]:hover, body:not(.delta-charm-colors) .slot.filled[data-pet="true"]:hover { box-shadow: 0 0 12px rgba(158, 59, 249, 0.7) !important; }
        .premium-crown { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: url('/data/ui/icons/crown.svg') center/contain no-repeat; filter: drop-shadow(0 0 4px gold); z-index: 20; }
        .premium-sparkles { position: absolute; inset: 0; pointer-events: none; z-index: 15; }
        .premium-sparkle { position: absolute; width: 4px; height: 4px; background: gold; border-radius: 50%; animation: sparkle 1.5s ease-in-out infinite; }
        .sparkle-0 { top: 10%; left: 10%; animation-delay: 0s; }
        .sparkle-1 { top: 10%; right: 10%; animation-delay: 0.4s; }
        .sparkle-2 { bottom: 10%; left: 10%; animation-delay: 0.8s; }
        .sparkle-3 { bottom: 10%; right: 10%; animation-delay: 1.2s; }
        @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }
        #sysdelta { position: relative; }
        #sysdelta .delta-icon { font-size: 16px; font-weight: bold; color: #F5C247; }
        #sysdelta:hover .delta-icon { text-shadow: 0 0 8px rgba(245, 194, 71, 0.6); }
    `;

    let isInitialized = false;
    let cleanup = null;
    let CONFIG = null;
    let ccEnabled = true;
    let hideBuffsEnabled = false;
    let fullscreenKey = "o";
    let sessionStart = Date.now();
    let totalPlaytime = 0;
    let dynamicStyle = null;

    function $(sel, root = document) {
        try { return root?.querySelector(sel) || null; } catch { return null; }
    }

    function $$(sel, root = document) {
        try { return Array.from(root?.querySelectorAll(sel) || []); } catch { return []; }
    }

    function getToggle(key, defaultVal) {
        const { lib } = getDeps();
        if (lib) return lib.storage.getToggle(key, defaultVal);
        const saved = localStorage.getItem("deltaUI_" + key);
        if (saved !== null) return saved === "true";
        return CONFIG?.defaults?.toggles?.[key] ?? defaultVal;
    }

    function setStyleImportant(el, prop, value) {
        if (!el?.style) return;
        try { el.style.setProperty(prop, value, "important"); } catch { el.style[prop] = value; }
    }

    function getPathFromSrc(src) {
        if (!src) return "";
        try { return new URL(src, window.location.origin).pathname; } catch { return src.split("?")[0]; }
    }

    function formatTime(s) {
        if (s < 0) s = 0;
        if (s < 60) return s + "s";
        if (s < 3600) return Math.floor(s / 60) + "m " + (s % 60) + "s";
        if (s < 86400) return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
        return Math.floor(s / 86400) + "d " + Math.floor((s % 86400) / 3600) + "h";
    }

    function formatNumber(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
        return String(n);
    }

    function colorFromPercent(pct) {
        if (pct >= 109) return CONFIG.qualityColors.RED;
        if (pct >= 99) return CONFIG.qualityColors.ORANGE;
        if (pct >= 90) return CONFIG.qualityColors.PURPLE;
        if (pct >= 70) return CONFIG.qualityColors.BLUE;
        if (pct >= 50) return CONFIG.qualityColors.GREEN;
        return CONFIG.qualityColors.GREY;
    }

    function injectCriticalCSS() {
        const { lib } = getDeps();
        if (lib) {
            lib.injectStyle("delta-critical-css", CRITICAL_CSS);
        } else {
            if (document.getElementById("delta-critical-css")) return;
            const style = document.createElement("style");
            style.id = "delta-critical-css";
            style.textContent = CRITICAL_CSS;
            document.head.appendChild(style);
        }
    }

    function buildRuntimeConfig() {
        CONFIG = window.DELTA_CONFIG;
        if (!CONFIG) return null;
        CONFIG.skillbarColors = { ...CONFIG.defaults.skillbarColors };
        CONFIG.charmColors = { ...CONFIG.defaults.charmColors };
        CONFIG.petColor = CONFIG.defaults.petColor;
        CONFIG.hiddenBuffs = [];
        CONFIG.fpsHideSelectors = [];
        loadSavedSettings();
        return CONFIG;
    }

    function loadSavedSettings() {
        const { lib } = getDeps();
        try {
            const saved = lib ? lib.storage.getJSON(CONFIG.storageKeys.SKILLBAR_COLORS) : JSON.parse(localStorage.getItem(CONFIG.storageKeys.SKILLBAR_COLORS) || "{}");
            if (saved) Object.assign(CONFIG.skillbarColors, saved);
        } catch {}
        try {
            const saved = lib ? lib.storage.getJSON(CONFIG.storageKeys.CHARM_COLORS) : JSON.parse(localStorage.getItem(CONFIG.storageKeys.CHARM_COLORS) || "{}");
            if (saved) Object.assign(CONFIG.charmColors, saved);
        } catch {}
        try {
            const saved = lib ? lib.storage.get(CONFIG.storageKeys.PET_COLOR) : localStorage.getItem(CONFIG.storageKeys.PET_COLOR);
            if (saved) CONFIG.petColor = saved;
        } catch {}
        loadHiddenBuffs();
        loadCCSettings();
        loadFPSSettings();
    }

    function loadHiddenBuffs() {
        const { lib } = getDeps();
        try {
            const saved = lib ? lib.storage.getJSON(CONFIG.storageKeys.HIDDEN_BUFFS) : JSON.parse(localStorage.getItem(CONFIG.storageKeys.HIDDEN_BUFFS) || "{}");
            if (!saved) return;
            const arr = [];
            for (const [buffId, isHidden] of Object.entries(saved)) {
                if (!isHidden) continue;
                for (const className of Object.keys(CONFIG.buffIcons || {})) {
                    const buff = CONFIG.buffIcons[className].find(b => b.id === buffId);
                    if (buff) { arr.push(buff.src); break; }
                }
                const utilBuff = (CONFIG.utilityBuffs || []).find(b => b.id === buffId);
                if (utilBuff) arr.push(utilBuff.src);
            }
            CONFIG.hiddenBuffs = arr;
        } catch {}
    }

    function loadCCSettings() {
        const { lib } = getDeps();
        try {
            const saved = lib ? lib.storage.getJSON(CONFIG.storageKeys.CC_SETTINGS) : JSON.parse(localStorage.getItem(CONFIG.storageKeys.CC_SETTINGS) || "{}");
            if (!saved) return;
            (CONFIG.ccEffects || []).forEach(cc => {
                const settings = saved[cc.id];
                if (settings) { cc.color = settings.color; cc.priority = settings.priority; }
            });
        } catch {}
    }

    function loadFPSSettings() {
        const { lib } = getDeps();
        try {
            const saved = lib ? lib.storage.getJSON(CONFIG.storageKeys.FPS_SETTINGS) : JSON.parse(localStorage.getItem(CONFIG.storageKeys.FPS_SETTINGS) || "{}");
            const fpsSettings = saved || {};
            const arr = [];
            (CONFIG.fpsOptions || []).forEach(opt => {
                if (fpsSettings[opt.id] ?? opt.default) arr.push(opt.selector);
            });
            CONFIG.fpsHideSelectors = arr;
        } catch {}
    }

    function generateDynamicStyles() {
        let css = "";
        for (const [id, color] of Object.entries(CONFIG.skillbarColors)) {
            const extraGlow = id === "skr" ? `, 0 0 10px ${color}` : "";
            css += `#${id} { border: 3px solid ${color} !important; box-shadow: 0 0 6px ${color}${extraGlow} !important; }\n`;
        }
        for (const [charm, color] of Object.entries(CONFIG.charmColors)) {
            css += `body.delta-charm-colors .slot.filled[data-${charm}="true"] { border-color: ${color} !important; box-shadow: 0 0 8px ${color} !important; }
                body.delta-charm-colors .slot.filled[data-${charm}="true"] > .slotdescription { border-color: ${color} !important; box-shadow: 0 0 12px ${color}cc !important; }
                body.delta-charm-colors .slot.filled[data-${charm}="true"] > .slotdescription .slottitle { color: ${color} !important; }\n`;
        }
        css += `body.delta-charm-colors .slot.filled[data-pet="true"] { border-color: ${CONFIG.petColor} !important; box-shadow: 0 0 8px ${CONFIG.petColor} !important; }
            body.delta-charm-colors .slot.filled[data-pet="true"] > .slotdescription { border-color: ${CONFIG.petColor} !important; box-shadow: 0 0 12px ${CONFIG.petColor}cc !important; }
            body.delta-charm-colors .slot.filled[data-pet="true"] > .slotdescription .slottitle { color: ${CONFIG.petColor} !important; }\n`;
        css += `body:not(.delta-charm-colors) .slot.filled[data-charm="true"], body:not(.delta-charm-colors) .slot.filled[data-pet="true"] { border-color: #9E3BF9 !important; box-shadow: 0 0 6px rgba(158, 59, 249, 0.5) !important; }\n`;
        if (CONFIG.fpsHideSelectors?.length > 0) {
            css += `body.delta-fps-mode :is(${CONFIG.fpsHideSelectors.join(", ")}) { display: none !important; }\n`;
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
    }

    const ImagePreloader = {
        cache: new Map(),
        preloaded: false,
        preload() {
            if (this.preloaded) return;
            this.preloaded = true;
            for (const [original, replacement] of Object.entries(CONFIG.replacements || {})) {
                const img = new Image();
                img.src = replacement;
                this.cache.set(original, img);
            }
        },
        get(original) { return this.cache.get(original); }
    };

    const SlotProcessor = {
        processedSlots: new WeakMap(),
        getReplacementKey(srcPath) { return srcPath.replace("_grey.avif", "_q3.avif"); },
        process(slot) {
            if (!slot || !(slot instanceof Element)) return;
            const img = slot.querySelector("img.icon") || slot.querySelector("img");
            if (!img?.src) return;
            const srcPath = getPathFromSrc(img.src);
            const normalizedPath = this.getReplacementKey(srcPath);
            const itemRecolorEnabled = document.body.classList.contains("delta-item-recolor");
            const isAlreadyReplacement = img.src.includes("githubusercontent") || img.src.includes("github");
            if (itemRecolorEnabled && !isAlreadyReplacement) {
                for (const [original, replacement] of Object.entries(CONFIG.replacements || {})) {
                    if (normalizedPath.includes(original) || srcPath.includes(original)) {
                        if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;
                        const preloaded = ImagePreloader.get(original);
                        img.src = (preloaded?.complete) ? preloaded.src : replacement;
                        img.dataset.replaced = "true";
                        break;
                    }
                }
            }
            if (!itemRecolorEnabled && img.dataset.replaced === "true" && img.dataset.originalSrc) {
                img.src = img.dataset.originalSrc;
                delete img.dataset.replaced;
                delete img.dataset.originalSrc;
            }
            delete slot.dataset.pet;
            delete slot.dataset.charm;
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
                    if (!slot.querySelector(".premium-crown")) {
                        const crown = document.createElement("div");
                        crown.className = "premium-crown";
                        slot.appendChild(crown);
                    }
                    if (!slot.querySelector(".premium-sparkles")) {
                        const sparkles = document.createElement("div");
                        sparkles.className = "premium-sparkles";
                        sparkles.innerHTML = '<div class="premium-sparkle sparkle-0"></div><div class="premium-sparkle sparkle-1"></div><div class="premium-sparkle sparkle-2"></div><div class="premium-sparkle sparkle-3"></div>';
                        slot.appendChild(sparkles);
                    }
                }
            }
            this.processedSlots.set(slot, img.src);
        },
        scanAll() {
            $$(".slot.filled, .container.border.purp").forEach(slot => this.process(slot));
        },
        revertAllImages() {
            $$('img[data-replaced="true"][data-original-src]').forEach(img => {
                img.src = img.dataset.originalSrc;
                delete img.dataset.replaced;
                delete img.dataset.originalSrc;
            });
            this.processedSlots = new WeakMap();
        }
    };

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
            if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
            let overlay = parent.querySelector(".cc-hp-border-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "cc-hp-border-overlay";
                parent.appendChild(overlay);
            }
            let highestCC = null;
            frame.querySelectorAll(".buffarray.party img.icon").forEach(buff => {
                for (const cc of (CONFIG.ccEffects || [])) {
                    if (cc.priority === 0) continue;
                    if (buff.src.includes(cc.src)) {
                        if (!highestCC || cc.priority > highestCC.priority) highestCC = cc;
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
        const arr = [];
        for (const [buffId, isHidden] of Object.entries(hiddenBuffsObj)) {
            if (!isHidden) continue;
            for (const className of Object.keys(CONFIG.buffIcons || {})) {
                const buff = CONFIG.buffIcons[className].find(b => b.id === buffId);
                if (buff) { arr.push(buff.src); break; }
            }
            const utilBuff = (CONFIG.utilityBuffs || []).find(b => b.id === buffId);
            if (utilBuff) arr.push(utilBuff.src);
        }
        CONFIG.hiddenBuffs = arr;
        updateHiddenBuffs();
    }

    function updateCCConfig(ccSettings) {
        (CONFIG.ccEffects || []).forEach(cc => {
            const settings = ccSettings[cc.id];
            if (settings) { cc.color = settings.color; cc.priority = settings.priority; }
        });
        updateCCOverlays();
    }

    function updateFPSConfig(fpsSettings) {
        const arr = [];
        (CONFIG.fpsOptions || []).forEach(opt => {
            if (fpsSettings[opt.id] ?? opt.default) arr.push(opt.selector);
        });
        CONFIG.fpsHideSelectors = arr;
        updateDynamicStyles();
    }

    function applyToggle(toggleId, isEnabled) {
        const { lib } = getDeps();
        if (lib) lib.storage.setToggle(toggleId, isEnabled);
        else localStorage.setItem("deltaUI_" + toggleId, String(isEnabled));

        switch (toggleId) {
            case "ccIndicator": ccEnabled = isEnabled; updateCCOverlays(); break;
            case "hideBuffs": hideBuffsEnabled = isEnabled; updateHiddenBuffs(); break;
            case "fpsMode": document.body.classList.toggle("delta-fps-mode", isEnabled); break;
            case "chatTweaks": const cc = $("#chat-controls"); if (cc) cc.style.display = isEnabled ? "flex" : "none"; break;
            case "itemRecolor":
                document.body.classList.toggle("delta-item-recolor", isEnabled);
                if (isEnabled) SlotProcessor.scanAll();
                else { SlotProcessor.revertAllImages(); SlotProcessor.scanAll(); }
                break;
            case "charmColors": document.body.classList.toggle("delta-charm-colors", isEnabled); break;
            case "playtimeLabels":
                const p = $("#totalPlaytimeUI"), s = $("#sessionTimeUI");
                if (p) p.style.display = isEnabled ? "flex" : "none";
                if (s) s.style.display = isEnabled ? "flex" : "none";
                break;
            case "fameLabels":
                const g = $("#fameGainedUI"), l = $("#fameLostUI");
                if (g) g.style.display = isEnabled ? "flex" : "none";
                if (l) l.style.display = isEnabled ? "flex" : "none";
                break;
            case "mouseover": if (window.DeltaMouseover) isEnabled ? window.DeltaMouseover.enable() : window.DeltaMouseover.disable(); break;
            case "partyUIEditor": if (window.DeltaPartyArranger) isEnabled ? window.DeltaPartyArranger.enable() : window.DeltaPartyArranger.disable(); break;
            case "canvasScaler": if (window.DeltaCanvasScaler) isEnabled ? window.DeltaCanvasScaler.enable() : window.DeltaCanvasScaler.disable(); break;
            case "partyAutoSort": if (window.DeltaPartyArranger) isEnabled ? window.DeltaPartyArranger.enableAutoSort() : window.DeltaPartyArranger.disableAutoSort(); break;
        }
    }

    function applyAllSavedToggles() {
        ["ccIndicator", "hideBuffs", "fpsMode", "chatTweaks", "itemRecolor", "charmColors", "playtimeLabels", "fameLabels", "mouseover", "partyUIEditor", "canvasScaler", "partyAutoSort"].forEach(id => {
            applyToggle(id, getToggle(id, CONFIG.defaults.toggles[id] || false));
        });
    }

    function applySkillColors() {
        $$(".skillbox.svelte-1e0alkc .slot.filled").forEach(slot => {
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
        });
    }

    function scanDamageBars() {
        $$(".window.panel-black.svelte-1f1v3u3 .wrapper .bar .progressBar").forEach(bar => {
            const left = bar.querySelector("span.left");
            if (!left || left.querySelector("img.dmg-class-icon")) return;
            for (const [cls, src] of Object.entries(CONFIG.classIcons || {})) {
                if (bar.classList.contains(cls)) {
                    const img = document.createElement("img");
                    img.className = "dmg-class-icon";
                    img.src = src;
                    img.style.marginRight = "4px";
                    left.prepend(img);
                    break;
                }
            }
        });
    }

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
        const percent = parseInt(percentSpan.textContent.replace("%", "").trim(), 10);
        if (isNaN(percent)) return;
        const color = colorFromPercent(percent);
        const title = tooltip.querySelector(".slottitle");
        if (title) setStyleImportant(title, "color", color);
        setStyleImportant(tooltip, "border-color", color);
        setStyleImportant(tooltip, "box-shadow", `0 0 12px ${color}cc`);
    }

    function recolorChatItems() {
        $$("#chat .chatItem:not([data-fully-colored])").forEach(item => {
            const percentSpan = item.querySelector(".textpurp-l, .textblue-l");
            if (!percentSpan) return;
            const match = percentSpan.textContent.trim().match(/(\d+)%/);
            if (!match) return;
            const color = colorFromPercent(parseInt(match[1], 10));
            if (!color) return;
            item.style.backgroundColor = `${color}33`;
            setStyleImportant(percentSpan, "color", color);
            setStyleImportant(item, "color", color);
            const upgradeSpan = item.querySelector(".textprimary");
            if (upgradeSpan) setStyleImportant(upgradeSpan, "color", "#40edff");
            item.dataset.fullyColored = "true";
        });
    }

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

    function fixBattleboardWindow() {
        $$(".window.panel-black.svelte-1f1v3u3").forEach(win => {
            const titleDiv = win.querySelector(".title > div");
            win.classList.toggle("battleboard-window", titleDiv?.textContent.trim() === "War Statistics");
        });
    }

    function createSessionStats() {
        if (document.getElementById("sessionStatsContainer")) return;
        const container = document.createElement("div");
        container.id = "sessionStatsContainer";
        container.innerHTML = `
            <div class="stat-box" id="totalPlaytimeUI">Total playtime: <span class="value">0s</span></div>
            <div class="stat-box" id="sessionTimeUI">Session time: <span class="value">0s</span></div>
            <div class="stat-box" id="fameGainedUI">Fame Gained: <span class="fame-value"><img src="/data/ui/currency/fame.svg" class="fame-icon"><span id="fameGainedAmount">0</span></span></div>
            <div class="stat-box" id="fameLostUI">Fame Lost: <span class="fame-value"><img src="/data/ui/currency/fame.svg" class="fame-icon"><span id="fameLostAmount">0</span></span></div>
        `;
        document.body.appendChild(container);
    }

    function updateTimeUI() {
        const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
        const sessionEl = $("#sessionTimeUI .value");
        const totalEl = $("#totalPlaytimeUI .value");
        if (sessionEl) sessionEl.textContent = formatTime(elapsed);
        if (totalEl) totalEl.textContent = formatTime(totalPlaytime + elapsed);
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

    function injectDeltaButton() {
        if ($("#sysdelta")) return;
        const btnbar = $(".l-corner-ur .btnbar");
        if (!btnbar) return;
        const syschar = $("#syschar", btnbar);
        if (!syschar) return;
        const btn = document.createElement("div");
        btn.id = "sysdelta";
        btn.className = "btn border black";
        btn.title = "Delta's UI Settings";
        btn.innerHTML = '<span class="delta-icon">Δ</span>';
        btn.addEventListener("click", () => window.DeltaSettings?.toggle());
        btnbar.insertBefore(btn, syschar);
    }

    function setupObserver() {
        const { lib } = getDeps();
        const callback = (mutations) => {
            let shouldUpdateTooltips = false;
            let shouldUpdateDamageBars = false;
            let shouldUpdateWindows = false;
            const slotsToProcess = new Set();

            for (const mutation of mutations) {
                if (mutation.type === "attributes" && mutation.attributeName === "src") {
                    const target = mutation.target;
                    if (target.tagName === "IMG") {
                        const slot = target.closest(".slot.filled, .container.border.purp");
                        if (slot) slotsToProcess.add(slot);
                    }
                    continue;
                }
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.classList?.contains("slot") && node.classList?.contains("filled")) slotsToProcess.add(node);
                    if (node.querySelectorAll) node.querySelectorAll(".slot.filled").forEach(slot => slotsToProcess.add(slot));
                    if (node.classList?.contains("slotdescription") || node.querySelector?.(".slotdescription")) shouldUpdateTooltips = true;
                    if (node.classList?.contains("progressBar") || node.querySelector?.(".progressBar")) shouldUpdateDamageBars = true;
                    if (node.classList?.contains("window") || node.querySelector?.(".window")) shouldUpdateWindows = true;
                }
            }

            if (slotsToProcess.size > 0) slotsToProcess.forEach(slot => SlotProcessor.process(slot));
            if (shouldUpdateTooltips) {
                $$(".slotdescription").forEach(updateTooltipUI);
            }
            if (shouldUpdateDamageBars) requestAnimationFrame(scanDamageBars);
            if (shouldUpdateWindows) {
                requestAnimationFrame(() => {
                    fixBattleboardWindow();
                    colorWarStatisticsTable();
                    applySkillColors();
                });
            }
        };

        if (lib && cleanup) {
            const observerId = lib.observers.create(document.body, callback, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["src"],
                debounce: 50
            });
            cleanup.trackObserver(observerId);
        } else {
            const observer = new MutationObserver(callback);
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
            if (cleanup) cleanup.trackCustom(() => observer.disconnect());
        }
    }

    function setupUpdateLoop() {
        const { lib } = getDeps();
        let frameCount = 0;

        function tick() {
            frameCount++;
            if (frameCount % 30 === 0) {
                if ($(".battleboard-window")) updateFactionPanel();
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

        const intervalId = setInterval(() => {
            fixBattleboardWindow();
            if (!$("#sysdelta")) injectDeltaButton();
            SlotProcessor.scanAll();
            recolorChatItems();
        }, CONFIG.timing.SLOW_UPDATE);

        if (cleanup) cleanup.trackCustom(() => clearInterval(intervalId));
    }

    let factionPanel = null;

    function updateFactionPanel() {
        const warStats = $(".battleboard-window");
        if (!warStats) {
            if (factionPanel) { factionPanel.remove(); factionPanel = null; }
            return;
        }
        if (!factionPanel || !document.contains(factionPanel)) {
            factionPanel = document.createElement("div");
            factionPanel.id = "faction-stats-panel";
            factionPanel.innerHTML = '<div class="fs-section vg" id="vg-stats"></div><div class="fs-vs">VS</div><div class="fs-section bl" id="bl-stats"></div>';
            const parent = warStats.parentElement;
            if (parent) {
                parent.style.display = "flex";
                parent.style.alignItems = "flex-start";
                parent.appendChild(factionPanel);
            }
        }
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
                totalDmg += p.dmg; totalHeal += p.heal; totalKills += p.kills; totalFame += p.fame;
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
                statsDiv.innerHTML = `<div class="fs-header ${f}"><img src="${ICONS[f] || ""}"><span class="fs-name ${f}">${f.toUpperCase()}</span><span class="fs-count"><strong>${data.length}</strong></span></div>
                    <div class="fs-classes"><span class="fs-class"><img src="${ICONS.warrior || ""}"><span>${classCounts.warrior}</span></span><span class="fs-class"><img src="${ICONS.mage || ""}"><span>${classCounts.mage}</span></span><span class="fs-class"><img src="${ICONS.shaman || ""}"><span>${classCounts.shaman}</span></span><span class="fs-class"><img src="${ICONS.archer || ""}"><span>${classCounts.archer}</span></span></div>
                    <div class="fs-stats"><div class="fs-stat"><span class="fs-label">⚔</span><span class="fs-value ${cmp(totalKills, otherKills)}">${formatNumber(totalKills)}</span></div><div class="fs-stat"><span class="fs-label">💥</span><span class="fs-value ${cmp(totalDmg, otherDmg)}">${formatNumber(totalDmg)}</span></div><div class="fs-stat"><span class="fs-label">💚</span><span class="fs-value ${cmp(totalHeal, otherHeal)}">${formatNumber(totalHeal)}</span></div><div class="fs-stat"><span class="fs-label"><img src="${ICONS.fame || ""}"></span><span class="fs-value ${cmp(totalFame, otherFame)}">${formatNumber(totalFame)}</span></div></div>`;
            }
        });
    }

    function setupKeyboardHandler() {
        const { lib } = getDeps();
        const handler = (e) => {
            const active = document.activeElement;
            const isTyping = active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.isContentEditable;
            if (active?.classList?.contains("keybind-input")) return;
            if (!isTyping && e.key.toLowerCase() === fullscreenKey) {
                const isFS = document.fullscreenElement || document.webkitFullscreenElement;
                if (isFS) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
                else document.documentElement.requestFullscreen?.();
            }
        };
        if (lib && cleanup) {
            cleanup.trackEvent(lib.events.on(window, "keydown", handler));
        } else {
            window.addEventListener("keydown", handler);
            if (cleanup) cleanup.trackCustom(() => window.removeEventListener("keydown", handler));
        }
    }

    function setupBeforeUnload() {
        const handler = () => {
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            localStorage.setItem(CONFIG.storageKeys.PLAYTIME, String(totalPlaytime + elapsed));
        };
        window.addEventListener("beforeunload", handler);
        if (cleanup) cleanup.trackCustom(() => window.removeEventListener("beforeunload", handler));
    }

    function init() {
        if (isInitialized) return;
        isInitialized = true;

        const { lib } = getDeps();
        if (lib) cleanup = lib.createCleanup();
        else {
            const arr = [];
            cleanup = { trackEvent: () => {}, trackObserver: () => {}, trackInterval: () => {}, trackCustom: (fn) => arr.push(fn), run: () => arr.forEach(fn => fn()) };
        }

        if (!buildRuntimeConfig()) {
            setTimeout(init, 100);
            return;
        }

        injectCriticalCSS();
        fullscreenKey = localStorage.getItem("deltaUI_fullscreenKey") || "o";
        totalPlaytime = Number(localStorage.getItem(CONFIG.storageKeys.PLAYTIME) || "0") || 0;
        ccEnabled = getToggle("ccIndicator", true);
        hideBuffsEnabled = getToggle("hideBuffs", false);

        ImagePreloader.preload();
        updateDynamicStyles();
        createSessionStats();
        setupObserver();
        setupUpdateLoop();
        setupKeyboardHandler();
        setupBeforeUnload();

        const partyBtn = $("div.btn.party");
        if (partyBtn) partyBtn.remove();

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
        }, CONFIG.timing.INIT_DELAY);
    }

    function destroy() {
        if (!isInitialized) return;
        isInitialized = false;
        if (cleanup) { cleanup.run(); cleanup = null; }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    window.DeltaUI = Object.freeze({
        applyToggle,
        updateDynamicStyles,
        saveSkillbarColors: () => {
            const { lib } = getDeps();
            if (lib) lib.storage.setJSON(CONFIG.storageKeys.SKILLBAR_COLORS, CONFIG.skillbarColors);
            else localStorage.setItem(CONFIG.storageKeys.SKILLBAR_COLORS, JSON.stringify(CONFIG.skillbarColors));
        },
        saveCharmColors: () => {
            const { lib } = getDeps();
            if (lib) lib.storage.setJSON(CONFIG.storageKeys.CHARM_COLORS, CONFIG.charmColors);
            else localStorage.setItem(CONFIG.storageKeys.CHARM_COLORS, JSON.stringify(CONFIG.charmColors));
        },
        savePetColor: () => {
            const { lib } = getDeps();
            if (lib) lib.storage.set(CONFIG.storageKeys.PET_COLOR, CONFIG.petColor);
            else localStorage.setItem(CONFIG.storageKeys.PET_COLOR, CONFIG.petColor);
        },
        resetToDefaults: () => {
            CONFIG.skillbarColors = { ...CONFIG.defaults.skillbarColors };
            CONFIG.charmColors = { ...CONFIG.defaults.charmColors };
            CONFIG.petColor = CONFIG.defaults.petColor;
            window.DeltaUI.saveSkillbarColors();
            window.DeltaUI.saveCharmColors();
            window.DeltaUI.savePetColor();
        },
        setFullscreenKey: (key) => { fullscreenKey = key.toLowerCase(); },
        updateHiddenBuffsConfig,
        updateCCConfig,
        updateFPSConfig,
        destroy,
        reinit: () => { destroy(); init(); },
        version: "2.0.0"
    });
})();
