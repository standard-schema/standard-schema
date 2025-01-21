// import {Button} from '@/components/ui/button';
import { Button, buttonVariants } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/codeblock";
import { parseMarkdown } from "@/lib/markdown";
import { Check, File, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export default async function Home() {
  // const content = readFileSync(join(process.cwd(), "index.md"), "utf-8");

  // const lines = content.split("\n").filter((line) => {
  //   // filter h1
  //   if (line.startsWith("# ")) return false;
  //   return true;
  // });

  // const html = parseMarkdown(lines.join("\n"));

  return (
    <div className="min-h-screen font-[family-name:var(--font-ibm-plex-mono)] max-w-[800px] px-4 py-8 w-full mx-auto">
      <main className="flex flex-col gap-8 items-start px-4">
        <div className="h-[15vh]" />
        <div className="flex flex-col items-center mx-auto">
          <p
            className="flex text-center text-sm font-small uppercase text-gray-900 px-4 bg-[hsl(var(--foreground))] rounded"
            style={{
              fontVariant: "small-caps",
            }}
          >
            Introducing
          </p>
          <div className="h-4" />
          <h1 className="flex text-center text-4xl">Standard Schema</h1>
          <div className="h-4" />
          <h2 className="text-gray-200">
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

        <div className="h-[10vh]" />
        <hr className="border-t-[1px] border-gray-700 w-full" />
        <div className="h-[10vh]" />
        <article
          className="flex flex-col gap-4 prose prose-gray dark:prose-invert !max-w-none text-gray-300"
          /* biome-ignore lint */
          // dangerouslySetInnerHTML={{
          //   __html: html,
          // }}
        >
          <h2>What is it?</h2>
          <p>
            Standard Schema is a standard interface designed to be implemented
            by all JavaScript and TypeScript schema libraries.
          </p>
          <p>
            The goal is to make it easier for other frameworks and libraries to
            accept user-defined schemas, without needing to implement a custom
            adapter for each schema library.Because Standard Schema is a
            *specification*, they can do so with no additional runtime
            dependencies.
          </p>

          <h2>The specification</h2>
          <p>
            The specification is designed to be minimal, to avoid conflicts with
            the API surface of existing, and to provide a mechanism for both{" "}
            <em>runtime validation</em> and <em>static type inference</em>.
            Ideally, it will require only a handful of lines of code for any
            existing library to implement this specification.
          </p>
          <p>Below is a simplified version of the specification.</p>
          <CodeBlock lang="ts">{`
            interface StandardSchemaV1<Input = unknown, Output = Input> {
              "~standard": {
                // version of Standard Schema being implemented
                version: 1;
                // the name of the validation library
                vendor: string;
                // validator function
                validate: (
                  value: unknown,
                ) => Result<Output> | Promise<Result<Output>>;
                // inferred types
                types?: { input: Input, output: Output } | undefined;
              };
            }

            type Result<Output> = 
              | { value: Output; issues?: undefined }
              | { issues: Array<{ message: string; path?: ReadonlyArray<PropertyKey | PathSegment> }> }
          `}</CodeBlock>

          <h2>What libraries implement the spec?</h2>
          <p>
            The following validation libraries have implemented the Standard
            Schema specification.
          </p>
          <p>
            If you maintain a schema library that has implemented Standard
            Schema, please{" "}
            <Link href="https://github.com/standard-schema/standard-schema/compare">
              open a PR
            </Link>{" "}
            to add it to this list. If you have questions about implementation,
            reach out on GitHub or contact
          </p>

          <table className="table-auto">
            <thead>
              <tr>
                <th>Implementer</th>
                <th>Version(s)</th>
                <th>Docs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zod</td>
                {/* <td>
                  <Link href="https://valibot.dev/">
                    <Image
                      aria-hidden
                      src="/zod.svg"
                      alt="Zod icon"
                      width={70}
                      height={70}
                    />
                  </Link>
                </td> */}
                <td>3.24.0+</td>
                <td>
                  <Link href="https://zod.dev/">zod.dev</Link>
                </td>
              </tr>
              <tr>
                <td>Valibot</td>
                {/* <td>
                  <Link href="https://valibot.dev/">
                    <Image
                      aria-hidden
                      src="/valibot.svg"
                      alt="Valibot icon"
                      width={70}
                      height={70}
                    />
                  </Link>
                </td> */}
                <td>v1.0 (including RCs)</td>
                <td>
                  <Link href="https://valibot.dev/">valibot.dev</Link>
                </td>
              </tr>
              <tr>
                <td>ArkType</td>
                {/* <td>
                  <Link href="https://arktype.io/">
                    <Image
                      aria-hidden
                      src="/arktype.svg"
                      alt="Arktype icon"
                      width={70}
                      height={70}
                    />
                  </Link>
                </td> */}
                <td>v2.0+</td>
                <td>
                  <Link href="https://arktype.io/">arktype.io</Link>
                </td>
              </tr>
              <tr>
                <td>Arri Schema</td>
                <td>v0.71.0+</td>
                <td>
                  <Link href="https://github.com/modiimedia/arri">
                    github.com/modiimedia/arri
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>

          <h2>
            How do I accept Standard Schemas in my framework/library/tool?
          </h2>
          <p>
            Let's run through a simple example of how to write a generic
            function that accepts any Standard Schema-compliant validator,
            extracts its inferred type, and uses it to validate data.
          </p>
          <CodeBlock lang="ts">
            {`
          import type { StandardSchemaV1 } from "@standard-schema/spec";
          
          export async function standardValidate<T extends StandardSchemaV1>(
            schema: T,
            input: StandardSchemaV1.InferInput<T>,
          ): Promise<StandardSchemaV1.InferOutput<T>> {
            let result = schema["~standard"].validate(input);
            if (result instanceof Promise) result = await result;

            // if the \`issues\` field exists, the validation failed
            if (result.issues) {
              throw new Error(JSON.stringify(result.issues, null, 2));
            }

            return result.value;
          }`}
          </CodeBlock>
          <p>
            This simple function can be used to accept any standard-compliant
            schema and use it to parse data in a type-safe way.
          </p>
          <CodeBlock lang="ts">
            {`
            import * as z from "zod";
            import * as v from "valibot";
            import { type } from "arktype";

            const zodResult = await standardValidate(z.string(), "hello");
            // => "hello"
            const valibotResult = await standardValidate(v.string(), "hello");
            // => "hello"
            const arktypeResult = await standardValidate(type("string"), "hello");
            // => "hello"
            `}
          </CodeBlock>

          <h2>What tools accept Standard Schema-compliant schemas?</h2>
          <p>
            The following frameworks and libraries have added support for any
            schema that conform to the Standard Schema specification.
          </p>

          <table className="table-auto">
            <thead>
              <tr>
                <th>Integrator</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link href="https://github.com/trpc/trpc">tRPC</Link>
                </td>
                <td>
                  🧙‍♀️ Move fast and break nothing. End-to-end typesafe APIs made
                  easy
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/TanStack/form">
                    TanStack Form
                  </Link>
                </td>
                <td>
                  🤖 Headless, performant, and type-safe form state management
                  for TS/JS, React, Vue, Angular, Solid, and Lit
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/tanstack/router">
                    TanStack Router
                  </Link>
                </td>
                <td>
                  A fully type-safe React router with built-in data fetching,
                  stale-while revalidate caching and first-class search-param
                  APIs
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/pingdotgg/uploadthing">
                    UploadThing
                  </Link>
                </td>
                <td>File uploads for modern web devs</td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/formwerkjs/formwerk">
                    Formwerk
                  </Link>
                </td>
                <td>
                  A Vue.js Framework for building high-quality, accessible,
                  delightful forms.
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/modevol-com/gqloom">
                    GQLoom
                  </Link>
                </td>
                <td>
                  Weave GraphQL schema and resolvers using Standard Schema
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/nuxt/ui">Nuxt UI</Link>
                </td>
                <td>
                  A UI Library for modern web apps, powered by Vue & Tailwind
                  CSS
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/unnoq/orpc">oRPC</Link>
                </td>
                <td>Typesafe APIs made simple 🪄</td>
              </tr>
              <tr>
                <td>
                  <Link href="https://github.com/victorgarciaesgi/regle">
                    Regle
                  </Link>
                </td>
                <td>
                  Type-safe model-based form validation library for Vue.js
                </td>
              </tr>
            </tbody>
          </table>
          <blockquote>
            If you've implemented Standard Schema in your library, please{" "}
            <Link href="https://github.com/standard-schema/standard-schema/compare">
              open a PR
            </Link>{" "}
            to add it to this list.
          </blockquote>

          <h2>Who wrote the spec?</h2>
          <p>
            The original concept was proposed in a 2023 tweet by{" "}
            <Link href="https://x.com/colinhacks">Colin McDonnell</Link>{" "}
            (creator of Zod).
          </p>
          <div
            className="mx-auto"
            // biome-ignore lint:
            dangerouslySetInnerHTML={{
              __html: `<blockquote class="twitter-tweet" data-theme="dark"><p lang="en" dir="ltr">What if all the type validation libraries in the ecosystem implemented a shared interface? <br><br>Then other libraries that accept user-provided schemas (e.g. tRPC) could accept any &quot;spec-compliant&quot; validator and not need to implement special logic for each lib<br><br>Proposal: <a href="https://t.co/GTTcanOoFW">pic.twitter.com/GTTcanOoFW</a></p>&mdash; Colin McDonnell (@colinhacks) <a href="https://twitter.com/colinhacks/status/1634284724796661761?ref_src=twsrc%5Etfw">March 10, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
            }}
          />
          <p>
            The final version of the spec was designed by Colin,{" "}
            <Link href="https://x.com/fabianHiller">Fabian Hiller</Link>{" "}
            (creator of Valibot), and{" "}
            <Link href="https://x.com/ssalbdivad">David Blass</Link> (creator of
            ArkType).{" "}
          </p>

          <h2>What's next?</h2>
          <p>
            The <code>1.0.0</code> version of <code>@standard-schema/spec</code>{" "}
            has been published to npm and JSR. With any luck, this will be the
            only version ever published.
          </p>
          <ul>
            <li>
              If you want to dig into the spec, it's defined as a single
              TypeScript file, available on GitHub{" "}
              <Link href="https://github.com/standard-schema/standard-schema/blob/main/packages/spec/src/index.ts">
                here
              </Link>
              .
            </li>
            <li>
              For validation library authors, refer to the{" "}
              <Link href="https://github.com/standard-schema/standard-schema">
                README
              </Link>{" "}
              for more a more comprehensive integration guide & FAQs.
            </li>
            <li>
              For other maintainers who are interested in integrating with
              Standard Schema compatible libraries, refer to the README or refer
              to other implementations like{" "}
              <Link href="https://github.com/TanStack/form/pull/1020">
                Tanstack Form
              </Link>{" "}
              or{" "}
              <Link href="https://github.com/honojs/middleware/pull/887">
                Hono Middleware
              </Link>
              .
            </li>
          </ul>

          {/* <h2>FAQ</h2>
          <p>
            These are the most frequently asked questions about Standard Schema.
            If your question is not listed, feel free to create an issue.
          </p>

          <h3>
            Do I need to include <code>@standard-schema/spec</code> as a
            dependency?
          </h3>
          <p>
            No. The <code>@standard-schema/spec</code> package is completely
            optional. You can just copy and paste the types into your project,
            or manually add the <code>~standard</code> properties to your
            existing types. But you can include{" "}
            <code>@standard-schema/spec</code> as a dev dependency and consume
            it exclusively with <code>import type</code>. The{" "}
            <code>@standard-schema/spec</code> package contains no runtime code
            and only exports types.
          </p>

          <h3>
            Why did you choose to prefix the <code>~standard</code> property
            with <code>~</code>?
          </h3>
          <p>
            The goal of prefixing the key with <code>~</code> is to both avoid
            conflicts with existing API surfaces and to de-prioritize these keys
            in auto-complete. The <code>~</code> character is one of the few
            ASCII characters that occurs after <code>A-Za-z0-9</code>{" "}
            lexicographically, so VS Code puts these suggestions at the bottom
            of the list.
          </p>
          <Image
            src="https://github.com/standard-schema/standard-schema/assets/3084745/5dfc0219-7531-481e-9691-cff5bc471378"
            alt="Screenshot showing the de-prioritization of the `~` prefix keys in VS Code."
            width={600}
            height={400}
          />

          <h3>
            Why don't you use symbols for the keys instead of the <code>~</code>{" "}
            prefix?
          </h3>
          <p>
            In TypeScript, using a plain <code>Symbol</code> inline as a key
            always collapses to a simple <code>symbol</code> type. This would
            cause conflicts with other schema properties that use symbols.
          </p>
          <CodeBlock lang="ts">{`
            const object = {
              [Symbol.for('~output')]: 'some data',
            };
            // { [k: symbol]: string }
          `}</CodeBlock>
          <p>
            By contrast, declaring the symbol externally makes it "nominally
            typed". This means that the key is sorted in autocomplete under the
            variable name (e.g. <code>testSymbol</code> below). Thus, these
            symbol keys don't get sorted to the bottom of the autocomplete list,
            unlike <code>~</code>-prefixed string keys.
          </p>
          <Image
            src="https://github.com/standard-schema/standard-schema/assets/3084745/82c47820-90c3-4163-a838-858b987a6bea"
            alt="Screenshot showing the prioritization of external symbols in VS Code"
            width={600}
            height={400}
          />

          <h3>What should I do if I only accept synchronous validation?</h3>
          <p>
            The <code>~validate</code> function does not necessarily have to
            return a <code>Promise</code>. If you only accept synchronous
            validation, you can simply throw an error if the returned value is
            an instance of the <code>Promise</code> class.
          </p>
          <CodeBlock lang="ts">{`
            import type { StandardSchemaV1 } from "@standard-schema/spec";

            function validateInput(schema: StandardSchemaV1, data: unknown) {
              const result = schema["~standard"].validate(data);
              if (result instanceof Promise) {
                throw new TypeError('Schema validation must be synchronous');
              }
              // ...
            }
          `}</CodeBlock> */}
        </article>
      </main>
      <div className="h-[15vh]" />
      <hr className="border-t-[1px] border-gray-900 w-full" />
      <div className="h-6" />
      <footer className="flex flex-row justify-between first-letter:gap-6 flex-wrap items-center">
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
          <p>© {new Date().getFullYear()}</p>
        </div>

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
