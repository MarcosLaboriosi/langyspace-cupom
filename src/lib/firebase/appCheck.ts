import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { firebaseApp } from "./app";
import { firebaseConfig } from "./config";

export const appCheck = initializeAppCheck(firebaseApp, {
  isTokenAutoRefreshEnabled: true,
  provider: new ReCaptchaEnterpriseProvider(
    firebaseConfig.appCheckRecaptchaSiteKey,
  ),
});
