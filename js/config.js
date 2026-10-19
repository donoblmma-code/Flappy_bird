'use strict';
window.Flappy = window.Flappy || {};
Flappy.CONFIG = Object.freeze({
  width: 400, height: 600, gravity: 900, flapVelocity: -320,
  pipeSpeed: 150, pipeGap: 160, pipeSpawnInterval: 1500, birdRadius: 14,
  birdX: 106, pipeWidth: 64, pipeLip: 4, pipeLipHeight: 24,
  groundHeight: 56, fixedStep: 1 / 120, maxDelta: 0.05
});
Flappy.GameState = Object.freeze({MENU:'menu', PLAYING:'playing', PAUSED:'paused', GAME_OVER:'gameOver'});
Flappy.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
