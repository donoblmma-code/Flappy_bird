'use strict';
(() => {
  const F=Flappy,C=F.CONFIG,S=F.GameState,byId=id=>document.getElementById(id),canvas=byId('game-canvas');
  const ui={menu:byId('menu-panel'),pause:byId('pause-panel'),over:byId('gameover-panel'),scoreHud:byId('score-hud'),
    score:byId('score'),best:byId('sidebar-best'),finalScore:byId('final-score'),finalBest:byId('final-best'),
    kicker:byId('result-kicker'),message:byId('result-message'),play:byId('play-button'),restart:byId('restart-button'),
    resume:byId('resume-button'),pauseButton:byId('pause-button'),sound:byId('sound-button'),live:byId('live-announcement')};
  let local; try { local=window.localStorage; } catch { local=null; }
  const audio=new F.AudioEffects(),renderer=new F.Renderer(canvas);
  let accumulator=0,lastTime=null,lastDeath=-Infinity;
  const game=new F.GameModel({
    storage:new F.ScoreStorage(local),
    onScore(score,best) {
      ui.score.textContent=score; ui.best.textContent=best;
      ui.score.classList.remove('score-pop'); void ui.score.offsetWidth; ui.score.classList.add('score-pop'); audio.point();
    },
    onStateChange(state) {
      accumulator=0;
      ui.menu.hidden=state!==S.MENU; ui.pause.hidden=state!==S.PAUSED; ui.over.hidden=state!==S.GAME_OVER;
      ui.scoreHud.hidden=state===S.MENU || state===S.GAME_OVER; ui.pauseButton.disabled=state!==S.PLAYING && state!==S.PAUSED;
      const paused=state===S.PAUSED;
      ui.pauseButton.setAttribute('aria-label',paused?'Resume game':'Pause game');
      ui.pauseButton.title=paused?'Resume (P or Escape)':'Pause (P or Escape)';
      ui.pauseButton.innerHTML=paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
      if(paused) { ui.live.textContent='Game paused.'; ui.resume.focus({preventScroll:true}); }
      if(state===S.PLAYING) { ui.score.textContent=game.score; canvas.focus({preventScroll:true}); ui.live.textContent='Keep flying. Press Space or tap to flap.'; }
    },
    onGameOver(score,best,isRecord) {
      lastDeath=performance.now(); renderer.flash=.18; audio.collision(); ui.finalScore.textContent=score; ui.finalBest.textContent=best;
      ui.kicker.textContent=isRecord?'A NEW PERSONAL BEST!':'A GOOD LITTLE FLIGHT';
      ui.message.textContent=isRecord?'Look at those little wings go.':score>=10?'You found your rhythm. Keep it going.':'Every great flight starts with a flap.';
      ui.live.textContent='Game over. Score '+score+'. Best '+best+'. Press Space or Fly again to restart.';
      ui.restart.focus({preventScroll:true});
    }
  });
  ui.best.textContent=game.best;
  function action(source) {
    audio.unlock();
    if(game.state===S.MENU || game.state===S.GAME_OVER) {
      // Ignore a rapid extra tap at impact; an explicit Restart click always works.
      if(game.state===S.GAME_OVER && source!=='button' && performance.now()-lastDeath<350) return;
      renderer.reset(); game.start(); resize(); audio.flap();
    } else if(game.state===S.PLAYING) { game.flap(); audio.flap(); }
  }
  function togglePause() {
    audio.unlock();
    if(game.state===S.PLAYING) game.pause(); else if(game.state===S.PAUSED) { lastTime=null; game.resume(); }
  }
  F.bindInput({canvas,play:ui.play,restart:ui.restart,resume:ui.resume,pause:ui.pauseButton,sound:ui.sound,
    onAction:action,onPause:togglePause,
    onSound() { const muted=audio.toggle(); ui.sound.setAttribute('aria-pressed',String(muted)); ui.sound.setAttribute('aria-label',muted?'Enable sound':'Mute sound'); ui.sound.title=muted?'Enable sound':'Mute sound'; },
    onBlur() { game.pause(); lastTime=null; }
  });
  const resize=()=>{
    renderer.resize(); game.pipes.width=renderer.worldWidth;
    game.bird.x=Math.min(200,renderer.worldWidth*.265);
  };
  resize();
  if(window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize',resize);
  F.bindFullscreen({button:byId('fullscreen-button'),
    onChange(active) { if(!active) game.pause(); lastTime=null; resize(); },
    onError() { ui.live.textContent='Fullscreen could not start. The game still fills this window. Try your browser’s fullscreen shortcut.'; }
  });
  function frame(now) {
    const dt=lastTime===null?0:Math.min(C.maxDelta,Math.max(0,(now-lastTime)/1000)); lastTime=now;
    if(game.state===S.PLAYING) {
      accumulator+=dt;
      while(accumulator+1e-9>=C.fixedStep && game.state===S.PLAYING) { accumulator-=C.fixedStep; game.update(C.fixedStep); }
      accumulator=Math.max(0,accumulator);
    } else accumulator=0;
    renderer.update(dt,game.state); renderer.draw(game); requestAnimationFrame(frame);
  }
  renderer.draw(game); requestAnimationFrame(frame);
})();
