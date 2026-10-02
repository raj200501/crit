import { FIRST_DEGREE, flagsFor, stillToConfirm } from "@/lib/clinical";
import { formatCondition, viewTree, type PersonView } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";
import { Alert, Check, Lock } from "./icons";
import styles from "./SummaryDocument.module.css";

const REL: Record<string, string> = {
  mother: "Mother",
  father: "Father",
  sibling: "Sibling",
  "paternal-grandfather": "Paternal grandfather",
  "paternal-grandmother": "Paternal grandmother",
  "maternal-grandfather": "Maternal grandfather",
  "maternal-grandmother": "Maternal grandmother",
  "paternal-aunt-uncle": "Father’s sibling",
  "maternal-aunt-uncle": "Mother’s sibling",
};

function order(v: PersonView) {
  const first = FIRST_DEGREE.includes(v.person.relation) ? 0 : 1;
  const heart = v.cardiac ? 0 : 1;
  const status = { conflicting: 0, known: 1, unknown: 2, declined: 3 }[v.status];
  return first * 100 + heart * 10 + status;
}

function source(r: Report) {
  if (r.source === "record") return `Portal record${r.record?.recordedDate ? `, ${r.record.recordedDate.slice(0, 4)}` : ""}`;
  if (r.source === "self") return "Self-reported";
  return r.reportedBy;
}

export default function SummaryDocument({ tree, audience = "patient" }: { tree: FamilyTree; audience?: "patient" | "clinician" }) {
  const views = viewTree(tree);
  const rows = views.filter((v) => v.person.relation !== "self").sort((a, b) => order(a) - order(b));
  const flags = flagsFor(tree, views);
  const todo = stillToConfirm(views);
  const visitDate = tree.visit?.date
    ? new Date(`${tree.visit.date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <article className={styles.paper} aria-label="Pre-visit family history summary">
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Pre-visit summary · Family heart history</p>
          <h1 className={styles.title}>{tree.patientName === "You" ? "Family history" : tree.patientName}</h1>
          <p className={styles.sub}>
            {tree.visit
              ? `${tree.visit.specialty}${visitDate ? ` · ${visitDate}` : ""}${tree.visit.practice ? ` · ${tree.visit.practice}` : ""}`
              : "Upcoming visit"}
            {" · "}3 generations · {rows.length} relatives
          </p>
        </div>
        <div className={styles.review}>
          {tree.reviewedAt ? (
            <span className={styles.reviewed}>
              <Check size={13} /> Reviewed by patient {new Date(tree.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          ) : (
            <span className={styles.unreviewed}>Not yet reviewed by patient</span>
          )}
          {tree.synthetic ? <span className={styles.synthetic}>Synthetic demo data</span> : null}
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}>Worth discussing</h2>
        {flags.length ? (
          <ul className={styles.flags}>
            {flags.map((f, i) => (
              <li key={i}>
                <Alert size={14} />
                <span>
                  <b>{f.title}.</b> {f.detail}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.none}>Nothing in the reported history matches the usual cardiology red flags. Gaps below may still matter.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>By relative</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Relative</th>
              <th scope="col">What was reported</th>
              <th scope="col">Status</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const conds = v.reports.filter((r) => r.kind === "condition");
              const none = v.reports.filter((r) => r.kind === "no-history");
              return (
                <tr key={v.person.id} className={v.cardiac && v.status !== "declined" ? styles.heartRow : undefined}>
                  <th scope="row">
                    {v.person.label}
                    {v.person.deceased ? " †" : ""}
                    <small>{REL[v.person.relation]}</small>
                  </th>
                  <td>
                    {v.status === "declined" ? (
                      <span className={styles.muted}>
                        <Lock size={11} /> Declined to share
                      </span>
                    ) : conds.length || none.length ? (
                      <ul className={styles.items}>
                        {conds.map((r) => (
                          <li key={r.id}>
                            {formatCondition(r)}
                            {v.status === "conflicting" ? <span className={styles.by}> ({r.reportedBy})</span> : null}
                            {r.note ? <q className={styles.note}>{r.note}</q> : null}
                          </li>
                        ))}
                        {none.map((r) => (
                          <li key={r.id}>No heart history{v.status === "conflicting" ? <span className={styles.by}> ({r.reportedBy})</span> : null}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.muted}>{v.headline}</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[v.status]}`}>{v.status}</span>
                  </td>
                  <td className={styles.src}>{v.reports.length ? [...new Set(v.reports.map(source))].join(", ") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {todo.length ? (
        <section className={styles.section}>
          <h2 className={styles.h2}>Still to confirm</h2>
          <p className={styles.todo}>
            {todo.map((v, i) => (
              <span key={v.person.id}>
                {i ? " · " : ""}
                {v.person.label}: {v.status === "conflicting" ? "reports disagree" : v.headline.toLowerCase()}
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <footer className={styles.foot}>
        <p>
          {audience === "clinician" ? "Shared by the patient, read-only. " : ""}Patient-reported family history to support the conversation. Not a diagnosis or
          a risk score. &ldquo;Portal record&rdquo; items were retrieved from the relative&rsquo;s own patient portal with their consent; a record date can be
          when a problem was listed, not when it was diagnosed.
        </p>
        <p>
          Family Health Tree · prototype by Team 709 · prepared{" "}
          {new Date(tree.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </footer>
    </article>
  );
}
