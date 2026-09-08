TOEFL 2026 — FIVE RETRO VISUALS UPDATE
========================================

Drop this package over the ROOT of the current TOEFL-2026 project.

FILES
-----
retromax.js
visuals.css
site-tree-nav.css

assets/visuals/
  toefl-2026-hero.webp
  task-explorer-hero.webp
  practice-hub-hero.webp
  writing-lab-hero.webp
  speaking-lab-hero.webp

INTEGRATION
-----------
- Homepage:
  The right-side hero box now renders the TOEFL 2026 pixel artwork and no longer
  appears as an empty diagonal-color panel.

- Task Explorer:
  The old hero console is upgraded with the generated 12-task pixel artwork.
  Four compact Reading / Listening / Writing / Speaking jump buttons remain
  available under the image.

- Practice Hub:
  The text-only hero becomes a responsive two-column hero with the generated
  Practice Hub artwork.

- Writing Lab:
  The generated Writing Lab scene is integrated inside the existing hero
  information card; the source metrics remain visible.

- Speaking Lab:
  The generated Speaking Lab scene is integrated inside the existing hero
  information card; the source metrics remain visible.

TECHNICAL
---------
- No HTML files need to be replaced.
- retromax.js dynamically inserts the correct artwork on each existing page.
- visuals.css is loaded automatically by retromax.js.
- WebP images are optimized to a maximum width of 1440 px.
- Existing TOEFL://MAP behavior is preserved.
- Responsive and reduced-motion behavior is included.
