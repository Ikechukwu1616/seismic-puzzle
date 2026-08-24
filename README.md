# SEISMIC Puzzle

A jigsaw puzzle game built around the SEISMIC community. Rebuild each character by dragging real interlocking puzzle pieces back into place.

Built with React + Vite. No backend, progress saves to localStorage.

## Run it

npm install
npm run dev

Open the local URL it prints. Works with mouse and touch.

## Build for production

npm run build
npm run preview

## Project structure

src/
  components   PuzzlePiece, ProgressBar, SeismicLogo, AnimatedBackground, ConfirmModal
  screens      Loading, Login, MainMenu, LevelSelect, PuzzleGame, PauseMenu, CompletionScreen, Settings, HowToPlay, Credits
  data/levels.js   every level, one object per character
  utils/puzzleShapes.js   generates the actual interlocking jigsaw piece shapes for a rows x cols grid
  hooks        useProgress (save system), useAudio (sound)
  utils        storage.js (localStorage), audioManager.js (background music + sfx)
  styles       global.css, variables.css, the SEISMIC colors and type

public/
  audio        drop real mp3 files here, see public/audio/README.md
  characters   the character images used by the levels

## Adding a level

Open src/data/levels.js and add one object with an id, name, character, image path, rows, cols, and difficulty. The image gets sliced into rows x cols jigsaw pieces automatically, everything else (level select tile, saving, unlocking the next level) works on its own.

## Notes

- Piece count scales with rows x cols: 6, 8, 10, 12, 15 across the five levels.
- Every level shows a small thumbnail of the character being rebuilt in the top right corner during play.
- The audio manager is a singleton outside React, so background music never restarts on re-render or screen change.
- Progress, unlocked levels, best times, settings, all live under one localStorage key, see src/utils/storage.js.

Created by Dav_walker_0
