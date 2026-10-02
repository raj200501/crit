"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { layoutTree, NODE_H, NODE_W } from "@/lib/layout";
import type { PersonView } from "@/lib/status";
import { Check, Heart, Lock } from "./icons";
import styles from "./TreeView.module.css";

interface Props {
  views: PersonView[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Ids waiting on an invite reply. */
  pendingIds?: Set<string>;
  maxScale?: number;
  /** Below this the tree scrolls sideways instead of shrinking further. */
  minScale?: number;
}

export default function TreeView({ views, selectedId, onSelect, pendingIds, maxScale = 1, minScale = 0.62 }: Props) {
  const layout = useMemo(() => layoutTree(views.map((v) => v.person)), [views]);
  const byId = useMemo(() => new Map(views.map((v) => [v.person.id, v])), [views]);
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const f = el.clientWidth / (layout.width + 8);
      setScale(Math.min(maxScale, Math.max(minScale, f)));
      setScrolls(f < minScale);
    };
    fit();
    // On narrow screens start centered on the patient.
    const self = layout.nodes.find((n) => byId.get(n.id)?.person.relation === "self");
    const f = el.clientWidth / (layout.width + 8);
    if (self && f < minScale) el.scrollLeft = (self.x + NODE_W / 2) * minScale - el.clientWidth / 2;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout, byId, maxScale, minScale]);

  return (
    <>
      {scrolls ? <p className={styles.scrollHint}>Scroll sideways to see everyone ↔</p> : null}
      <div ref={wrap} className={styles.wrap}>
        <div
          className={styles.sizer}
          style={{
            width: layout.width * scale + 8,
            height: layout.height * scale + 8,
          }}
        >
          <div
            className={styles.canvas}
            style={{
              width: layout.width,
              height: layout.height,
              transform: `scale(${scale})`,
            }}
            role="group"
            aria-label="Family health tree"
          >
            <svg className={styles.edges} width={layout.width} height={layout.height} aria-hidden>
              {layout.edges.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </svg>
            {layout.nodes.map((n) => {
              const v = byId.get(n.id)!;
              const p = v.person;
              const isSelf = p.relation === "self";
              const finding = v.status === "known" && v.cardiac;
              const cls = [
                styles.node,
                isSelf ? styles.self : styles[v.status],
                finding ? styles.finding : "",
                selectedId === n.id ? styles.selected : "",
              ].join(" ");
              const pending = pendingIds?.has(n.id) && v.status === "unknown";
              return (
                <button
                  key={n.id}
                  data-person-id={n.id}
                  type="button"
                  className={cls}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                  onClick={() => onSelect?.(n.id)}
                  aria-pressed={selectedId === n.id}
                  aria-label={`${p.label}: ${isSelf ? "you" : v.status}. ${v.headline}`}
                >
                  <span className={styles.name}>
                    {p.label}
                    {p.deceased ? (
                      <span className={styles.deceased} title="Deceased" aria-label="deceased">
                        †
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.sub}>{isSelf ? v.headline : pending ? "Invite sent · waiting" : subLine(v)}</span>
                  {v.cardiac && !isSelf ? (
                    <span className={styles.heart} title="Heart-related">
                      <Heart size={11} />
                    </span>
                  ) : null}
                  {v.verified ? (
                    <span className={styles.verified} title={v.reason}>
                      <Check size={10} /> Record
                    </span>
                  ) : null}
                  {v.status === "conflicting" ? <span className={styles.badge}>{v.reason}</span> : null}
                  {v.status === "declined" ? (
                    <span className={styles.lock} title="Declined to share">
                      <Lock size={11} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function subLine(v: PersonView) {
  if (v.status === "known" || v.status === "conflicting") return `${v.status} · ${v.headline}`;
  return v.headline;
}

export function Legend() {
  return (
    <ul className={styles.legend} aria-label="Legend">
      <li>
        <i className={`${styles.dot} ${styles.dKnown}`} /> known
      </li>
      <li>
        <i className={`${styles.dot} ${styles.dConf}`} /> conflicting
      </li>
      <li>
        <i className={`${styles.dot} ${styles.dUnknown}`} /> unknown
      </li>
      <li>
        <i className={`${styles.dot} ${styles.dDeclined}`} /> declined
      </li>
      <li>
        <i className={`${styles.dot} ${styles.dFinding}`} /> heart finding
      </li>
    </ul>
  );
}
