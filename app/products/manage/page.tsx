"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";


interface Product {
  _id: string;

  productId: string;
  name: string;
  category: string;
  description?: string;

  image?: {
    url: string;
    publicId: string;
  };

  stock: number;
  price: number;
  active: boolean;

  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
}

const CATEGORY_OPTIONS = [
  "Moulds",
  "Garden Products",
  "Construction Products",
  "Temple Products",
  "Tanks",
  "Doors",
  "Roofing Sheets",
];

function createAbbreviation(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function generateProductId(name: string, category: string) {
  if (!name.trim() || !category.trim()) {
    return "";
  }

  const categoryCode = createAbbreviation(category);
  const nameCode = createAbbreviation(name);
  const suffix = Date.now().toString().slice(-5);

  return `${categoryCode}-${nameCode}-${suffix}`;
}

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    productId: "",
    name: "",
    category: "",
    description: "",
    stock: 0,
    price: 0,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  //images
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] =
  useState<Product | null>(null);

const [editForm, setEditForm] = useState({
  name: "",
  category: "",
  description: "",
  stock: 0,
  price: 0,
  active: true,
});

const [editImage, setEditImage] =
  useState<File | null>(null);

const [editImagePreview, setEditImagePreview] =
  useState<string | null>(null);

const [updating, setUpdating] =
  useState(false);

  function openEditModal(product: Product) {
  setEditingProduct(product);

  setEditForm({
    name: product.name,
    category: product.category,
    description: product.description || "",
    stock: product.stock,
    price: product.price,
    active: product.active,
  });

  setEditImage(null);

  setEditImagePreview(
    product.image?.url || null
  );

  setError(null);
  setSuccessMessage(null);
}

function closeEditModal() {
  setEditingProduct(null);

  setEditImage(null);

  setEditImagePreview(null);

  setEditForm({
    name: "",
    category: "",
    description: "",
    stock: 0,
    price: 0,
    active: true,
  });
}
async function handleUpdate(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!editingProduct) {
    return;
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    setError(
      "Authentication required to update products."
    );

    return;
  }

  try {
    setUpdating(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();

    formData.append(
      "name",
      editForm.name
    );

    formData.append(
      "category",
      editForm.category
    );

    formData.append(
      "description",
      editForm.description
    );

    formData.append(
      "stock",
      String(editForm.stock)
    );

    formData.append(
      "price",
      String(editForm.price)
    );

    formData.append(
      "active",
      String(editForm.active)
    );

    if (editImage) {
      formData.append(
        "image",
        editImage
      );
    }

    const response = await fetch(
      `/api/products/${editingProduct._id}`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Failed to update product."
      );
    }

    // Update React state immediately.
    setProducts((prev) =>
      prev.map((product) =>
        product._id === editingProduct._id
          ? data.product
          : product
      )
    );

    setSuccessMessage(
      "Product updated successfully."
    );

    closeEditModal();
  } catch (err: any) {
    setError(err.message);
  } finally {
    setUpdating(false);
  }
}

  useEffect(() => {
    const autoProductId = generateProductId(form.name, form.category);
    setForm((prev) => {
      if (prev.productId === autoProductId) return prev;
      return { ...prev, productId: autoProductId };
    });
  }, [form.name, form.category]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to load products.");
      setLoading(false);
      return;
    }
    fetchProducts(token);
  }, []);

  async function fetchProducts(token: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProductsResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || "Unable to load products.");
      }
      setProducts(data.products || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetchProducts(token);
    }
  }, [search]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }
    const q = search.toLowerCase();
    return products.filter((product) => {
      return (
        product.productId.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  const formatCurrency = (value: number) => `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}`;

  async function handleDelete(productId: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to delete products.");
      return;
    }

    setDeletingIds((prev) => [...prev, productId]);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product.");
      }

      setProducts((prev) => prev.filter((product) => product._id !== productId));
      setSuccessMessage("Product deleted successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== productId));
    }
  }



  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    setError(
      "Authentication required to add products."
    );
    return;
  }

  setSubmitting(true);
  setSuccessMessage(null);
  setError(null);

  try {
    const formData = new FormData();

    formData.append(
      "productId",
      form.productId
    );

    formData.append(
      "name",
      form.name
    );

    formData.append(
      "category",
      form.category
    );

    formData.append(
      "description",
      form.description
    );

    formData.append(
      "stock",
      String(form.stock)
    );

    formData.append(
      "price",
      String(form.price)
    );

    formData.append(
      "active",
      String(form.active)
    );

    if (image) {
      formData.append(
        "image",
        image
      );
    }

    const response = await fetch(
      "/api/products",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Failed to create product."
      );
    }

    setProducts((prev) => [
      ...prev,
      data.product,
    ]);

    setForm({
      productId: "",
      name: "",
      category: "",
      description: "",
      stock: 0,
      price: 0,
      active: true,
    });

    setImage(null);
    setImagePreview(null);

    setSuccessMessage(
      "Product created successfully."
    );
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
}

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product management...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Product management</p>
            <h1 className="text-3xl font-semibold text-slate-900">Catalog and inventory</h1>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {products.length} products loaded
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Add a new product</p>
              <p className="text-sm text-slate-500">Create a new product SKU in the catalog.</p>
            </div>
          </div>
          {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {successMessage && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Product ID</span>
                <input
                  value={form.productId}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Auto-generated from name and category"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="Product name"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="0"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Stock</span>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="0"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Active</span>
                <select
                  value={form.active ? "true" : "false"}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value === "true" }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>
            <label className="block">
  <span className="text-sm font-medium text-slate-700">
    Product Image
  </span>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) {
        setImage(null);
        setImagePreview(null);
        return;
      }

      setImage(file);

      const previewUrl = URL.createObjectURL(file);

      setImagePreview(previewUrl);
    }}
    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
  />

  <p className="mt-2 text-xs text-slate-500">
    JPG, PNG or WebP. Maximum 5MB.
  </p>
</label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Optional product description"
                rows={3}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Saving..." : "Create Product"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Search products</p>
              <p className="text-sm text-slate-500">Filter by ID, name, category, or description.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProducts.map((product) => {
                  const deleting = deletingIds.includes(product._id);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.productId}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.category}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-900">{product.stock}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.active ? "Active" : "Inactive"}</td>
                        <td className="px-6 py-4 text-right text-sm">
  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={() => openEditModal(product)}
      className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
    >
      Edit
    </button>

    {/* <button
      type="button"
      onClick={() => handleDelete(product._id)}
      disabled={deleting}
      className="inline-flex items-center rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button> */}
    <button
  type="button"
  onClick={() => setProductToDelete(product)}
  disabled={deleting}
  className="inline-flex items-center rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
>
  {deleting ? "Deleting..." : "Delete"}
</button>
  </div>
</td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
            

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Product
                </p>

                <h2 className="text-2xl font-semibold text-slate-900">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingProduct.productId}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >

              {/* IMAGE */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Product Image
                </label>

                <div className="mt-3 flex items-center gap-5">

                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="Product preview"
                      className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
                      No image
                    </div>
                  )}

                  <div className="flex-1">

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        setEditImage(file);

                        const previewUrl =
                          URL.createObjectURL(file);

                        setEditImagePreview(
                          previewUrl
                        );
                      }}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG or WebP. Maximum 5MB.
                    </p>

                  </div>

                </div>
              </div>

              {/* NAME */}
              <label className="block">

                <span className="text-sm font-medium text-slate-700">
                  Product Name
                </span>

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />

              </label>

              {/* CATEGORY + PRICE */}
              <div className="grid gap-4 sm:grid-cols-2">

                <label>

                  <span className="text-sm font-medium text-slate-700">
                    Category
                  </span>

                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >

                    <option value="">
                      Select category
                    </option>

                    {CATEGORY_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}

                  </select>

                </label>

                <label>

                  <span className="text-sm font-medium text-slate-700">
                    Price
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: Number(
                          e.target.value
                        ),
                      }))
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  />

                </label>

              </div>

              {/* STOCK + ACTIVE */}
              <div className="grid gap-4 sm:grid-cols-2">

                <label>

                  <span className="text-sm font-medium text-slate-700">
                    Stock
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        stock: Number(
                          e.target.value
                        ),
                      }))
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  />

                </label>

                <label>

                  <span className="text-sm font-medium text-slate-700">
                    Status
                  </span>

                  <select
                    value={
                      editForm.active
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        active:
                          e.target.value ===
                          "true",
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <option value="true">
                      Active
                    </option>

                    <option value="false">
                      Inactive
                    </option>

                  </select>

                </label>

              </div>

              {/* DESCRIPTION */}
              <label className="block">

                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description:
                        e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />

              </label>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {updating
                    ? "Updating..."
                    : "Update Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
<AlertDialog
  open={!!productToDelete}
  onOpenChange={(open) => {
    if (!open) {
      setProductToDelete(null);
    }
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Delete Product?
      </AlertDialogTitle>

      <AlertDialogDescription>
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-900">
          {productToDelete?.name}
        </span>
        ? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel
        onClick={() => setProductToDelete(null)}
      >
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction
        onClick={async () => {
          if (!productToDelete) return;

          const productId = productToDelete._id;

          setProductToDelete(null);

          await handleDelete(productId);
        }}
        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
      >
        Delete Product
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}
 