# Milestone 4 Miro board: resume kit

Board: https://miro.com/app/board/uXjVEdDYBoA=/

The board was built with the Miro MCP tools. On Oct 7, 2026 the work stopped at Miro's Free-plan limit of 100 tool calls a day. These SVG files are the frames that are still missing, ready to send with `mcp__Miro__canvas_create_from_svg`, one file per call:

1. `miro4/c4_s3v2.svg`: Step 3, What's new and what's old (fixed layout)
2. `miro4/c4_s5av2.svg`: Step 5a, technical feasibility (fixed `<year>` text and the "No." header)
3. `miro4/c4_srcv2_1.svg`, `c4_srcv2_2.svg`, `c4_srcv2_3.svg`: Sources in three readable frames (fixed `&section` links)
4. `miro4/c4_hdrv2.svg`: the header. Regenerate it last with `python3 miro4/gen4.py` so its board links point to the new frames' ids (`ingest4.py` records ids after each create).

Never call `canvas_update_from_svg`; it hangs on this board.

After creating them, delete by hand in Miro:
- Stale frames from earlier attempts: 3458764686296796879 (old header), 3458764686309900670 (old Step 2a), 3458764686310116563 (old half-built canvas), 3458764686318376065 (empty duplicate canvas), and the loose test stickies 3458764686318138450, 3458764686318138653, 3458764686318375960.
- The frames the new ones replace: header 3458764686321510435, Step 3 3458764686320118391, Step 5a 3458764686320572749, Sources 3458764686321274594.

Then drag the replacements into place (Step 3 to 3486/12917, Step 5a to 0/17666, Sources to 0, 4120 and 8240 at y 24664, header to 0/8600), move the header to the top of the Frames panel, and export the board as PDF. For the canvas, also export the area x 3486–8982, y 9644–12757 as one page.
