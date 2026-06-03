import { getFirestore } from "firebase/firestore/lite";
import "./appCheck";
import { firebaseApp } from "./app";
import { connectFirestoreToEmulator } from "./emulators";

export const db = getFirestore(firebaseApp);

connectFirestoreToEmulator(db);
