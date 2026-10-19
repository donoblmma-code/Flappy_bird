'use strict';
(() => {
  const C = Flappy.CONFIG;
  class Bird {
    constructor() { this.reset(); }
    reset() { this.x=C.birdX; this.y=280; this.velocity=0; this.rotation=0; this.wingTime=0; }
    flap() { this.velocity=C.flapVelocity; this.rotation=-0.38; this.wingTime=0; }
    update(dt) {
      this.y += this.velocity * dt + 0.5 * C.gravity * dt * dt;
      this.velocity += C.gravity * dt;
      this.rotation = Flappy.clamp(this.velocity / 600, -0.38, 1.15);
      this.wingTime += dt;
    }
  }
  Flappy.Bird = Bird;
})();
