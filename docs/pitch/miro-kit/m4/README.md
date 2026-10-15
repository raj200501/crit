# Milestone 4 board, rebuilt (Oct 15, 2026)

The old board (`uXjVEdDYBoA=`, 1,853 items with duplicate frames) is kept as an archive. The clean board is
**https://miro.com/app/board/uXjVEZts9lk=/** ("Team 709 · Stemma · Milestone 4 VCA (clean)"): 22 frames, the
Business Model Canvas (all 88 Post-its, colored by tag, red dot = untested) in the middle, the analysis around it.

- `pages.json`: the page copy, condensed from `../../value-creation-analysis.md` and fact-checked against it and the
  final Maker Day 2 deck (`../../maker-day-2-pitch.md`). Edit copy here, not on the board, then rebuild.
- `build.py pages.json OUT`: writes `OUT/board.svg` (Canvas Composer SVG, frames in reading order = PDF page order),
  one SVG per frame, an HTML preview per frame and `report.json` (any page whose text runs past its footer).
  The canvas, the Step 3 bars, the mockup screens and the sources are drawn straight from the VCA.
- `shoot.mjs PREVIEW_DIR PNG_DIR`: screenshots the previews (run from the repo root so Playwright resolves).
- `prep.json` + `make_prep.py`: the review prep page (run of show, Q&A drill, admissions, checklist).

PDF for Oct 23: in Miro open the Frames panel; the frames are already in reading order (At a glance, canvas,
Steps 2a to 5, logic, configuration, wedge, riskiest claim, mockups, choices, sources). Export the frames as PDF,
one frame per page, and check every page.
