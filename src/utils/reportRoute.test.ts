import { describe, expect, it } from "vitest";
import { getReportSlugFromPathname } from "./reportRoute";

describe("getReportSlugFromPathname", () => {
  it("reads a valid report slug", () => {
    expect(getReportSlugFromPathname("/relatorio/leticia10")).toBe("leticia10");
  });

  it("normalizes uppercase slugs", () => {
    expect(getReportSlugFromPathname("/relatorio/LETICIA10/")).toBe(
      "leticia10",
    );
  });

  it("returns empty for redirect paths and invalid report paths", () => {
    expect(getReportSlugFromPathname("/leticia10")).toBe("");
    expect(getReportSlugFromPathname("/relatorio/bad/extra")).toBe("");
    expect(getReportSlugFromPathname("/relatorio/-bad")).toBe("");
  });
});
