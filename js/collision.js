'use strict';
(() => {
  const C=Flappy.CONFIG;
  function circleRect(cx,cy,r,x,y,w,h) {
    const dx=cx-Flappy.clamp(cx,x,x+w);
    const dy=cy-Flappy.clamp(cy,y,y+h);
    return dx*dx+dy*dy <= r*r;
  }
  function collides(bird, pipes) {
    const r=C.birdRadius, ground=C.height-C.groundHeight;
    if(bird.y-r<=0 || bird.y+r>=ground) return true;
    for(let i=0;i<pipes.length;i++) {
      const p=pipes[i], top=p.gapY-C.pipeGap/2, bottom=p.gapY+C.pipeGap/2;
      if(circleRect(bird.x,bird.y,r,p.x,0,C.pipeWidth,top) ||
         circleRect(bird.x,bird.y,r,p.x-C.pipeLip,top-C.pipeLipHeight,C.pipeWidth+C.pipeLip*2,C.pipeLipHeight) ||
         circleRect(bird.x,bird.y,r,p.x,bottom,C.pipeWidth,ground-bottom) ||
         circleRect(bird.x,bird.y,r,p.x-C.pipeLip,bottom,C.pipeWidth+C.pipeLip*2,C.pipeLipHeight)) return true;
    }
    return false;
  }
  Flappy.circleRect=circleRect;
  Flappy.collides=collides;
})();
