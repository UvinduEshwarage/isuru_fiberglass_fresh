import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import {
  ensureProductIndexes,
  productCollection,
  ProductDocument,
} from "../../../lib/productModel";
import cloudinary from "../../../lib/cloudinary";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";

  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  const db = await connectDB();

  await ensureProductIndexes(db);

  const search = request.nextUrl.searchParams.get("search") || "";

  const limitParam = request.nextUrl.searchParams.get("limit");

  const skipParam = request.nextUrl.searchParams.get("skip");

  const filter: any = {
    active: true,
  };

  if (search) {
    const q = new RegExp(search, "i");

    filter.$or = [
      { productId: q },
      { name: q },
      { category: q },
      { description: q },
    ];
  }

  let cursor = productCollection(db).find(filter).sort({ name: 1 });

  if (limitParam) {
    const limit = Number(limitParam);

    if (!Number.isNaN(limit) && limit > 0) {
      cursor = cursor.limit(limit);
    }
  }

  if (skipParam) {
    const skip = Number(skipParam);

    if (!Number.isNaN(skip) && skip > 0) {
      cursor = cursor.skip(skip);
    }
  }

  const products = await cursor.toArray();

  const normalizedProducts = products.map((product) => ({
    ...product,
    _id: product._id?.toString() || "",
  }));

  return NextResponse.json({
    products: normalizedProducts,
  });
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const productId = String(formData.get("productId") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "Uncategorized").trim();
    const description = String(formData.get("description") || "").trim();
    const stock = Number(formData.get("stock") || 0);
    const price = Number(formData.get("price") || 0);
    const active = String(formData.get("active")) !== "false";
    const image = formData.get("image");
    if (!productId || !name) {
      return NextResponse.json(
        {
          error: "Missing required product fields",
        },
        {
          status: 400,
        },
      );
    }

    let imageData:
      | {
          url: string;
          publicId: string;
        }
      | undefined;

    /*
     * Upload image to Cloudinary
     */
    if (image instanceof File && image.size > 0) {
      // Basic validation
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: "Only image files are allowed.",
          },
          {
            status: 400,
          },
        );
      }

      // 5 MB limit
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: "Image must be smaller than 5MB.",
          },
          {
            status: 400,
          },
        );
      }

      const bytes = await image.arrayBuffer();

      const buffer = Buffer.from(bytes);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(result);
            },
          )
          .end(buffer);
      });

      imageData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const product: ProductDocument = {
      productId,
      name,
      category,
      description,
      stock,
      price,
      active,

      image: imageData,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await connectDB();

    await ensureProductIndexes(db);

    const result = await productCollection(db).insertOne(product);

    return NextResponse.json(
      {
        product: {
          ...product,
          _id: result.insertedId.toString(),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to create product",
      },
      {
        status: 500,
      },
    );
  }
}
