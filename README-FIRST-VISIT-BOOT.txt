TOEFL 2026 — FIRST-VISIT RETRO BOOT + SMART CACHE
===================================================

Replace/add these files in the PROJECT ROOT:

- retromax.js
- boot.css
- service-worker.js

WHAT IT DOES
------------
- Shows the retro TOEFL OS boot screen on the first visit only.
- Uses real cache progress instead of a fake timer.
- Registers a service worker on HTTPS / localhost.
- Caches the five current pages, core CSS/JS, practice data, favicons,
  Pixel Pet files, and the five WebP page visuals.
- Returning visits skip the long intro and warm/check the cache silently.
- Includes SKIP INTRO for slow connections.
- On Save-Data / 2G connections, returning-visit background warming is avoided.
- Works with prefers-reduced-motion.
- Does not add tracking cookies. Existing progress/notes remain browser-local.

TEST THE BOOT SCREEN AGAIN
--------------------------
Add this query to any page:
?boot=1

Example:
index.html?boot=1

IMPORTANT
---------
Service workers only work on HTTPS or localhost.
They do not work when opening the HTML directly with file://.
The website still works in file:// mode; it simply skips the offline cache engine.
