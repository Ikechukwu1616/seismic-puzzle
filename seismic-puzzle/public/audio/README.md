Drop real audio files here with these exact names, the game picks them up automatically:

- music-theme.mp3   (looping background music)
- sfx-click.mp3      (button click)
- sfx-pickup.mp3     (piece picked up)
- sfx-place.mp3      (correct placement)
- sfx-wrong.mp3      (incorrect placement)
- sfx-complete.mp3   (level completed)

I couldn't download and bundle an actual track myself, my build environment has no internet access, and grabbing someone else's music without checking the license isn't something I'll do blind. Two solid places to grab real, free tracks yourself:

- Kenney's Music Jingles pack, kenney.nl/assets/music-jingles, fully public domain (CC0), no credit needed, good short jingles for placement/completion sounds.
- Pixabay Music, pixabay.com/music/search/puzzle, filter by "CC0" if you want zero attribution, has full loopable background tracks.

Pick one, rename it to music-theme.mp3, drop it here, done. Until then the game runs fine silently, missing files just get caught and ignored (see src/utils/audioManager.js).
