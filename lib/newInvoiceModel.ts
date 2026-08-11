import { Db, Collection, ObjectId } from "mongodb";

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface NewInvoiceDocument {
  _id?: ObjectId;

  InvoiceID: string;

  customerName: string;

  items: InvoiceItem[];

  totalPrice: number;

  date: string;

  createdAt: string;

  notes?: string;
}

export function newInvoiceCollection(db: Db): Collection<NewInvoiceDocument> {
  return db.collection<NewInvoiceDocument>("new_invoices");
}

export async function ensureNewInvoiceIndexes(db: Db): Promise<void> {
  const collection = newInvoiceCollection(db);

  // Search invoices by customer
  await collection.createIndex({
    customerName: 1,
  });

  // Sort/filter by invoice date
  await collection.createIndex({
    date: 1,
  });

  // Ensure each invoice ID is indexed; only create a unique index if there are no duplicates.
  const indexes = await collection.indexes();
  const invoiceIndex = indexes.find(
    (index) =>
      index.name === "InvoiceID_1" ||
      index.name === "InvoiceID_unique" ||
      JSON.stringify(index.key) === JSON.stringify({ InvoiceID: 1 }),
  );

  if (!invoiceIndex) {
    const duplicateInvoiceId = await collection
      .aggregate([
        { $match: { InvoiceID: { $exists: true, $ne: null } } },
        { $group: { _id: "$InvoiceID", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 1 },
      ])
      .toArray();

    if (duplicateInvoiceId.length > 0) {
      await collection.createIndex({ InvoiceID: 1 }, { name: "InvoiceID_1" });
    } else {
      await collection.createIndex(
        { InvoiceID: 1 },
        { unique: true, name: "InvoiceID_unique" },
      );
    }
  } else if (!invoiceIndex.unique) {
    if (typeof invoiceIndex.name === "string") {
      await collection.dropIndex(invoiceIndex.name);
    }

    const duplicateInvoiceId = await collection
      .aggregate([
        { $match: { InvoiceID: { $exists: true, $ne: null } } },
        { $group: { _id: "$InvoiceID", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $limit: 1 },
      ])
      .toArray();

    if (duplicateInvoiceId.length > 0) {
      await collection.createIndex({ InvoiceID: 1 }, { name: "InvoiceID_1" });
    } else {
      await collection.createIndex(
        { InvoiceID: 1 },
        { unique: true, name: "InvoiceID_unique" },
      );
    }
  }

  // Sort recent invoices
  await collection.createIndex({
    createdAt: -1,
  });
}
