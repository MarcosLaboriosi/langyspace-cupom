export const redirectTo = (destinationUrl: string) => {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("redirectAuditFixture")
  ) {
    window.dispatchEvent(
      new CustomEvent("couponRedirectAuditDestination", {
        detail: destinationUrl,
      }),
    );
    return;
  }

  window.location.replace(destinationUrl);
};
