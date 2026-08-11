import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "../../../../lib/mongodb";
import { verifyJwt } from "../../../../lib/auth";

import { invoiceCollection } from "../../../../lib/invoiceModel";

import { newInvoiceCollection } from "../../../../lib/newInvoiceModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

// =====================================
// GET ONE INVOICE
// =====================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  requireAuth(request);

  const { id } = await params;

  const db = await connectDB();

  // Search new invoices first
  const newInvoice = await newInvoiceCollection(db).findOne({
    _id: new ObjectId(id),
  });

  if (newInvoice) {
    return NextResponse.json({
      source: "new",
      invoice: {
        ...newInvoice,
        _id: newInvoice._id?.toString?.() || id,
      },
    });
  }

  // Search historical invoices
  const historicalInvoice = await invoiceCollection(db).findOne({
    _id: new ObjectId(id),
  });

  if (historicalInvoice) {
    return NextResponse.json({
      source: "historical",
      invoice: {
        ...historicalInvoice,
        _id: historicalInvoice._id?.toString?.() || id,
      },
    });
  }

  return NextResponse.json(
    {
      error: "Invoice not found",
    },
    {
      status: 404,
    },
  );
}
// =====================================
// UPDATE
// (NEW INVOICES ONLY)
// =====================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);

    const { id } = await params;

    const body = await request.json();

    if (body.items) {
      body.totalPrice = body.items.reduce(
        (sum: number, item: any) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0,
      );
    }

    const db = await connectDB();

    const result = await newInvoiceCollection(db).updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: body,
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: "Only new invoices can be updated",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message: "Invoice updated",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================
// DELETE
// (NEW INVOICES ONLY)
// =====================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAuth(request);

    const { id } = await params;

    const db = await connectDB();

    const result = await newInvoiceCollection(db).deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          error: "Only new invoices can be deleted",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message: "Invoice deleted",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
