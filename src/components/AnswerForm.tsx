"use client";

import { useId, useState } from "react";
import { HEART_CHOICES } from "@/lib/clinical";
import type { ReportKind } from "@/lib/types";
import styles from "./AnswerForm.module.css";

export interface Answer {
  kind: ReportKind;
  condition?: string;
  ageAtOnset?: number;
  approximate?: boolean;
  note?: string;
}

interface Props {
  /** "you" when the person answers for themself, otherwise their name. */
  subject: string;
  self?: boolean;
  /** Offer "rather not share" (only the person themself can decline). */
  allowDecline?: boolean;
  submitLabel?: string;
  compact?: boolean;
  onSubmit: (answers: Answer[]) => void;
  onCancel?: () => void;
}

type Pick = { age: string; approx: boolean };

export default function AnswerForm({ subject, self, allowDecline, submitLabel = "Save", compact, onSubmit, onCancel }: Props) {
  const id = useId();
  const [picked, setPicked] = useState<Record<string, Pick>>({});
  const [other, setOther] = useState({ on: false, text: "", age: "", approx: false });
  const [alt, setAlt] = useState<"none" | "dont-know" | "declined" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const anyPicked = Object.keys(picked).length > 0 || (other.on && other.text.trim().length > 0);

  const toggle = (cid: string) => {
    setAlt(null);
    setError(null);
    setPicked((p) => {
      const next = { ...p };
      if (next[cid]) delete next[cid];
      else next[cid] = { age: "", approx: false };
      return next;
    });
  };

  const chooseAlt = (a: typeof alt) => {
    setAlt(a);
    setPicked({});
    setOther({ on: false, text: "", age: "", approx: false });
    if (a === "declined") setNote(""); // a decline carries nothing else
    setError(null);
  };

  const parseAge = (s: string) => {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 && n <= 120 ? n : undefined;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = note.trim() || undefined;
    if (alt) {
      onSubmit([{ kind: alt === "none" ? "no-history" : alt, note: alt === "declined" ? undefined : trimmedNote }]);
      return;
    }
    if (!anyPicked) {
      setError("Pick at least one, or choose “None of these” or “I don’t know”.");
      return;
    }
    const answers: Answer[] = HEART_CHOICES.filter((c) => picked[c.id]).map((c) => ({
      kind: "condition",
      condition: c.condition,
      ageAtOnset: parseAge(picked[c.id].age),
      approximate: picked[c.id].approx || undefined,
    }));
    if (other.on && other.text.trim()) {
      answers.push({ kind: "condition", condition: other.text.trim(), ageAtOnset: parseAge(other.age), approximate: other.approx || undefined });
    }
    if (trimmedNote && answers.length) answers[0].note = trimmedNote;
    onSubmit(answers);
  };

  const q = self ? "Have you ever had any of these?" : `Has ${subject} ever had any of these?`;

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ""}`} onSubmit={submit} noValidate>
      <fieldset className={styles.group}>
        <legend className={styles.q}>{q}</legend>
        <p className={styles.hint}>Tick anything that fits, even if you&rsquo;re not sure of the details.</p>
        <div className={styles.choices}>
          {HEART_CHOICES.map((c) => {
            const on = !!picked[c.id];
            return (
              <div key={c.id} className={`${styles.choice} ${on ? styles.on : ""}`}>
                <label className={styles.choiceMain}>
                  <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
                  <span>
                    <b>{c.label}</b>
                    <small>{c.examples}</small>
                  </span>
                </label>
                {on ? (
                  <div className={styles.age}>
                    <label htmlFor={`${id}-${c.id}-age`}>{self ? "About how old were you?" : "About how old were they?"}</label>
                    <input
                      id={`${id}-${c.id}-age`}
                      className="input"
                      inputMode="numeric"
                      placeholder="Age"
                      value={picked[c.id].age}
                      onChange={(e) => setPicked((p) => ({ ...p, [c.id]: { ...p[c.id], age: e.target.value.replace(/\D/g, "").slice(0, 3) } }))}
                    />
                    <label className={styles.approx}>
                      <input
                        type="checkbox"
                        checked={picked[c.id].approx}
                        onChange={(e) => setPicked((p) => ({ ...p, [c.id]: { ...p[c.id], approx: e.target.checked } }))}
                      />
                      roughly
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}
          <div className={`${styles.choice} ${other.on ? styles.on : ""}`}>
            <label className={styles.choiceMain}>
              <input
                type="checkbox"
                checked={other.on}
                onChange={(e) => {
                  setAlt(null);
                  setOther((o) => ({ ...o, on: e.target.checked }));
                }}
              />
              <span>
                <b>Something else heart-related</b>
                <small>Say it in your own words</small>
              </span>
            </label>
            {other.on ? (
              <div className={styles.other}>
                <input
                  className="input"
                  placeholder="e.g. heart murmur, valve surgery"
                  value={other.text}
                  onChange={(e) => setOther((o) => ({ ...o, text: e.target.value.slice(0, 80) }))}
                  aria-label="Describe the condition"
                />
                <div className={styles.age}>
                  <label htmlFor={`${id}-other-age`}>Age</label>
                  <input
                    id={`${id}-other-age`}
                    className="input"
                    inputMode="numeric"
                    placeholder="Age"
                    value={other.age}
                    onChange={(e) => setOther((o) => ({ ...o, age: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                  />
                  <label className={styles.approx}>
                    <input type="checkbox" checked={other.approx} onChange={(e) => setOther((o) => ({ ...o, approx: e.target.checked }))} />
                    roughly
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className={styles.alts} role="radiogroup" aria-label="Other answers">
        <button type="button" role="radio" aria-checked={alt === "none"} className={alt === "none" ? styles.altOn : ""} onClick={() => chooseAlt("none")}>
          None of these
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={alt === "dont-know"}
          className={alt === "dont-know" ? styles.altOn : ""}
          onClick={() => chooseAlt("dont-know")}
        >
          I don&rsquo;t know
        </button>
        {allowDecline ? (
          <button
            type="button"
            role="radio"
            aria-checked={alt === "declined"}
            className={alt === "declined" ? styles.altOn : ""}
            onClick={() => chooseAlt("declined")}
          >
            I&rsquo;d rather not share
          </button>
        ) : null}
      </div>

      {alt !== "declined" ? (
        <div className="field">
          <label className="field-label" htmlFor={`${id}-note`}>
            Anything else, in your own words <span className="muted">(optional)</span>
          </label>
          <textarea
            id={`${id}-note`}
            className="input"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 280))}
            placeholder="e.g. “He had chest pain in his late 50s, I think it was angina.”"
          />
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        {onCancel ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
