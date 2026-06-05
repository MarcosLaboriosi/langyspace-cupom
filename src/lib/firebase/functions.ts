import { getFunctions } from "firebase/functions";
import "./appCheck";
import { firebaseApp } from "./app";
import { connectFunctionsToEmulator } from "./emulators";

const functionsRegion = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION;

export const functions = getFunctions(
  firebaseApp,
  typeof functionsRegion === "string" && functionsRegion.length > 0
    ? functionsRegion
    : undefined,
);

connectFunctionsToEmulator(functions);
