// ==========================================
// PARTY ARRANGER MODULE
// ==========================================

(function () {
  'use strict';

  const STORAGE_KEY = 'hordesPartyOrder_v6';
  const LOCK_KEY = 'hordesPartyLocked_v6';
  const ENFORCE_DELAY = 150;
  const UI_CHECK_INTERVAL = 500;
  const ENFORCE_INTERVALS = [100, 300, 600, 1000, 1500, 2500];

  let editMode = false;
  let isLocked = false;
  let applying = false;
  let debounceTimer = null;
  let observer = null;
  let selectedFrame = null;
  let draggedFrame = null;
  let lastFrameCount = 0;
  let lastEnforceTime = 0;
  let isEnabled = false;
  let uiCheckerInterval = null;

  function injectStyles() {
    if (document.getElementById('pa-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'pa-styles';
    styles.textContent = `
      #pa-arrange-btn {
        cursor: pointer;
        user-select: none;
        min-width: 28px;
        text-align: center;
        transition: all 0.2s ease;
        position: relative;
        font-size: 14px;
      }

      #pa-arrange-btn:hover {
        filter: brightness(1.3);
        transform: scale(1.05);
      }

      #pa-arrange-btn:active {
        transform: scale(0.95);
      }

      #pa-arrange-btn.pa-editing {
        animation: pa-btn-pulse 1s infinite;
      }

      #pa-arrange-btn.pa-locked {
        text-shadow: 0 0 6px rgba(46, 204, 113, 0.8);
      }

      #pa-arrange-btn.pa-unlocked {
        opacity: 0.7;
      }

      #pa-arrange-btn .pa-tip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s;
        border: 1px solid rgba(255,255,255,0.15);
        z-index: 99999;
        pointer-events: none;
      }

      #pa-arrange-btn .pa-tip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.95);
      }

      #pa-arrange-btn:hover .pa-tip {
        opacity: 1;
        visibility: visible;
      }

      @keyframes pa-btn-pulse {
        0%, 100% {
          text-shadow: 0 0 8px rgba(243, 156, 18, 0.8);
        }
        50% {
          text-shadow: 0 0 16px rgba(243, 156, 18, 1), 0 0 24px rgba(243, 156, 18, 0.6);
        }
      }

      .pa-edit-mode {
        outline: 2px dashed #f39c12 !important;
        outline-offset: 4px !important;
        background: rgba(243, 156, 18, 0.05);
      }

      .pa-draggable {
        cursor: grab !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease, outline 0.15s ease !important;
      }

      .pa-draggable:hover {
        transform: translateX(3px);
        box-shadow: -3px 0 8px rgba(243, 156, 18, 0.5);
      }

      .pa-dragging {
        opacity: 0.4 !important;
        cursor: grabbing !important;
        transform: scale(0.98) !important;
      }

      .pa-drag-over {
        outline: 2px solid #3498db !important;
        outline-offset: 2px !important;
        background: rgba(52, 152, 219, 0.1) !important;
      }

      .pa-selected {
        outline: 3px solid #f1c40f !important;
        outline-offset: 2px !important;
        animation: pa-select-pulse 0.8s infinite;
      }

      @keyframes pa-select-pulse {
        0%, 100% { outline-color: #f1c40f; box-shadow: 0 0 8px rgba(241, 196, 15, 0.5); }
        50% { outline-color: #e67e22; box-shadow: 0 0 15px rgba(230, 126, 34, 0.7); }
      }

      #pa-toast {
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
        padding: 10px 18px;
        border-radius: 6px;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        font-weight: 600;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.1);
      }

      #pa-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(styles);
  }

  function removeStyles() {
    const styles = document.getElementById('pa-styles');
    if (styles) styles.remove();
  }

  function getToast() {
    let toast = document.getElementById('pa-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pa-toast';
      document.body.appendChild(toast);
    }
    return toast;
  }

  function removeToast() {
    const toast = document.getElementById('pa-toast');
    if (toast) toast.remove();
  }

  function showToast(msg, bgColor, duration = 2500) {
    const toast = getToast();
    toast.textContent = msg;
    toast.style.background = bgColor;
    toast.style.color = '#fff';
    toast.classList.add('show');

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function getBtnBar() {
    return document.querySelector('.btnbar');
  }

  function getContainer() {
    return document.querySelector('.partyframes');
  }

  function getFrames() {
    return Array.from(document.querySelectorAll('.partyframes > .grid.left'));
  }

  function getName(frame) {
    if (!frame) return null;
    const el = frame.querySelector('.progressBar span.left, span.left');
    if (!el) return null;
    let name = el.textContent.trim();
    name = name.replace(/\.{2,}$/, '').replace(/…$/, '');
    return name.toLowerCase();
  }

  function getCurrentOrder() {
    return getFrames().map(getName).filter(Boolean);
  }

  function saveOrder() {
    const order = getCurrentOrder();
    if (order.length === 0) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    console.log('[PA] Saved order:', order);
    return true;
  }

  function loadOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveLockState() {
    localStorage.setItem(LOCK_KEY, JSON.stringify(isLocked));
  }

  function loadLockState() {
    try {
      return JSON.parse(localStorage.getItem(LOCK_KEY)) === true;
    } catch {
      return false;
    }
  }

  function getButton() {
    return document.getElementById('pa-arrange-btn');
  }

  function removeButton() {
    const btn = getButton();
    if (btn) btn.remove();
  }

  function createButton() {
    if (!isEnabled) return;
    if (getButton()) {
      updateButtonState();
      return;
    }

    const btnbar = getBtnBar();
    if (!btnbar) return;

    const btn = document.createElement('div');
    btn.id = 'pa-arrange-btn';
    btn.className = 'btn border black';

    const partyBtn = btnbar.querySelector('.btn.party');
    const partySizeBtn = btnbar.querySelector('#partybtn');

    if (partySizeBtn) {
      btnbar.insertBefore(btn, partySizeBtn);
    } else if (partyBtn && partyBtn.nextSibling) {
      btnbar.insertBefore(btn, partyBtn.nextSibling);
    } else {
      btnbar.insertBefore(btn, btnbar.firstChild?.nextSibling || null);
    }

    btn.addEventListener('click', onButtonClick);
    btn.addEventListener('contextmenu', onButtonRightClick);

    updateButtonState();
    console.log('[PA] Button injected');
  }

  function updateButtonState() {
    const btn = getButton();
    if (!btn) return;

    btn.classList.remove('pa-editing', 'pa-locked', 'pa-unlocked');

    if (editMode) {
      btn.innerHTML = '✏️<span class="pa-tip">Click to SAVE & LOCK</span>';
      btn.classList.add('pa-editing');
    } else if (isLocked) {
      btn.innerHTML = '🔒<span class="pa-tip">LOCKED ✓<br>Click: Edit order<br>Right-click: Reset</span>';
      btn.classList.add('pa-locked');
    } else {
      btn.innerHTML = '🔓<span class="pa-tip">UNLOCKED<br>Click: Arrange party<br>Right-click: Reset</span>';
      btn.classList.add('pa-unlocked');
    }
  }

  function onButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (editMode) {
      disableEditMode(true);
      showToast('🔒 Order saved & locked!', '#27ae60');
    } else {
      enableEditMode();
      showToast('✏️ Drag or click to reorder', '#e67e22', 3000);
    }
  }

  function onButtonRightClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (editMode) {
      disableEditMode(false);
      showToast('❌ Edit cancelled', '#e74c3c');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      isLocked = false;
      saveLockState();
      updateButtonState();
      showToast('🗑️ Order reset', '#e74c3c');
    }
  }

  function enforceOrder() {
    if (applying || editMode || !isLocked || !isEnabled) return;

    const container = getContainer();
    if (!container) return;

    const savedOrder = loadOrder();
    if (savedOrder.length === 0) return;

    const frameList = getFrames();
    if (frameList.length === 0) return;

    const frameMap = new Map();
    frameList.forEach(f => {
      const name = getName(f);
      if (name) frameMap.set(name, f);
    });

    const currentOrder = getCurrentOrder();
    if (ordersMatch(savedOrder, currentOrder)) return;

    applying = true;
    lastEnforceTime = Date.now();

    console.log('[PA] Enforcing...', { saved: savedOrder, current: currentOrder });

    pauseObserver();

    try {
      const orderedFrames = [];
      const usedNames = new Set();

      savedOrder.forEach(savedName => {
        for (const [frameName, frame] of frameMap) {
          if (!usedNames.has(frameName) && namesMatch(savedName, frameName)) {
            orderedFrames.push(frame);
            usedNames.add(frameName);
            break;
          }
        }
      });

      frameList.forEach(f => {
        const name = getName(f);
        if (name && !usedNames.has(name)) {
          orderedFrames.push(f);
        }
      });

      orderedFrames.forEach(frame => {
        container.appendChild(frame);
      });

      console.log('[PA] Order enforced ✓');

    } catch (e) {
      console.error('[PA] Enforce error:', e);
    }

    applying = false;
    setTimeout(resumeObserver, 50);
  }

  function ordersMatch(saved, current) {
    const relevantCurrent = current.filter(name =>
      saved.some(s => namesMatch(s, name))
    );
    const relevantSaved = saved.filter(name =>
      current.some(c => namesMatch(name, c))
    );

    if (relevantSaved.length !== relevantCurrent.length) return false;

    return relevantSaved.every((name, i) => namesMatch(name, relevantCurrent[i]));
  }

  function namesMatch(a, b) {
    if (!a || !b) return false;
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a === b || a.startsWith(b) || b.startsWith(a);
  }

  function debouncedEnforce() {
    if (editMode || !isLocked || !isEnabled) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(enforceOrder, ENFORCE_DELAY);
  }

  function scheduleMultipleEnforcements() {
    if (!isLocked || editMode || !isEnabled) return;
    ENFORCE_INTERVALS.forEach(delay => {
      setTimeout(() => {
        if (isLocked && !editMode && isEnabled) enforceOrder();
      }, delay);
    });
  }

  function createObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;

      let needsButtonCheck = false;
      let needsEnforce = false;

      for (const m of mutations) {
        if (m.type !== 'childList') continue;

        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;

          if (node.classList?.contains('btnbar') ||
              node.querySelector?.('.btnbar') ||
              node.classList?.contains('l-corner-ul') ||
              node.querySelector?.('.l-corner-ul')) {
            needsButtonCheck = true;
          }

          if (node.classList?.contains('partyframes') ||
              node.classList?.contains('grid') ||
              node.querySelector?.('.partyframes') ||
              node.querySelector?.('.grid.left')) {
            needsEnforce = true;
          }
        }

        if (m.target.classList?.contains('partyframes')) {
          needsEnforce = true;
        }
      }

      if (needsButtonCheck) {
        setTimeout(createButton, 50);
      }

      if (needsEnforce && isLocked && !editMode && !applying) {
        debouncedEnforce();
      }
    });

    resumeObserver();
  }

  function pauseObserver() {
    if (observer) observer.disconnect();
  }

  function resumeObserver() {
    if (observer && isEnabled) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  function startUIChecker() {
    if (uiCheckerInterval) return;

    uiCheckerInterval = setInterval(() => {
      if (!isEnabled) return;

      injectStyles();

      if (!getButton() && getBtnBar()) {
        createButton();
      }

      const currentCount = getFrames().length;
      if (currentCount !== lastFrameCount) {
        lastFrameCount = currentCount;
        if (isLocked && !editMode && currentCount > 0) {
          setTimeout(enforceOrder, 200);
        }
      }

      if (isLocked && !editMode && !applying) {
        const timeSinceLastEnforce = Date.now() - lastEnforceTime;
        if (timeSinceLastEnforce > 3000) {
          enforceOrder();
        }
      }
    }, UI_CHECK_INTERVAL);
  }

  function stopUIChecker() {
    if (uiCheckerInterval) {
      clearInterval(uiCheckerInterval);
      uiCheckerInterval = null;
    }
  }

  function enableEditMode() {
    if (editMode || !isEnabled) return;

    editMode = true;
    pauseObserver();
    clearSelection();

    const container = getContainer();
    if (container) {
      container.classList.add('pa-edit-mode');
    }

    getFrames().forEach(frame => {
      frame.classList.add('pa-draggable');
      frame.setAttribute('draggable', 'true');

      frame._pa_dragstart = onDragStart;
      frame._pa_dragend = onDragEnd;
      frame._pa_dragover = onDragOver;
      frame._pa_dragenter = onDragEnter;
      frame._pa_dragleave = onDragLeave;
      frame._pa_drop = onDrop;
      frame._pa_click = onFrameClick;

      frame.addEventListener('dragstart', frame._pa_dragstart);
      frame.addEventListener('dragend', frame._pa_dragend);
      frame.addEventListener('dragover', frame._pa_dragover);
      frame.addEventListener('dragenter', frame._pa_dragenter);
      frame.addEventListener('dragleave', frame._pa_dragleave);
      frame.addEventListener('drop', frame._pa_drop);
      frame.addEventListener('click', frame._pa_click);
    });

    updateButtonState();
    console.log('[PA] Edit mode ON');
  }

  function disableEditMode(save = true) {
    if (!editMode) return;

    editMode = false;
    clearSelection();

    const container = getContainer();
    if (container) {
      container.classList.remove('pa-edit-mode');
    }

    getFrames().forEach(frame => {
      frame.classList.remove('pa-draggable', 'pa-dragging', 'pa-drag-over', 'pa-selected');
      frame.removeAttribute('draggable');

      if (frame._pa_dragstart) frame.removeEventListener('dragstart', frame._pa_dragstart);
      if (frame._pa_dragend) frame.removeEventListener('dragend', frame._pa_dragend);
      if (frame._pa_dragover) frame.removeEventListener('dragover', frame._pa_dragover);
      if (frame._pa_dragenter) frame.removeEventListener('dragenter', frame._pa_dragenter);
      if (frame._pa_dragleave) frame.removeEventListener('dragleave', frame._pa_dragleave);
      if (frame._pa_drop) frame.removeEventListener('drop', frame._pa_drop);
      if (frame._pa_click) frame.removeEventListener('click', frame._pa_click);
    });

    if (save) {
      if (saveOrder()) {
        isLocked = true;
        saveLockState();
      }
    }

    updateButtonState();
    if (isEnabled) resumeObserver();
    console.log('[PA] Edit mode OFF, save:', save);
  }

  function onDragStart(e) {
    draggedFrame = e.currentTarget;
    e.currentTarget.classList.add('pa-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    clearSelection();

    setTimeout(() => {
      if (draggedFrame) draggedFrame.classList.add('pa-dragging');
    }, 0);
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('pa-dragging');
    getFrames().forEach(f => f.classList.remove('pa-drag-over'));
    draggedFrame = null;
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDragEnter(e) {
    e.preventDefault();
    if (e.currentTarget !== draggedFrame) {
      e.currentTarget.classList.add('pa-drag-over');
    }
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('pa-drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.classList.remove('pa-drag-over');

    if (!draggedFrame || draggedFrame === target) return;

    const container = getContainer();
    if (!container) return;

    const frames = getFrames();
    const dragIdx = frames.indexOf(draggedFrame);
    const dropIdx = frames.indexOf(target);

    if (dragIdx === -1 || dropIdx === -1) return;

    if (dragIdx < dropIdx) {
      container.insertBefore(draggedFrame, target.nextSibling);
    } else {
      container.insertBefore(draggedFrame, target);
    }

    console.log('[PA] Dragged:', getName(draggedFrame), 'to position', dropIdx);
  }

  function onFrameClick(e) {
    if (!editMode || draggedFrame) return;

    e.preventDefault();
    e.stopPropagation();

    const frame = e.currentTarget;

    if (!selectedFrame) {
      selectedFrame = frame;
      frame.classList.add('pa-selected');
    } else if (selectedFrame === frame) {
      clearSelection();
    } else {
      swapFrames(selectedFrame, frame);
      clearSelection();
    }
  }

  function clearSelection() {
    if (selectedFrame) {
      selectedFrame.classList.remove('pa-selected');
      selectedFrame = null;
    }
  }

  function swapFrames(a, b) {
    const container = getContainer();
    if (!container) return;

    const frames = getFrames();
    const aIdx = frames.indexOf(a);
    const bIdx = frames.indexOf(b);

    if (aIdx === -1 || bIdx === -1) return;

    const marker = document.createElement('div');
    container.insertBefore(marker, a);
    container.insertBefore(a, b);
    container.insertBefore(b, marker);
    container.removeChild(marker);

    console.log('[PA] Swapped:', getName(a), '↔', getName(b));
  }

  // Global event handlers
  function onGlobalClick(e) {
    if (!editMode || !isEnabled) return;
    if (e.target.closest('.partyframes') || e.target.closest('#pa-arrange-btn')) return;

    disableEditMode(true);
    showToast('🔒 Order saved!', '#27ae60');
  }

  function onGlobalKeydown(e) {
    if (!isEnabled) return;

    if (e.key === 'Escape' && editMode) {
      e.preventDefault();
      disableEditMode(false);
      showToast('❌ Edit cancelled', '#e74c3c');
    }
  }

  function onVisibilityChange() {
    if (!document.hidden && isLocked && !editMode && isEnabled) {
      scheduleMultipleEnforcements();
    }
  }

  function onWindowFocus() {
    if (isLocked && !editMode && isEnabled) {
      setTimeout(enforceOrder, 200);
    }
  }

  function setupGlobalEvents() {
    document.addEventListener('click', onGlobalClick, true);
    document.addEventListener('keydown', onGlobalKeydown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onWindowFocus);
  }

  function removeGlobalEvents() {
    document.removeEventListener('click', onGlobalClick, true);
    document.removeEventListener('keydown', onGlobalKeydown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('focus', onWindowFocus);
  }

  // ==========================================
  // ENABLE / DISABLE
  // ==========================================

  function enable() {
    if (isEnabled) return;
    isEnabled = true;

    isLocked = loadLockState();

    injectStyles();
    createObserver();
    setupGlobalEvents();
    startUIChecker();

    const tryCreateButton = () => {
      if (getBtnBar()) {
        createButton();
      } else {
        setTimeout(tryCreateButton, 200);
      }
    };
    tryCreateButton();

    if (isLocked) {
      scheduleMultipleEnforcements();
    }

    console.log('[PA] Enabled! Locked:', isLocked);
  }

  function disable() {
    if (!isEnabled) return;

    if (editMode) {
      disableEditMode(false);
    }

    isEnabled = false;

    pauseObserver();
    stopUIChecker();
    removeGlobalEvents();
    removeButton();
    removeToast();

    console.log('[PA] Disabled');
  }

  // ==========================================
  // INIT
  // ==========================================

  function init() {
    console.log('[PA] Party Arranger module loaded');

    const savedSetting = localStorage.getItem('deltaUI_partyUIEditor');
    if (savedSetting === 'true') {
      enable();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================
  // EXPOSE API
  // ==========================================

  window.DeltaPartyArranger = {
    enable: enable,
    disable: disable,
    isEnabled: function() { return isEnabled; }
  };

})();
