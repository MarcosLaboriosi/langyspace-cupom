import { execFileSync } from "node:child_process";

const projectId = "langyspace-564b5";
const databaseId = "(default)";
const campaignId = "embaixadoras-2026";
const campaignName = "Embaixadoras";
const langyWhatsappNumber = "5534997711070";

const timestamp = (value) => ({ __firestoreType: "timestamp", value });

const collections = {
  campaigns: "marketing_campaigns",
  influencers: "marketing_influencers",
  links: "short_links",
};

const buildInstagramUrl = (handle) =>
  handle ? `https://www.instagram.com/${handle.replace(/^@/, "")}/` : null;

const buildInfluencerWhatsappUrl = (influencer) => {
  const message = `Oi, Langy.space! Vim pela influencer ${influencer.displayName} e queria usar o cupom ${influencer.defaultCouponCode}.`;

  return `https://wa.me/${langyWhatsappNumber}?text=${encodeURIComponent(message)}`;
};

const influencers = [
  {
    id: "livia",
    displayName: "Lívia",
    fullName: "Livia Tessallya Araújo Aguiar",
    internalLabel: "Livia Tessallya Araújo Aguiar",
    onboardingStatus: "pending_student_link",
    studentAccountStatus: "not_created",
    studentId: null,
    discount: {
      label: "10% off todos os meses",
      type: "percent",
      value: 10,
    },
    defaultCouponCode: "LIVIA10",
    defaultShortLinkReportId: "rpt_8Yp2Nq4Tz6Vb1Rc5",
    defaultShortLinkSlug: "livia10",
    socialProfiles: {
      instagram: {
        handle: "l.tessallya._",
        status: "active",
        url: buildInstagramUrl("l.tessallya._"),
      },
      tiktok: {
        handle: "liviaa._arauujo",
        status: "active",
        url: "https://www.tiktok.com/@liviaa._arauujo",
      },
    },
  },
  {
    id: "leticia",
    displayName: "Letícia",
    fullName: "Leticia Neves Araujo Fonseca",
    internalLabel: "Leticia Neves Araujo Fonseca",
    onboardingStatus: "pending_instagram",
    studentAccountStatus: "linked",
    studentId: "4MaNt8JjSL8fK2aveVJs",
    discount: {
      label: "10% off todos os meses",
      type: "percent",
      value: 10,
    },
    defaultCouponCode: "LETICIA10",
    defaultShortLinkReportId: "rpt_5Kq9Lm2Ta8Xc4Pn7",
    defaultShortLinkSlug: "leticia10",
    socialProfiles: {
      instagram: {
        handle: null,
        status: "pending",
        url: null,
      },
      tiktok: {
        handle: "leticianevesz",
        status: "active",
        url: "https://www.tiktok.com/@leticianevesz",
      },
    },
  },
  {
    id: "clara",
    displayName: "Clara",
    fullName: null,
    internalLabel: "Clara",
    onboardingStatus: "pending_full_name",
    studentAccountStatus: "not_created",
    studentId: null,
    discount: {
      label: "10% off todos os meses",
      type: "percent",
      value: 10,
    },
    defaultCouponCode: "CLARA10",
    defaultShortLinkReportId: "rpt_2Vn7Rb5Qx9Mz3Hd8",
    defaultShortLinkSlug: "clara10",
    socialProfiles: {
      instagram: {
        handle: "langy.space",
        status: "active",
        url: "https://www.instagram.com/langy.space/",
      },
      tiktok: {
        handle: "langy.space",
        status: "active",
        url: "https://www.tiktok.com/@langy.space",
      },
    },
  },
  {
    id: "emysuelle",
    displayName: "Emilly Suellen",
    fullName: "Emilly Suellen",
    internalLabel: "Emilly Suellen",
    onboardingStatus: "pending_instagram",
    studentAccountStatus: "linked",
    studentId: "cCNIhxCd19OHNM78jX6i",
    discount: {
      label: "10% off todos os meses",
      type: "percent",
      value: 10,
    },
    defaultCouponCode: "EMY10",
    defaultShortLinkReportId: "rpt_6Dc4Ws8Jy2Lp9Tf3",
    defaultShortLinkSlug: "emy10",
    socialProfiles: {
      instagram: {
        handle: null,
        status: "pending",
        url: null,
      },
      tiktok: {
        handle: "emysuelle",
        status: "active",
        url: "https://www.tiktok.com/@emysuelle",
      },
    },
  },
];

const getAccessToken = () =>
  execFileSync("gcloud", ["auth", "print-access-token"], {
    encoding: "utf8",
  }).trim();

const documentUrl = (collectionName, documentId) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}`;

const toFirestoreValue = (value) => {
  if (value?.__firestoreType === "timestamp") {
    return { timestampValue: value.value };
  }

  if (value === null) {
    return { nullValue: null };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }

  return {
    mapValue: {
      fields: toFirestoreFields(value),
    },
  };
};

const toFirestoreFields = (data) =>
  Object.entries(data).reduce((fields, [key, value]) => {
    fields[key] = toFirestoreValue(value);

    return fields;
  }, {});

const readExistingCreatedAt = async ({
  accessToken,
  collectionName,
  documentId,
}) => {
  const response = await fetch(documentUrl(collectionName, documentId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to read ${collectionName}/${documentId}: ${response.status} ${await response.text()}`,
    );
  }

  const document = await response.json();

  return document.fields?.createdAt?.timestampValue ?? null;
};

const upsertDocument = async ({
  accessToken,
  collectionName,
  documentId,
  data,
}) => {
  const now = new Date().toISOString();
  const existingCreatedAt = await readExistingCreatedAt({
    accessToken,
    collectionName,
    documentId,
  });

  const response = await fetch(documentUrl(collectionName, documentId), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: toFirestoreFields({
        ...data,
        createdAt: timestamp(existingCreatedAt ?? now),
        updatedAt: timestamp(now),
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to write ${collectionName}/${documentId}: ${response.status} ${await response.text()}`,
    );
  }

  console.log(`Upserted ${collectionName}/${documentId}`);
};

const buildInfluencerDocument = (influencer) => ({
  id: influencer.id,
  displayName: influencer.displayName,
  fullName: influencer.fullName,
  internalLabel: influencer.internalLabel,
  onboardingStatus: influencer.onboardingStatus,
  studentAccountStatus: influencer.studentAccountStatus,
  studentId: influencer.studentId,
  defaultCampaignId: campaignId,
  defaultCampaignName: campaignName,
  defaultCouponCode: influencer.defaultCouponCode,
  defaultShortLinkReportId: influencer.defaultShortLinkReportId,
  defaultShortLinkSlug: influencer.defaultShortLinkSlug,
  source: "influencer",
  medium: "coupon",
  socialProfiles: influencer.socialProfiles,
  notes:
    "Cadastro inicial criado antes de fechar todos os detalhes comerciais.",
});

const buildShortLinkDocument = (influencer) => ({
  reportId: influencer.defaultShortLinkReportId,
  slug: influencer.defaultShortLinkSlug,
  title: `Cupom ${influencer.displayName} 10`,
  type: "whatsapp",
  destinationUrl: buildInfluencerWhatsappUrl(influencer),
  couponCode: influencer.defaultCouponCode,
  influencerId: influencer.id,
  influencerName: influencer.displayName,
  campaignId,
  campaignName,
  source: "influencer",
  medium: "coupon",
  discountLabel: influencer.discount.label,
  discountType: influencer.discount.type,
  discountValue: influencer.discount.value,
  discountScope: "all_months",
  active: true,
});

const main = async () => {
  const accessToken = getAccessToken();

  await upsertDocument({
    accessToken,
    collectionName: collections.campaigns,
    documentId: campaignId,
    data: {
      id: campaignId,
      name: campaignName,
      status: "active",
      channel: "influencer",
      source: "influencer",
      medium: "coupon",
      defaultWhatsappNumber: langyWhatsappNumber,
      notes:
        "Campanha inicial de cupons das embaixadoras Langy.space com redirect para WhatsApp.",
    },
  });

  for (const influencer of influencers) {
    await upsertDocument({
      accessToken,
      collectionName: collections.influencers,
      documentId: influencer.id,
      data: buildInfluencerDocument(influencer),
    });

    await upsertDocument({
      accessToken,
      collectionName: collections.links,
      documentId: influencer.defaultShortLinkSlug,
      data: buildShortLinkDocument(influencer),
    });
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
