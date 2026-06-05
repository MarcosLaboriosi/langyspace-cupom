import {
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore/lite";
import { connectFunctionsEmulator, type Functions } from "firebase/functions";

interface FirebaseEmulatorState {
  firestore: boolean;
  functions: boolean;
}

type FirebaseEmulatorGlobal = typeof globalThis & {
  __LANGYSPACE_COUPON_FIREBASE_EMULATORS__?: FirebaseEmulatorState;
};

const defaultEmulatorHost = "127.0.0.1";
const defaultFirestoreEmulatorPort = 8080;
const defaultFunctionsEmulatorPort = 5001;

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

const getEmulatorState = () => {
  const scope = globalThis as FirebaseEmulatorGlobal;

  if (!scope.__LANGYSPACE_COUPON_FIREBASE_EMULATORS__) {
    scope.__LANGYSPACE_COUPON_FIREBASE_EMULATORS__ = {
      firestore: false,
      functions: false,
    };
  }

  return scope.__LANGYSPACE_COUPON_FIREBASE_EMULATORS__;
};

export const connectFirestoreToEmulator = (db: Firestore) => {
  if (!shouldUseFirebaseEmulators()) {
    return;
  }

  const state = getEmulatorState();

  if (state.firestore) {
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
  state.firestore = true;
};

export const connectFunctionsToEmulator = (functions: Functions) => {
  if (!shouldUseFirebaseEmulators()) {
    return;
  }

  const state = getEmulatorState();

  if (state.functions) {
    return;
  }

  connectFunctionsEmulator(
    functions,
    readEnv("VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST") ?? defaultEmulatorHost,
    readPort(
      "VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT",
      defaultFunctionsEmulatorPort,
    ),
  );
  state.functions = true;
};
