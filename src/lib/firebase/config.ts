export interface FirebaseClientConfig {
  apiKey: string;
  appCheckRecaptchaSiteKey: string;
  appId: string;
  authDomain: string;
  measurementId?: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

const readRequiredEnv = (key: string): string => {
  const value = import.meta.env[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required Firebase environment variable: ${key}`);
  }

  return value;
};

const readOptionalEnv = (key: string): string | undefined => {
  const value = import.meta.env[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: readRequiredEnv("VITE_FIREBASE_API_KEY"),
  appCheckRecaptchaSiteKey: readRequiredEnv(
    "VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY",
  ),
  appId: readRequiredEnv("VITE_FIREBASE_APP_ID"),
  authDomain: readRequiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  measurementId: readOptionalEnv("VITE_FIREBASE_MEASUREMENT_ID"),
  messagingSenderId: readRequiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  projectId: readRequiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: readRequiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
};
