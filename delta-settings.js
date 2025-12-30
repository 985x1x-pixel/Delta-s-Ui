// ==========================================
// DELTA UI SETTINGS WINDOW v3.7
// Game-Native Style
// ==========================================

(function() {
    "use strict";

    function waitForConfig(callback) {
        if (window.DELTA_CONFIG && window.DeltaUI) {
            if (document.body) {
                callback();
            } else {
                document.addEventListener("DOMContentLoaded", callback);
            }
        } else {
            setTimeout(() => waitForConfig(callback), 50);
        }
    }

    waitForConfig(initSettings);

    function initSettings() {
        const CONFIG = window.DELTA_CONFIG;
        const DeltaUI = window.DeltaUI;

        if (!CONFIG || !DeltaUI) {
            console.warn("[Delta Settings] CONFIG or DeltaUI not ready, retrying...");
            setTimeout(initSettings, 100);
            return;
        }

        // ==========================================
        // STATE
        // ==========================================

        let deltaSettingsWindow = null;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        // ==========================================
        // DOM HELPERS
        // ==========================================

        const $ = (sel, root = document) => {
            try {
                return root ? root.querySelector(sel) : null;
            } catch (e) {
                console.warn("[Delta Settings] Query failed:", sel, e);
                return null;
            }
        };

        const $$ = (sel, root = document) => {
            try {
                return root ? Array.from(root.querySelectorAll(sel)) : [];
            } catch (e) {
                console.warn("[Delta Settings] QueryAll failed:", sel, e);
                return [];
            }
        };

        // ==========================================
        // STORAGE HELPERS
        // ==========================================

        function getToggle(key, defaultVal = false) {
            const saved = localStorage.getItem("deltaUI_" + key);
            if (saved !== null) return saved === "true";
            return CONFIG.defaults.toggles[key] ?? defaultVal;
        }

        function getHiddenBuffs() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKeys.HIDDEN_BUFFS);
                return saved ? JSON.parse(saved) : { ...CONFIG.defaults.hiddenBuffs };
            } catch (e) {
                return { ...CONFIG.defaults.hiddenBuffs };
            }
        }

        function saveHiddenBuffs(hiddenBuffs) {
            localStorage.setItem(CONFIG.storageKeys.HIDDEN_BUFFS, JSON.stringify(hiddenBuffs));
            if (DeltaUI.updateHiddenBuffsConfig) {
                DeltaUI.updateHiddenBuffsConfig(hiddenBuffs);
            }
        }

        function getCCSettings() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKeys.CC_SETTINGS);
                return saved ? JSON.parse(saved) : { ...CONFIG.defaults.ccSettings };
            } catch (e) {
                return { ...CONFIG.defaults.ccSettings };
            }
        }

        function saveCCSettings(ccSettings) {
            localStorage.setItem(CONFIG.storageKeys.CC_SETTINGS, JSON.stringify(ccSettings));
            if (DeltaUI.updateCCConfig) {
                DeltaUI.updateCCConfig(ccSettings);
            }
        }

        function getFPSSettings() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKeys.FPS_SETTINGS);
                if (saved) {
                    return JSON.parse(saved);
                }
                const defaults = {};
                (CONFIG.fpsOptions || []).forEach(opt => {
                    defaults[opt.id] = opt.default;
                });
                return defaults;
            } catch (e) {
                return {};
            }
        }

        function saveFPSSettings(fpsSettings) {
            localStorage.setItem(CONFIG.storageKeys.FPS_SETTINGS, JSON.stringify(fpsSettings));
            if (DeltaUI.updateFPSConfig) {
                DeltaUI.updateFPSConfig(fpsSettings);
            }
        }

        // ==========================================
        // SKILLBAR SCANNER
        // ==========================================

        function scanSkillbar() {
            const skillbar = document.querySelector("#skillbar");
            const slots = [];

            if (!skillbar) {
                console.log("[Delta Settings] Skillbar not found yet");
                return slots;
            }

            skillbar.querySelectorAll(".slot[id]").forEach(slot => {
                const id = slot.id;
                if (id && id.startsWith("sk")) {
                    const keyText = slot.querySelector(".slottext.key");
                    const keybind = keyText ? keyText.textContent.trim() : id.replace("sk", "").toUpperCase();
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

        function generateSkillbarColorRows(slots) {
            if (slots.length === 0) {
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

        function generateCharmColorRows() {
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

        function generateBuffToggleRows() {
            const hiddenBuffs = getHiddenBuffs();
            const classes = ["warrior", "archer", "mage", "shaman"];
            let html = '';

            classes.forEach(className => {
                const buffs = (CONFIG.buffIcons || {})[className] || [];
                if (buffs.length === 0) return;

                html += `<h4 class="textprimary class-header">${className.charAt(0).toUpperCase() + className.slice(1)}</h4>`;
                html += '<div class="settings fps-settings">';

                buffs.forEach(buff => {
                    const isHidden = hiddenBuffs[buff.id] === true;
                    html += `
                        <div class="fps-row">
                            <img src="${buff.src}" class="buff-icon" alt="${buff.name}" style="width:20px;height:20px;margin-right:8px;border-radius:3px;">
                            <span class="fps-name">${buff.name}</span>
                        </div>
                        <div class="btn checkbox ${isHidden ? "active" : ""}" data-buff-id="${buff.id}"></div>
                    `;
                });

                html += '</div>';
            });

            const utilityBuffs = CONFIG.utilityBuffs || [];
            if (utilityBuffs.length > 0) {
                html += `<h4 class="textprimary class-header">Utility</h4>`;
                html += '<div class="settings fps-settings">';

                utilityBuffs.forEach(buff => {
                    const isHidden = hiddenBuffs[buff.id] === true;
                    html += `
                        <div class="fps-row">
                            <img src="${buff.src}" class="buff-icon" alt="${buff.name}" style="width:20px;height:20px;margin-right:8px;border-radius:3px;">
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
            let html = '';

            (CONFIG.ccEffects || []).forEach(cc => {
                const settings = ccSettings[cc.id] || { color: cc.color, priority: cc.priority };
                html += `
                    <div class="cc-row">
                        <img src="${cc.src}" class="cc-icon" alt="${cc.name}">
                        <span class="cc-name">${cc.name}</span>
                    </div>
                    <div class="cc-controls">
                        <div class="color-input-wrapper">
                            <div class="color-preview cc-color-preview" style="background: ${settings.color};"></div>
                            <input type="color" class="cc-color-input" data-cc-id="${cc.id}" value="${settings.color}">
                        </div>
                        <input type="number" class="cc-priority-input" data-cc-id="${cc.id}" value="${settings.priority}" min="0" max="10" title="Priority (0 = disabled)">
                    </div>
                `;
            });

            return html;
        }

        function generateFPSRows() {
            const fpsSettings = getFPSSettings();
            let html = '';

            (CONFIG.fpsOptions || []).forEach(opt => {
                const isEnabled = fpsSettings[opt.id] !== undefined ? fpsSettings[opt.id] : opt.default;
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

        function closeDeltaSettingsWindow() {
            if (deltaSettingsWindow) {
                deltaSettingsWindow.remove();
                deltaSettingsWindow = null;
            }
            isDragging = false;
        }

        function toggleDeltaSettings() {
            if (deltaSettingsWindow && document.contains(deltaSettingsWindow)) {
                closeDeltaSettingsWindow();
            } else {
                createDeltaSettingsWindow();
            }
        }

        function createDeltaSettingsWindow() {
            if (deltaSettingsWindow) deltaSettingsWindow.remove();

            deltaSettingsWindow = document.createElement("div");
            deltaSettingsWindow.className = "window-pos";
            deltaSettingsWindow.id = "delta-settings-window";
            deltaSettingsWindow.style.cssText = "z-index: 100; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);";

            const skillbarSlots = scanSkillbar();
            const currentFullscreenKey = localStorage.getItem("deltaUI_fullscreenKey") || "o";
            const currentFameResetKey = localStorage.getItem("deltaUI_fameResetKey") || "[";
            const hideBuffsEnabled = getToggle("hideBuffs", false);
            const ccIndicatorEnabled = getToggle("ccIndicator", true);
            const fpsModeEnabled = getToggle("fpsMode", false);

            deltaSettingsWindow.innerHTML = `
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

                                        <div>Mouseover<br><small class="textgrey">Cast skills on mouseover targets</small></div>
                                        <div class="btn checkbox ${getToggle("mouseover", false) ? "active" : ""}" data-toggle="mouseover"></div>

                                        <div>Party UI Editor<br><small class="textgrey">Resize and move chat window</small></div>
                                        <div class="btn checkbox ${getToggle("partyUIEditor", false) ? "active" : ""}" data-toggle="partyUIEditor"></div>
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
                                                <input type="text" 
                                                       id="fullscreen-key-input" 
                                                       class="keybind-input" 
                                                       value="${currentFullscreenKey.toUpperCase()}" 
                                                       maxlength="1" 
                                                       readonly
                                                       placeholder="Press a key">
                                                <div class="btn small" id="clear-fullscreen-key">✕</div>
                                            </div>
                                    
                                            <div>Fame Reset<br><small class="textgrey">Press key to reset fame counters</small></div>
                                            <div class="keybind-input-wrapper">
                                                <input type="text" 
                                                       id="fame-reset-key-input" 
                                                       class="keybind-input" 
                                                       value="${currentFameResetKey.toUpperCase()}" 
                                                       maxlength="1" 
                                                       readonly
                                                       placeholder="Press a key">
                                                <div class="btn small" id="clear-fame-reset-key">✕</div>
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
                                        ${generateSkillbarColorRows(skillbarSlots)}
                                    </div>

                                    <h3 class="textprimary">Charm Colors</h3>
                                    <div class="settings svelte-13nnce4">
                                        ${generateCharmColorRows()}
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
                                        ${generateBuffToggleRows()}
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

            document.body.appendChild(deltaSettingsWindow);
            setupEventListeners();
        }

        // ==========================================
        // CUSTOMIZATION VISIBILITY
        // ==========================================

        function updateCustomizationVisibility(toggleId, isEnabled) {
            if (!deltaSettingsWindow) return;

            const notice = $(`.customization-notice[data-for="${toggleId}"]`, deltaSettingsWindow);
            const section = $(`.customization-section[data-for="${toggleId}"]`, deltaSettingsWindow);

            if (notice) {
                notice.style.display = isEnabled ? "none" : "block";
            }
            if (section) {
                section.style.opacity = isEnabled ? "1" : "0.5";
                section.style.pointerEvents = isEnabled ? "auto" : "none";
            }
        }

        // ==========================================
        // EVENT LISTENERS
        // ==========================================

        function setupEventListeners() {
            if (!deltaSettingsWindow) return;

            // Close button
            $(".close-btn", deltaSettingsWindow)?.addEventListener("click", closeDeltaSettingsWindow);

            // Tab navigation
            $$(".delta-nav .choice", deltaSettingsWindow).forEach(choice => {
                choice.addEventListener("click", () => {
                    const targetTab = choice.dataset.tab;
                    $$(".delta-nav .choice", deltaSettingsWindow).forEach(c => c.classList.remove("active"));
                    choice.classList.add("active");
                    $$(".tab-panel", deltaSettingsWindow).forEach(panel => {
                        panel.classList.toggle("active", panel.dataset.panel === targetTab);
                    });
                });
            });

            // Feature toggles
            $$(".btn.checkbox[data-toggle]", deltaSettingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const toggleId = checkbox.dataset.toggle;
                    const isNowActive = !checkbox.classList.contains("active");
                    checkbox.classList.toggle("active");
                    localStorage.setItem("deltaUI_" + toggleId, isNowActive.toString());

                    if (DeltaUI.applyToggle) {
                        DeltaUI.applyToggle(toggleId, isNowActive);
                    }

                    if (toggleId === "hideBuffs" || toggleId === "ccIndicator" || toggleId === "fpsMode") {
                        updateCustomizationVisibility(toggleId, isNowActive);
                    }
                });
            });

            // Buff toggle handlers
            $$(".btn.checkbox[data-buff-id]", deltaSettingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const buffId = checkbox.dataset.buffId;
                    const isNowActive = !checkbox.classList.contains("active");
                    checkbox.classList.toggle("active");

                    const hiddenBuffs = getHiddenBuffs();
                    hiddenBuffs[buffId] = isNowActive;
                    saveHiddenBuffs(hiddenBuffs);
                });
            });

            // FPS toggle handlers
            $$(".btn.checkbox[data-fps-id]", deltaSettingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const fpsId = checkbox.dataset.fpsId;
                    const isNowActive = !checkbox.classList.contains("active");
                    checkbox.classList.toggle("active");

                    const fpsSettings = getFPSSettings();
                    fpsSettings[fpsId] = isNowActive;
                    saveFPSSettings(fpsSettings);
                });
            });

            // CC color input handlers
            $$(".cc-color-input", deltaSettingsWindow).forEach(input => {
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

            // CC priority input handlers
            $$(".cc-priority-input", deltaSettingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const ccId = e.target.dataset.ccId;
                    const priority = parseInt(e.target.value, 10) || 0;
                    const ccSettings = getCCSettings();
                    if (!ccSettings[ccId]) {
                        ccSettings[ccId] = { color: "#ffffff", priority: priority };
                    } else {
                        ccSettings[ccId].priority = priority;
                    }
                    saveCCSettings(ccSettings);
                });
            });

            // Dragging
            const titleframe = $(".titleframe", deltaSettingsWindow);
            if (titleframe) {
                titleframe.addEventListener("mousedown", (e) => {
                    if (e.target.closest(".close-btn") || e.target.closest(".btn")) return;
                    isDragging = true;
                    const rect = deltaSettingsWindow.getBoundingClientRect();
                    dragOffset.x = e.clientX - rect.left;
                    dragOffset.y = e.clientY - rect.top;
                    deltaSettingsWindow.style.transform = "none";
                    deltaSettingsWindow.style.left = rect.left + "px";
                    deltaSettingsWindow.style.top = rect.top + "px";
                });
            }

            document.addEventListener("mousemove", (e) => {
                if (!isDragging || !deltaSettingsWindow) return;
                deltaSettingsWindow.style.left = (e.clientX - dragOffset.x) + "px";
                deltaSettingsWindow.style.top = (e.clientY - dragOffset.y) + "px";
            });

            document.addEventListener("mouseup", () => { isDragging = false; });

            // Skill color inputs
            $$(".skill-color-input", deltaSettingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const skillId = e.target.dataset.skillId;
                    CONFIG.skillbarColors[skillId] = e.target.value;
                    if (DeltaUI.saveSkillbarColors) DeltaUI.saveSkillbarColors();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    const preview = e.target.previousElementSibling;
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Charm color inputs
            $$(".charm-color-input", deltaSettingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const charmId = e.target.dataset.charmId;
                    CONFIG.charmColors[charmId] = e.target.value;
                    if (DeltaUI.saveCharmColors) DeltaUI.saveCharmColors();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    const preview = e.target.previousElementSibling;
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Pet color input
            const petInput = $("#pet-color-input", deltaSettingsWindow);
            if (petInput) {
                petInput.addEventListener("input", (e) => {
                    CONFIG.petColor = e.target.value;
                    if (DeltaUI.savePetColor) DeltaUI.savePetColor();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    const preview = $("#pet-preview", deltaSettingsWindow);
                    if (preview) preview.style.background = e.target.value;
                });
            }

            // Reset button
            const resetBtn = $("#reset-all-colors", deltaSettingsWindow);
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    if (DeltaUI.resetToDefaults) DeltaUI.resetToDefaults();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    createDeltaSettingsWindow();
                });
            }

            // Export button
            const exportBtn = $("#export-colors", deltaSettingsWindow);
            if (exportBtn) {
                exportBtn.addEventListener("click", () => {
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
            }

            // Import button
            const importBtn = $("#import-colors", deltaSettingsWindow);
            if (importBtn) {
                importBtn.addEventListener("click", () => {
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
                        if (DeltaUI.saveSkillbarColors) DeltaUI.saveSkillbarColors();
                        if (DeltaUI.saveCharmColors) DeltaUI.saveCharmColors();
                        if (DeltaUI.savePetColor) DeltaUI.savePetColor();
                        if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                        createDeltaSettingsWindow();
                    } catch (e) {
                        alert("Invalid JSON format!");
                    }
                });
            }

            // Fullscreen keybind input
            const fullscreenKeyInput = $("#fullscreen-key-input", deltaSettingsWindow);
            if (fullscreenKeyInput) {
                fullscreenKeyInput.addEventListener("click", () => {
                    fullscreenKeyInput.value = "";
                    fullscreenKeyInput.placeholder = "Press a key...";
                });

                fullscreenKeyInput.addEventListener("keydown", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const key = e.key.toLowerCase();

                    if (["shift", "control", "alt", "meta"].includes(key)) {
                        return;
                    }

                    fullscreenKeyInput.value = key.toUpperCase();
                    localStorage.setItem("deltaUI_fullscreenKey", key);

                    if (DeltaUI.setFullscreenKey) {
                        DeltaUI.setFullscreenKey(key);
                    }

                    fullscreenKeyInput.blur();
                    console.log("[Delta UI] Fullscreen key set to: " + key.toUpperCase());
                });

                fullscreenKeyInput.addEventListener("blur", () => {
                    const currentKey = localStorage.getItem("deltaUI_fullscreenKey") || "o";
                    if (!fullscreenKeyInput.value) {
                        fullscreenKeyInput.value = currentKey.toUpperCase();
                    }
                    fullscreenKeyInput.placeholder = "Press a key";
                });
            }

            const clearFullscreenKey = $("#clear-fullscreen-key", deltaSettingsWindow);
            if (clearFullscreenKey) {
                clearFullscreenKey.addEventListener("click", () => {
                    const defaultKey = "o";
                    const input = $("#fullscreen-key-input", deltaSettingsWindow);
                    if (input) input.value = defaultKey.toUpperCase();
                    localStorage.setItem("deltaUI_fullscreenKey", defaultKey);

                    if (DeltaUI.setFullscreenKey) {
                        DeltaUI.setFullscreenKey(defaultKey);
                    }

                    console.log("[Delta UI] Fullscreen key reset to: O");
                });
            }

            // Fame reset keybind input
            const fameResetKeyInput = $("#fame-reset-key-input", deltaSettingsWindow);
            if (fameResetKeyInput) {
                fameResetKeyInput.addEventListener("click", () => {
                    fameResetKeyInput.value = "";
                    fameResetKeyInput.placeholder = "Press a key...";
                });
            
                fameResetKeyInput.addEventListener("keydown", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
            
                    const key = e.key.toLowerCase();
            
                    if (["shift", "control", "alt", "meta"].includes(key)) {
                        return;
                    }
            
                    fameResetKeyInput.value = key.length === 1 ? key.toUpperCase() : key;
                    localStorage.setItem("deltaUI_fameResetKey", key);
            
                    if (window.FameNotifier?.setResetKey) {
                        window.FameNotifier.setResetKey(key);
                    }
            
                    fameResetKeyInput.blur();
                    console.log("[Delta Settings] Fame reset key set to:", key);
                });
            
                fameResetKeyInput.addEventListener("blur", () => {
                    const currentKey = localStorage.getItem("deltaUI_fameResetKey") || "[";
                    if (!fameResetKeyInput.value) {
                        fameResetKeyInput.value = currentKey.length === 1 ? currentKey.toUpperCase() : currentKey;
                    }
                    fameResetKeyInput.placeholder = "Press a key";
                });
            }
            
            const clearFameResetKey = $("#clear-fame-reset-key", deltaSettingsWindow);
            if (clearFameResetKey) {
                clearFameResetKey.addEventListener("click", () => {
                    const defaultKey = "[";
                    const input = $("#fame-reset-key-input", deltaSettingsWindow);
                    if (input) input.value = defaultKey;
                    localStorage.setItem("deltaUI_fameResetKey", defaultKey);
            
                    if (window.FameNotifier?.setResetKey) {
                        window.FameNotifier.setResetKey(defaultKey);
                    }
            
                    console.log("[Delta Settings] Fame reset key reset to: [");
                });
            }
        }

        // ==========================================
        // EXPOSE API
        // ==========================================

        window.DeltaSettings = {
            toggle: toggleDeltaSettings,
            close: closeDeltaSettingsWindow,
            open: createDeltaSettingsWindow
        };

        console.log("✅ Delta Settings module loaded");
    }
})();
