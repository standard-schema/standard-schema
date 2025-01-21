import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import AnchorPlugin from "markdown-it-anchor";

async function createMarkdown() {
  if ((globalThis as any).md) return (globalThis as any).md;
  const md = MarkdownIt();

  md.use(
    await Shiki({
      themes: {
        light: "vitesse-light",
        dark: "vitesse-black",
      },
    }),
  );
  md.use(AnchorPlugin);

  (globalThis as any).md = md;
  return md;
}
// const md = MarkdownIt();

// md.use(
//   await Shiki({
//     themes: {
//       light: "vitesse-light",
//       dark: "vitesse-black",
//     },
//   }),
// );
// md.use(AnchorPlugin);

// export { md };

export async function parseMarkdown(markdown: string) {
  return (await createMarkdown()).render(markdown);
}
