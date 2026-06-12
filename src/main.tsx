import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./pages/CouponRedirectPage/styles.css";
import "./pages/CouponMetricsPage/styles.css";

createRoot(document.getElementById("root")!).render(<App />);
