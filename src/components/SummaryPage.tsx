"use client";

import Link from "next/link";
import { useState } from "react";
import { packJson } from "@/lib/compress";
import { toFhirBundle } from "@/lib/fhir";
import { shareableTree } from "@/lib/redact";
import { actions, useTree } from "@/lib/store";
import { Back, Check, Doc, Lock } from "./icons";
import SummaryDocument from "./SummaryDocument";
import styles from "./SummaryPage.module.css";

export default function SummaryPage() {
  const tree = useTree();
  const reviewed = !!tree.reviewedAt;
  const [shared, setShared] = useState<{ key: string; link: string; qr: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  // A link is only shown while the content it was made from is unchanged.
  const contentKey = `${tree.id}|${tree.reports.map((r) => r.id).join()}|${tree.people.map((p) => `${p.id}${p.label}${p.sex}${p.deceased}`).join()}|${tree.reviewedAt}|${tree.visit?.date}`;
  const link = shared?.key === contentKey ? shared.link : null;
  const qr = shared?.key === contentKey ? shared.qr : null;

  const makeLink = async () => {
    const key = contentKey;
    const packed = await packJson(shareableTree(tree));
    const url = `${window.location.origin}/view#${packed}`;
    let code: string | null = null;
    if (url.length < 2300) {
      const QR = await import("qrcode");
      code = await QR.toDataURL(url, { errorCorrectionLevel: "L", margin: 1, width: 220, color: { dark: "#1f2937", light: "#ffffff" } });
    }
    setShared({ key, link: url, qr: code });
    actions.markShared();
  };

  const downloadFhir = () => {
    const blob = new Blob([JSON.stringify(toFhirBundle(tree), null, 2)], { type: "application/fhir+json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `family-history-${tree.patientName.toLowerCase().replace(/\W+/g, "-")}.fhir.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className={styles.main}>
      <div className={`${styles.bar} no-print`}>
        <Link href="/tree" className="btn btn-ghost btn-sm">
          <Back size={14} /> Back to tree
        </Link>
      </div>
      <div className={styles.grid}>
        <SummaryDocument tree={tree} />
        <aside className={`${styles.side} no-print`}>
          <section className={`card ${styles.box}`}>
            <h2 className={styles.h2}>1. Review it</h2>
            <label className={styles.check}>
              <input type="checkbox" checked={reviewed} onChange={(e) => actions.markReviewed(e.target.checked)} />
              <span>I&rsquo;ve checked this and it matches what my family told me.</span>
            </label>
            <p className={styles.hint}>Changing the tree clears this, so the summary is never out of date when you share it.</p>
          </section>

          <section className={`card ${styles.box}`}>
            <h2 className={styles.h2}>2. Bring it</h2>
            <button className="btn btn-primary btn-block" onClick={() => window.print()} disabled={!reviewed}>
              <Doc size={14} /> Print or save as PDF
            </button>
            <button className="btn btn-secondary btn-block" onClick={makeLink} disabled={!reviewed}>
              Make a link for the practice
            </button>
            {link ? (
              <div className={styles.share}>
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="QR code that opens a read-only copy of this summary" width={180} height={180} />
                ) : null}
                <div className={styles.linkRow}>
                  <input className="input" readOnly value={link} aria-label="Read-only summary link" onFocus={(e) => e.currentTarget.select()} />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className={styles.hint}>
                  <Lock size={11} /> Read-only. The summary is packed into the link after the #, so it never reaches our server. A production version would use
                  encrypted SMART Health Links.
                </p>
              </div>
            ) : null}
            {!reviewed ? <p className={styles.hint}>Review the summary first.</p> : null}
          </section>

          <section className={`card ${styles.box}`}>
            <h2 className={styles.h2}>For the practice&rsquo;s EHR</h2>
            <button className="btn btn-ghost btn-block" onClick={downloadFhir}>
              Download as FHIR (FamilyMemberHistory)
            </button>
            <button className="btn btn-ghost btn-block" disabled title="Needs a signed BAA; planned for the paid pilot">
              Send to practice&rsquo;s Box folder (pilot)
            </button>
            <p className={styles.hint}>
              Box signs a HIPAA BAA only on Enterprise plans. In a paid pilot, summaries would go to the practice&rsquo;s BAA-covered storage. The prototype
              stores nothing.
            </p>
          </section>
          {tree.sharedAt ? (
            <p className={styles.sharedNote}>
              <Check size={12} /> Link made{" "}
              {new Date(tree.sharedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
