import { CouponMetricsPage } from "./pages/CouponMetricsPage";
import { CouponRedirectPage } from "./pages/CouponRedirectPage";
import { getReportSlugFromPathname } from "./utils/reportRoute";

export function App() {
  const reportSlug = getReportSlugFromPathname(window.location.pathname);

  if (reportSlug) {
    return <CouponMetricsPage slug={reportSlug} />;
  }

  return <CouponRedirectPage />;
}
