# Flappy Bird

A self-contained arcade game built with HTML, CSS, and vanilla JavaScript. Canvas draws all artwork and Web Audio generates the sounds. No downloads, dependencies, build tools, or backend are needed.

## Run

Open **index.html** in a modern browser. Keep the project files together. The game works directly from a file URL.

Optional: run `python -m http.server 8080` from the project folder, then visit http://localhost:8080.

## Controls

- **Space:** start, flap, or restart. Holding Space does not repeat flaps.
- **Left click / tap on the playfield:** flap.
- **P / Escape or pause button:** pause and resume.
- **Play / Fly again buttons:** start and restart.
- **F / fullscreen button:** enter or leave native fullscreen. Escape exits fullscreen and pauses the game.
- **Speaker button:** toggle sound. Sound starts after your first interaction.

The game pauses when the tab is hidden or the browser loses focus. Use Resume, P, or Escape to continue. Clear a pipe pair for one point. The best score is saved in localStorage. If browser storage is blocked, the best remains available for the current session. File-URL and private-mode storage behavior depends on the browser.

## Files

- index.html and style.css: page, menus, HUD, and responsive layout.
- script.js: UI coordination and the single animation loop.
- js/config.js: constants and game states.
- js/bird.js, pipes.js, collision.js, game.js: physics, fair obstacles, circle-versus-rectangle collisions, scores, and states.
- js/renderer.js: procedural pixel-inspired scenery and bird animation.
- js/input.js, audio.js, storage.js: controls, effects, and best-score persistence.
- assets/sounds/: reserved for optional assets. No asset files are required.

Classic scripts let the game load directly from index.html without ES-module file security restrictions. Systems remain separated in small namespaced modules. The game fills the browser window with no surrounding page. Its 600-unit-tall playfield adapts its width to the screen without stretching graphics, including when rotating a phone or entering fullscreen. Native fullscreen requires a button click or key press and browser support. A 120 Hz simulation uses elapsed time and exact constant-gravity integration; large frame gaps are capped at 50 ms.

## Development tests

Run `node tests/game.test.cjs`. Node is only needed to run the tests. The tests cover physics, valid pipe openings, collisions, scoring, pause/resume, restart, persistence, keyboard/pointer input, and animation-loop behavior.

## Verified results

All automated tests pass, including a full simulated flight and UI integration with a mock DOM/Canvas. Browser UI preview was unavailable in the development session, so real-browser visuals, mobile device behavior, and audible sound playback have not been directly verified.
