'use strict';
(() => {
  // Pointer events unify mouse, pen and touch, avoiding synthesized duplicate clicks.
  function bindInput({canvas,play,restart,resume,pause,sound,onAction,onPause,onSound,onBlur}) {
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0 || !event.isPrimary) return;
      event.preventDefault(); canvas.focus({preventScroll:true}); onAction('pointer');
    });
    document.addEventListener('keydown',event=>{
      const target=event.target;
      if(target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if(event.code==='Space') { event.preventDefault(); if(!event.repeat) onAction('keyboard'); }
      else if(event.code==='KeyP' || (event.code==='Escape' && !document.fullscreenElement && !document.webkitFullscreenElement)) { event.preventDefault(); if(!event.repeat) onPause(); }
    });
    play.addEventListener('click',()=>onAction('button')); restart.addEventListener('click',()=>onAction('button'));
    resume.addEventListener('click',()=>onPause()); pause.addEventListener('click',()=>onPause()); sound.addEventListener('click',()=>onSound());
    document.addEventListener('visibilitychange',()=>{if(document.hidden) onBlur();}); window.addEventListener('blur',onBlur);
  }
  Flappy.bindInput=bindInput;
})();
