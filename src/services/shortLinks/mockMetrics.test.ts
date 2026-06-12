import { describe, expect, it } from "vitest";
import {
  demoShortLinkMetricsReportId,
  getDemoShortLinkMetrics,
} from "./mockMetrics";

describe("demo short link metrics", () => {
  it("uses a synthetic report id for the public example", () => {
    expect(demoShortLinkMetricsReportId).toBe("rpt_ClaraDemo9Xc4Pn7");
  });

  it("returns a high-click Clara campaign with fewer than 150 enrollments", () => {
    const shortRangeMetrics = getDemoShortLinkMetrics(7);
    const metrics = getDemoShortLinkMetrics(30);
    const longRangeMetrics = getDemoShortLinkMetrics(90);

    expect(metrics.link.influencerName).toBe("Clara");
    expect(metrics.link.couponCode).toBe("CLARA10");
    expect(metrics.link.slug).toBe("clara10");
    expect(metrics.rangeDays).toBe(30);
    expect(metrics.daily).toHaveLength(30);
    expect(metrics.funnel.clicks).toBeGreaterThan(30_000);
    expect(metrics.funnel.enrollments).toBeGreaterThan(40);
    expect(metrics.funnel.enrollments).toBeLessThan(150);
    expect(metrics.funnel.enrollments % 10).not.toBe(0);
    expect(shortRangeMetrics.funnel.enrollments).toBeLessThan(150);
    expect(shortRangeMetrics.funnel.enrollments % 10).not.toBe(0);
    expect(longRangeMetrics.funnel.clicks).toBeGreaterThan(100_000);
    expect(longRangeMetrics.funnel.enrollments).toBeLessThan(150);
    expect(longRangeMetrics.funnel.enrollments % 10).not.toBe(0);
    expect(metrics.details.topUtms.content).toHaveLength(5);
    expect(metrics.details.topRegions.length).toBeGreaterThanOrEqual(5);
    expect(metrics.details.clickHeatmap.length).toBeGreaterThanOrEqual(6);
  });
});
