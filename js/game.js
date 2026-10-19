'use strict';
(() => {
  const C=Flappy.CONFIG, S=Flappy.GameState;
  class GameModel {
    constructor({storage, random, onScore, onGameOver, onStateChange} = {}) {
      this.storage=storage;
      this.best=storage ? storage.load() : 0;
      this.bird=new Flappy.Bird();
      this.pipes=new Flappy.PipeSystem(random);
      this.state=S.MENU; this.score=0; this.elapsed=0; this.initialBest=this.best;
      this.onScore=onScore; this.onGameOver=onGameOver; this.onStateChange=onStateChange;
    }
    setState(state) {
      if(this.state===state) return;
      this.state=state;
      if(this.onStateChange) this.onStateChange(state);
    }
    start() {
      this.bird.reset(); this.pipes.reset(); this.score=0; this.elapsed=0; this.initialBest=this.best;
      this.setState(S.PLAYING); this.bird.flap();
    }
    flap() { if(this.state===S.PLAYING) this.bird.flap(); }
    pause() { if(this.state===S.PLAYING) this.setState(S.PAUSED); }
    resume() { if(this.state===S.PAUSED) this.setState(S.PLAYING); }
    update(dt) {
      if(this.state!==S.PLAYING) return;
      this.elapsed+=dt; this.bird.update(dt); this.pipes.update(dt);
      if(Flappy.collides(this.bird,this.pipes.items)) {
        this.setState(S.GAME_OVER);
        if(this.onGameOver) this.onGameOver(this.score,this.best,this.score>this.initialBest);
        return;
      }
      for(let i=0;i<this.pipes.items.length;i++) {
        const p=this.pipes.items[i];
        if(!p.passed && p.x+C.pipeWidth+C.pipeLip<this.bird.x-C.birdRadius) {
          p.passed=true; this.score++;
          if(this.score>this.best) { this.best=this.score; if(this.storage) this.storage.save(this.best); }
          if(this.onScore) this.onScore(this.score,this.best);
        }
      }
    }
  }
  Flappy.GameModel=GameModel;
})();
