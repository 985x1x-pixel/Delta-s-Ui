// ==========================================
// MOUSEOVER MODULE
// ==========================================

(function () {
  'use strict';

  const SELECT_KEYS = ['1','2','3','4','5','6','7','8','9','0'];
  const SHOW_HOVER_EFFECT = true;

  let hoveredFrame = null;
  let isEnabled = false;
  let isRedispatching = false;

  // ==========================================
  // STYLES
  // ==========================================

  function injectStyles() {
    if (document.getElementById('mouse-over-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mouse-over-styles';
    style.textContent = `
      .partyframes .grid.left.mo-hover {
        outline: 2px solid rgba(52, 152, 219, 0.8) !important;
        outline-offset: 1px !important;
        background: rgba(52, 152, 219, 0.1) !important;
        transition: all 0.1s ease !important;
      }
      
      .partyframes .grid.left.mo-hover .barsInner {
        box-shadow: inset 0 0 10px rgba(52, 152, 219, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  function handleMouseover(e) {
    if (!isEnabled) return;
    
    const frame = e.target.closest('.partyframes .grid.left');
    
    if (hoveredFrame && hoveredFrame !== frame) {
      hoveredFrame.classList.remove('mo-hover');
    }
    
    if (frame) {
      hoveredFrame = frame;
      if (SHOW_HOVER_EFFECT) {
        frame.classList.add('mo-hover');
      }
    }
  }

  function handleMouseout(e) {
    if (!isEnabled) return;
    
    const frame = e.target.closest('.partyframes .grid.left');
    if (!frame) return;
    
    const related = e.relatedTarget;
    if (!related || !frame.contains(related)) {
      if (frame === hoveredFrame) {
        frame.classList.remove('mo-hover');
        hoveredFrame = null;
      }
    }
  }

  function simulateKey(key, code, keyCode) {
    const targets = [document, document.body, document.documentElement];
    
    targets.forEach(target => {
      target.dispatchEvent(new KeyboardEvent('keydown', {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      target.dispatchEvent(new KeyboardEvent('keypress', {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });
    
    setTimeout(() => {
      targets.forEach(target => {
        target.dispatchEvent(new KeyboardEvent('keyup', {
          key: key,
          code: code,
          keyCode: keyCode,
          which: keyCode,
          bubbles: true,
          cancelable: true,
          view: window
        }));
      });
    }, 20);
  }

  function handleKeydown(e) {
    if (!isEnabled) return;
    if (isRedispatching) return;
    
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    
    if (!SELECT_KEYS.includes(e.key)) return;
    
    if (hoveredFrame) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const clickable = hoveredFrame.querySelector('.barsInner.targetable') || 
                        hoveredFrame.querySelector('.barsInner') || 
                        hoveredFrame;
      
      clickable.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      clickable.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      clickable.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      isRedispatching = true;
      
      setTimeout(() => {
        simulateKey(e.key, e.code, e.keyCode);
        
        setTimeout(() => {
          isRedispatching = false;
        }, 100);
      }, 30);
    }
  }

  // ==========================================
  // ENABLE / DISABLE
  // ==========================================

  function enableMouseover() {
    if (isEnabled) return;
    isEnabled = true;
    
    injectStyles();
    
    document.addEventListener('mouseover', handleMouseover);
    document.addEventListener('mouseout', handleMouseout);
    document.addEventListener('keydown', handleKeydown, true);
  }

  function disableMouseover() {
    if (!isEnabled) return;
    isEnabled = false;
    
    if (hoveredFrame) {
      hoveredFrame.classList.remove('mo-hover');
      hoveredFrame = null;
    }
    
    document.removeEventListener('mouseover', handleMouseover);
    document.removeEventListener('mouseout', handleMouseout);
    document.removeEventListener('keydown', handleKeydown, true);
  }

  // ==========================================
  // INIT
  // ==========================================

  function init() {
    const saved = localStorage.getItem('deltaUI_mouseover');
    if (saved === 'true') {
      enableMouseover();
    }
  }

  init();

  // ==========================================
  // EXPOSE API
  // ==========================================

  window.DeltaMouseover = {
    enable: enableMouseover,
    disable: disableMouseover,
    isEnabled: () => isEnabled,
    getHoveredFrame: () => hoveredFrame
  };

})();
