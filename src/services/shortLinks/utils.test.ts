import { describe, expect, it } from "vitest";
import { buildRedirectDestination } from "./utils";
import type { ShortLinkModel, UtmParams } from "./types";

const emptyUtmParams: UtmParams = {
  utm_campaign: null,
  utm_content: null,
  utm_medium: null,
  utm_source: null,
  utm_term: null,
};

const createLink = (
  overrides: Partial<ShortLinkModel> = {},
): ShortLinkModel => ({
  active: true,
  campaignId: null,
  campaignName: null,
  couponCode: null,
  destinationUrl: "https://student.langy.space/registration",
  influencerId: null,
  influencerName: null,
  medium: null,
  slug: "leticia10",
  source: null,
  title: "Cupom Leticia 10",
  type: "checkout",
  ...overrides,
});

describe("buildRedirectDestination", () => {
  it("adds couponCode to checkout links", () => {
    expect(
      buildRedirectDestination(
        createLink({
          couponCode: "LETICIA10",
        }),
        emptyUtmParams,
      ),
    ).toBe("https://student.langy.space/registration?couponCode=LETICIA10");
  });

  it("keeps an existing couponCode on checkout links", () => {
    expect(
      buildRedirectDestination(
        createLink({
          couponCode: "LETICIA10",
          destinationUrl:
            "https://student.langy.space/registration?couponCode=CLARA10",
        }),
        emptyUtmParams,
      ),
    ).toBe("https://student.langy.space/registration?couponCode=CLARA10");
  });

  it("adds UTMs and couponCode to checkout links", () => {
    expect(
      buildRedirectDestination(
        createLink({
          couponCode: "LETICIA10",
        }),
        {
          ...emptyUtmParams,
          utm_campaign: "embaixadoras-2026",
          utm_source: "tiktok",
        },
      ),
    ).toBe(
      "https://student.langy.space/registration?utm_source=tiktok&utm_campaign=embaixadoras-2026&couponCode=LETICIA10",
    );
  });

  it("does not add couponCode to non-checkout links", () => {
    expect(
      buildRedirectDestination(
        createLink({
          couponCode: "LETICIA10",
          type: "website",
        }),
        emptyUtmParams,
      ),
    ).toBe("https://student.langy.space/registration");
  });
});
