'use strict';
(() => {
  function bindFullscreen({button,target=document.documentElement,onChange,onError}) {
    const enter=target.requestFullscreen||target.webkitRequestFullscreen;
    const exit=document.exitFullscreen||document.webkitExitFullscreen;
    let active=false;
    const isFullscreen=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement);
    function update() {
      const next=isFullscreen();
      const label=next?'Exit fullscreen':'Enter fullscreen';
      button.setAttribute('aria-label',label); button.setAttribute('aria-pressed',String(next));
      button.title=enter?label+' (F)':'Fullscreen unavailable in this browser';
      if(next!==active) { active=next; if(onChange) onChange(active); }
    }
    async function toggle() {
      if(!enter) return;
      try {
        if(isFullscreen()) { if(exit) await exit.call(document); }
        else await enter.call(target);
        update();
      } catch { if(onError) onError(); }
    }
    button.disabled=!enter;
    button.addEventListener('click',toggle);
    document.addEventListener('fullscreenchange',update);
    document.addEventListener('webkitfullscreenchange',update);
    document.addEventListener('keydown',event=>{
      const target=event.target;
      if(event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
        (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))) return;
      if(event.code==='KeyF') { event.preventDefault(); toggle(); }
    });
    update();
  }
  Flappy.bindFullscreen=bindFullscreen;
})();
