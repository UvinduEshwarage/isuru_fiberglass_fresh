import { Db, Collection, ObjectId } from "mongodb";

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface NewInvoiceDocument {
  _id?: ObjectId;

  customerName: string;

  items: InvoiceItem[];

  totalPrice: number;

  date: string;

  createdAt: string;

  notes?: string;
}

export function newInvoiceCollection(
  db: Db
): Collection<NewInvoiceDocument> {
  return db.collection<NewInvoiceDocument>("new_invoices");
}

export async function ensureNewInvoiceIndexes(
  db: Db
): Promise<void> {

  const collection = newInvoiceCollection(db);

  // Search invoices by customer
  await collection.createIndex({
    customerName: 1,
  });

  // Sort/filter by invoice date
  await collection.createIndex({
    date: 1,
  });

  // Sort recent invoices
  await collection.createIndex({
    createdAt: -1,
  });
}