import { useEffect } from "react";
import logoWhiteSrc from "@/assets/horizontal-logo-white.svg";
import {
  FALLBACK_REDIRECT_URL,
  REDIRECT_DESCRIPTION,
  REDIRECT_TITLE,
  SHORT_LINK_RESOLVE_TIMEOUT_MS,
} from "@/config/constants";
import { resolveShortLinkRedirect } from "@/services/shortLinks";
import {
  getClickContext,
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
        const clickContext = getClickContext(
          window.location,
          document.referrer,
        );
        const destinationUrl = await withTimeout(
          resolveShortLinkRedirect(slug, clickContext),
          SHORT_LINK_RESOLVE_TIMEOUT_MS,
        );

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
