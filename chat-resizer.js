// ==========================================
// CHAT RESIZER MODULE
// ==========================================

(function() {
    'use strict';

    var STORAGE_KEY = 'hordes_chat_v7';
    var MIN_WIDTH = 250;
    var MAX_WIDTH = 1200;
    var MIN_HEIGHT = 150;
    var MAX_HEIGHT = 900;

    var saved = null;
    var state = null;
    var chat = null;
    var chatInput = null;
    var channelSelect = null;
    var controlsCreated = false;
    var initAttempts = 0;
    var MAX_INIT_ATTEMPTS = 50;

    function getDefault() {
        return {
            x: 10,
            y: window.innerHeight - 420,
            width: 400,
            height: 320
        };
    }

    function injectChatResizerStyles() {
        if (document.getElementById('chat-resizer-css')) return;

        var css = document.createElement('style');
        css.id = 'chat-resizer-css';
        css.textContent = [
            '/* Chat styling */',
            '#chat.resizer-active {',
            '  position: fixed !important;',
            '  z-index: 10000 !important;',
            '  background: rgba(16, 19, 29, 0.85) !important;',
            '  border: 1px solid rgba(91, 133, 142, 0.4) !important;',
            '  border-bottom: none !important;',
            '  border-radius: 6px 6px 0 0 !important;',
            '  transition: border-color 0.15s !important;',
            '}',
            '',
            '#chatinput.resizer-active {',
            '  position: fixed !important;',
            '  z-index: 10000 !important;',
            '  border-radius: 0 !important;',
            '  border: 1px solid rgba(91, 133, 142, 0.4) !important;',
            '  border-top: none !important;',
            '  border-bottom: none !important;',
            '  transition: border-color 0.15s !important;',
            '  background: rgba(16, 19, 29, 0.95) !important;',
            '}',
            '',
            '.channelselect.resizer-active {',
            '  position: fixed !important;',
            '  z-index: 10000 !important;',
            '  border: 1px solid rgba(91, 133, 142, 0.4) !important;',
            '  border-top: none !important;',
            '  border-radius: 0 0 6px 6px !important;',
            '  background: rgba(16, 19, 29, 0.9) !important;',
            '  padding: 4px !important;',
            '  box-sizing: border-box !important;',
            '  transition: border-color 0.15s !important;',
            '  display: flex !important;',
            '}',
            '',
            '#chat.resizer-interacting,',
            '#chatinput.resizer-interacting,',
            '.channelselect.resizer-interacting {',
            '  border-color: #F5C247 !important;',
            '}',
            '',
            '#chat-controls {',
            '  position: fixed;',
            '  z-index: 10002;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 4px;',
            '}',
            '',
            '#chat-move-handle {',
            '  width: 20px;',
            '  height: 20px;',
            '  cursor: move;',
            '  opacity: 0.5;',
            '  transition: opacity 0.15s;',
            '}',
            '',
            '#chat-move-handle:hover {',
            '  opacity: 1;',
            '}',
            '',
            '#chat-move-handle svg {',
            '  width: 100%;',
            '  height: 100%;',
            '  fill: #5b858e;',
            '  transition: fill 0.15s;',
            '}',
            '',
            '#chat-move-handle:hover svg {',
            '  fill: #F5C247;',
            '}',
            '',
            '#chat-reset-btn {',
            '  width: 20px;',
            '  height: 20px;',
            '  background: transparent;',
            '  border: none;',
            '  border-radius: 4px;',
            '  font-size: 16px;',
            '  color: #5b858e;',
            '  cursor: pointer;',
            '  opacity: 0.5;',
            '  transition: opacity 0.15s, color 0.15s;',
            '  padding: 0;',
            '  line-height: 20px;',
            '  text-align: center;',
            '}',
            '',
            '#chat-reset-btn:hover {',
            '  opacity: 1;',
            '  color: #F5C247;',
            '}',
            '',
            '#chat-resize-handle {',
            '  width: 20px;',
            '  height: 20px;',
            '  cursor: ne-resize;',
            '  opacity: 0.5;',
            '  transition: opacity 0.15s;',
            '}',
            '',
            '#chat-resize-handle:hover {',
            '  opacity: 1;',
            '}',
            '',
            '#chat-resize-handle svg {',
            '  width: 100%;',
            '  height: 100%;',
            '  fill: #5b858e;',
            '  transition: fill 0.15s;',
            '}',
            '',
            '#chat-resize-handle:hover svg {',
            '  fill: #F5C247;',
            '}',
            '',
            '#chat-size-label {',
            '  position: fixed;',
            '  z-index: 10003;',
            '  background: rgba(16, 19, 29, 0.95);',
            '  color: #F5C247;',
            '  padding: 6px 12px;',
            '  border-radius: 4px;',
            '  font: 13px hordes, sans-serif;',
            '  border: 1px solid #5b858e;',
            '  pointer-events: none;',
            '  display: none;',
            '}',
            '',
            '#chat-size-label.visible {',
            '  display: block;',
            '}',
            '',
            'body.chat-interacting {',
            '  user-select: none !important;',
            '}',
            'body.chat-interacting * {',
            '  user-select: none !important;',
            '}'
        ].join('\n');

        document.head.appendChild(css);
    }

    function load() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                var parsed = JSON.parse(data);
                if (parsed && parsed.width && parsed.height) {
                    saved = parsed;
                    return;
                }
            }
        } catch (e) {}
        saved = getDefault();
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}
    }

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function keepInBounds() {
        saved.width = clamp(saved.width, MIN_WIDTH, Math.min(MAX_WIDTH, window.innerWidth - 20));
        saved.height = clamp(saved.height, MIN_HEIGHT, Math.min(MAX_HEIGHT, window.innerHeight - 20));
        saved.x = clamp(saved.x, 5, window.innerWidth - saved.width - 5);
        saved.y = clamp(saved.y, 5, window.innerHeight - saved.height - 5);
    }

    function getInputHeight() {
        return chatInput ? (chatInput.offsetHeight || 34) : 34;
    }

    function getChannelHeight() {
        return channelSelect ? (channelSelect.offsetHeight || 30) : 30;
    }

    function updatePositions() {
        if (!chat) return;

        keepInBounds();

        var inputH = chatInput ? getInputHeight() : 0;
        var channelH = channelSelect ? getChannelHeight() : 0;
        var totalBottomH = inputH + channelH;
        var chatH = saved.height - totalBottomH;

        chat.style.left = saved.x + 'px';
        chat.style.top = saved.y + 'px';
        chat.style.width = saved.width + 'px';
        chat.style.height = chatH + 'px';

        if (chatInput) {
            chatInput.style.left = saved.x + 'px';
            chatInput.style.top = (saved.y + chatH) + 'px';
            chatInput.style.width = saved.width + 'px';
        }

        if (channelSelect) {
            channelSelect.style.left = saved.x + 'px';
            channelSelect.style.top = (saved.y + chatH + inputH) + 'px';
            channelSelect.style.width = saved.width + 'px';
        }

        updateControlPositions();
    }

    function updateControlPositions() {
        var controls = document.getElementById('chat-controls');
        var sizeLabel = document.getElementById('chat-size-label');

        if (!controls) return;

        controls.style.left = (saved.x + saved.width - 76) + 'px';
        controls.style.top = (saved.y + 4) + 'px';

        if (sizeLabel) {
            sizeLabel.style.left = (saved.x + saved.width / 2 - 40) + 'px';
            sizeLabel.style.top = (saved.y + saved.height / 2 - 12) + 'px';
            sizeLabel.textContent = Math.round(saved.width) + ' × ' + Math.round(saved.height);
        }
    }

    function setInteracting(active) {
        if (chat) chat.classList.toggle('resizer-interacting', active);
        if (chatInput) chatInput.classList.toggle('resizer-interacting', active);
        if (channelSelect) channelSelect.classList.toggle('resizer-interacting', active);
    }

    function showSizeLabel() {
        var label = document.getElementById('chat-size-label');
        if (label) label.classList.add('visible');
    }

    function hideSizeLabel() {
        var label = document.getElementById('chat-size-label');
        if (label) label.classList.remove('visible');
    }

    function createMoveIcon() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.innerHTML = '<path d="M12 2l3 3h-2v4h4v-2l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V5H9l3-3z"/>';
        return svg;
    }

    function createResizeIcon() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.innerHTML = '<path d="M10 4h10v10l-4-4-6 6-2-2 6-6z"/>';
        return svg;
    }

    function removeControls() {
        var oldControls = document.getElementById('chat-controls');
        var oldLabel = document.getElementById('chat-size-label');
        if (oldControls) oldControls.remove();
        if (oldLabel) oldLabel.remove();
        controlsCreated = false;
    }

    function createControls() {
        // Always remove old controls first
        removeControls();

        var controls = document.createElement('div');
        controls.id = 'chat-controls';

        var moveHandle = document.createElement('div');
        moveHandle.id = 'chat-move-handle';
        moveHandle.title = 'Drag to move';
        moveHandle.appendChild(createMoveIcon());
        moveHandle.addEventListener('mousedown', onMoveStart);

        var resetBtn = document.createElement('button');
        resetBtn.id = 'chat-reset-btn';
        resetBtn.innerHTML = '↺';
        resetBtn.title = 'Reset position and size';
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            saved = getDefault();
            save();
            updatePositions();
            showSizeLabel();
            setTimeout(hideSizeLabel, 1000);
        });

        var resizeHandle = document.createElement('div');
        resizeHandle.id = 'chat-resize-handle';
        resizeHandle.title = 'Drag to resize';
        resizeHandle.appendChild(createResizeIcon());
        resizeHandle.addEventListener('mousedown', onResizeStart);

        controls.appendChild(moveHandle);
        controls.appendChild(resetBtn);
        controls.appendChild(resizeHandle);

        document.body.appendChild(controls);

        var sizeLabel = document.createElement('div');
        sizeLabel.id = 'chat-size-label';
        document.body.appendChild(sizeLabel);

        controlsCreated = true;
        console.log('[Chat Resizer] Controls created');
    }

    function onMoveStart(e) {
        e.preventDefault();
        e.stopPropagation();

        state = {
            action: 'move',
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startX: saved.x,
            startY: saved.y
        };

        document.body.classList.add('chat-interacting');
        document.body.style.cursor = 'move';
        setInteracting(true);
    }

    function onResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();

        state = {
            action: 'resize',
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startX: saved.x,
            startY: saved.y,
            startW: saved.width,
            startH: saved.height
        };

        document.body.classList.add('chat-interacting');
        document.body.style.cursor = 'ne-resize';
        setInteracting(true);
        showSizeLabel();
    }

    function onMouseMove(e) {
        if (!state) return;

        var dx = e.clientX - state.startMouseX;
        var dy = e.clientY - state.startMouseY;

        if (state.action === 'move') {
            saved.x = state.startX + dx;
            saved.y = state.startY + dy;
        }
        else if (state.action === 'resize') {
            saved.width = clamp(state.startW + dx, MIN_WIDTH, MAX_WIDTH);
            var newH = state.startH - dy;
            if (newH >= MIN_HEIGHT && newH <= MAX_HEIGHT) {
                saved.height = newH;
                saved.y = state.startY + dy;
            }
            showSizeLabel();
        }

        updatePositions();
    }

    function onMouseUp() {
        if (!state) return;

        document.body.classList.remove('chat-interacting');
        document.body.style.cursor = '';
        setInteracting(false);

        keepInBounds();
        save();
        updatePositions();

        setTimeout(hideSizeLabel, 500);

        state = null;
    }

    function findElements() {
        chat = document.getElementById('chat');
        chatInput = document.getElementById('chatinput');
        channelSelect = document.querySelector('.channelselect');
        return chat && chatInput;
    }

    function ensureClasses() {
        if (chat && !chat.classList.contains('resizer-active')) {
            chat.classList.add('resizer-active');
        }
        if (chatInput && !chatInput.classList.contains('resizer-active')) {
            chatInput.classList.add('resizer-active');
        }
        if (channelSelect && !channelSelect.classList.contains('resizer-active')) {
            channelSelect.classList.add('resizer-active');
        }
    }

    function verifyControls() {
        var controls = document.getElementById('chat-controls');
        var moveHandle = document.getElementById('chat-move-handle');
        var resetBtn = document.getElementById('chat-reset-btn');
        var resizeHandle = document.getElementById('chat-resize-handle');

        // Check if all controls exist and are in DOM
        if (!controls || !document.body.contains(controls)) return false;
        if (!moveHandle || !resetBtn || !resizeHandle) return false;

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

        // Always verify controls exist, recreate if missing
        if (!verifyControls()) {
            createControls();
        }

        updatePositions();
    }

    function checkLoop() {
        if (findElements()) {
            ensureClasses();

            // Recreate controls if they're missing
            if (!verifyControls()) {
                console.log('[Chat Resizer] Controls missing, recreating...');
                createControls();
            }

            updatePositions();
        }
    }

    function initChatResizer() {
        injectChatResizerStyles();
        load();

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        window.addEventListener('resize', function() {
            keepInBounds();
            updatePositions();
        });

        // Main check loop - checks frequently
        setInterval(checkLoop, 500);

        // Initial setup with delay
        setTimeout(setup, 1000);
        setTimeout(setup, 2000);
        setTimeout(setup, 3000);

        console.log('[Chat Resizer] Initialized');
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatResizer);
    } else {
        initChatResizer();
    }

    // Expose for manual init if needed
    window.initChatResizer = initChatResizer;
    window.recreateChatControls = createControls;

})();
