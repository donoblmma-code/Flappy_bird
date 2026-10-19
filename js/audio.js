'use strict';
(() => {
  class AudioEffects {
    constructor() { this.context=null; this.master=null; this.muted=false; }
    unlock() {
      if(this.muted) return;
      try {
        if(!this.context) {
          const AudioContext=window.AudioContext||window.webkitAudioContext;
          if(!AudioContext) return;
          this.context=new AudioContext(); this.master=this.context.createGain();
          this.master.gain.value=.16; this.master.connect(this.context.destination);
        }
        if(this.context.state==='suspended') this.context.resume().catch(()=>{});
      } catch { this.context=null; }
    }
    toggle() {
      this.muted=!this.muted;
      if(this.master && this.context) this.master.gain.setValueAtTime(this.muted?0:.16,this.context.currentTime);
      if(!this.muted) this.unlock();
      return this.muted;
    }
    tone(frequency,endFrequency,duration,type='square',delay=0,volume=.45) {
      if(this.muted || !this.context || this.context.state!=='running') return;
      const c=this.context,start=c.currentTime+delay,oscillator=c.createOscillator(),gain=c.createGain();
      oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),start+duration);
      gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime(volume,start+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      oscillator.connect(gain); gain.connect(this.master); oscillator.start(start); oscillator.stop(start+duration+.015);
      oscillator.onended=()=>{oscillator.disconnect(); gain.disconnect();};
    }
    flap() { this.tone(520,850,.085,'triangle'); }
    point() { this.tone(880,880,.09,'square',0,.25); this.tone(1320,1320,.14,'square',.075,.25); }
    collision() { this.tone(180,45,.24,'sawtooth',0,.6); this.tone(95,30,.28,'triangle',.03,.6); }
  }
  Flappy.AudioEffects=AudioEffects;
})();
