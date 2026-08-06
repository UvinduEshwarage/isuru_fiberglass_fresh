import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "../../../../lib/mongodb";
import { verifyJwt } from "../../../../lib/auth";
import { productCollection } from "../../../../lib/productModel";
import cloudinary from "../../../../lib/cloudinary";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  return verifyJwt(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  const db = await connectDB();
  const resolvedParams: any = await params;
  const id = String(resolvedParams.id || resolvedParams?.productId || "");
  const product = await productCollection(db).findOne({
    _id: new ObjectId(id),
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     requireAuth(request);
//   } catch (error) {
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 401 },
//     );
//   }

//   const body = await request.json().catch(() => null);
//   if (!body) {
//     return NextResponse.json({ error: "No body provided" }, { status: 400 });
//   }

//   const db = await connectDB();
//   const resolvedParams: any = await params;
//   const id = String(resolvedParams.id || "");

//   const update: any = {
//     updatedAt: new Date().toISOString(),
//   };

//   if (body.name != null) update.name = String(body.name).trim();
//   if (body.category != null) update.category = String(body.category).trim();
//   if (body.description != null)
//     update.description = String(body.description).trim();
//   if (body.stock != null) update.stock = Number(body.stock);
//   if (body.price != null) update.price = Number(body.price);
//   if (body.active != null) update.active = Boolean(body.active);

//   const result = await productCollection(db).updateOne(
//     { _id: new ObjectId(id) },
//     { $set: update },
//   );

//   if (result.matchedCount === 0) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   return NextResponse.json({ message: "Product updated" });
// }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Authentication
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const db = await connectDB();

    // 2. Find existing product
    const existingProduct = await productCollection(db).findOne({
      _id: new ObjectId(id),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3. Read multipart/form-data
    const formData = await request.formData();

    const update: any = {
      updatedAt: new Date().toISOString(),
    };

    const name = formData.get("name");
    const category = formData.get("category");
    const description = formData.get("description");
    const stock = formData.get("stock");
    const price = formData.get("price");
    const active = formData.get("active");
    const image = formData.get("image");

    // 4. Normal fields
    if (name !== null) {
      update.name = String(name).trim();
    }

    if (category !== null) {
      update.category = String(category).trim();
    }

    if (description !== null) {
      update.description = String(description).trim();
    }

    if (stock !== null) {
      const parsedStock = Number(stock);

      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json(
          { error: "Invalid stock value" },
          { status: 400 },
        );
      }

      update.stock = parsedStock;
    }

    if (price !== null) {
      const parsedPrice = Number(price);

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { error: "Invalid price value" },
          { status: 400 },
        );
      }

      update.price = parsedPrice;
    }

    if (active !== null) {
      update.active = String(active) === "true";
    }

    let newImagePublicId: string | null = null;

    // 5. New image supplied?
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed." },
          { status: 400 },
        );
      }

      // 5 MB maximum
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be smaller than 5MB." },
          { status: 400 },
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload NEW image first.
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
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
        );

        uploadStream.end(buffer);
      });

      newImagePublicId = uploadResult.public_id;

      update.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    // 6. Update MongoDB
    try {
      const result = await productCollection(db).updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: update,
        },
      );

      if (result.matchedCount === 0) {
        // Clean up newly uploaded image if DB update somehow failed.
        if (newImagePublicId) {
          await cloudinary.uploader.destroy(newImagePublicId);
        }

        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
    } catch (databaseError) {
      // Don't leave an unused new image in Cloudinary.
      if (newImagePublicId) {
        await cloudinary.uploader.destroy(newImagePublicId);
      }

      throw databaseError;
    }

    // 7. MongoDB update succeeded.
    // Now delete OLD image.
    if (
      newImagePublicId &&
      existingProduct.image?.publicId &&
      existingProduct.image.publicId !== newImagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(existingProduct.image.publicId, {
          invalidate: true,
        });
      } catch (cloudinaryError) {
        console.error("Old Cloudinary image cleanup failed:", cloudinaryError);
      }
    }

    // 8. Return updated product
    const updatedProduct = await productCollection(db).findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct
        ? {
            ...updatedProduct,
            _id: updatedProduct._id?.toString(),
          }
        : null,
    });
  } catch (error: any) {
    console.error("Update product error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to update product",
      },
      { status: 500 },
    );
  }
}

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     requireAuth(request);
//   } catch (error) {
//     return NextResponse.json({ error: (error as Error).message }, { status: 401 });
//   }

//   const db = await connectDB();
//   const resolvedParams: any = await params;
//   const id = String(resolvedParams.id || "");
//   const result = await productCollection(db).deleteOne({ _id: new ObjectId(id) });

//   if (result.deletedCount === 0) {
//     return NextResponse.json({ error: "Product not found" }, { status: 404 });
//   }

//   return NextResponse.json({ message: "Product deleted" });
// }


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 401,
      },
    );
  }

  try {
    const db = await connectDB();

    const resolvedParams: any = await params;

    const id = String(resolvedParams.id || "");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID",
        },
        {
          status: 400,
        },
      );
    }

    const product = await productCollection(db).findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Delete image from Cloudinary
     */
    if (product.image?.publicId) {
      await cloudinary.uploader.destroy(product.image.publicId, {
        invalidate: true,
      });
    }

    /*
     * Delete MongoDB product
     */
    await productCollection(db).deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to delete product",
      },
      {
        status: 500,
      },
    );
  }
}