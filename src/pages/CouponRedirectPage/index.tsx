import { useEffect } from "react";
import logoWhiteSrc from "@/assets/horizontal-logo-white.svg";
import {
  CLICK_WRITE_TIMEOUT_MS,
  FALLBACK_REDIRECT_URL,
  REDIRECT_DESCRIPTION,
  REDIRECT_TITLE,
} from "@/config/constants";
import { getShortLink, recordShortLinkClick } from "@/services/shortLinks";
import {
  buildRedirectDestination,
  getClickContext,
  isValidDestinationUrl,
  isValidSlug,
  normalizeSlug,
  withTimeout,
} from "@/services/shortLinks/utils";
import { redirectTo } from "@/utils/redirect";

export const CouponRedirectPage = () => {
  useEffect(() => {
    const runRedirect = async () => {
      const slug = normalizeSlug(window.location.pathname);

      if (!slug || !isValidSlug(slug)) {
        redirectTo(FALLBACK_REDIRECT_URL);

        return;
      }

      try {
        const link = await getShortLink(slug);

        if (!link) {
          redirectTo(FALLBACK_REDIRECT_URL);

          return;
        }

        const clickContext = getClickContext(
          window.location,
          document.referrer,
        );
        const destinationUrl = buildRedirectDestination(link, clickContext);
        const isRedirectAllowed =
          link.active && isValidDestinationUrl(destinationUrl);

        if (!isRedirectAllowed) {
          await withTimeout(
            recordShortLinkClick({
              clickContext,
              destinationUrl: isValidDestinationUrl(link.destinationUrl)
                ? link.destinationUrl
                : FALLBACK_REDIRECT_URL,
              link,
              status: link.active ? "invalid_destination" : "inactive",
            }),
            CLICK_WRITE_TIMEOUT_MS,
          ).catch(() => undefined);
          redirectTo(FALLBACK_REDIRECT_URL);

          return;
        }

        await withTimeout(
          recordShortLinkClick({
            clickContext,
            destinationUrl,
            link,
            status: "redirected",
          }),
          CLICK_WRITE_TIMEOUT_MS,
        ).catch(() => undefined);
        redirectTo(destinationUrl);
      } catch {
        redirectTo(FALLBACK_REDIRECT_URL);
      }
    };

    void runRedirect();
  }, []);

  return (
    <main className="coupon-splash">
      <section
        className="coupon-splash__content"
        aria-label={REDIRECT_TITLE}
        aria-live="polite"
        role="status"
      >
        <div className="coupon-splash__logo-wrap">
          <img
            className="coupon-splash__logo"
            alt="Langy.space"
            src={logoWhiteSrc}
          />
        </div>
        <h1 className="coupon-sr-only">{REDIRECT_TITLE}</h1>
        <p className="coupon-sr-only">{REDIRECT_DESCRIPTION}</p>
      </section>
    </main>
  );
};
