import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer as createViteServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = resolve(
  root,
  ".local",
  "layout-audit",
  new Date().toISOString().replaceAll(":", "-"),
);
const tolerance = 2;
const height = 1100;
const captureScreenshots = process.env.LAYOUT_AUDIT_SCREENSHOTS === "1";
const timeoutMs = Number(process.env.LAYOUT_AUDIT_TIMEOUT_MS ?? 600_000);
const requestedWidths = (process.env.LAYOUT_AUDIT_WIDTHS ?? "")
  .split(",")
  .map(Number)
  .filter((width) => Number.isInteger(width) && width > 0);
const widths =
  requestedWidths.length > 0
    ? requestedWidths
    : [390, 768, 1280, 1281, 1440, 1536, 1551, 1552, 2048];
const screenshotWidths = new Set([390, 1281, 2048]);
const path = "/relatorio/rpt_ClaraDemo9Xc4Pn7";
const stressText =
  "Campanha consolidada de aquisição para alunos interessados em inglês profissional e viagens internacionais";
const stressToken =
  "campanhainstitucionalcomidentificadorextremamentelongosemespacos000000000000000000000000000000000000";

async function auditRedirectFallback(page, baseUrl, width) {
  const issues = [];
  const stats = { containers: 0, controls: 0, maskedText: 0, scenarios: 0 };
  const cases = [
    {
      id: "redirect-valid-fallback",
      expected:
        "https://langy.space/?shortLinkSlug=leticia10#aula-experimental",
      path: "/leticia10?redirectAuditFixture=failure",
    },
    {
      id: "redirect-invalid-fallback",
      expected: "https://langy.space/#aula-experimental",
      path: "/cupom/invalido?redirectAuditFixture=failure",
    },
  ];

  for (const auditCase of cases) {
    await page.goto(`${baseUrl}${auditCase.path}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => window.__layoutAuditRedirectDestinations?.length === 1,
    );
    const destination = await page.evaluate(
      () => window.__layoutAuditRedirectDestinations[0],
    );

    if (destination !== auditCase.expected) {
      issues.push({
        actualDestination: destination,
        expectedDestination: auditCase.expected,
        kind: "coupon-form-fallback-mismatch",
        path: auditCase.path,
      });
    }

    const scenario = {
      caseId: auditCase.id,
      mode: "normal",
      path: auditCase.path,
      width,
    };
    const result = await inspect(page, scenario);
    issues.push(...result.issues);
    stats.scenarios += 1;
    stats.containers += result.stats.containers;
    stats.controls += result.stats.controls;
    stats.maskedText += result.stats.maskedText;
    await screenshot(page, scenario, result.issues.length > 0);
  }

  return { issues, stats };
}

function openPort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("layout_audit_port_unavailable"));
        return;
      }
      server.close((error) =>
        error ? reject(error) : resolvePort(address.port),
      );
    });
  });
}

async function stress(page) {
  await page.evaluate(
    ({ longText, token }) => {
      const setText = (selector, value) => {
        document.querySelectorAll(selector).forEach((element) => {
          element.textContent = value;
        });
      };
      setText(".coupon-report__heading h1", longText);
      setText(
        ".coupon-report__heading > p:last-of-type",
        `${token} · ${longText}`,
      );
      setText(".coupon-report__public-link", `cupom.langy.space/${token}`);
      setText(".coupon-report__section-header h2", longText);
      setText(".coupon-report__rank-list span", longText);
      setText(
        ".coupon-report__share-list span",
        `https://social.example/${token}`,
      );
    },
    { longText: stressText, token: stressToken },
  );
  await page.evaluate(
    () => new Promise((resolveFrame) => requestAnimationFrame(resolveFrame)),
  );
}

async function inspect(page, scenario) {
  return page.evaluate(
    ({ current, allowedTolerance, forceFailure }) => {
      const issues = [];
      const stats = { containers: 0, controls: 0, maskedText: 0 };
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const fullValueAvailable = (element) =>
        Boolean(
          element.matches(".coupon-sr-only") ||
          element.getAttribute("aria-label")?.trim() ||
          element.getAttribute("title")?.trim(),
        );
      const addOverflow = (kind, element, axis, context = {}) => {
        if (!visible(element)) return;
        const overflow =
          axis === "x"
            ? element.scrollWidth - element.clientWidth
            : element.scrollHeight - element.clientHeight;
        if (overflow > allowedTolerance) {
          issues.push({
            ...current,
            ...context,
            kind,
            overflow: Math.ceil(overflow),
          });
        }
      };

      addOverflow(
        "document-horizontal-overflow",
        document.documentElement,
        "x",
      );
      document
        .querySelectorAll(
          ".coupon-splash__content, .coupon-report__hero-inner, .coupon-report__content, .coupon-report__kpi, .coupon-report__panel, .coupon-report__section-header",
        )
        .forEach((container, containerIndex) => {
          if (!visible(container)) return;
          stats.containers += 1;
          addOverflow("container-horizontal-overflow", container, "x", {
            containerIndex,
          });
          const ownerRect = container.getBoundingClientRect();
          container
            .querySelectorAll(
              ":scope > h1, :scope > h2, :scope > div, :scope > a",
            )
            .forEach((content, contentIndex) => {
              if (!visible(content)) return;
              const rect = content.getBoundingClientRect();
              if (
                rect.left < ownerRect.left - allowedTolerance ||
                rect.right > ownerRect.right + allowedTolerance
              ) {
                issues.push({
                  ...current,
                  containerIndex,
                  contentIndex,
                  kind: "content-outside-owner",
                });
              }
            });
        });

      document
        .querySelectorAll("a, button, input, select")
        .forEach((control, controlIndex) => {
          if (!visible(control)) return;
          stats.controls += 1;
          const rect = control.getBoundingClientRect();
          if (
            rect.left < -allowedTolerance ||
            rect.right > window.innerWidth + allowedTolerance
          ) {
            issues.push({
              ...current,
              controlIndex,
              kind: "control-outside-viewport",
            });
          }
          addOverflow("control-horizontal-overflow", control, "x", {
            controlIndex,
          });
        });

      document
        .querySelectorAll("h1, h2, h3, p, a, button, small, span, strong")
        .forEach((element, elementIndex) => {
          if (!visible(element) || !element.textContent?.trim()) return;
          const style = getComputedStyle(element);
          const overflowX = element.scrollWidth - element.clientWidth;
          const overflowY = element.scrollHeight - element.clientHeight;
          if (
            ((["hidden", "clip"].includes(style.overflowX) &&
              overflowX > allowedTolerance) ||
              (["hidden", "clip"].includes(style.overflowY) &&
                overflowY > allowedTolerance)) &&
            !fullValueAvailable(element)
          ) {
            stats.maskedText += 1;
            issues.push({
              ...current,
              className: String(element.className || ""),
              elementIndex,
              kind: "masked-text-without-full-value",
              overflowX: Math.ceil(overflowX),
              overflowY: Math.ceil(overflowY),
              text: element.textContent.trim().slice(0, 160),
            });
          }
        });

      if (forceFailure)
        issues.push({ ...current, kind: "forced-failure-proof" });
      return { issues, stats };
    },
    {
      allowedTolerance: tolerance,
      current: scenario,
      forceFailure: process.env.LAYOUT_AUDIT_FORCE_FAILURE === "1",
    },
  );
}

async function screenshot(page, scenario, force = false) {
  if (
    !force &&
    (!captureScreenshots ||
      (scenario.caseId === "report" && scenario.mode !== "stress") ||
      !screenshotWidths.has(scenario.width))
  ) {
    return;
  }
  await mkdir(artifacts, { recursive: true });
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: resolve(
      artifacts,
      `${scenario.caseId}-${scenario.width}-${scenario.mode}${force ? "-failure" : ""}.png`,
    ),
  });
}

async function run() {
  const port = await openPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = await createViteServer({
    configFile: resolve(root, "vite.config.ts"),
    logLevel: "error",
    root,
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { height, width: 2048 } });
    await page.addInitScript(() => {
      window.__layoutAuditRedirectDestinations = [];
      window.addEventListener("couponRedirectAuditDestination", (event) => {
        window.__layoutAuditRedirectDestinations.push(event.detail);
      });
    });
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin === baseUrl || ["blob:", "data:"].includes(url.protocol)) {
        route.continue();
      } else {
        route.abort("blockedbyclient");
      }
    });
    const issues = [];
    const totals = { containers: 0, controls: 0, maskedText: 0, scenarios: 0 };
    for (const width of widths) {
      await page.setViewportSize({ height, width });
      await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
      await page
        .locator(".coupon-report__content")
        .waitFor({ state: "visible" });
      await page
        .locator(".coupon-report__panel")
        .first()
        .waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      const thirtyDayOption = page.getByRole("button", { name: "30d" });
      await thirtyDayOption.click();
      await page.waitForFunction(() => {
        const group = document.querySelector(
          '[role="group"][aria-label="Período"]',
        );
        const selected = group?.querySelectorAll('button[aria-pressed="true"]');

        return (
          selected?.length === 1 &&
          selected.item(0).textContent?.trim() === "30d"
        );
      });
      for (const mode of ["normal", "stress"]) {
        if (mode === "stress") await stress(page);
        const scenario = { caseId: "report", mode, path, width };
        const result = await inspect(page, scenario);
        totals.scenarios += 1;
        totals.containers += result.stats.containers;
        totals.controls += result.stats.controls;
        totals.maskedText += result.stats.maskedText;
        issues.push(...result.issues);
        await screenshot(page, scenario, result.issues.length > 0);
      }
      const redirectResult = await auditRedirectFallback(page, baseUrl, width);
      issues.push(...redirectResult.issues);
      totals.scenarios += redirectResult.stats.scenarios;
      totals.containers += redirectResult.stats.containers;
      totals.controls += redirectResult.stats.controls;
      totals.maskedText += redirectResult.stats.maskedText;
    }
    const summary = {
      cases: 3,
      generatedAt: new Date().toISOString(),
      issues,
      totals,
      viewportWidths: widths,
    };
    await mkdir(artifacts, { recursive: true });
    await writeFile(
      resolve(artifacts, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    if (issues.length > 0) {
      console.error(`Layout audit failed with ${issues.length} issue(s).`);
      console.error(JSON.stringify(issues.slice(0, 40), null, 2));
      console.error(`Full report: ${resolve(artifacts, "summary.json")}`);
      process.exitCode = 1;
      return;
    }
    console.log(
      `Layout audit passed: ${totals.scenarios} scenarios, zero geometry issues.`,
    );
    console.log(`Report: ${resolve(artifacts, "summary.json")}`);
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

const timer = setTimeout(() => {
  console.error(`Layout audit exceeded the ${timeoutMs}ms safety timeout.`);
  process.exit(1);
}, timeoutMs);
timer.unref();

try {
  await run();
} finally {
  clearTimeout(timer);
}
