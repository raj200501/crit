import Link from "next/link";
import { Arrow, Check, Heart, Link as LinkIcon, Lock } from "@/components/icons";
import TreeView, { Legend } from "@/components/TreeView";
import { demoTree } from "@/lib/demo";
import { viewTree } from "@/lib/status";
import styles from "./landing.module.css";

export default function Home() {
  const views = viewTree(demoTree());
  return (
    <main id="main" className={styles.page}>
      {/* Spacer for the fixed SiteNav until P3 rebuilds this page. */}
      <div aria-hidden className="h-20" />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className="kicker">Team 709 · Product Studio</p>
          <h1>
            Turn &ldquo;heart problems run in the family&rdquo; into <em>who, what, and at what age.</em>
          </h1>
          <p className={styles.lead}>
            Build a three-generation family health tree before your cardiology visit. Relatives fill in their own branches. Every answer keeps who said it, and
            nothing uncertain gets flattened into a guess.
          </p>
          <div className={styles.ctas}>
            <Link href="/tree" className="btn btn-accent">
              Try the demo family <Arrow size={14} />
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary">
              How it would really work
            </Link>
          </div>
        </div>
        <div className={`card ${styles.heroCard}`}>
          <div className={styles.window}>
            <i />
            <i />
            <i />
            <span>Alex&rsquo;s family · cardiology visit Oct 14</span>
          </div>
          <TreeView views={views} maxScale={0.8} minScale={0.3} />
          <div className={styles.heroLegend}>
            <Legend />
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <div>
          <span className={styles.num}>01</span>
          <h3>Build it in minutes</h3>
          <p>Guided questions with real examples (&ldquo;stent, bypass, AFib, pacemaker&rdquo;), not a blank &ldquo;any family history?&rdquo; box.</p>
        </div>
        <div>
          <span className={styles.num}>02</span>
          <h3>Relatives fill in their own branch</h3>
          <p>One text link, no account. A relative can share a single fact from their MyChart without exposing their whole chart.</p>
        </div>
        <div>
          <span className={styles.num}>03</span>
          <h3>Keep the uncertainty</h3>
          <p>Known, unknown, declined or conflicting. When Mom and Uncle Dev disagree, the summary shows both, with names.</p>
        </div>
        <div>
          <span className={styles.num}>04</span>
          <h3>Walk in prepared</h3>
          <p>
            A one-page summary you review, with guideline-matched items listed first for the clinician. Print it, show a QR code, or export it as FHIR for the
            practice&rsquo;s EHR.
          </p>
        </div>
      </section>

      <section className={styles.heard}>
        <div className={styles.heardHead}>
          <p className="kicker">What we heard</p>
          <h2>The history exists. It just isn&rsquo;t usable at the visit.</h2>
        </div>
        <div className={styles.quotes}>
          <figure>
            <blockquote>Knowing &ldquo;heart disease&rdquo; was in the family was much less useful than knowing exactly what happened and when.</blockquote>
            <figcaption>Patient with palpitations, paraphrased from our interview notes</figcaption>
          </figure>
          <figure>
            <blockquote>&ldquo;A result can be technically available but still not be useful until someone puts it into context.&rdquo;</blockquote>
            <figcaption>Physician assistant, internal medicine</figcaption>
          </figure>
          <figure>
            <blockquote>Family history from Epic, a chatbot and paper forms is typed into a pedigree tool by hand, one relative at a time.</blockquote>
            <figcaption>Genetics counselor, from our interview notes</figcaption>
          </figure>
          <figure>
            <blockquote>A full chart review is unlikely in the ER; a flagged, scannable summary is more realistic.</blockquote>
            <figcaption>Emergency medicine doctor, from our interview notes</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.privacy}>
        <div>
          <p className="kicker">Privacy by design</p>
          <h2>In this prototype, nothing is stored on a server.</h2>
          <p>
            Your tree lives in your browser. Invite links and replies carry their answers after the &ldquo;#&rdquo;, which browsers never send to a server. The
            MyChart demo connects to the public SMART on FHIR sandbox with made-up patients.
          </p>
        </div>
        <ul>
          <li>
            <Lock size={16} /> No accounts, no tracking pixels, no ads
          </li>
          <li>
            <Check size={16} /> Relatives choose exactly what to share, and can decline
          </li>
          <li>
            <LinkIcon size={16} /> A portal fact is labeled with where it came from, not &ldquo;verified&rdquo;
          </li>
          <li>
            <Heart size={16} /> It helps the conversation. It never diagnoses or scores risk
          </li>
        </ul>
      </section>

    </main>
  );
}
