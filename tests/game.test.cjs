'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const core=['config','storage','bird','pipes','collision','game'];
function setup() {
  const sandbox={};sandbox.window=sandbox;vm.createContext(sandbox);
  for(const name of core) vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),sandbox,{filename:name+'.js'});
  return sandbox.Flappy;
}
function near(a,b,tolerance=1e-7) {assert.ok(Math.abs(a-b)<tolerance,a+' differs from '+b);}
test('all JavaScript files parse and every HTML reference exists',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
  for(const file of ['script.js',...fs.readdirSync(path.join(root,'js')).map(f=>'js/'+f)]) new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
});
test('constant-gravity physics agrees at 30, 60, 120 and 144 Hz',()=>{
  const F=setup();
  for(const rate of [30,60,120,144]) {
    const b=new F.Bird();b.flap();for(let i=0;i<rate;i++) b.update(1/rate);
    near(b.y,280-320+450);near(b.velocity,580);assert.ok(b.rotation>0);
    b.flap();assert.equal(b.velocity,-320);assert.ok(b.rotation<0);
  }
});
test('circle/rectangle collision honors edges and rounded corners',()=>{
  const F=setup();
  assert.equal(F.circleRect(0,0,14,14,0,10,10),true);
  assert.equal(F.circleRect(0,0,14,14.01,0,10,10),false);
  assert.equal(F.circleRect(0,0,14,10,10,10,10),false);
  assert.equal(F.circleRect(0,0,14,9,9,10,10),true);
});
test('ceiling, ground, shafts, and pipe lips collide; a clear gap does not',()=>{
  const F=setup(),b=new F.Bird(),pipe={x:100,gapY:280};
  b.y=280;assert.equal(F.collides(b,[pipe]),false);
  b.y=14;assert.equal(F.collides(b,[]),true);
  b.y=530;assert.equal(F.collides(b,[]),true);
  b.y=214;assert.equal(F.collides(b,[pipe]),true);
  b.y=346;assert.equal(F.collides(b,[pipe]),true);
  b.x=83;b.y=185;assert.equal(F.collides(b,[pipe]),true);
  b.x=81;b.y=185;assert.equal(F.collides(b,[pipe]),false);
});
test('continuous generation has fair openings, constant spacing, and bounded storage',()=>{
  const F=setup();let seed=17;const random=()=>{seed=(seed*48271)%2147483647;return seed/2147483647};
  const p=new F.PipeSystem(random);let lastGap=null,count=0;
  const spawn=p.spawn.bind(p);p.spawn=()=>{spawn();const gap=p.lastGap;assert.ok(gap>=146&&gap<=398);if(lastGap!==null)assert.ok(Math.abs(gap-lastGap)<=90);lastGap=gap;count++;};
  for(let i=0;i<120*120;i++){p.update(1/120);assert.ok(p.items.length<=4);}
  assert.ok(count>=79);for(let i=1;i<p.items.length;i++)near(p.items[i].x-p.items[i-1].x,225);
  p.reset();assert.equal(p.items.length,0);assert.equal(p.lastGap,null);assert.equal(p.spawnTime,0);
});
test('states, scoring exactly once, persistence, death callback, and complete restart',()=>{
  const F=setup();const map=new Map();const store=new F.ScoreStorage({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)});
  let deaths=0,points=0;const g=new F.GameModel({storage:store,onGameOver:()=>deaths++,onScore:()=>points++});
  assert.equal(g.state,F.GameState.MENU);g.start();assert.equal(g.state,F.GameState.PLAYING);assert.equal(g.bird.velocity,-320);
  g.bird.y=280;g.bird.velocity=0;g.pipes.items.push({x:0,gapY:280,passed:false});g.update(1/120);g.update(1/120);
  assert.equal(g.score,1);assert.equal(points,1);assert.equal(g.best,1);assert.equal(store.load(),1);
  g.pause();const y=g.bird.y,x=g.pipes.items[0].x,time=g.elapsed;g.flap();g.update(2);
  assert.equal(g.state,F.GameState.PAUSED);assert.equal(g.bird.y,y);assert.equal(g.pipes.items[0].x,x);assert.equal(g.elapsed,time);
  g.resume();g.bird.y=531;g.bird.velocity=100;g.update(1/120);assert.equal(g.state,F.GameState.GAME_OVER);assert.equal(deaths,1);
  const deadX=g.pipes.items[0].x;g.update(1);assert.equal(deaths,1);assert.equal(g.pipes.items[0].x,deadX);
  g.start();assert.equal(g.score,0);assert.equal(g.pipes.items.length,0);assert.equal(g.elapsed,0);assert.equal(g.bird.y,280);assert.equal(g.best,1);
  assert.equal(new F.GameModel({storage:store}).best,1);
});
test('blocked or malformed storage does not stop a game',()=>{
  const F=setup();for(const value of ['-2','NaN','1.5','Infinity','9007199254740992'])assert.equal(new F.ScoreStorage({getItem:()=>value}).load(),0);
  const storage=new F.ScoreStorage({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
  assert.equal(storage.load(),0);assert.doesNotThrow(()=>storage.save(2));assert.equal(new F.ScoreStorage(null).load(),0);
});
test('Space suppresses repeats and default scroll; left pointer/touch flaps once',()=>{
  const F=setup(),listeners={},buttons={};let actions=0,pauses=0,blurs=0;
  const target=name=>({addEventListener:(event,callback)=>listeners[name+':'+event]=callback,focus(){}});
  const canvas=target('canvas');for(const name of ['play','restart','resume','pause','sound'])buttons[name]=target(name);
  class HTMLElement {}
  const ctx={Flappy:F,HTMLElement,document:{addEventListener:(e,cb)=>listeners['document:'+e]=cb},window:{addEventListener:(e,cb)=>listeners['window:'+e]=cb}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'js/input.js'),'utf8'),ctx);
  F.bindInput({canvas,...buttons,onAction:()=>actions++,onPause:()=>pauses++,onSound(){},onBlur:()=>blurs++});
  let prevented=0;const key=(code,repeat=false)=>({code,repeat,target:canvas,preventDefault(){prevented++}});
  listeners['document:keydown'](key('Space'));listeners['document:keydown'](key('Space',true));assert.equal(actions,1);assert.equal(prevented,2);
  listeners['canvas:pointerdown']({button:0,isPrimary:true,preventDefault(){}});assert.equal(actions,2);
  listeners['canvas:pointerdown']({button:2,isPrimary:true,preventDefault(){}});assert.equal(actions,2);
  listeners['document:keydown'](key('KeyP'));listeners['document:keydown'](key('Escape'));assert.equal(pauses,2);
  listeners['window:blur']();assert.equal(blurs,1);
});

function appSetup(width=400,dpr=1,height=width*1.5,fullscreen='unsupported') {
  const ctx=vm.createContext({});ctx.window=ctx;ctx.devicePixelRatio=dpr;
  const listeners={},elements={},queue=[],transforms=[];let now=0,draws=0,fullscreenRequests=0,fullscreenExits=0;
  let viewportWidth=width,viewportHeight=height;
  function listen(event,cb){const key='document:'+event,previous=listeners[key];listeners[key]=previous?event=>{previous(event);return cb(event);}:cb;}
  class Element {
    constructor(id){this.id=id;this.tagName='BUTTON';this.hidden=false;this.textContent='';this.classList={add(){},remove(){}};this.offsetWidth=1;this.width=400;this.height=600;}
    addEventListener(event,cb){listeners[this.id+':'+event]=cb;}
    focus(){ctx.document.activeElement=this;}
    setAttribute(key,value){this[key]=value;}
    getBoundingClientRect(){return {width:viewportWidth,height:viewportHeight};}
    getContext(){return drawing;}
    emit(event,data={}){return listeners[this.id+':'+event](data);}
  }
  const drawing=new Proxy({setTransform(...values){transforms.push(values);},createLinearGradient(){return {addColorStop(){}};}},{get(target,key){return key in target?target[key]:(...args)=>{for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));draws++;};}});
  const ids=fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/id="([^"]+)"/g);
  for(const match of ids)elements[match[1]]=new Element(match[1]);
  elements['game-canvas'].tagName='CANVAS';
  ctx.HTMLElement=Element;
  ctx.document={getElementById:id=>elements[id],createElement:()=>new Element('generated'),addEventListener:listen,documentElement:new Element('document-root'),hidden:false};
  if(fullscreen!=='unsupported') {
    ctx.document.documentElement.requestFullscreen=async()=>{
      fullscreenRequests++; if(fullscreen==='reject') throw Error('Fullscreen denied');
      ctx.document.fullscreenElement=ctx.document.documentElement;listeners['document:fullscreenchange']();
    };
    ctx.document.exitFullscreen=async()=>{fullscreenExits++;ctx.document.fullscreenElement=null;listeners['document:fullscreenchange']();};
  }
  ctx.addEventListener=(event,cb)=>listeners['window:'+event]=cb;
  ctx.requestAnimationFrame=callback=>{queue.push(callback);return queue.length;};
  ctx.performance={now:()=>now};
  for(const name of [...core,'renderer','audio','input','fullscreen']) vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx);
  const Base=ctx.Flappy.GameModel;let model;
  ctx.Flappy.GameModel=class extends Base {constructor(options){super(options);model=this;}};
  vm.runInContext(fs.readFileSync(path.join(root,'script.js'),'utf8'),ctx);
  return {ctx,elements,transforms,get fullscreenRequests(){return fullscreenRequests;},get fullscreenExits(){return fullscreenExits;},get model(){return model;},get draws(){return draws;},
    resize(w,h){viewportWidth=w;viewportHeight=h;listeners['window:resize']();},
    frame(time){now=time;assert.equal(queue.length,1);queue.shift()(now);assert.equal(queue.length,1);},
    key(code,repeat=false){listeners['document:keydown']({code,repeat,target:elements['game-canvas'],preventDefault(){}});},
    blur(){listeners['window:blur']();},pointer(){elements['game-canvas'].emit('pointerdown',{button:0,isPrimary:true,preventDefault(){}});}};
}
test('complete app initializes, draws, sizes for high DPI, caps time gaps, and preserves a single loop',()=>{
  const app=appSetup(312,2),F=app.ctx.Flappy,ui=app.elements;
  assert.equal(ui['game-canvas'].width,624);assert.equal(ui['game-canvas'].height,936);assert.ok(app.draws>0);
  ui['play-button'].emit('click');assert.equal(app.model.state,F.GameState.PLAYING);assert.equal(ui['menu-panel'].hidden,true);
  app.frame(0);app.frame(1000);near(app.model.elapsed,.05);
  ui['pause-button'].emit('click');assert.equal(app.model.state,F.GameState.PAUSED);assert.equal(ui['pause-panel'].hidden,false);
  const y=app.model.bird.y;app.frame(1100);app.pointer();app.frame(1200);assert.equal(app.model.bird.y,y);
  ui['resume-button'].emit('click');assert.equal(app.model.state,F.GameState.PLAYING);assert.equal(ui['pause-panel'].hidden,true);
  app.frame(1300);near(app.model.elapsed,.05);app.blur();assert.equal(app.model.state,F.GameState.PAUSED);
  app.key('Escape');assert.equal(app.model.state,F.GameState.PLAYING);
  ui['sound-button'].emit('click');assert.equal(ui['sound-button']['aria-pressed'],'true');ui['sound-button'].emit('click');assert.equal(ui['sound-button']['aria-pressed'],'false');
  for(let i=0;i<6;i++) {
    app.model.bird.y=535;app.model.bird.velocity=100;app.frame(1400+i*40);app.frame(1420+i*40);
    assert.equal(app.model.state,F.GameState.GAME_OVER);assert.equal(ui['gameover-panel'].hidden,false);
    ui['restart-button'].emit('click');assert.equal(app.model.score,0);assert.equal(app.model.pipes.items.length,0);
  }
});
test('a full simulated flight clears multiple pipes and updates HUD and final results',()=>{
  const app=appSetup();app.model.pipes.random=()=>.5;app.key('Space');app.frame(0);
  for(let i=1;i<=600;i++) {if(app.model.bird.y>290&&app.model.bird.velocity>0)app.pointer();app.frame(i*1000/60);}
  assert.equal(app.model.state,app.ctx.Flappy.GameState.PLAYING);assert.ok(app.model.score>=4);assert.equal(app.elements.score.textContent,app.model.score);
  app.model.bird.y=535;app.model.bird.velocity=100;app.frame(10020);
  assert.equal(app.elements['final-score'].textContent,app.model.score);assert.equal(app.elements['final-best'].textContent,app.model.best);
});

test('portrait and widescreen fill the canvas without stretching and resize without overlapping pipes',()=>{
  const app=appSetup(1920,2,1080);near(app.model.pipes.width,600*1920/1080);
  const transform=app.transforms[app.transforms.length-1];near(transform[0],transform[3]);
  assert.equal(app.elements['game-canvas'].width,3840);assert.equal(app.elements['game-canvas'].height,2160);
  app.model.pipes.spawn();near(app.model.pipes.items[0].x,app.model.pipes.width+4);
  app.resize(390,844);near(app.model.pipes.width,600*390/844);assert.ok(app.model.bird.x<app.model.pipes.width/2);
  const narrowTransform=app.transforms[app.transforms.length-1];near(narrowTransform[0],narrowTransform[3]);
  app.model.pipes.spawn();assert.ok(app.model.pipes.items[1].x-app.model.pipes.items[0].x>=225);
  app.frame(0);app.frame(20);
});
test('fullscreen button and F toggle native fullscreen, exit pauses, and Escape belongs to the browser',async()=>{
  const app=appSetup(400,1,600,'supported'),button=app.elements['fullscreen-button'];
  app.key('Space');assert.equal(button.disabled,false);
  await button.emit('click');assert.equal(app.fullscreenRequests,1);assert.equal(button['aria-pressed'],'true');
  app.key('Escape');assert.equal(app.model.state,app.ctx.Flappy.GameState.PLAYING);
  await button.emit('click');assert.equal(app.fullscreenExits,1);assert.equal(button['aria-pressed'],'false');assert.equal(app.model.state,app.ctx.Flappy.GameState.PAUSED);
  app.key('KeyF');await new Promise(resolve=>setImmediate(resolve));assert.equal(app.fullscreenRequests,2);
  app.key('KeyF',true);await new Promise(resolve=>setImmediate(resolve));assert.equal(app.fullscreenExits,1);
  app.key('KeyF');await new Promise(resolve=>setImmediate(resolve));assert.equal(app.fullscreenExits,2);
  app.frame(0);app.frame(30);
});
test('unsupported or denied fullscreen leaves the window-sized game usable',async()=>{
  const unsupported=appSetup();assert.equal(unsupported.elements['fullscreen-button'].disabled,true);unsupported.key('Space');unsupported.frame(0);unsupported.frame(20);
  assert.equal(unsupported.model.state,unsupported.ctx.Flappy.GameState.PLAYING);
  const rejected=appSetup(400,1,600,'reject');rejected.key('Space');await rejected.elements['fullscreen-button'].emit('click');
  assert.match(rejected.elements['live-announcement'].textContent,/Fullscreen could not start/);assert.equal(rejected.model.state,rejected.ctx.Flappy.GameState.PLAYING);
});
