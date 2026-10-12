// src/content/interviews.ts — the /research/interviews tab. Team 709's 21 interviews (September 2026), paraphrased from the
// Team Hub interview logs and privacy-checked before they shipped here. Anonymous by construction: interview IDs and roles
// only, no names, pronouns, places, workplaces, vendors or relatives' details. tests/interviews.test.ts enforces that; keep
// it true when you edit. Quotes are the only verbatim text, and only where the notes themselves used quotation marks.

export type InterviewRole =
  | "Patient"
  | "Internist"
  | "Registered nurse"
  | "Physician assistant"
  | "Emergency medicine doctor"
  | "Genetics counselor";

export interface InterviewCounts {
  readonly total: number;
  readonly patients: number;
  readonly physicianAssistants: number;
  readonly emergencyDoctor: number;
  readonly geneticsCounselor: number;
  readonly internist: number;
  readonly registeredNurse: number;
}

export interface Interview {
  /** The log's own ID: ID001–ID020, then D021 (interview 21 is logged as D021, not ID021). */
  readonly id: string;
  readonly role: InterviewRole;
  readonly topic: string;
  /** Paraphrased from the notes. */
  readonly learned: string;
  /** The interview touched on family history. */
  readonly familyHistory: boolean;
  /** Verbatim, and only where the notes put the words in quotation marks. */
  readonly quote?: string;
}

export interface InterviewTheme {
  readonly title: string;
  readonly summary: string;
  /** The interviews the theme draws on. */
  readonly ids: readonly string[];
}

export interface InterviewResearch {
  readonly period: string;
  /** The anonymity label shown with the list. */
  readonly note: string;
  readonly intro: string;
  readonly counts: InterviewCounts;
  readonly gaps: string;
  readonly themes: readonly InterviewTheme[];
  readonly interviews: readonly Interview[];
}

export const INTERVIEW_RESEARCH = {
  period: "September 2026",
  note: "Paraphrased from the team's interview notes. Participants are identified by interview ID only.",
  intro:
    "We ran these 21 interviews in September 2026, while our team was researching one question: how might we improve how conditions get diagnosed? We talked with 15 patients and 6 clinicians about how a diagnosis comes together. Family history came up in five of them: two patients whose useful family details surfaced only after a specialist asked for them, an internist who counted it among the most important factors, and an ER doctor and a genetics counselor who gave us their view of a family history tool. Those two patient stories are the interview evidence behind our decision to build a patient-owned family health tree, the idea that became Stemma. Everything below is paraphrased from our interview notes; words in quotation marks are only those the notes themselves put in quotation marks.",
  counts: { total: 21, patients: 15, physicianAssistants: 2, emergencyDoctor: 1, geneticsCounselor: 1, internist: 1, registeredNurse: 1 },
  gaps: "Among these 21 there is no practice owner or manager, no cardiologist and no relative asked to share family history, and only one patient (ID007) matches our cardiology starting point.",
  themes: [
    {
      title: "Family history is vague until someone asks",
      summary:
        "In the two patient stories where it came up, the patient knew little or nothing at first, and the useful details came out only after a specialist asked more specifically, or asked the patient to find out, and the patient went to relatives. Clinicians weighed it as one signal among several, and a genetics counselor doubted patients can build an accurate tree without guidance.",
      ids: ["ID002", "ID006", "ID007", "ID010", "D021"],
    },
    {
      title: "Specific questions find what patients leave out",
      summary:
        "Patients often left out details they did not think mattered, such as another symptom, a new medicine or when a symptom happened. A more specific question, or better words for a symptom, is what brought them out.",
      ids: ["ID001", "ID002", "ID006", "ID013", "ID017", "ID018", "ID019"],
    },
    {
      title: "The patient carries the story between visits",
      summary:
        "Patients were often the only ones holding the full timeline: repeating their history, carrying results between offices, and keeping their own notes, photos or logs, sometimes because symptoms did not show up during the appointment.",
      ids: ["ID001", "ID002", "ID003", "ID004", "ID009", "ID011", "ID012", "ID015", "ID016", "ID017", "ID020"],
    },
    {
      title: "Nobody owns the next step",
      summary:
        "Between visits, results sometimes reached patients before anyone explained them, and follow-up got harder when it was unclear who should act next, or what the plan was if a first treatment failed.",
      ids: ["ID001", "ID002", "ID003", "ID004", "ID008", "ID009", "ID014"],
    },
    {
      title: "A normal result is not an answer",
      summary:
        "Normal tests often left patients feeling dismissed, doubting themselves or no closer to an explanation, and many were unsure when a symptom that lingered was worth another visit.",
      ids: ["ID005", "ID006", "ID007", "ID012", "ID014", "ID015", "ID016", "ID018", "ID019", "ID020"],
    },
  ],
  interviews: [
    {
      id: "ID001",
      role: "Patient",
      topic: "Months of fatigue and joint pain",
      learned:
        "Fatigue was the hardest symptom to get across until a doctor offered more precise words for it. Between visits a borderline result went unexplained, and the patient repeated their whole history at each new appointment.",
      familyHistory: false,
      quote: "everyone’s tired.",
    },
    {
      id: "ID002",
      role: "Internist",
      topic: "How a diagnosis comes together over visits",
      learned:
        "A diagnosis usually builds across several visits, and the riskiest moments fall between them, when a test or result is not followed up and no one clearly owns the next step. Family history was among the factors named as most important, alongside the symptom timeline and change from baseline.",
      familyHistory: true,
    },
    {
      id: "ID003",
      role: "Patient",
      topic: "Recurring headaches and a scan report",
      learned:
        "A scan report reached the patient's portal before anyone explained it; its technical wording caused real worry, and no one had said who would discuss it. Trust came back when a specialist went through the report line by line and tied it to the symptoms.",
      familyHistory: false,
    },
    {
      id: "ID004",
      role: "Patient",
      topic: "Months of abdominal pain",
      learned:
        "Each provider focused on a different piece of the case. The patient brought screenshots of earlier results, unsure every provider could see the same records, and learned at the specialist visit that some outside records had not transferred; that visit was the first where everything was discussed together.",
      familyHistory: false,
    },
    {
      id: "ID005",
      role: "Patient",
      topic: "A knee injury and a normal first scan",
      learned:
        "The patient took a normal first scan to mean nothing was wrong, because no one had said what that test could and could not show. Understanding why each test was ordered mattered almost as much as the result.",
      familyHistory: false,
    },
    {
      id: "ID006",
      role: "Patient",
      topic: "Months of recurring digestive symptoms",
      learned:
        "The patient first reported no relevant family history. After a specialist asked more specific questions about conditions in the family, they asked a parent and learned of a diagnosis they had never known by name. It did not settle the diagnosis, but it changed what the specialist considered worth testing for.",
      familyHistory: true,
    },
    {
      id: "ID007",
      role: "Patient",
      topic: "Episodes of racing heart and dizziness",
      learned:
        "The patient knew heart problems ran in the family but not who, what or at what age. After a specialist asked them to find out more, they asked relatives and learned which relative had had a heart rhythm problem and roughly at what age; the specialist weighed that alongside the patient's monitor results. Gathering it was hard because relatives remembered events differently and did not always know the medical terms.",
      familyHistory: true,
    },
    {
      id: "ID008",
      role: "Registered nurse",
      topic: "Who explains results to patients",
      learned:
        "Patients often turn to the nurse to explain new results, sometimes before the physician has reviewed them, and some see abnormal results in the portal before anyone on the team has spoken to them. Across repeated handoffs no one owns the whole picture, and patient concerns can get buried.",
      familyHistory: false,
      quote: "Everyone is doing their part, but sometimes no one is looking at the whole picture.",
    },
    {
      id: "ID009",
      role: "Physician assistant",
      topic: "Results that arrive without context",
      learned:
        "The hardest part is getting information back from outside specialists and imaging centers, and reports can flag a finding without saying whether it explains the symptoms. Follow-up gets difficult when it is unclear whether the specialist, the PA or the primary care doctor takes the next step.",
      familyHistory: false,
      quote: "A result can be technically available but still not be useful until someone puts it into context.",
    },
    {
      id: "ID010",
      role: "Emergency medicine doctor",
      topic: "Diagnosis and family history in the ER",
      learned:
        "The emergency department rules out emergencies rather than solving long-running mysteries, and incomplete histories are the norm. Family history is asked about only for some complaints, such as chest pain or fainting, and a full chart review is unlikely there, so a flagged, scannable summary is more realistic. It is worth much more in primary care and internal medicine.",
      familyHistory: true,
    },
    {
      id: "ID011",
      role: "Patient",
      topic: "A rash that came and went",
      learned:
        "Each visit saw only how the rash looked that day, so photos the patient took over time turned out to matter to the specialist. During a long wait for the referral, the patient did not know what to do if it got worse.",
      familyHistory: false,
    },
    {
      id: "ID012",
      role: "Patient",
      topic: "Breathlessness that came and went",
      learned:
        "Symptoms rarely happened during appointments, and normal first tests made the patient question whether they were real. The patient felt the diagnosis moved forward only because they kept coming back, and wanted a clearer plan for what to do if symptoms continued.",
      familyHistory: false,
    },
    {
      id: "ID013",
      role: "Patient",
      topic: "Ear pain with a cause elsewhere",
      learned:
        "Pain that felt like it came from the ear was linked to the jaw only when a primary care visit asked about other symptoms the patient had not connected. Before that, an urgent care visit that found no infection left them unsure whom to see next.",
      familyHistory: false,
    },
    {
      id: "ID014",
      role: "Physician assistant",
      topic: "Follow-up when a first treatment fails",
      learned:
        "A diagnosis can get clearer as the patient responds to treatment, but notes don't always say what the first provider wanted if treatment failed. Patients may wait weeks because they don't know when a lingering symptom becomes a concern.",
      familyHistory: false,
    },
    {
      id: "ID015",
      role: "Patient",
      topic: "Sinus symptoms that kept returning",
      learned:
        "Repeat visits for the same problem felt disconnected, and the patient struggled to remember when symptoms improved or worsened. What helped was a specialist who went through what had already been tried instead of starting over, the patient's own simple notes, and an explanation of the possible causes.",
      familyHistory: false,
    },
    {
      id: "ID016",
      role: "Patient",
      topic: "Back pain that came and went",
      learned:
        "Pain that came and went was hard to describe in a visit focused on how the patient felt that day. A physical therapist who asked about daily routine, together with the patient's own tracking, found what seemed to trigger it.",
      familyHistory: false,
    },
    {
      id: "ID017",
      role: "Patient",
      topic: "Frequent headaches",
      learned:
        "The patient left out neck pain and poor sleep, thinking they were unrelated, until more specific questions at a second visit brought them up and changed the plan. Tracking headaches in phone notes made that visit easier.",
      familyHistory: false,
    },
    {
      id: "ID018",
      role: "Patient",
      topic: "A cough that would not clear",
      learned:
        "The cough's pattern, worse after eating and when lying down, came out only when the doctor asked when it happened, which pointed to a possible cause outside the lungs. Before that, the patient was unsure what a general instruction to come back if it did not improve actually meant.",
      familyHistory: false,
    },
    {
      id: "ID019",
      role: "Patient",
      topic: "Tiredness after a recent change",
      learned:
        "At first the patient did not mention a recently started medicine because it was for something unrelated. When the doctor asked about any recent changes, lining up when it started with when the symptoms began pointed to it as a possible contributor.",
      familyHistory: false,
    },
    {
      id: "ID020",
      role: "Patient",
      topic: "Nausea after meals",
      learned:
        "Normal bloodwork made the patient wonder if they were overreacting, and changing their diet on their own made it hard to remember what the symptoms were first like. A simple food and symptom log, which the doctor asked for, made the pattern visible.",
      familyHistory: false,
    },
    {
      id: "D021",
      role: "Genetics counselor",
      topic: "How family history reaches a genetics program",
      learned:
        "Family history arrives from several disconnected sources and is entered into a pedigree tool by hand, one relative at a time, and only about one in five patients returns the pre-visit questionnaire. The counselor doubted patients could build an accurate tree unaided, saw a guided tool that asks the right questions as the more workable path, and stressed that a person has to judge what matters.",
      familyHistory: true,
    },
  ],
} as const satisfies InterviewResearch;

/** Who we talked to, in display order: each role, its plural label and its key in `counts`. */
export const INTERVIEW_ROLES = [
  { role: "Patient", label: "Patients", key: "patients" },
  { role: "Physician assistant", label: "Physician assistants", key: "physicianAssistants" },
  { role: "Emergency medicine doctor", label: "Emergency medicine doctor", key: "emergencyDoctor" },
  { role: "Genetics counselor", label: "Genetics counselor", key: "geneticsCounselor" },
  { role: "Internist", label: "Internist", key: "internist" },
  { role: "Registered nurse", label: "Registered nurse", key: "registeredNurse" },
] as const satisfies readonly { role: InterviewRole; label: string; key: Exclude<keyof InterviewCounts, "total"> }[];

/** "21 interviews · 15 patients · 2 PAs · an ER doctor · …", the same line as the home page's "What we heard". */
export function interviewCountsLine(c: InterviewCounts): string {
  const some = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);
  return [
    `${c.total} interviews`,
    some(c.patients, "a patient", "patients"),
    some(c.physicianAssistants, "a PA", "PAs"),
    some(c.emergencyDoctor, "an ER doctor", "ER doctors"),
    some(c.geneticsCounselor, "a genetics counselor", "genetics counselors"),
    some(c.internist, "an internist", "internists"),
    some(c.registeredNurse, "an RN", "RNs"),
  ].join(" · ");
}
