import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import dedent from "dedent";

interface Props {
  children: string;
  lang: BundledLanguage;
}

export async function CodeBlock(props: Props) {
  const out = await codeToHtml(dedent(props.children), {
    lang: props.lang,
    themes: {
      light: "vitesse-light",
      dark: "vitesse-black",
    },
  });

  // biome-ignore lint:
  return <div dangerouslySetInnerHTML={{ __html: out }} />;
}
