import { Db, Collection, ObjectId } from "mongodb";

export interface InvoiceDocument {
  _id?: ObjectId;

  InvoiceID: string;

  Year: number;
  Month: number;
  Quarter: string;
  MonthName: string;

  ProductCategory: string;
  Quantity: number;

  IsSeasonal: number;

  MonthlyRevenue: number;
}

export function invoiceCollection(db: Db): Collection<InvoiceDocument> {
  return db.collection<InvoiceDocument>("invoices");
}

export async function ensureInvoiceIndexes(db: Db) {
  const collection = invoiceCollection(db);

  await collection.createIndex({ InvoiceID: 1 });

  await collection.createIndex({
    Year: 1,
    Month: 1,
  });

  await collection.createIndex({
    ProductCategory: 1,
  });

  await collection.createIndex({
    Quarter: 1,
  });
}
