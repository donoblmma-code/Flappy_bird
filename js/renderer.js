'use strict';
(() => {
  const C=Flappy.CONFIG, S=Flappy.GameState;
  class Renderer {
    constructor(canvas) {
      this.worldWidth=C.width; this.canvas=canvas; this.ctx=canvas.getContext('2d');
      this.time=0; this.cloudOffset=0; this.groundOffset=0; this.flash=0;
      this.sky=document.createElement('canvas'); this.sky.width=C.width; this.sky.height=C.height;
      const sky=this.sky.getContext('2d'), gradient=sky.createLinearGradient(0,0,0,C.height);
      gradient.addColorStop(0,'#a6d9e4'); gradient.addColorStop(1,'#daefd5');
      sky.fillStyle=gradient; sky.fillRect(0,0,C.width,C.height);
      this.clouds=[{x:30,y:57,s:.7},{x:230,y:97,s:1.1},{x:370,y:36,s:.6},{x:100,y:355,s:.85},{x:340,y:293,s:.7}];
      this.resize();
    }
    resize() {
      const rect=this.canvas.getBoundingClientRect(), ratio=Math.min(window.devicePixelRatio||1,3);
      const width=Math.max(1,Math.round(rect.width*ratio)), height=Math.max(1,Math.round(rect.height*ratio));
      if(this.canvas.width!==width || this.canvas.height!==height) { this.canvas.width=width; this.canvas.height=height; }
      this.worldWidth=width/height*C.height;
      this.ctx.setTransform(width/this.worldWidth,0,0,height/C.height,0,0); this.ctx.imageSmoothingEnabled=false;
    }
    update(dt,state) {
      if(state===S.MENU || state===S.PLAYING) {
        this.time+=dt; this.cloudOffset=(this.cloudOffset+dt*9)%500;
        this.groundOffset=(this.groundOffset+dt*C.pipeSpeed)%32;
      }
      this.flash=Math.max(0,this.flash-dt);
    }
    reset() { this.flash=0; }
    draw(model) {
      const ctx=this.ctx; ctx.drawImage(this.sky,0,0,this.worldWidth,C.height);
      for(let tile=-500;tile<this.worldWidth+500;tile+=500) {
        for(let i=0;i<this.clouds.length;i++) {
          const cloud=this.clouds[i]; this.cloud(tile+cloud.x-this.cloudOffset,cloud.y,cloud.s);
        }
      }
      for(let x=0;x<this.worldWidth;x+=400) { ctx.save(); ctx.translate(x,0); this.landscape(); ctx.restore(); }
      for(let i=0;i<model.pipes.items.length;i++) this.pipe(model.pipes.items[i]);
      this.ground();
      if(model.state===S.MENU) {
        this.bird(this.worldWidth/2,326+Math.sin(this.time*2.8)*7,Math.sin(this.time*2.8)*.05,this.time,1.6);
        this.sparkle(this.worldWidth/2-37,321,4); this.sparkle(this.worldWidth/2+36,309,3);
      } else this.bird(model.bird.x,model.bird.y,model.bird.rotation,model.bird.wingTime,1);
      if(this.flash>0) { ctx.fillStyle='rgba(255,250,225,'+(this.flash/0.18*.45)+')'; ctx.fillRect(0,0,this.worldWidth,C.height); }
    }
    cloud(x,y,s) {
      const c=this.ctx; c.save(); c.translate(Math.round(x),y); c.scale(s,s);
      c.fillStyle='#ecf6ee'; c.fillRect(0,14,78,15); c.fillRect(11,6,53,23); c.fillRect(25,0,27,12);
      c.fillStyle='#fffdf1'; c.fillRect(3,14,69,11); c.fillRect(13,8,45,14); c.fillRect(27,2,22,12); c.restore();
    }
    landscape() {
      const c=this.ctx, g=C.height-C.groundHeight;
      c.fillStyle='#b5d7b1'; c.beginPath(); c.moveTo(0,g); c.lineTo(0,474); c.lineTo(40,444); c.lineTo(58,444); c.lineTo(97,466); c.lineTo(145,423); c.lineTo(160,423); c.lineTo(208,465); c.lineTo(255,436); c.lineTo(275,436); c.lineTo(326,462); c.lineTo(374,420); c.lineTo(400,440); c.lineTo(400,g); c.closePath(); c.fill();
      c.fillStyle='#9ec69d'; c.beginPath(); c.moveTo(0,g); c.lineTo(0,503); c.lineTo(52,485); c.lineTo(82,485); c.lineTo(128,509); c.lineTo(188,477); c.lineTo(213,477); c.lineTo(269,506); c.lineTo(340,478); c.lineTo(368,478); c.lineTo(400,496); c.lineTo(400,g); c.fill();
      c.fillStyle='#86b488';
      for(let i=0;i<16;i++) { const x=i*28-8,h=10+(i%3)*8; c.fillRect(x,g-h,16,h); c.fillRect(x+4,g-h-5,8,5); }
    }
    pipe(p) {
      const top=p.gapY-C.pipeGap/2,bottom=p.gapY+C.pipeGap/2;
      this.pipeRect(p.x,-4,C.pipeWidth,top+4,false);
      this.pipeRect(p.x-C.pipeLip,top-C.pipeLipHeight,C.pipeWidth+C.pipeLip*2,C.pipeLipHeight,true);
      this.pipeRect(p.x,bottom,C.pipeWidth,C.height-C.groundHeight-bottom,false);
      this.pipeRect(p.x-C.pipeLip,bottom,C.pipeWidth+C.pipeLip*2,C.pipeLipHeight,true);
    }
    pipeRect(x,y,w,h,lip) {
      const c=this.ctx;
      c.fillStyle='#365735'; c.fillRect(x,y,w,h);
      c.fillStyle='#7fa849'; c.fillRect(x+3,y+3,w-6,Math.max(0,h-6));
      c.fillStyle='#b0cf70'; c.fillRect(x+5,y+3,8,Math.max(0,h-6));
      c.fillStyle='#95bb55'; c.fillRect(x+13,y+3,7,Math.max(0,h-6));
      c.fillStyle='#577e3b'; c.fillRect(x+w-12,y+3,9,Math.max(0,h-6));
      if(lip) { c.fillStyle='#c1d982'; c.fillRect(x+5,y+3,w-17,3); c.fillStyle='#5e843c'; c.fillRect(x+3,y+h-6,w-6,3); }
    }
    ground() {
      const c=this.ctx,y=C.height-C.groundHeight;
      c.fillStyle='#365d36'; c.fillRect(0,y,this.worldWidth,3);
      c.fillStyle='#a7c961'; c.fillRect(0,y+3,this.worldWidth,11);
      c.fillStyle='#d5e693'; c.fillRect(0,y+3,this.worldWidth,3);
      c.fillStyle='#78a04a';
      for(let x=-32-this.groundOffset;x<this.worldWidth;x+=32) { c.fillRect(x,y+8,16,4); c.fillRect(x+16,y+5,8,3); }
      c.fillStyle='#5e783a'; c.fillRect(0,y+14,this.worldWidth,3);
      c.fillStyle='#ede4b8'; c.fillRect(0,y+17,this.worldWidth,C.groundHeight-17);
      c.fillStyle='#d6cfa2'; c.fillRect(0,y+17,this.worldWidth,5); c.fillStyle='#d2c99a';
      for(let x=-32-this.groundOffset;x<this.worldWidth;x+=32) { c.fillRect(x+8,y+31,4,3); c.fillRect(x+23,y+44,6,3); }
    }
    bird(x,y,rotation,wingTime,scale) {
      const c=this.ctx,wing=Math.sin(wingTime*32)>0?-2:5;
      c.save(); c.translate(x,y); c.rotate(rotation); c.scale(scale,scale);
      c.lineWidth=2.5; c.lineJoin='miter'; c.strokeStyle='#5c542e';
      c.fillStyle='#edac42'; c.fillRect(-20,-2,8,9); c.strokeRect(-20,-2,8,9);
      c.beginPath(); c.moveTo(-14,-7); c.lineTo(-10,-7); c.lineTo(-10,-12); c.lineTo(7,-12); c.lineTo(7,-10); c.lineTo(12,-10); c.lineTo(12,-6); c.lineTo(15,-6); c.lineTo(15,8); c.lineTo(10,8); c.lineTo(10,12); c.lineTo(-10,12); c.lineTo(-10,8); c.lineTo(-14,8); c.closePath(); c.fillStyle='#f9d45b'; c.fill(); c.stroke();
      c.fillStyle='#ffe48b'; c.fillRect(-7,-9,12,4); c.fillStyle='#eeb245'; c.fillRect(-9,7,18,3);
      c.fillStyle='#fff9db'; c.fillRect(4,-9,9,11); c.strokeRect(4,-9,9,11);
      c.fillStyle='#383d32'; c.fillRect(9,-6,3,5);
      c.fillStyle='#ed9541'; c.fillRect(13,1,11,6); c.strokeRect(13,1,11,6); c.fillStyle='#ffc26a'; c.fillRect(15,2,7,2);
      c.fillStyle='#e7b545'; c.fillRect(-13,wing,14,7); c.strokeRect(-13,wing,14,7); c.fillStyle='#ffe7a0'; c.fillRect(-11,wing+1,8,2); c.restore();
    }
    sparkle(x,y,size) { const c=this.ctx; c.fillStyle='#fff9d3'; c.fillRect(x-size,y-1,size*2,2); c.fillRect(x-1,y-size,2,size*2); }
  }
  Flappy.Renderer=Renderer;
})();
