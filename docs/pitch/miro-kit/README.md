# Milestone 4 Miro board: finishing steps

Board: https://miro.com/app/board/uXjVEdDYBoA=/

Every frame is on the board (the last ones were created on Oct 8, 2026). What's left needs a person in Miro, because the Miro tools used here can't delete or move items: delete the old frames, drag the new ones into place, and export the PDF.

Open any item with `https://miro.com/app/board/uXjVEdDYBoA=/?moveToWidget=<id>`; Miro zooms to it and selects it, so pressing Delete removes it. Deleting a frame also deletes everything inside it.

## 1. Delete the leftovers from earlier attempts

| What | id |
| --- | --- |
| Old header (first try) | 3458764686296796879 |
| Old Step 2a (first try) | 3458764686309900670 |
| Half-built canvas, titled "Step 1 · Business Model Canvas" | 3458764686310116563 |
| Empty duplicate canvas, same title | 3458764686318376065 |
| Loose test sticky "Practice 1 [O] More family history…" | 3458764686318138450 |
| Loose test stickies | 3458764686318138653, 3458764686318375960 |

## 2. Delete the frames that have replacements

| Old frame | id | Replaced by |
| --- | --- | --- |
| Header · Team 709 · Stemma (at x 0, y 8600) | 3458764686321510435 | 3458764686482124776 |
| Step 3 · What's new and what's old (at 3486, 12917) | 3458764686320118391 | 3458764686481010984 |
| Step 5a · Technical feasibility (at 0, 17666) | 3458764686320572749 | 3458764686481535874 |
| Step 5b · Operational feasibility (at 4120, 17666) | 3458764686320716240 | 3458764686481998906 |
| Sources (one wide frame at 0, 24664) | 3458764686321274594 | Sources 1, 2 and 3 of 3 (below) |

Step 5a and Step 5b were rebuilt because the old ones still listed the print and cholesterol-label fixes as to-do. Both shipped on Oct 7.

## 3. Drag the new frames into the gaps

The new frames sit in a column on the right (x 16480). Move each one so its top-left corner lands here (Miro shows X and Y while you drag):

| New frame | id | Move to (x, y) |
| --- | --- | --- |
| Header · Team 709 · Stemma | 3458764686482124776 | 0, 8600 |
| Step 3 · What's new and what's old | 3458764686481010984 | 3486, 12917 |
| Step 5a · Technical feasibility | 3458764686481535874 | 0, 17666 |
| Step 5b · Operational feasibility | 3458764686481998906 | 4120, 17666 |
| Sources (1 of 3) | 3458764686481665690 | 0, 24664 |
| Sources (2 of 3) | 3458764686481814608 | 4120, 24664 |
| Sources (3 of 3) | 3458764686481998193 | 8240, 24664 |

They fit without overlapping: the new Step 5a and 5b end above the next row (y 19439), and the new header ends above the first content row (y 9644). The "Why each Post-it" frames and "Choices made, and open items" (x 12360) are already where they belong.

## 4. Order and export

1. In the Frames panel, drag the header to the top. Then order the frames by step: canvas, Why each Post-it, Step 2, Step 3, mockups, Step 4, Step 5, logic, configuration, wedge, riskiest claim, choices, sources.
2. Export the frames: in the Frames panel, open the "⋯" menu and choose Save as PDF (or Board menu → Export → Save as PDF and pick the frames). Each frame becomes a page, in panel order.
3. The canvas is split over three frames side by side ("Business Model Canvas (1 of 3)" to "(3 of 3)", area x 3486–8982, y 9644–12757). If you want the 9 boxes on one page, export that area on its own (Export → Save as PDF or image, area option) and put it first in the PDF you hand in.

## How the frames were made

`miro4/gen4.py` writes each frame as Canvas Composer SVG from `docs/pitch/value-creation-analysis.md` (its scratchpad copy is the generator's source), and `miro4/ingest4.py` records the ids Miro returns (`ids4.json`, `links.json`). The header's board-map links come from `links.json`, so the header is always generated last. Only `canvas_create_from_svg` was used. `canvas_update_from_svg` asks for approval on every call, so it can't run while nobody is watching, and the Free plan allows 100 tool calls a day.
