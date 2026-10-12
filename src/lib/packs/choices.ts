// The question cards for each pack, as plain data. A leaf module (imports only types), so the "none" wording can name
// the questions it covered without importing a whole pack.
import type { Choice } from "./types";

// Guided cardiac questions: plain words with examples, because patients answer
// "any family history?" with "no" until someone names the condition.

export const HEART_CHOICES: Choice[] = [
  {
    id: "mi",
    label: "Heart attack or blocked arteries",
    examples: "stent, bypass surgery, angina (chest pain from the heart)",
    condition: "Heart attack or coronary artery disease",
  },
  {
    id: "arrhythmia",
    label: "Irregular heartbeat",
    examples: "atrial fibrillation (AFib), arrhythmia, pacemaker",
    condition: "Arrhythmia",
  },
  {
    id: "arrest",
    label: "Survived a cardiac arrest, or has an implanted defibrillator",
    examples: "heart stopped and was restarted with CPR or a shock, has an ICD",
    condition: "Survived cardiac arrest or has an ICD",
  },
  {
    id: "sudden",
    label: "Sudden or unexplained death",
    examples: "died suddenly or in their sleep, unexplained drowning or car crash, died after collapsing during exercise",
    condition: "Sudden unexplained death",
  },
  {
    id: "cardiomyopathy",
    label: "Heart muscle disease",
    examples: "cardiomyopathy, thick or enlarged heart, heart failure at a young age",
    condition: "Cardiomyopathy",
  },
  {
    id: "inherited-rhythm",
    label: "A diagnosed inherited rhythm condition",
    examples: "long QT syndrome, Brugada syndrome, CPVT",
    condition: "Inherited rhythm condition (long QT, Brugada, CPVT)",
  },
  {
    id: "faint",
    label: "Unexplained fainting",
    examples: "passed out without warning, or while exercising",
    condition: "Unexplained fainting",
  },
  {
    id: "fh",
    label: "Very high cholesterol",
    examples: "familial hypercholesterolemia, cholesterol treated from a young age",
    condition: "Very high cholesterol",
  },
  {
    id: "aortic",
    label: "Aortic aneurysm or tear",
    examples: "aortic aneurysm, aortic dissection (a tear in the aorta)",
    condition: "Aortic aneurysm or dissection",
  },
  {
    id: "stroke",
    label: "Stroke",
    examples: "stroke or mini-stroke (TIA)",
    condition: "Stroke or TIA",
  },
];

// The general set, for any visit that isn't cardiology. Plain words with examples, like the heart questions. Conditions
// that both sets ask about store the same name, so a tree that switches visit type keeps comparable answers. Sources
// (re-opened Oct 12, 2026): [N9] CDC, About Family Health History; [N10] CDC, Family Health History and Adults (updated
// Aug 24, 2026); [N2] USPSTF, BRCA-related cancer (2019); [N3] USPSTF, prediabetes and type 2 diabetes (2021); [N4] US
// Multi-Society Task Force, colorectal cancer screening (2017). 42 CFR 410.15 (the Medicare wellness visit) asks for
// "diseases that may be hereditary" in parents, siblings and children but names no condition: it is the reason to ask,
// not the source of a card. No card carries a criterion: these are questions, not rules.
export const GENERAL_CHOICES: Choice[] = [
  {
    id: "mi",
    label: "Heart attack or blocked arteries",
    examples: "stent, bypass surgery, angina (chest pain from the heart)",
    condition: "Heart attack or coronary artery disease",
    source: "[N10] “a family health history of early heart disease or heart attacks”",
  },
  {
    id: "heart",
    label: "Other heart disease",
    examples: "heart failure, irregular heartbeat (AFib), a heart valve or heart muscle problem",
    condition: "Other heart disease",
    detail: { label: "What kind? (optional)", placeholder: "e.g. heart failure, AFib, a valve problem" },
    source:
      "[N9] “at least one chronic disease, such as cancer, heart disease, and diabetes”; [N10] “Do you have any chronic diseases, such as heart disease or diabetes?”",
  },
  {
    id: "stroke",
    label: "Stroke",
    examples: "stroke or mini-stroke (TIA)",
    condition: "Stroke or TIA",
    source: "[N10] “Have you had any other serious diseases, such as cancer or stroke?”",
  },
  {
    id: "hbp",
    label: "High blood pressure",
    examples: "hypertension, takes pills for blood pressure",
    condition: "High blood pressure",
    source: "[N10] “Do you have any health conditions, such as high blood pressure or high cholesterol?”",
  },
  {
    id: "fh",
    label: "Very high cholesterol",
    examples: "cholesterol that runs in the family (familial hypercholesterolemia, FH), or treated from a young age",
    condition: "Very high cholesterol",
    source: "[N10] “ask your healthcare provider about checking for familial hypercholesterolemia (FH)”",
  },
  {
    id: "diabetes",
    label: "Diabetes",
    examples: "high blood sugar, treated with diet, pills or insulin. Type 2, which usually starts in adulthood, is the most common kind.",
    condition: "Diabetes",
    source: "[N9] “Does your mom, dad, sister, or brother have diabetes?”; [N3] “a family history of diabetes”",
  },
  {
    id: "breast",
    label: "Breast cancer",
    examples: "in a woman or a man, at any age",
    condition: "Breast cancer",
    source: "[N2] risk tools count “male family members with breast cancer”; [N10] “a male relative with breast cancer”",
  },
  {
    id: "ovarian",
    label: "Ovarian cancer",
    examples: "including cancer of the fallopian tubes or of the lining of the belly (peritoneal cancer)",
    condition: "Ovarian, fallopian tube or peritoneal cancer",
    source: "[N2] “breast, ovarian, tubal, or peritoneal cancer”; [N10] “a close relative with ovarian cancer”",
  },
  {
    id: "colorectal",
    label: "Colon or rectal cancer",
    examples: "cancer of the colon (large bowel) or rectum, also called bowel cancer",
    condition: "Colon or rectal cancer",
    source: "[N10] “a parent or sibling with colorectal cancer before age 50”; [N4] “in a first-degree relative age <60 years”",
  },
  {
    id: "cancer-other",
    label: "Another cancer",
    examples: "any other kind; you can name it",
    condition: "Other cancer",
    detail: { label: "What kind? (optional)", placeholder: "e.g. prostate, pancreas, melanoma (skin)" },
    source:
      "[N10] “Have you had any other serious diseases, such as cancer or stroke? What type of cancer?”; placeholder from the BRCA-linked cancers [N2] names",
  },
];

/** "heart attack or blocked arteries, stroke, …": what a "None of these" answer covered. */
export const askedAbout = (choices: readonly Choice[]) => choices.map((c) => c.label.toLowerCase()).join(", ");
