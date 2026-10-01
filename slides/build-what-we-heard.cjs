// Builds what-we-heard.pptx: one research-overview slide in the Team 709 deck theme
// (white, Cambria Bold navy titles, Calibri body, rust accent). Run: node build-what-we-heard.cjs
const pptxgen = require("pptxgenjs");
const path = require("path");
const SKILL = process.env.PPTX_SKILL;
const THEME = {
  name: "Team 709", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "1F2937", lt1: "FFFFFF", dk2: "374151", lt2: "F9FAFB", accent1: "C2410C", accent2: "15803D",
    accent3: "D97706", accent4: "6B7280", accent5: "E5E7EB", accent6: "222B3A", hlink: "C2410C", folHlink: "6B7280" },
};
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in, same as the Google Slides deck
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: "Team 709 Content",
  background: { color: "FFFFFF" },
  objects: [
    { text: { text: "Team 709", options: { x: 7.6, y: 0.28, w: 1.9, h: 0.3, align: "right", bold: true, fontSize: 11, color: C.accent4, margin: 0, isTextBox: true } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.45, w: 6.4, h: 0.7, fontFace: "Cambria", bold: true, fontSize: 36, color: C.text1, margin: 0, valign: "bottom", align: "left" }, text: "" } },
  ],
});

const s = pres.addSlide({ masterName: "Team 709 Content" });
s.addText("WHAT WE HEARD", { placeholder: "title" });

// Left: headline stat
s.addText("30", { x: 0.5, y: 1.95, w: 2.2, h: 1.0, fontFace: "Cambria", bold: true, fontSize: 72, color: C.accent1,
  margin: 0, valign: "bottom", isTextBox: true, objectName: "Stat number" });
s.addText("interviews", { x: 0.5, y: 3.0, w: 2.2, h: 0.35, fontSize: 18, bold: true, color: C.text1, margin: 0,
  isTextBox: true, objectName: "Stat label" });
s.addText("with patients and clinicians", { x: 0.5, y: 3.35, w: 2.3, h: 0.6, fontSize: 14, color: C.text2, margin: 0,
  valign: "top", isTextBox: true, objectName: "Stat breakdown" });

// Right: one headline per voice
const cards = [
  { who: "PATIENTS", head: "\u201CIt runs in the family.\u201D But who?" },
  { who: "PHYSICIAN ASSISTANTS", head: "They rebuild the\nstory every visit." },
  { who: "ER DOCTOR", head: "Red flags,\nnot a full chart." },
  { who: "GENETICS COUNSELOR", head: "Every pedigree\nbuilt by hand." },
];
const X0 = 3.0, Y0 = 1.5, W = 3.15, H = 1.45, GAP = 0.2;
cards.forEach((c, i) => {
  const x = X0 + (i % 2) * (W + GAP), y = Y0 + Math.floor(i / 2) * (H + GAP);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: W, h: H, rectRadius: 0.08,
    fill: { color: C.background2 }, line: { color: C.accent5, width: 1 }, objectName: `Card ${i + 1}` });
  s.addText(c.who, { x: x + 0.22, y: y + 0.2, w: W - 0.44, h: 0.25, fontSize: 10, bold: true, charSpacing: 1,
    color: C.accent1, margin: 0, isTextBox: true, objectName: `Card ${i + 1} label` });
  s.addText(c.head, { x: x + 0.22, y: y + 0.5, w: W - 0.44, h: 0.8, fontFace: "Cambria", bold: true, fontSize: 18,
    color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: `Card ${i + 1} heading` });
});

s.addText("Research", { x: 7.0, y: 5.22, w: 2.5, h: 0.22, fontSize: 9, color: "9CA3AF",
  align: "right", margin: 0, isTextBox: true, objectName: "Footer" });
s.addNotes([
  "30 interviews with patients and clinicians. Logged in Team Hub so far: 15 patients, 2 PAs, an ER doctor, a genetics counselor, an internist and an RN.",
  "",
  "PATIENTS: They know heart problems run in the family, not who, what, or at what age. ID007 only learned an uncle had a young-onset arrhythmia after the cardiologist sent them to ask relatives. ID006 said no family history until the GI doctor asked specifically; they would have answered differently if asked: \u201CHas anyone in your family had long-term stomach problems or autoimmune disease?\u201D",
  "",
  "PHYSICIAN ASSISTANTS (ID009, ID014): They reconstruct what happened at the first visit before deciding the next step, and wait on outside specialists to send results back. ID009: \u201CA result can be technically available but still not be useful until someone puts it into context.\u201D",
  "",
  "ER DOCTOR (ID010): Family history only matters for a few red flags: chest pain, fainting, sudden unexplained death in a young first-degree relative. A full chart review is unlikely in the ED; a flagged, scannable summary is more realistic. Bigger value in primary care.",
  "",
  "GENETICS COUNSELOR (D021): Family history comes from Epic, an Ambry Care chatbot and paper questionnaires, and she enters it by hand into Progeny, a desktop pedigree tool, one relative at a time. Only ~20% of patients return the pre-visit questionnaire. She expects patients building their own tree would put relatives on the wrong side, so the tool has to guide them. \u201CThere has to be a human in the loop to make the judgment about what matters.\u201D",
  "",
  "What it changed: guided questions, keep who said what, a one-page summary.",
].join("\n"));

(async () => {
  const out = path.join(__dirname, "what-we-heard.pptx");
  await pres.writeFile({ fileName: out });
  if (SKILL) { const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js")); await applyTheme(out, THEME); }
  console.log("wrote", out);
})();
