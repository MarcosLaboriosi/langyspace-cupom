import { doc, getDoc } from "firebase/firestore/lite";
import { SHORT_LINKS_COLLECTION } from "@/config/constants";
import { db } from "@/lib/firebase/firestore";
import { mapShortLinkData } from "./utils";
import type { ShortLinkModel } from "./types";

export const getShortLink = async (
  slug: string,
): Promise<ShortLinkModel | null> => {
  const snapshot = await getDoc(doc(db, SHORT_LINKS_COLLECTION, slug));

  if (!snapshot.exists()) {
    return null;
  }

  return mapShortLinkData(slug, snapshot.data());
};
