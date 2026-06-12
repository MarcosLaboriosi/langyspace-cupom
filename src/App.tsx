import { CouponMetricsPage } from "./pages/CouponMetricsPage";
import { CouponRedirectPage } from "./pages/CouponRedirectPage";
import { getReportIdFromPathname } from "./utils/reportRoute";

export function App() {
  const reportId = getReportIdFromPathname(window.location.pathname);

  if (reportId) {
    return <CouponMetricsPage id={reportId} />;
  }

  return <CouponRedirectPage />;
}
