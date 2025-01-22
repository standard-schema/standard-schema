import dedent from "dedent";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

interface Props {
  children: string;
  lang: BundledLanguage;
}

export async function CodeBlock(props: Props) {
  const out = await codeToHtml(dedent(props.children), {
    lang: props.lang,
    themes: {
      light: "github-light-default",
      dark: "github-dark-default",
    },
  });

  return <div dangerouslySetInnerHTML={{ __html: out }} />;
}
