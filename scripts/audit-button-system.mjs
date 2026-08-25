import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(root, "src");
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredSource = /(?:^|\/)[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$|\.d\.ts$/;

const allowedDirectButtonImports = new Set([
  "src/pages/CouponMetricsPage/styles.ts",
]);
const allowedDomainMotion = new Map([]);

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
  const sourcePath = relative(root, file);

  if (/rotate\(\s*360deg\s*\)/.test(source)) {
    failures.push(
      `${sourcePath}: local wait spinner; use Spinner or Button isLoading from @langyspace/ui`,
    );
  }

  if (
    /(?:\bkeyframes\s*`|@keyframes\s+[\w-]+)/.test(source) &&
    !allowedDomainMotion.has(sourcePath)
  ) {
    failures.push(
      `${sourcePath}: unclassified motion; add an exact path, reason and owner to allowedDomainMotion`,
    );
  }

  const packageImports = source.matchAll(
    /(?:import|export)\s+(?:type\s+)?(?:\{([\s\S]*?)\}|[^'"]+)\s+from\s+['"]@langyspace\/ui['"]/g,
  );
  for (const match of packageImports) {
    if (
      /\bButton(?:\s+as\s+\w+)?\b/.test(match[1] ?? match[0]) &&
      !allowedDirectButtonImports.has(sourcePath)
    ) {
      failures.push(
        `${sourcePath}: direct Button import bypasses this product boundary; use the approved local import`,
      );
    }
  }

  if (
    /type\s+\w*Button\w*\s*=\s*(?!Extract\b|Exclude\b|Pick\b|Omit\b)(?=[^;\n]*['"]primary['"])(?=[^;\n]*['"]secondary['"])[^;\n]+/.test(
      source,
    )
  ) {
    failures.push(
      `${sourcePath}: copied Button union; derive it from the public @langyspace/ui types`,
    );
  }

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
