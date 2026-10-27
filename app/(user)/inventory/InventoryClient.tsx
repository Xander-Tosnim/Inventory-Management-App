"use client";
import Pagination from "@/components/pagination";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { deleteProduct, updateProduct } from "@/lib/actions/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  lowStockAt: number | null;
}

interface InventoryClientProps {
  initialData: {
    items: Product[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    searchQuery: string;
  };
}

export default function InventoryClient({ initialData }: InventoryClientProps) {
  const { items, totalPages, currentPage, pageSize, searchQuery } = initialData;
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // GSAP Elements
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".soft-landing", {
        opacity: 0,
        y: -20,
        stagger: 0.2,
      });
    },
    { scope: container,
      dependencies: [currentPage],
      revertOnUpdate: true,
     },
  );

  return (
    <div ref={container} className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Inventory
              </h1>
              <p className="text-sm text-gray-500">
                Manage your products and track inventory levels.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-lg border border-gray-200 py-3 px-4">
            <form action="/inventory" method="GET" className="flex gap-2">
              <input
                name="search"
                defaultValue={searchQuery}
                placeholder="Search products..."
                className="text-black flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="px-6 bg-purple-600 hover:bg-purple-700 text-white text-md rounded-xl cursor-pointer">
                Search
              </button>
            </form>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-black">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Low Stock At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  items.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-100 soft-landing"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.sku || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.lowStockAt || "-"}
                      </td>
                      <td className="pl-6 py-4 text-sm text-gray-500 flex gap-1">
                        <form
                          action={async (formData) => {
                            startTransition(async () => {
                              await deleteProduct(formData);
                            });
                          }}
                        >
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            disabled={isPending}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
                          >
                            {isPending ? "Deleting..." : "Delete"}
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="px-3 py-1 rounded-lg bg-gray-400 hover:bg-gray-700 text-white cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{
                  search: searchQuery,
                  pageSize: String(pageSize),
                }}
              />
            </div>
          )}
        </div>
      </main>
      {selectedProduct && (
        <EditModal
          key={selectedProduct.id}
          productForEdit={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

function EditModal({ productForEdit, onClose, }: { productForEdit: Product; onClose: () => void; }) {
  const initialValues = {
    name: productForEdit.name,
    sku: productForEdit.sku ?? "",
    price: String(productForEdit.price),
    quantity: String(productForEdit.quantity),
    lowStockAt: productForEdit.lowStockAt == null ? "" : String(productForEdit.lowStockAt),
  };

  const [values, setValues] = useState(initialValues);

  const [state, formAction, isPending] = useActionState(updateProduct, { success: false, message: "", });

  const isDirty = Object.keys(initialValues).some((key) => values[key as keyof typeof values] !== initialValues[key as keyof typeof initialValues]);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  function handleChange(field: keyof typeof initialValues, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-6xl rounded-xl bg-white p-6 shadow-xl">
        {/* Modal header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Product
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">
              Product ID: {productForEdit.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Product form */}
        <form action={formAction}>
          <input type="hidden" name="id" value={productForEdit.id} />

          <div>
            <div className="grid min-w-225 grid-cols-5 gap-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  name="name"
                  required
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  name="sku"
                  value={values.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={values.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={values.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Low Stock At
                </label>
                <input
                  name="lowStockAt"
                  type="number"
                  min="0"
                  step="1"
                  value={values.lowStockAt}
                  onChange={(e) => handleChange("lowStockAt", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {isDirty ? "You have unsaved changes." : "No changes made."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isDirty || isPending}
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>

          {state.message && !state.success && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {state.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
