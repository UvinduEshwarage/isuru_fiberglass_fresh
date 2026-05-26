import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
import fs from "fs";
import { MongoClient } from "mongodb";

const url: string = process.env.MONGODB_URL as string;

if (!url) {
  throw new Error("MONGODB_URL is not defined in environment variables");
}

async function importData() {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db("pos_db");
    const collection = db.collection("invoices");

    const filePath = "./enriched_invoices_cleaned.json";

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      throw new Error("JSON file must contain an array of records");
    }

    console.log(`Rows found: ${data.length}`);

    // Clean + normalize data (match JSON fields)
    const cleaned = data.map((row: any) => ({
      invoiceNo: row.InvoiceID || null,
      date: row.InvoiceDate ? new Date(row.InvoiceDate) : null,
      productName: row.ProductCategory?.trim() || "Unknown",
      category: row.ProductCategory?.trim() || "Uncategorized",
      quantity: Number(row.Quantity || 0),
      unitPrice: Number(row.UnitPrice || 0),
      totalPrice: Number(row.LineTotal || 0),
    }));

    // Optional: clear old data (DEV ONLY)
    await collection.deleteMany({});

    const result = await collection.insertMany(cleaned, {
      ordered: false,
    });

    console.log("Inserted documents:", result.insertedCount);
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await client.close();
  }
}

importData();