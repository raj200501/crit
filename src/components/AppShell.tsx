import Link from "next/link";
import { Logo } from "./icons";
import styles from "./AppShell.module.css";

export default function AppShell({ children, active }: { children: React.ReactNode; active?: "tree" | "summary" | "how" }) {
  return (
    <div className={styles.shell}>
      <div className={`${styles.banner} no-print`} role="note">
        Prototype with a made-up demo family. Please don&rsquo;t enter real health information.
      </div>
      <header className={`${styles.header} no-print`}>
        <Link href="/" className={styles.brand}>
          <Logo />
          <span>Family Health Tree</span>
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/tree" className={active === "tree" ? styles.active : undefined}>
            Tree
          </Link>
          <Link href="/summary" className={active === "summary" ? styles.active : undefined}>
            Pre-visit summary
          </Link>
          <Link href="/how-it-works" className={active === "how" ? styles.active : undefined}>
            How it works
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
