'use strict';
(() => {
  const C = Flappy.CONFIG;
  class PipeSystem {
    constructor(random = Math.random) { this.random=random; this.width=C.width; this.items=[]; this.reset(); }
    reset() { this.items.length=0; this.spawnTime=0; this.nextSpawn=1; this.lastGap=null; }
    spawn() {
      const low=146, high=C.height-C.groundHeight-146;
      const min=this.lastGap===null ? low : Math.max(low, this.lastGap-90);
      const max=this.lastGap===null ? high : Math.min(high, this.lastGap+90);
      const gapY=min+this.random()*(max-min);
      const previous=this.items[this.items.length-1];
      // Resizing must not spawn a new pipe on top of a pair already in flight.
      const minimumX=previous?previous.x+C.pipeSpeed*C.pipeSpawnInterval/1000:0;
      this.items.push({x:Math.max(this.width+C.pipeLip,minimumX), gapY, passed:false});
      this.lastGap=gapY;
    }
    update(dt) {
      this.spawnTime+=dt;
      while (this.spawnTime >= this.nextSpawn) {
        this.spawnTime-=this.nextSpawn;
        this.nextSpawn=C.pipeSpawnInterval/1000;
        this.spawn();
      }
      for(let i=0;i<this.items.length;i++) this.items[i].x-=C.pipeSpeed*dt;
      while(this.items.length && this.items[0].x+C.pipeWidth+C.pipeLip<0) this.items.shift();
    }
  }
  Flappy.PipeSystem=PipeSystem;
})();
