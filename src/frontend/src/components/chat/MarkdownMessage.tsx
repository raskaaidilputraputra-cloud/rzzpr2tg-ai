import { renderMarkdown } from "@/lib/markdown";
import { useMemo } from "react";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/** Renders an assistant reply as formatted markdown. */
export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: content is escaped inside renderMarkdown before tags are added
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
