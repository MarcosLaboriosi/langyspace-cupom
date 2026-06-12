import { describe, expect, it } from "vitest";
import {
  demoShortLinkMetricsReportId,
  getDemoShortLinkMetrics,
} from "./mockMetrics";

describe("demo short link metrics", () => {
  it("uses a synthetic report id for the public example", () => {
    expect(demoShortLinkMetricsReportId).toBe("rpt_DudaDemo9Xc4Pn7");
  });

  it("returns a high-volume Duda campaign for public examples", () => {
    const metrics = getDemoShortLinkMetrics(30);

    expect(metrics.link.influencerName).toBe("Duda");
    expect(metrics.link.couponCode).toBe("DUDA10");
    expect(metrics.link.slug).toBe("duda10");
    expect(metrics.rangeDays).toBe(30);
    expect(metrics.daily).toHaveLength(30);
    expect(metrics.funnel.clicks).toBeGreaterThan(30_000);
    expect(metrics.funnel.paymentViews).toBeGreaterThan(5_000);
    expect(metrics.funnel.enrollments).toBeGreaterThan(2_000);
    expect(metrics.details.topUtms.content).toHaveLength(5);
    expect(metrics.details.topRegions.length).toBeGreaterThanOrEqual(5);
    expect(metrics.details.clickHeatmap.length).toBeGreaterThanOrEqual(6);
  });
});
