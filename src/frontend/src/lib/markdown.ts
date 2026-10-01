/**
 * Minimal, dependency-free markdown renderer for assistant replies.
 * Mirrors the formatting used by the original RzzPr2tg Ai app: fenced code
 * blocks, inline code, headings, bold/italic, lists, and blockquotes.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderMarkdown(text: string): string {
  if (!text) return "";

  let html = escapeHtml(text);

  html = html.replace(
    /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g,
    '<pre class="my-3 overflow-x-auto rounded-xl border border-border bg-muted p-4 font-mono text-xs text-foreground"><code>$2</code></pre>',
  );
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="my-3 overflow-x-auto rounded-xl border border-border bg-muted p-4 font-mono text-xs text-foreground"><code>$1</code></pre>',
  );
  html = html.replace(
    /`([^`\n]+)`/g,
    '<code class="rounded bg-skybrand-100 px-1.5 py-0.5 font-mono text-xs text-skybrand-700 dark:bg-slate-800 dark:text-skybrand-300">$1</code>',
  );
  html = html.replace(
    /^###\s+(.+)$/gm,
    '<h4 class="mb-1 mt-3 text-base font-bold">$1</h4>',
  );
  html = html.replace(
    /^##\s+(.+)$/gm,
    '<h3 class="mb-1 mt-3 text-lg font-bold">$1</h3>',
  );
  html = html.replace(
    /^#\s+(.+)$/gm,
    '<h2 class="mb-2 mt-3 text-xl font-bold">$1</h2>',
  );
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold">$1</strong>',
  );
  html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  html = html.replace(
    /^\s*[-*]\s+(.+)$/gm,
    '<div class="ml-4 list-item list-disc">$1</div>',
  );
  html = html.replace(
    /^\s*\d+\.\s+(.+)$/gm,
    '<div class="ml-4 list-decimal list-item">$1</div>',
  );
  html = html.replace(
    /^>\s?(.+)$/gm,
    '<blockquote class="my-2 border-l-4 border-skybrand-400 pl-3 text-muted-foreground">$1</blockquote>',
  );
  html = html.replace(/\n/g, "<br>");

  return html;
}
