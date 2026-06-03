import { useEffect } from "react";
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
    <main className="coupon-page" aria-live="polite">
      <section className="coupon-panel">
        <div className="coupon-mark" aria-hidden="true">
          <span />
        </div>
        <p className="coupon-eyebrow">langy.space</p>
        <h1>{REDIRECT_TITLE}</h1>
        <p>{REDIRECT_DESCRIPTION}</p>
      </section>
    </main>
  );
};
