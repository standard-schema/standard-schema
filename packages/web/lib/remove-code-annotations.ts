export function removeCodeAnnotations(code: string) {
  const annotationRegex = /\/\/\s*\[!code\s*(?:\S.*)?\]/;

  return code
    .split("\n")
    .filter((line) => !annotationRegex.test(line))
    .join("\n");
}
