// For tests that render components to static HTML: `import styles from "./X.module.css"` returns the class names as
// themselves (styles.sheet → "sheet"), so the markup can be compared without a bundler.
import Module from "node:module";

type Ext = Record<string, (m: { exports: unknown }) => void>;

export function stubCssModules() {
  const ext = (Module as unknown as { _extensions: Ext })._extensions;
  ext[".css"] = (m) => {
    m.exports = new Proxy({}, { get: (_t, k) => (k === "__esModule" ? false : typeof k === "string" ? k : undefined) });
  };
}
