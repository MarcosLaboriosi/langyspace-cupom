import { describe, expect, it } from "vitest";
import { getReportIdFromPathname } from "./reportRoute";

describe("getReportIdFromPathname", () => {
  it("reads a valid report id", () => {
    expect(getReportIdFromPathname("/relatorio/rpt_8Yp2Nq4Tz6Vb1Rc5")).toBe(
      "rpt_8Yp2Nq4Tz6Vb1Rc5",
    );
  });

  it("preserves case-sensitive report ids", () => {
    expect(getReportIdFromPathname("/relatorio/Rpt8Yp2Nq4Tz6Vb1Rc5/")).toBe(
      "Rpt8Yp2Nq4Tz6Vb1Rc5",
    );
  });

  it("returns empty for redirect paths and invalid report paths", () => {
    expect(getReportIdFromPathname("/leticia10")).toBe("");
    expect(getReportIdFromPathname("/relatorio/leticia10")).toBe("");
    expect(getReportIdFromPathname("/relatorio/bad")).toBe("");
    expect(getReportIdFromPathname("/relatorio/bad/extra")).toBe("");
    expect(getReportIdFromPathname("/relatorio/abc$123")).toBe("");
  });
});
