import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { parseMarkdown } from "@/lib/markdown";
import { getUrl } from "@/lib/utils";

export async function generateMetadata() {
  const title = "Standard Schema";
  const description = "A common interface for TypeScript validation libraries";
  const url = getUrl();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Standard Schema",
      url: `${url}/schema`,
      locale: "en_US",
      images: [
        {
          url: `${url}/og.png`,
          width: 1200,
          height: 630,
          alt: "Standard Schema",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@colinhacks",
      title,
      description,
      images: [`${url}/og.png`],
    },
  } satisfies Metadata;
}

export default async function ValidatorPage() {
  const mdPath = join(process.cwd(), "..", "spec", "schema.md");
  const md = readFileSync(mdPath, "utf-8").split("<!-- start -->")[1];

  const html = await parseMarkdown(md);

  return (
    <div className="min-h-screen font-[family-name:var(--font-ibm-plex-mono)] max-w-[800px] px-4 py-8 w-full mx-auto">
      <main className="flex flex-col gap-8 items-start">
        <div className="h-[5vw]" />
        <div className="flex flex-col items-center mx-auto">
          <Image
            src="/favicon.svg"
            width="50"
            height="50"
            alt="Standard Schema fire logo"
          />
          <div className="h-4" />
          <p
            className="flex text-center text-sm font-small uppercase text-gray-900 px-12 bg-[hsl(var(--foreground))] rounded"
            style={{
              fontVariant: "small-caps",
            }}
          >
            Introducing
          </p>
          <div className="h-4" />
          <h1 className="flex text-center text-3xl sm:text-4xl">
            Standard Schema
          </h1>
          <div className="h-4 text-center" />
          <h2 className="text-gray-200 text-center">
            A common interface for TypeScript validation libraries
          </h2>
          <div className="h-8" />
          <Link
            href="https://github.com/standard-schema/standard-schema"
            className={buttonVariants({ variant: "outline" })}
          >
            <Github />
            Go to repo
          </Link>
        </div>

        <div className="h-[3vw]" />
        <hr className="border-t-2 border-gray-500 w-full" />
        <div className="h-[3vw]" />
        <article
          className="flex flex-col gap-4 prose prose-sm md:prose-base prose-gray dark:prose-invert !max-w-none text-gray-300 prose-th:border-b-2 prose-th:border-gray-500 prose-blockquote:border-l-2 prose-blockquote:border-gray-500 prose-blockquote:text-sm prose-blockquote:quote- "
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </main>
      <div className="h-[15vh]" />
      <hr className="border-t-2 border-gray-500 w-full" />
      <div className="h-6" />
      <footer className="flex flex-col text-center align-center md:flex-row-reverse md:text-start md:justify-between first-letter:gap-6 flex-wrap items-center">
        <Link
          href="https://github.com/standard-schema/standard-schema"
          className={`${buttonVariants({
            variant: "ghost",
            size: "lg",
          })} flex-none`}
        >
          <Github />
          Go to repo →
        </Link>
        <div className="h-4" />
        <div className="text-sm">
          <p>
            by{" "}
            <Link href="https://twitter.com/colinhacks" className="underline">
              @colinhacks
            </Link>
            ,{" "}
            <Link href="https://twitter.com/fabianHiller" className="underline">
              @fabianhiller
            </Link>
            , and{" "}
            <Link href="https://twitter.com/ssalbdivad" className="underline">
              @ssalbdivad
            </Link>
          </p>
          <div className="h-2" />
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
