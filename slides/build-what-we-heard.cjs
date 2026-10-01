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
s.addText([
  { text: "21 interviews: ", options: { bold: true, color: C.text1 } },
  { text: "15 patients, 2 PAs, an ER doctor, a genetics counselor, an internist and an RN." },
], { x: 0.5, y: 1.2, w: 9, h: 0.4, fontSize: 14, color: C.text2, margin: 0, isTextBox: true, objectName: "Subtitle" });

const cards = [
  { who: "15 PATIENTS", head: "It runs in the family. But who?",
    body: "One only learned of an uncle’s young-onset arrhythmia after calling relatives.",
    quote: null, src: "ID007 + 14 more" },
  { who: "2 PHYSICIAN ASSISTANTS", head: "They rebuild the story every visit.",
    body: null,
    quote: "“A result can be technically available but still not be useful until someone puts it into context.”", src: "ID009 · ID014" },
  { who: "1 EMERGENCY DOCTOR", head: "Only a few red flags matter.",
    body: "Chest pain, fainting, a young relative’s sudden death. A flagged summary is more realistic than a full chart.",
    quote: null, src: "ID010" },
  { who: "1 GENETICS COUNSELOR", head: "Builds every pedigree by hand.",
    body: "Retypes each relative from Epic, chatbots and paper into Progeny, one at a time.",
    quote: null, src: "D021" },
];
const X0 = 0.5, W = 2.1, GAP = 0.2, Y = 1.75, H = 2.55;
cards.forEach((c, i) => {
  const x = X0 + i * (W + GAP);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: Y, w: W, h: H, rectRadius: 0.08,
    fill: { color: C.background2 }, line: { color: C.accent5, width: 1 }, objectName: `Card ${i + 1}` });
  s.addText(c.who, { x: x + 0.15, y: Y + 0.15, w: W - 0.3, h: 0.22, fontSize: 9, bold: true, charSpacing: 1,
    color: C.accent1, margin: 0, isTextBox: true, objectName: `Card ${i + 1} label` });
  s.addText(c.head, { x: x + 0.15, y: Y + 0.4, w: W - 0.3, h: 0.75, fontFace: "Cambria", bold: true, fontSize: 15,
    color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: `Card ${i + 1} heading` });
  const runs = c.body ? [{ text: c.body, options: { color: C.text2 } }] : [{ text: c.quote, options: { italic: true, color: C.text1 } }];
  s.addText(runs, { x: x + 0.15, y: Y + 1.2, w: W - 0.3, h: 1.0, fontSize: 12, margin: 0, valign: "top",
    lineSpacingMultiple: 0.95, isTextBox: true, objectName: `Card ${i + 1} body` });
  s.addText(c.src, { x: x + 0.15, y: Y + H - 0.28, w: W - 0.3, h: 0.2, fontSize: 8.5, color: C.accent4, margin: 0,
    isTextBox: true, objectName: `Card ${i + 1} source` });
});

s.addText([
  { text: "+ ", options: { color: C.accent1, bold: true } },
  { text: "What it changed: ", options: { bold: true, color: C.text1 } },
  { text: "guided questions · keep who said what · a one-page summary" },
], { x: 0.5, y: 4.65, w: 9, h: 0.3, fontSize: 14, color: C.text2, margin: 0, isTextBox: true, objectName: "Takeaway" });
s.addText("Research · 21 interviews", { x: 7.0, y: 5.25, w: 2.5, h: 0.22, fontSize: 9, color: "9CA3AF",
  align: "right", margin: 0, isTextBox: true, objectName: "Footer" });
s.addText("IDs refer to our Team Hub interview logs", { x: 0.5, y: 5.25, w: 4, h: 0.22, fontSize: 9, color: "9CA3AF",
  margin: 0, isTextBox: true, objectName: "Source note" });
s.addNotes("21 interviews: 15 patients (ID001, 003-007, 011-013, 015-020) and 6 clinicians: internal medicine physician (ID002), RN (ID008), PAs (ID009, ID014), emergency medicine doctor (ID010), genetics counselor (D021). Genetics counselor: family history from Epic, an Ambry Care chatbot and paper questionnaires is entered by hand into Progeny, a desktop pedigree tool, one relative at a time; only ~20% of patients return the pre-visit questionnaire.");

(async () => {
  const out = path.join(__dirname, "what-we-heard.pptx");
  await pres.writeFile({ fileName: out });
  if (SKILL) { const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js")); await applyTheme(out, THEME); }
  console.log("wrote", out);
})();
