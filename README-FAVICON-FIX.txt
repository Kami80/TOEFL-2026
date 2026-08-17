TOEFL 2026 — BROWSER TAB FAVICON FIX
====================================

Replace/add these files in the project root:

- retromax.js
- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png
- toefl-2026-favicon-192.png
- toefl-2026-favicon-512.png
- toefl-2026-favicon.webp

WHAT WAS FIXED
- The current HTML pages did not explicitly link favicon assets.
- retromax.js now registers the favicon links on every existing project page.
- Dedicated 16x16 and 32x32 PNG files were added for browser tabs.
- favicon.ico includes 16, 32, 48, 64, 128 and 256 px variants.
- A cache-busting favicon version is included.

AFTER REPLACING
If the old blank/default icon remains, do one hard refresh (Ctrl+F5 on Windows)
or close/reopen the tab. Browsers cache favicons unusually aggressively.
