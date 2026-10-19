# CODEX PROJECT PLAN — FLAPPY BIRD

## Role
You are an experienced JavaScript game developer. Your task is to build a complete, polished, fully functional Flappy Bird-style browser game using HTML, CSS, and vanilla JavaScript.

Do not use React, TypeScript, Phaser, Unity, or other game engines.

## Project Goal
Create a smooth, responsive, visually appealing Flappy Bird game with accurate physics, moving obstacles, scoring, animations, sound effects, and restart functionality.

The game must work on desktop and mobile devices.

## File Structure
Create the following files:

```text
flappy-bird/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── bird.png
    ├── background.png
    └── sounds/
```

Image assets are optional. If they are unavailable, draw all graphics programmatically using Canvas.

## Phase 1 — HTML Structure
1. Create an HTML5 document.
2. Create a 400 × 600 game canvas.
3. Center the game on the screen.
4. Add a main menu containing a Play button.
5. Add a score counter.
6. Add a game-over interface.
7. Add a Restart button.
8. Provide a pause/resume option.

## Phase 2 — Visual Design
Create a colorful pixel-art-inspired game.

Design requirements:
- Light blue sky background.
- White clouds.
- Green pipes with darker outlines.
- Yellow bird with orange beak.
- Animated wings.
- Scrolling ground.
- Large readable score display.
- Clean start and game-over menus.

Use CSS for surrounding menus and Canvas for gameplay rendering.

The visuals should remain sharp and consistent at different screen sizes.

## Phase 3 — Bird Physics
Implement realistic arcade-style movement.

Initial configuration:

```js
const CONFIG = {
  width: 400,
  height: 600,
  gravity: 900,
  flapVelocity: -320,
  pipeSpeed: 150,
  pipeGap: 160,
  pipeSpawnInterval: 1500,
  birdRadius: 14
};
```

Requirements:
- Gravity continuously accelerates the bird downward.
- Pressing Space, clicking, or tapping makes the bird flap upward.
- Each flap changes the bird's vertical velocity.
- Bird rotates upward when rising.
- Bird rotates downward when falling.
- Wings animate while playing.
- Movement must use delta time so physics is not tied to frame rate.

## Phase 4 — Pipe Generation
1. Generate pipes from the right side of the screen.
2. Each obstacle consists of a top and bottom pipe.
3. Randomize the vertical location of the opening.
4. Keep openings within a fair playable range.
5. Move pipes smoothly from right to left.
6. Remove pipes that leave the screen.
7. Avoid impossible obstacle configurations.
8. Make pipe spawning independent of FPS.

## Phase 5 — Collision System
Implement precise collision detection between the bird and:
- Upper pipes.
- Lower pipes.
- Ground.
- Ceiling.

Use circle-versus-rectangle collision detection for pipes.

When a collision happens:
1. Trigger the game-over state.
2. Stop spawning and moving pipes.
3. Play a collision sound.
4. Display the final score.
5. Show the Restart button.

Ensure collisions are fair and do not trigger before objects visibly touch.

## Phase 6 — Scoring System
1. Start each game at zero points.
2. Award 1 point whenever the bird passes a pipe pair.
3. Prevent scoring the same pipe pair twice.
4. Show the score at the top center.
5. Track the highest score.
6. Save the highest score using localStorage.
7. Restore the saved highest score on reload.

## Phase 7 — Game States
Create a clean state-management system with:

```js
const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameOver"
};
```

Transitions:
- MENU → PLAYING
- PLAYING → PAUSED
- PAUSED → PLAYING
- PLAYING → GAME_OVER
- GAME_OVER → PLAYING

Prevent duplicated event listeners and accidental multiple game loops.

## Phase 8 — Controls
Desktop:
- Space: Flap / Start / Restart
- Left Mouse Click: Flap
- P or Escape: Pause / Resume

Mobile:
- Tap: Flap
- On-screen buttons for starting and restarting.
- Touch controls must not scroll the page.

Avoid unwanted repeated flap events when a key is held.

## Phase 9 — Animations and Sound
Implement:
- Smooth bird wing animation.
- Bird rotation based on vertical velocity.
- Scrolling clouds.
- Scrolling ground.
- Pipe movement.
- Score pop animation.
- Game-over transition.

Audio:
- Flap sound.
- Point sound.
- Collision sound.

Use generated Web Audio effects if external audio files are unavailable. Handle browser autoplay restrictions gracefully.

## Phase 10 — Performance Optimization
1. Use requestAnimationFrame.
2. Cap unusually large delta-time values.
3. Avoid unnecessary object allocations inside the main loop.
4. Remove off-screen pipes.
5. Avoid creating new audio objects every frame.
6. Properly resize the canvas for high-DPI displays.
7. Keep gameplay logic independent from rendering.
8. Ensure smooth performance on phones and desktop computers.

## Phase 11 — Testing
Verify all of the following:

- Bird flaps on Space, mouse click, and mobile tap.
- Gravity works consistently.
- Pipes generate continuously.
- Pipes have valid openings.
- Collision detection works.
- Score increments exactly once per obstacle.
- Game Over triggers correctly.
- Restart fully resets the game.
- High score saves correctly.
- Pause and resume work.
- No JavaScript console errors.
- No duplicate animation loops.
- No broken UI on mobile.
- Game remains playable at different refresh rates.

## Phase 12 — Final Delivery
Deliver a complete playable project.

Requirements:
- Implement all code directly into the project files.
- Do not leave placeholder functions or unfinished TODOs.
- Do not rely on missing external assets.
- Ensure index.html loads style.css and script.js correctly.
- Use relative file paths.
- Make the game runnable by opening index.html in a browser.
- Include a short README explaining controls and how to run the game.

## Implementation Instructions for Codex

Work through the phases in order, but implement the entire game rather than stopping after the first phase.

Prioritize functional gameplay before visual polish.

After implementation, review the code, run any available tests, fix discovered errors, and verify that the project is playable.

Do not merely describe how to create the game. **Actually create and modify the files.**

The final result must be a polished, fully functional Flappy Bird-style browser game.