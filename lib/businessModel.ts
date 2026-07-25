import { Db, Collection, ObjectId } from "mongodb";

export interface BusinessDocument {
  _id?: ObjectId;

  businessName: string;
  ownerName: string;

  email: string;
  phone: string;

  address: string;

  currency: string;

  taxRate: number;

  createdAt: string;
  updatedAt: string;
}

export function businessCollection(db: Db): Collection<BusinessDocument> {
  return db.collection<BusinessDocument>("business_settings");
}

// =========================
// Get Business Settings
// =========================

export async function findBusinessSettings(db: Db) {
  return businessCollection(db).findOne({});
}

// =========================
// Create Default Settings
// =========================

export async function createBusinessSettings(db: Db) {
  const now = new Date().toISOString();

  return businessCollection(db).insertOne({
    businessName: "Isuru Fiberglass Industries",
    ownerName: "",

    email: "",
    phone: "",

    address: "",

    currency: "LKR",

    taxRate: 0,

    createdAt: now,
    updatedAt: now,
  });
}

// =========================
// Update Settings
// =========================

export async function updateBusinessSettings(
  db: Db,
  data: Partial<BusinessDocument>,
) {
  return businessCollection(db).updateOne(
    {},
    {
      $set: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    },
  );
}

// =========================
// Ensure Default Settings
// =========================

export async function ensureBusinessSettings(db: Db) {
  const existing = await findBusinessSettings(db);

  if (!existing) {
    await createBusinessSettings(db);
  }
}
