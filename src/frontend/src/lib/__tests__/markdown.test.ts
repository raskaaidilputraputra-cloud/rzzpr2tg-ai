import { renderMarkdown } from "@/lib/markdown";
import { describe, expect, it } from "vitest";

describe("renderMarkdown", () => {
  it("renders fenced code blocks as pre/code", () => {
    const html = renderMarkdown("```python\nprint('hi')\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("<code>");
    expect(html).toContain("print('hi')");
  });

  it("renders inline code, bold, and headings", () => {
    const html = renderMarkdown("# Title\n\nUse `npm` and **bold** text.");
    expect(html).toContain("<h2");
    expect(html).toContain("<code");
    expect(html).toContain("<strong");
  });

  it("escapes raw HTML so replies cannot inject markup", () => {
    const html = renderMarkdown("<script>alert('x')</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("returns an empty string for empty input", () => {
    expect(renderMarkdown("")).toBe("");
  });
});
