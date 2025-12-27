// ==========================================
// CHAT RESIZER MODULE v2.0
// Draggable and resizable chat window
// ==========================================

(function() {
    "use strict";

    // Wait for DeltaLib
    function init() {
        if (!window.DeltaLib) {
            setTimeout(init, 50);
            return;
        }

        const Lib = window.DeltaLib;

        // ==========================================
        // CONSTANTS
        // ==========================================

        const STORAGE_KEY = "hordes_chat_v7";
        const BOUNDS = {
            MIN_WIDTH: 250,
            MAX_WIDTH: 1200,
            MIN_HEIGHT: 150,
            MAX_HEIGHT: 900,
            MARGIN: 5
        };

        // ==========================================
        // STATE
        // ==========================================

        let saved = null;
        let dragState = null;
        let elements = {
            chat: null,
            chatInput: null,
            channelSelect: null,
            controls: null,
            sizeLabel: null
        };
        let initAttempts = 0;
        const MAX_INIT_ATTEMPTS = 50;

        // ==========================================
        // CSS
        // ==========================================

        const CSS = `
            /* Chat container styling */
            #chat.resizer-active {
                position: fixed !important;
                z-index: 10000 !important;
                background: rgba(16, 19, 29, 0.85) !important;
                border: 1px solid rgba(91, 133, 142, 0.4) !important;
                border-bottom: none !important;
                border-radius: 6px 6px 0 0 !important;
                transition: border-color 0.15s !important;
            }

            #chatinput.resizer-active {
                position: fixed !important;
                z-index: 10000 !important;
                border-radius: 0 !important;
                border: 1px solid rgba(91, 133, 142, 0.4) !important;
                border-top: none !important;
                border-bottom: none !important;
                transition: border-color 0.15s !important;
                background: rgba(16, 19, 29, 0.95) !important;
            }

            .channelselect.resizer-active {
                position: fixed !important;
                z-index: 10000 !important;
                border: 1px solid rgba(91, 133, 142, 0.4) !important;
                border-top: none !important;
                border-radius: 0 0 6px 6px !important;
                background: rgba(16, 19, 29, 0.9) !important;
                padding: 4px !important;
                box-sizing: border-box !important;
                transition: border-color 0.15s !important;
                display: flex !important;
            }

            /* Interaction highlight */
            #chat.resizer-interacting,
            #chatinput.resizer-interacting,
            .channelselect.resizer-interacting {
                border-color: #F5C247 !important;
            }

            /* Controls container */
            #chat-controls {
                position: fixed;
                z-index: 10002;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* Move handle */
            #chat-move-handle {
                width: 20px;
                height: 20px;
                cursor: move;
                opacity: 0.5;
                transition: opacity 0.15s;
            }

            #chat-move-handle:hover {
                opacity: 1;
            }

            #chat-move-handle svg {
                width: 100%;
                height: 100%;
                fill: #5b858e;
                transition: fill 0.15s;
            }

            #chat-move-handle:hover svg {
                fill: #F5C247;
            }

            /* Reset button */
            #chat-reset-btn {
                width: 20px;
                height: 20px;
                background: transparent;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                color: #5b858e;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.15s, color 0.15s;
                padding: 0;
                line-height: 20px;
                text-align: center;
            }

            #chat-reset-btn:hover {
                opacity: 1;
                color: #F5C247;
            }

            /* Resize handle */
            #chat-resize-handle {
                width: 20px;
                height: 20px;
                cursor: ne-resize;
                opacity: 0.5;
                transition: opacity 0.15s;
            }

            #chat-resize-handle:hover {
                opacity: 1;
            }

            #chat-resize-handle svg {
                width: 100%;
                height: 100%;
                fill: #5b858e;
                transition: fill 0.15s;
            }

            #chat-resize-handle:hover svg {
                fill: #F5C247;
            }

            /* Size label */
            #chat-size-label {
                position: fixed;
                z-index: 10003;
                background: rgba(16, 19, 29, 0.95);
                color: #F5C247;
                padding: 6px 12px;
                border-radius: 4px;
                font: 13px hordes, sans-serif;
                border: 1px solid #5b858e;
                pointer-events: none;
                display: none;
            }

            #chat-size-label.visible {
                display: block;
            }

            /* Interaction state */
            body.chat-interacting {
                user-select: none !important;
            }

            body.chat-interacting * {
                user-select: none !important;
            }
        `;

        // ==========================================
        // HELPERS
        // ==========================================

        function $(selector, root = document) {
            return Lib.$(selector, root);
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

        function getDefaults() {
            return {
                x: 10,
                y: window.innerHeight - 420,
                width: 400,
                height: 320
            };
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function loadSettings() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed?.width && parsed?.height) {
                        saved = parsed;
                        return;
                    }
                }
            } catch (e) {
                console.warn("[Chat Resizer] Failed to load settings:", e);
            }
            saved = getDefaults();
        }

        function saveSettings() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            } catch (e) {
                console.warn("[Chat Resizer] Failed to save settings:", e);
            }
        }

        function keepInBounds() {
            const maxWidth = Math.min(BOUNDS.MAX_WIDTH, window.innerWidth - 20);
            const maxHeight = Math.min(BOUNDS.MAX_HEIGHT, window.innerHeight - 20);

            saved.width = clamp(saved.width, BOUNDS.MIN_WIDTH, maxWidth);
            saved.height = clamp(saved.height, BOUNDS.MIN_HEIGHT, maxHeight);
            saved.x = clamp(saved.x, BOUNDS.MARGIN, window.innerWidth - saved.width - BOUNDS.MARGIN);
            saved.y = clamp(saved.y, BOUNDS.MARGIN, window.innerHeight - saved.height - BOUNDS.MARGIN);
        }

        // ==========================================
        // ELEMENTS
        // ==========================================

        function findElements() {
            elements.chat = $("#chat");
            elements.chatInput = $("#chatinput");
            elements.channelSelect = $(".channelselect");
            return elements.chat && elements.chatInput;
        }

        function getInputHeight() {
            return elements.chatInput?.offsetHeight || 34;
        }

        function getChannelHeight() {
            return elements.channelSelect?.offsetHeight || 30;
        }

        // ==========================================
        // POSITIONING
        // ==========================================

        function updatePositions() {
            if (!elements.chat) return;

            keepInBounds();

            const inputH = elements.chatInput ? getInputHeight() : 0;
            const channelH = elements.channelSelect ? getChannelHeight() : 0;
            const totalBottomH = inputH + channelH;
            const chatH = saved.height - totalBottomH;

            // Position chat
            elements.chat.style.left = `${saved.x}px`;
            elements.chat.style.top = `${saved.y}px`;
            elements.chat.style.width = `${saved.width}px`;
            elements.chat.style.height = `${chatH}px`;

            // Position input
            if (elements.chatInput) {
                elements.chatInput.style.left = `${saved.x}px`;
                elements.chatInput.style.top = `${saved.y + chatH}px`;
                elements.chatInput.style.width = `${saved.width}px`;
            }

            // Position channel select
            if (elements.channelSelect) {
                elements.channelSelect.style.left = `${saved.x}px`;
                elements.channelSelect.style.top = `${saved.y + chatH + inputH}px`;
                elements.channelSelect.style.width = `${saved.width}px`;
            }

            updateControlPositions();
        }

        function updateControlPositions() {
            if (!elements.controls) return;

            elements.controls.style.left = `${saved.x + saved.width - 76}px`;
            elements.controls.style.top = `${saved.y + 4}px`;

            if (elements.sizeLabel) {
                elements.sizeLabel.style.left = `${saved.x + saved.width / 2 - 40}px`;
                elements.sizeLabel.style.top = `${saved.y + saved.height / 2 - 12}px`;
                elements.sizeLabel.textContent = `${Math.round(saved.width)} × ${Math.round(saved.height)}`;
            }
        }

        // ==========================================
        // VISUAL FEEDBACK
        // ==========================================

        function setInteracting(active) {
            const method = active ? "add" : "remove";
            elements.chat?.classList[method]("resizer-interacting");
            elements.chatInput?.classList[method]("resizer-interacting");
            elements.channelSelect?.classList[method]("resizer-interacting");
        }

        function showSizeLabel() {
            elements.sizeLabel?.classList.add("visible");
        }

        function hideSizeLabel() {
            elements.sizeLabel?.classList.remove("visible");
        }

        // ==========================================
        // CONTROLS
        // ==========================================

        function createIcon(type) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 24 24");

            if (type === "move") {
                svg.innerHTML = '<path d="M12 2l3 3h-2v4h4v-2l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V5H9l3-3z"/>';
            } else if (type === "resize") {
                svg.innerHTML = '<path d="M10 4h10v10l-4-4-6 6-2-2 6-6z"/>';
            }

            return svg;
        }

        function removeControls() {
            $("#chat-controls")?.remove();
            $("#chat-size-label")?.remove();
            elements.controls = null;
            elements.sizeLabel = null;
        }

        function createControls() {
            removeControls();

            // Controls container
            const controls = document.createElement("div");
            controls.id = "chat-controls";

            // Move handle
            const moveHandle = document.createElement("div");
            moveHandle.id = "chat-move-handle";
            moveHandle.title = "Drag to move";
            moveHandle.appendChild(createIcon("move"));
            moveHandle.addEventListener("mousedown", onMoveStart);

            // Reset button
            const resetBtn = document.createElement("button");
            resetBtn.id = "chat-reset-btn";
            resetBtn.innerHTML = "↺";
            resetBtn.title = "Reset position and size";
            resetBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                saved = getDefaults();
                saveSettings();
                updatePositions();
                showSizeLabel();
                setTimeout(hideSizeLabel, 1000);
            });

            // Resize handle
            const resizeHandle = document.createElement("div");
            resizeHandle.id = "chat-resize-handle";
            resizeHandle.title = "Drag to resize";
            resizeHandle.appendChild(createIcon("resize"));
            resizeHandle.addEventListener("mousedown", onResizeStart);

            controls.appendChild(moveHandle);
            controls.appendChild(resetBtn);
            controls.appendChild(resizeHandle);
            document.body.appendChild(controls);

            // Size label
            const sizeLabel = document.createElement("div");
            sizeLabel.id = "chat-size-label";
            document.body.appendChild(sizeLabel);

            elements.controls = controls;
            elements.sizeLabel = sizeLabel;

            console.log("[Chat Resizer] Controls created");
        }

        // ==========================================
        // DRAG HANDLERS
        // ==========================================

        function onMoveStart(e) {
            e.preventDefault();
            e.stopPropagation();

            dragState = {
                action: "move",
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startX: saved.x,
                startY: saved.y
            };

            document.body.classList.add("chat-interacting");
            document.body.style.cursor = "move";
            setInteracting(true);
        }

        function onResizeStart(e) {
            e.preventDefault();
            e.stopPropagation();

            dragState = {
                action: "resize",
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startX: saved.x,
                startY: saved.y,
                startW: saved.width,
                startH: saved.height
            };

            document.body.classList.add("chat-interacting");
            document.body.style.cursor = "ne-resize";
            setInteracting(true);
            showSizeLabel();
        }

        function onMouseMove(e) {
            if (!dragState) return;

            const dx = e.clientX - dragState.startMouseX;
            const dy = e.clientY - dragState.startMouseY;

            if (dragState.action === "move") {
                saved.x = dragState.startX + dx;
                saved.y = dragState.startY + dy;
            } else if (dragState.action === "resize") {
                saved.width = clamp(dragState.startW + dx, BOUNDS.MIN_WIDTH, BOUNDS.MAX_WIDTH);

                const newH = dragState.startH - dy;
                if (newH >= BOUNDS.MIN_HEIGHT && newH <= BOUNDS.MAX_HEIGHT) {
                    saved.height = newH;
                    saved.y = dragState.startY + dy;
                }

                showSizeLabel();
            }

            updatePositions();
        }

        function onMouseUp() {
            if (!dragState) return;

            document.body.classList.remove("chat-interacting");
            document.body.style.cursor = "";
            setInteracting(false);

            keepInBounds();
            saveSettings();
            updatePositions();

            setTimeout(hideSizeLabel, 500);
            dragState = null;
        }

        // ==========================================
        // SETUP
        // ==========================================

        function ensureClasses() {
            elements.chat?.classList.add("resizer-active");
            elements.chatInput?.classList.add("resizer-active");
            elements.channelSelect?.classList.add("resizer-active");
        }

        function verifyControls() {
            const controls = $("#chat-controls");
            if (!controls || !document.body.contains(controls)) return false;
            if (!$("#chat-move-handle") || !$("#chat-reset-btn") || !$("#chat-resize-handle")) return false;
            return true;
        }

        function setup() {
            if (!findElements()) {
                initAttempts++;
                if (initAttempts < MAX_INIT_ATTEMPTS) {
                    setTimeout(setup, 200);
                }
                return;
            }

            ensureClasses();

            if (!verifyControls()) {
                createControls();
            }

            updatePositions();
        }

        function checkLoop() {
            if (findElements()) {
                ensureClasses();

                if (!verifyControls()) {
                    console.log("[Chat Resizer] Controls missing, recreating...");
                    createControls();
                }

                updatePositions();
            }
        }

        // ==========================================
        // INITIALIZATION
        // ==========================================

        function initChatResizer() {
            injectStyle("chat-resizer-css", CSS);
            loadSettings();

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);

            window.addEventListener("resize", () => {
                keepInBounds();
                updatePositions();
            });

            // Check loop
            setInterval(checkLoop, 500);

            // Staggered setup attempts
            setTimeout(setup, 1000);
            setTimeout(setup, 2000);
            setTimeout(setup, 3000);

            console.log("[Chat Resizer] Initialized");
        }

        // Start
        initChatResizer();

        // Expose for external use
        window.ChatResizer = {
            reset: () => {
                saved = getDefaults();
                saveSettings();
                updatePositions();
            },
            recreateControls: createControls
        };
    }

    // Start initialization
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
