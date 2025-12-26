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

        let deltaSettingsWindow = null;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

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

        function getToggle(key, defaultVal = false) {
            const saved = localStorage.getItem("deltaUI_" + key);
            return saved !== null ? saved === "true" : defaultVal;
        }

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

        function centerWindow() {
            if (!deltaSettingsWindow) return;
            deltaSettingsWindow.style.left = "50%";
            deltaSettingsWindow.style.top = "50%";
            deltaSettingsWindow.style.transform = "translate(-50%, -50%)";
        }

        function createDeltaSettingsWindow() {
            if (deltaSettingsWindow) deltaSettingsWindow.remove();

            deltaSettingsWindow = document.createElement("div");
            deltaSettingsWindow.className = "window-pos";
            deltaSettingsWindow.id = "delta-settings-window";
            
            // Always start centered
            deltaSettingsWindow.style.cssText = "z-index: 100; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);";

            const skillbarSlots = scanSkillbar();
            const currentFullscreenKey = localStorage.getItem("deltaUI_fullscreenKey") || "o";

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
                                        
                                        <div>FPS Mode<br><small class="textgrey">Hide UI for performance</small></div>
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
                                            <input type="text" 
                                                   id="fullscreen-key-input" 
                                                   class="keybind-input" 
                                                   value="${currentFullscreenKey.toUpperCase()}" 
                                                   maxlength="1" 
                                                   readonly
                                                   placeholder="Press a key">
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
            setupDragging();
        }

        function setupDragging() {
            if (!deltaSettingsWindow) return;

            const titleframe = $(".titleframe", deltaSettingsWindow);
            if (!titleframe) return;

            titleframe.addEventListener("mousedown", (e) => {
                // Don't drag if clicking close button
                if (e.target.closest(".close-btn") || e.target.closest(".btn")) return;
                
                isDragging = true;
                
                // Get current position
                const rect = deltaSettingsWindow.getBoundingClientRect();
                
                // Calculate offset from mouse to top-left of window
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                
                // Switch from centered transform to absolute positioning
                deltaSettingsWindow.style.transform = "none";
                deltaSettingsWindow.style.left = rect.left + "px";
                deltaSettingsWindow.style.top = rect.top + "px";
                
                // Prevent text selection while dragging
                e.preventDefault();
            });
        }

        // Global mouse move handler
        document.addEventListener("mousemove", (e) => {
            if (!isDragging || !deltaSettingsWindow) return;
            
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            // Keep window within viewport bounds
            const rect = deltaSettingsWindow.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            deltaSettingsWindow.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
            deltaSettingsWindow.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
        });

        // Global mouse up handler
        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        function setupEventListeners() {
            if (!deltaSettingsWindow) return;

            $(".close-btn", deltaSettingsWindow)?.addEventListener("click", closeDeltaSettingsWindow);

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

            $$(".btn.checkbox[data-toggle]", deltaSettingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const toggleId = checkbox.dataset.toggle;
                    const isNowActive = !checkbox.classList.contains("active");
                    checkbox.classList.toggle("active");
                    localStorage.setItem("deltaUI_" + toggleId, isNowActive.toString());

                    if (DeltaUI.applyToggle) {
                        DeltaUI.applyToggle(toggleId, isNowActive);
                    }
                });
            });

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

            const resetBtn = $("#reset-all-colors", deltaSettingsWindow);
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    if (DeltaUI.resetToDefaults) DeltaUI.resetToDefaults();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    createDeltaSettingsWindow();
                });
            }

            const exportBtn = $("#export-colors", deltaSettingsWindow);
            if (exportBtn) {
                exportBtn.addEventListener("click", () => {
                    const data = { skillbarColors: CONFIG.skillbarColors, charmColors: CONFIG.charmColors, petColor: CONFIG.petColor };
                    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
                        exportBtn.textContent = "Copied!";
                        setTimeout(() => exportBtn.textContent = "Export", 1500);
                    });
                });
            }

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
        }

        window.DeltaSettings = {
            toggle: toggleDeltaSettings,
            close: closeDeltaSettingsWindow,
            open: createDeltaSettingsWindow,
            center: centerWindow
        };

        console.log("✅ Delta Settings module loaded");
    }
})();
