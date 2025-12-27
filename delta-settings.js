// ==========================================
// DELTA UI SETTINGS WINDOW v3.7
// Game-Native Style Settings Panel
// ==========================================

(function() {
    "use strict";

    // Wait for dependencies
    function init() {
        if (!window.DeltaLib || !window.DELTA_CONFIG || !window.DeltaUI) {
            setTimeout(init, 50);
            return;
        }

        const Lib = window.DeltaLib;
        const CONFIG = window.DELTA_CONFIG;
        const DeltaUI = window.DeltaUI;

        // ==========================================
        // HELPER FUNCTIONS
        // ==========================================

        function $(selector, root = document) {
            return Lib.$(selector, root);
        }

        function $$(selector, root = document) {
            return Lib.$$(selector, root);
        }

        function injectStyle(id, css) {
            let style = document.getElementById(id);
            if (!style) {
                style = document.createElement("style");
                style.id = id;
                document.head.appendChild(style);
            }
            style.textContent = css;
            return style;
        }

        function storageGet(key, defaultVal = null) {
            try {
                return localStorage.getItem(key) ?? defaultVal;
            } catch {
                return defaultVal;
            }
        }

        function storageSet(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn("[Delta Settings] Storage error:", e);
            }
        }

        function storageGetJSON(key, defaultVal = null) {
            try {
                const val = localStorage.getItem(key);
                return val ? JSON.parse(val) : defaultVal;
            } catch {
                return defaultVal;
            }
        }

        function storageSetJSON(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn("[Delta Settings] Storage error:", e);
            }
        }

        function getToggle(key, defaultVal = false) {
            const saved = storageGet(`deltaUI_${key}`);
            if (saved !== null) return saved === "true";
            return CONFIG.defaults.toggles[key] ?? defaultVal;
        }

        // ==========================================
        // STATE
        // ==========================================

        let settingsWindow = null;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        // ==========================================
        // CSS
        // ==========================================

        const CSS = `
            #delta-settings-window {
                position: fixed !important;
                z-index: 99999 !important;
            }

            #delta-settings-window .window {
                width: 480px;
                max-height: 600px;
            }

            #delta-settings-window .divide {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            /* Navigation */
            .delta-nav {
                display: flex;
                gap: 2px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(91, 133, 142, 0.3);
                flex-wrap: wrap;
            }

            .delta-nav .choice {
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 12px;
                color: #5b858e;
                transition: all 0.15s;
                background: rgba(0, 0, 0, 0.2);
            }

            .delta-nav .choice:hover {
                color: #F5C247;
                background: rgba(245, 194, 71, 0.1);
            }

            .delta-nav .choice.active {
                color: #F5C247;
                background: rgba(245, 194, 71, 0.2);
            }

            /* Tab panels */
            .tab-panel {
                display: none;
                padding: 12px;
            }

            .tab-panel.active {
                display: block;
            }

            .tab-panel h3 {
                margin: 16px 0 8px 0;
                font-size: 13px;
                border-bottom: 1px solid rgba(91, 133, 142, 0.2);
                padding-bottom: 4px;
            }

            .tab-panel h3:first-child {
                margin-top: 0;
            }

            /* Settings grid */
            #delta-settings-window .settings {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 8px 12px;
                align-items: center;
            }

            #delta-settings-window .settings > div:first-child {
                font-size: 12px;
            }

            #delta-settings-window .settings small {
                display: block;
                margin-top: 2px;
                opacity: 0.6;
            }

            /* Checkbox buttons */
            #delta-settings-window .btn.checkbox {
                width: 40px;
                height: 22px;
                border-radius: 11px;
                background: rgba(91, 133, 142, 0.3);
                position: relative;
                cursor: pointer;
                transition: all 0.2s;
            }

            #delta-settings-window .btn.checkbox::after {
                content: "";
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #5b858e;
                top: 3px;
                left: 3px;
                transition: all 0.2s;
            }

            #delta-settings-window .btn.checkbox.active {
                background: rgba(245, 194, 71, 0.3);
            }

            #delta-settings-window .btn.checkbox.active::after {
                background: #F5C247;
                left: 21px;
            }

            /* Color inputs */
            .color-input-wrapper {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .color-preview {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: 1px solid rgba(91, 133, 142, 0.4);
            }

            input[type="color"] {
                width: 32px;
                height: 24px;
                padding: 0;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background: transparent;
            }

            input[type="color"]::-webkit-color-swatch-wrapper {
                padding: 0;
            }

            input[type="color"]::-webkit-color-swatch {
                border: 1px solid rgba(91, 133, 142, 0.4);
                border-radius: 4px;
            }

            /* Keybind input */
            .keybind-input-wrapper {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .keybind-input {
                width: 50px;
                height: 28px;
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(91, 133, 142, 0.4);
                border-radius: 4px;
                color: #F5C247;
                cursor: pointer;
                transition: all 0.15s;
            }

            .keybind-input:focus {
                border-color: #F5C247;
                outline: none;
                background: rgba(245, 194, 71, 0.1);
            }

            .keybind-hint {
                margin-top: 12px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            /* Keybind badge */
            .keybind-badge {
                display: inline-block;
                padding: 2px 6px;
                background: rgba(245, 194, 71, 0.2);
                color: #F5C247;
                border-radius: 3px;
                font-size: 11px;
                font-weight: bold;
            }

            /* Action buttons */
            #delta-settings-window .btn.blue {
                background: rgba(6, 129, 234, 0.3);
                color: #0681ea;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
            }

            #delta-settings-window .btn.blue:hover {
                background: rgba(6, 129, 234, 0.5);
            }

            #delta-settings-window .btn.orange {
                background: rgba(255, 118, 0, 0.3);
                color: #ff7600;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
            }

            #delta-settings-window .btn.orange:hover {
                background: rgba(255, 118, 0, 0.5);
            }

            #delta-settings-window .btn.small {
                width: 24px;
                height: 24px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                background: rgba(91, 133, 142, 0.2);
                color: #5b858e;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
            }

            #delta-settings-window .btn.small:hover {
                background: rgba(255, 0, 0, 0.3);
                color: #ff4444;
            }

            /* Scrollable menu */
            #delta-settings-window .menu {
                max-height: 450px;
                overflow-y: auto;
            }

            /* Class headers */
            .class-header {
                margin: 16px 0 8px 0 !important;
                font-size: 12px !important;
                text-transform: capitalize;
            }

            .class-header:first-child {
                margin-top: 0 !important;
            }

            /* CC settings */
            .cc-settings {
                grid-template-columns: 1fr auto !important;
            }

            .cc-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cc-icon {
                width: 20px;
                height: 20px;
                border-radius: 3px;
            }

            .cc-name {
                font-size: 12px;
            }

            .cc-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cc-priority-input {
                width: 40px;
                height: 24px;
                text-align: center;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(91, 133, 142, 0.4);
                border-radius: 4px;
                color: #F5C247;
                font-size: 12px;
            }

            .cc-header {
                margin-bottom: 12px;
            }

            /* FPS settings */
            .fps-settings {
                grid-template-columns: 1fr auto !important;
            }

            .fps-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .fps-name {
                font-size: 12px;
            }

            .fps-header {
                margin-bottom: 12px;
            }

            /* Buff icon */
            .buff-icon {
                width: 20px;
                height: 20px;
                border-radius: 3px;
            }

            /* Customization notices */
            .customization-notice {
                padding: 8px 12px;
                background: rgba(255, 118, 0, 0.1);
                border: 1px solid rgba(255, 118, 0, 0.3);
                border-radius: 4px;
                margin-bottom: 12px;
            }

            .customization-section {
                transition: opacity 0.2s;
            }

            /* About tab */
            .about-content {
                text-align: center;
                padding: 20px;
            }

            .about-logo {
                font-size: 64px;
                color: #F5C247;
                margin-bottom: 16px;
                text-shadow: 0 0 20px rgba(245, 194, 71, 0.5);
            }

            .about-version {
                font-size: 14px;
                color: #5b858e;
                margin-bottom: 8px;
            }

            .about-author {
                font-size: 13px;
                margin-bottom: 16px;
            }

            .about-desc {
                font-size: 12px;
                color: #8ba3a8;
                line-height: 1.5;
                max-width: 300px;
                margin: 0 auto;
            }
        `;

        injectStyle("delta-settings-css", CSS);

        // ==========================================
        // SETTINGS HELPERS
        // ==========================================

        const getHiddenBuffs = () => {
            return storageGetJSON(CONFIG.storageKeys.HIDDEN_BUFFS, { ...CONFIG.defaults.hiddenBuffs });
        };

        const saveHiddenBuffs = (data) => {
            storageSetJSON(CONFIG.storageKeys.HIDDEN_BUFFS, data);
            DeltaUI.updateHiddenBuffsConfig?.(data);
        };

        const getCCSettings = () => {
            return storageGetJSON(CONFIG.storageKeys.CC_SETTINGS, { ...CONFIG.defaults.ccSettings });
        };

        const saveCCSettings = (data) => {
            storageSetJSON(CONFIG.storageKeys.CC_SETTINGS, data);
            DeltaUI.updateCCConfig?.(data);
        };

        const getFPSSettings = () => {
            const saved = storageGetJSON(CONFIG.storageKeys.FPS_SETTINGS, null);
            if (saved) return saved;

            // Return defaults
            const defaults = {};
            (CONFIG.fpsOptions || []).forEach(opt => {
                defaults[opt.id] = opt.default;
            });
            return defaults;
        };

        const saveFPSSettings = (data) => {
            storageSetJSON(CONFIG.storageKeys.FPS_SETTINGS, data);
            DeltaUI.updateFPSConfig?.(data);
        };

        // ==========================================
        // SKILLBAR SCANNER
        // ==========================================

        function scanSkillbar() {
            const skillbar = $("#skillbar");
            if (!skillbar) return [];

            const slots = [];
            skillbar.querySelectorAll(".slot[id]").forEach(slot => {
                const id = slot.id;
                if (id?.startsWith("sk")) {
                    const keyText = slot.querySelector(".slottext.key");
                    const keybind = keyText?.textContent.trim() || id.replace("sk", "").toUpperCase();
                    slots.push({
                        id,
                        keybind,
                        color: CONFIG.skillbarColors[id] || "#ffffff"
                    });
                }
            });

            return slots;
        }

        // ==========================================
        // HTML GENERATORS
        // ==========================================

        function generateSkillbarRows(slots) {
            if (slots.length === 0) {
                // Fallback to config
                return Object.entries(CONFIG.skillbarColors).map(([id, color]) => {
                    const key = id.replace("sk", "").toUpperCase();
                    return `
                        <div>Slot ${key}</div>
                        <div class="color-input-wrapper">
                            <div class="color-preview" style="background: ${color};"></div>
                            <input type="color" class="skill-color-input" data-skill-id="${id}" value="${color}">
                        </div>
                    `;
                }).join("");
            }

            return slots.map(slot => `
                <div>Slot <span class="keybind-badge">${slot.keybind}</span></div>
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${slot.color};"></div>
                    <input type="color" class="skill-color-input" data-skill-id="${slot.id}" value="${slot.color}">
                </div>
            `).join("");
        }

        function generateCharmRows() {
            return Object.entries(CONFIG.charmColors).map(([charm, color]) => {
                const name = CONFIG.charmNames[charm] || charm;
                return `
                    <div>${name}</div>
                    <div class="color-input-wrapper">
                        <div class="color-preview" style="background: ${color};"></div>
                        <input type="color" class="charm-color-input" data-charm-id="${charm}" value="${color}">
                    </div>
                `;
            }).join("");
        }

        function generateBuffRows() {
            const hiddenBuffs = getHiddenBuffs();
            const classes = ["warrior", "archer", "mage", "shaman"];
            let html = "";

            // Class buffs
            classes.forEach(className => {
                const buffs = CONFIG.buffIcons?.[className] || [];
                if (buffs.length === 0) return;

                html += `<h4 class="textprimary class-header">${className}</h4>`;
                html += '<div class="settings fps-settings">';

                buffs.forEach(buff => {
                    const isHidden = hiddenBuffs[buff.id] === true;
                    html += `
                        <div class="fps-row">
                            <img src="${buff.src}" class="buff-icon" alt="${buff.name}">
                            <span class="fps-name">${buff.name}</span>
                        </div>
                        <div class="btn checkbox ${isHidden ? "active" : ""}" data-buff-id="${buff.id}"></div>
                    `;
                });

                html += '</div>';
            });

            // Utility buffs
            const utilityBuffs = CONFIG.utilityBuffs || [];
            if (utilityBuffs.length > 0) {
                html += `<h4 class="textprimary class-header">Utility</h4>`;
                html += '<div class="settings fps-settings">';

                utilityBuffs.forEach(buff => {
                    const isHidden = hiddenBuffs[buff.id] === true;
                    html += `
                        <div class="fps-row">
                            <img src="${buff.src}" class="buff-icon" alt="${buff.name}">
                            <span class="fps-name">${buff.name}</span>
                        </div>
                        <div class="btn checkbox ${isHidden ? "active" : ""}" data-buff-id="${buff.id}"></div>
                    `;
                });

                html += '</div>';
            }

            return html;
        }

        function generateCCRows() {
            const ccSettings = getCCSettings();
            let html = "";

            (CONFIG.ccEffects || []).forEach(cc => {
                const settings = ccSettings[cc.id] || { color: cc.color, priority: cc.priority };
                html += `
                    <div class="cc-row">
                        <img src="${cc.src}" class="cc-icon" alt="${cc.name}">
                        <span class="cc-name">${cc.name}</span>
                    </div>
                    <div class="cc-controls">
                        <div class="color-input-wrapper">
                            <div class="color-preview" style="background: ${settings.color};"></div>
                            <input type="color" class="cc-color-input" data-cc-id="${cc.id}" value="${settings.color}">
                        </div>
                        <input type="number" class="cc-priority-input" data-cc-id="${cc.id}" 
                               value="${settings.priority}" min="0" max="10" title="Priority (0 = disabled)">
                    </div>
                `;
            });

            return html;
        }

        function generateFPSRows() {
            const fpsSettings = getFPSSettings();
            let html = "";

            (CONFIG.fpsOptions || []).forEach(opt => {
                const isEnabled = fpsSettings[opt.id] ?? opt.default;
                html += `
                    <div class="fps-row">
                        <span class="fps-name">${opt.name}</span>
                    </div>
                    <div class="btn checkbox ${isEnabled ? "active" : ""}" data-fps-id="${opt.id}"></div>
                `;
            });

            return html;
        }

        // ==========================================
        // WINDOW MANAGEMENT
        // ==========================================

        function close() {
            if (settingsWindow) {
                settingsWindow.remove();
                settingsWindow = null;
            }
            isDragging = false;
        }

        function toggle() {
            if (settingsWindow && document.contains(settingsWindow)) {
                close();
            } else {
                open();
            }
        }

        function open() {
            if (settingsWindow) settingsWindow.remove();

            const skillbarSlots = scanSkillbar();
            const currentFullscreenKey = storageGet("deltaUI_fullscreenKey", "o");

            const hideBuffsEnabled = getToggle("hideBuffs", false);
            const ccIndicatorEnabled = getToggle("ccIndicator", true);
            const fpsModeEnabled = getToggle("fpsMode", false);

            settingsWindow = document.createElement("div");
            settingsWindow.className = "window-pos";
            settingsWindow.id = "delta-settings-window";
            settingsWindow.style.cssText = "left: 50%; top: 50%; transform: translate(-50%, -50%);";

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
                                <div class="choice active" data-tab="features">Features</div>
                                <div class="choice" data-tab="controls">Controls</div>
                                <div class="choice" data-tab="colors">Colors</div>
                                <div class="choice" data-tab="customization">Customization</div>
                                <div class="choice" data-tab="about">About</div>
                            </div>
                            <div class="menu panel-black scrollbar svelte-13nnce4">
                                
                                <!-- Features Tab -->
                                <div class="tab-panel active" data-panel="features">
                                    <h3 class="textprimary">Gameplay</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>CC Indicator<br><small class="textgrey">Colored borders on CC'd party members</small></div>
                                        <div class="btn checkbox ${getToggle("ccIndicator", true) ? "active" : ""}" data-toggle="ccIndicator"></div>
                                        
                                        <div>Hide Buffs<br><small class="textgrey">Hide selected buff icons</small></div>
                                        <div class="btn checkbox ${getToggle("hideBuffs", false) ? "active" : ""}" data-toggle="hideBuffs"></div>
                                        
                                        <div>FPS Mode<br><small class="textgrey">Hide UI elements for performance</small></div>
                                        <div class="btn checkbox ${getToggle("fpsMode", false) ? "active" : ""}" data-toggle="fpsMode"></div>
                                    </div>

                                    <h3 class="textprimary">Chat</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Chat Tweaks<br><small class="textgrey">Resizable chat & controls</small></div>
                                        <div class="btn checkbox ${getToggle("chatTweaks", true) ? "active" : ""}" data-toggle="chatTweaks"></div>
                                    </div>

                                    <h3 class="textprimary">Visual</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Item Recolor<br><small class="textgrey">Quality-based item borders</small></div>
                                        <div class="btn checkbox ${getToggle("itemRecolor", true) ? "active" : ""}" data-toggle="itemRecolor"></div>
                                        
                                        <div>Charm Colors<br><small class="textgrey">Custom charm border colors</small></div>
                                        <div class="btn checkbox ${getToggle("charmColors", true) ? "active" : ""}" data-toggle="charmColors"></div>
                                    </div>

                                    <h3 class="textprimary">Stats Display</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Playtime Labels<br><small class="textgrey">Session & total time</small></div>
                                        <div class="btn checkbox ${getToggle("playtimeLabels", true) ? "active" : ""}" data-toggle="playtimeLabels"></div>
                                        
                                        <div>Fame Labels<br><small class="textgrey">Fame gained/lost counters</small></div>
                                        <div class="btn checkbox ${getToggle("fameLabels", true) ? "active" : ""}" data-toggle="fameLabels"></div>
                                    </div>
                                </div>

                                <!-- Controls Tab -->
                                <div class="tab-panel" data-panel="controls">
                                    <h3 class="textprimary">Keybinds</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Fullscreen Toggle<br><small class="textgrey">Press key to toggle fullscreen</small></div>
                                        <div class="keybind-input-wrapper">
                                            <input type="text" id="fullscreen-key-input" class="keybind-input" 
                                                   value="${currentFullscreenKey.toUpperCase()}" maxlength="1" 
                                                   readonly placeholder="Press a key">
                                            <div class="btn small" id="clear-fullscreen-key">✕</div>
                                        </div>
                                    </div>
                                    <div class="keybind-hint">
                                        <small class="textgrey">Click the input box and press any key to set a new keybind.</small>
                                    </div>
                                </div>

                                <!-- Colors Tab -->
                                <div class="tab-panel" data-panel="colors">
                                    <h3 class="textprimary">Skillbar Colors</h3>
                                    <div class="settings svelte-13nnce4">
                                        ${generateSkillbarRows(skillbarSlots)}
                                    </div>

                                    <h3 class="textprimary">Charm Colors</h3>
                                    <div class="settings svelte-13nnce4">
                                        ${generateCharmRows()}
                                    </div>

                                    <h3 class="textprimary">Pet Color</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Pet Border Glow</div>
                                        <div class="color-input-wrapper">
                                            <div class="color-preview" id="pet-preview" style="background: ${CONFIG.petColor};"></div>
                                            <input type="color" id="pet-color-input" value="${CONFIG.petColor}">
                                        </div>
                                    </div>

                                    <h3 class="textprimary">Actions</h3>
                                    <div class="settings svelte-13nnce4">
                                        <div>Export Colors</div>
                                        <div class="btn blue" id="export-colors">Export</div>
                                        
                                        <div>Import Colors</div>
                                        <div class="btn blue" id="import-colors">Import</div>
                                        
                                        <div>Reset to Defaults</div>
                                        <div class="btn orange" id="reset-all-colors">Reset</div>
                                    </div>
                                </div>

                                <!-- Customization Tab -->
                                <div class="tab-panel" data-panel="customization">
                                    <h3 class="textprimary">Hide Buffs Customization</h3>
                                    <div class="customization-notice" data-for="hideBuffs" ${hideBuffsEnabled ? 'style="display:none;"' : ''}>
                                        <small class="textgrey">⚠️ Enable "Hide Buffs" in Features tab to use this section.</small>
                                    </div>
                                    <div class="customization-section" data-for="hideBuffs" ${!hideBuffsEnabled ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                                        ${generateBuffRows()}
                                    </div>

                                    <h3 class="textprimary">CC Indicator Customization</h3>
                                    <div class="customization-notice" data-for="ccIndicator" ${ccIndicatorEnabled ? 'style="display:none;"' : ''}>
                                        <small class="textgrey">⚠️ Enable "CC Indicator" in Features tab to use this section.</small>
                                    </div>
                                    <div class="customization-section" data-for="ccIndicator" ${!ccIndicatorEnabled ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                                        <div class="cc-header">
                                            <small class="textgrey">Priority 0 = disabled. Higher priority shows first.</small>
                                        </div>
                                        <div class="settings cc-settings">
                                            ${generateCCRows()}
                                        </div>
                                    </div>

                                    <h3 class="textprimary">FPS Mode Customization</h3>
                                    <div class="customization-notice" data-for="fpsMode" ${fpsModeEnabled ? 'style="display:none;"' : ''}>
                                        <small class="textgrey">⚠️ Enable "FPS Mode" in Features tab to use this section.</small>
                                    </div>
                                    <div class="customization-section" data-for="fpsMode" ${!fpsModeEnabled ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                                        <div class="fps-header">
                                            <small class="textgrey">Choose which UI elements to hide when FPS Mode is active.</small>
                                        </div>
                                        <div class="settings fps-settings">
                                            ${generateFPSRows()}
                                        </div>
                                    </div>
                                </div>

                                <!-- About Tab -->
                                <div class="tab-panel" data-panel="about">
                                    <h3 class="textprimary">Delta UI</h3>
                                    <div class="about-content">
                                        <div class="about-logo">Δ</div>
                                        <div class="about-version">Version ${CONFIG.version}</div>
                                        <div class="about-author">Made with ♥ by <span class="textprimary">lordwar222</span></div>
                                        <div class="about-desc">
                                            A private UI enhancement mod for Hordes.io featuring customizable skillbar colors, 
                                            charm colors, CC indicators, and more.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(settingsWindow);
            setupEventListeners();
        }

        // ==========================================
        // EVENT LISTENERS
        // ==========================================

        function updateCustomizationVisibility(toggleId, isEnabled) {
            if (!settingsWindow) return;

            const notice = $(`.customization-notice[data-for="${toggleId}"]`, settingsWindow);
            const section = $(`.customization-section[data-for="${toggleId}"]`, settingsWindow);

            if (notice) {
                notice.style.display = isEnabled ? "none" : "block";
            }
            if (section) {
                section.style.opacity = isEnabled ? "1" : "0.5";
                section.style.pointerEvents = isEnabled ? "auto" : "none";
            }
        }

        function setupEventListeners() {
            if (!settingsWindow) return;

            // Close button
            $(".close-btn", settingsWindow)?.addEventListener("click", close);

            // Tab navigation
            $$(".delta-nav .choice", settingsWindow).forEach(choice => {
                choice.addEventListener("click", () => {
                    const targetTab = choice.dataset.tab;

                    $$(".delta-nav .choice", settingsWindow).forEach(c => c.classList.remove("active"));
                    choice.classList.add("active");

                    $$(".tab-panel", settingsWindow).forEach(panel => {
                        panel.classList.toggle("active", panel.dataset.panel === targetTab);
                    });
                });
            });

            // Feature toggles
            $$(".btn.checkbox[data-toggle]", settingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const toggleId = checkbox.dataset.toggle;
                    const isNowActive = !checkbox.classList.contains("active");

                    checkbox.classList.toggle("active");
                    storageSet(`deltaUI_${toggleId}`, String(isNowActive));
                    DeltaUI.applyToggle?.(toggleId, isNowActive);

                    // Update customization visibility
                    if (["hideBuffs", "ccIndicator", "fpsMode"].includes(toggleId)) {
                        updateCustomizationVisibility(toggleId, isNowActive);
                    }
                });
            });

            // Buff toggles
            $$(".btn.checkbox[data-buff-id]", settingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const buffId = checkbox.dataset.buffId;
                    const isNowActive = !checkbox.classList.contains("active");

                    checkbox.classList.toggle("active");

                    const hiddenBuffs = getHiddenBuffs();
                    hiddenBuffs[buffId] = isNowActive;
                    saveHiddenBuffs(hiddenBuffs);
                });
            });

            // FPS toggles
            $$(".btn.checkbox[data-fps-id]", settingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const fpsId = checkbox.dataset.fpsId;
                    const isNowActive = !checkbox.classList.contains("active");

                    checkbox.classList.toggle("active");

                    const fpsSettings = getFPSSettings();
                    fpsSettings[fpsId] = isNowActive;
                    saveFPSSettings(fpsSettings);
                });
            });

            // CC color inputs
            $$(".cc-color-input", settingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const ccId = e.target.dataset.ccId;
                    const ccSettings = getCCSettings();

                    if (!ccSettings[ccId]) {
                        ccSettings[ccId] = { color: e.target.value, priority: 1 };
                    } else {
                        ccSettings[ccId].color = e.target.value;
                    }

                    saveCCSettings(ccSettings);

                    const preview = e.target.previousElementSibling;
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // CC priority inputs
            $$(".cc-priority-input", settingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const ccId = e.target.dataset.ccId;
                    const priority = parseInt(e.target.value, 10) || 0;
                    const ccSettings = getCCSettings();

                    if (!ccSettings[ccId]) {
                        ccSettings[ccId] = { color: "#ffffff", priority };
                    } else {
                        ccSettings[ccId].priority = priority;
                    }

                    saveCCSettings(ccSettings);
                });
            });

            // Dragging
            const titleframe = $(".titleframe", settingsWindow);
            if (titleframe) {
                titleframe.addEventListener("mousedown", (e) => {
                    if (e.target.closest(".close-btn, .btn")) return;

                    isDragging = true;
                    const rect = settingsWindow.getBoundingClientRect();
                    dragOffset.x = e.clientX - rect.left;
                    dragOffset.y = e.clientY - rect.top;

                    settingsWindow.style.transform = "none";
                    settingsWindow.style.left = `${rect.left}px`;
                    settingsWindow.style.top = `${rect.top}px`;
                });
            }

            document.addEventListener("mousemove", (e) => {
                if (!isDragging || !settingsWindow) return;
                settingsWindow.style.left = `${e.clientX - dragOffset.x}px`;
                settingsWindow.style.top = `${e.clientY - dragOffset.y}px`;
            });

            document.addEventListener("mouseup", () => {
                isDragging = false;
            });

            // Skill color inputs
            $$(".skill-color-input", settingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const skillId = e.target.dataset.skillId;
                    CONFIG.skillbarColors[skillId] = e.target.value;

                    DeltaUI.saveSkillbarColors?.();
                    DeltaUI.updateDynamicStyles?.();

                    const preview = e.target.previousElementSibling;
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Charm color inputs
            $$(".charm-color-input", settingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const charmId = e.target.dataset.charmId;
                    CONFIG.charmColors[charmId] = e.target.value;

                    DeltaUI.saveCharmColors?.();
                    DeltaUI.updateDynamicStyles?.();

                    const preview = e.target.previousElementSibling;
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Pet color input
            const petInput = $("#pet-color-input", settingsWindow);
            petInput?.addEventListener("input", (e) => {
                CONFIG.petColor = e.target.value;

                DeltaUI.savePetColor?.();
                DeltaUI.updateDynamicStyles?.();

                const preview = $("#pet-preview", settingsWindow);
                if (preview) preview.style.background = e.target.value;
            });

            // Reset button
            $("#reset-all-colors", settingsWindow)?.addEventListener("click", () => {
                DeltaUI.resetToDefaults?.();
                DeltaUI.updateDynamicStyles?.();
                open(); // Recreate window
            });

            // Export button
            const exportBtn = $("#export-colors", settingsWindow);
            exportBtn?.addEventListener("click", () => {
                const data = {
                    skillbarColors: CONFIG.skillbarColors,
                    charmColors: CONFIG.charmColors,
                    petColor: CONFIG.petColor,
                    hiddenBuffs: getHiddenBuffs(),
                    ccSettings: getCCSettings(),
                    fpsSettings: getFPSSettings()
                };

                navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
                    exportBtn.textContent = "Copied!";
                    setTimeout(() => exportBtn.textContent = "Export", 1500);
                });
            });

            // Import button
            $("#import-colors", settingsWindow)?.addEventListener("click", () => {
                const json = prompt("Paste your color configuration:");
                if (!json) return;

                try {
                    const data = JSON.parse(json);

                    if (data.skillbarColors) Object.assign(CONFIG.skillbarColors, data.skillbarColors);
                    if (data.charmColors) Object.assign(CONFIG.charmColors, data.charmColors);
                    if (data.petColor) CONFIG.petColor = data.petColor;
                    if (data.hiddenBuffs) saveHiddenBuffs(data.hiddenBuffs);
                    if (data.ccSettings) saveCCSettings(data.ccSettings);
                    if (data.fpsSettings) saveFPSSettings(data.fpsSettings);

                    DeltaUI.saveSkillbarColors?.();
                    DeltaUI.saveCharmColors?.();
                    DeltaUI.savePetColor?.();
                    DeltaUI.updateDynamicStyles?.();

                    open(); // Recreate window
                } catch (e) {
                    alert("Invalid JSON format!");
                }
            });

            // Fullscreen keybind input
            const fullscreenKeyInput = $("#fullscreen-key-input", settingsWindow);
            if (fullscreenKeyInput) {
                fullscreenKeyInput.addEventListener("click", () => {
                    fullscreenKeyInput.value = "";
                    fullscreenKeyInput.placeholder = "Press a key...";
                });

                fullscreenKeyInput.addEventListener("keydown", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const key = e.key.toLowerCase();
                    if (["shift", "control", "alt", "meta"].includes(key)) return;

                    fullscreenKeyInput.value = key.toUpperCase();
                    storageSet("deltaUI_fullscreenKey", key);
                    DeltaUI.setFullscreenKey?.(key);
                    fullscreenKeyInput.blur();

                    console.log(`[Delta Settings] Fullscreen key set to: ${key.toUpperCase()}`);
                });

                fullscreenKeyInput.addEventListener("blur", () => {
                    const currentKey = storageGet("deltaUI_fullscreenKey", "o");
                    if (!fullscreenKeyInput.value) {
                        fullscreenKeyInput.value = currentKey.toUpperCase();
                    }
                    fullscreenKeyInput.placeholder = "Press a key";
                });
            }

            // Clear fullscreen key
            $("#clear-fullscreen-key", settingsWindow)?.addEventListener("click", () => {
                const defaultKey = "o";
                const input = $("#fullscreen-key-input", settingsWindow);

                if (input) input.value = defaultKey.toUpperCase();
                storageSet("deltaUI_fullscreenKey", defaultKey);
                DeltaUI.setFullscreenKey?.(defaultKey);

                console.log("[Delta Settings] Fullscreen key reset to: O");
            });
        }

        // ==========================================
        // EXPOSE API
        // ==========================================

        window.DeltaSettings = {
            toggle,
            open,
            close
        };

        console.log("✅ Delta Settings module loaded");
    }

    // Start initialization
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
