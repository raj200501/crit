// Runs synchronously while the HTML is parsed, before first paint (Next guide "preventing flash before hydration").
// On the client React would warn about rendering <script>, so the type flips to text/plain there; the DOM keeps the server's.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
