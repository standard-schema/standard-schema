import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ArrowRight, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { parseMarkdown } from "@/lib/markdown";
import { getUrl } from "@/lib/utils";

export async function generateMetadata() {
  const title = "Standard Schema";
  const description = "Common interfaces for interoperability in TypeScript";
  const url = getUrl();
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Standard Schema",
      url,
      locale: "en_US",
      images: [
        {
          url: `${url}/og.png`,
          width: 1200,
          height: 630,
          alt: "Standard Schema logo",
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

export default async function Home() {
  const mdPath = join(process.cwd(), "..", "..", "README.md");
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
            unoptimized
          />
          <div className="h-4" />
          <h1 className="flex text-center text-3xl sm:text-4xl">
            Standard Schema
          </h1>
          <div className="h-4 text-center" />
          <h2 className="text-gray-200 text-center">
            Common interfaces for interoperability in TypeScript
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
        <hr className="border-t border-gray-700 w-full" />
        <div className="h-[3vw]" />
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/schema"
            className="border border-white rounded-lg p-6 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-semibold text-white">
                  Standard Schema
                </h3>
                <p className="text-gray-300 text-sm">
                  For entities that perform data validation
                </p>
              </div>
              <ArrowRight className="text-white shrink-0 w-5 h-5 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link
            href="/json-schema"
            className="border border-white rounded-lg p-6 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-semibold text-white">
                  Standard JSON Schema
                </h3>
                <p className="text-gray-300 text-sm">
                  For entities that are or can be converted to JSON Schema
                </p>
              </div>
              <ArrowRight className="text-white shrink-0 w-5 h-5 mt-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
        <div className="h-[3vw]" />
        <hr className="border-t border-gray-700 w-full" />
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

        {/* <Github color="white" size={50} /> */}

        {/* <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a> */}
        {/* <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to repo →
        </a> */}
      </footer>
    </div>
  );
}
