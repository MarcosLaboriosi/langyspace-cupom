import {
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore/lite";

type FirebaseEmulatorGlobal = typeof globalThis & {
  __LANGYSPACE_COUPON_FIRESTORE_EMULATOR__?: boolean;
};

const defaultEmulatorHost = "127.0.0.1";
const defaultFirestoreEmulatorPort = 8080;

const shouldUseFirebaseEmulators = () =>
  import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true";

const readEnv = (key: string) => {
  const value = import.meta.env[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const readPort = (key: string, fallback: number) => {
  const value = Number(readEnv(key));

  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const connectFirestoreToEmulator = (db: Firestore) => {
  if (!shouldUseFirebaseEmulators()) {
    return;
  }

  const scope = globalThis as FirebaseEmulatorGlobal;

  if (scope.__LANGYSPACE_COUPON_FIRESTORE_EMULATOR__) {
    return;
  }

  connectFirestoreEmulator(
    db,
    readEnv("VITE_FIREBASE_FIRESTORE_EMULATOR_HOST") ?? defaultEmulatorHost,
    readPort(
      "VITE_FIREBASE_FIRESTORE_EMULATOR_PORT",
      defaultFirestoreEmulatorPort,
    ),
  );
  scope.__LANGYSPACE_COUPON_FIRESTORE_EMULATOR__ = true;
};
