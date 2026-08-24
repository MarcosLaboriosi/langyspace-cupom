import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(root, "src");
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredSource = /(?:^|\/)[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$|\.d\.ts$/;

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) return collectSourceFiles(path);
      if (!sourceExtensions.has(extname(entry.name))) return [];
      if (ignoredSource.test(relative(sourceRoot, path))) return [];

      return [path];
    }),
  );

  return files.flat();
}

const declarations = [
  { label: "native JSX button", pattern: /<button(?=[\s>])/g },
  { label: "styled.button declaration", pattern: /styled\.button\b/g },
];

const files = await collectSourceFiles(sourceRoot);
const failures = [];

for (const file of files) {
  const source = await readFile(file, "utf8");

  for (const declaration of declarations) {
    for (const match of source.matchAll(declaration.pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      failures.push(`${relative(root, file)}:${line}: ${declaration.label}`);
    }
  }
}

if (failures.length > 0) {
  console.error(
    "Button system audit failed. Compose Button or Pressable from @langyspace/ui:",
  );
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Button system audit passed: ${files.length} production source files, zero native button declarations.`,
  );
}
