import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import AnchorPlugin from "markdown-it-anchor";
import { transformerCopyButton } from "./transformer/shiki-transformer-copy-button";

declare global {
  var md: MarkdownIt;
}

async function initMarkdownParser() {
  if (globalThis.md) return globalThis.md;
  const md = MarkdownIt({
    html: true,
  });
  md.use(
    await Shiki({
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      transformers: [
        transformerCopyButton({
          enableDarkMode: true,
          duration: 3000,
          display: "ready",
          successIcon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14 2 2 4-4'/%3E%3C/svg%3E`,
          copyIcon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1' ry='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3C/svg%3E`,
        }),
      ],
    }),
  );
  md.use(AnchorPlugin, {
    slugify(s) {
      const slug = encodeURIComponent(
        String(s)
          .toLowerCase()
          .replaceAll(/[^a-z0-9 ]+/g, "")
          .replaceAll(/ +/g, "-"),
      );

      return slug;
    },
    permalink: AnchorPlugin.permalink.headerLink(),
  });
  globalThis.md = md;
  return md;
}

export async function parseMarkdown(markdown: string) {
  const parser = await initMarkdownParser();
  return parser.render(markdown);
}
