import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";

import { formatDatePHT } from "../../utils/formatDate";
import { formatVariantLabel } from "../../utils/formatVariantLabel";

import CreateProduct from "./CreateProduct";
import DeleteProduct from "./DeleteProduct";
import UpdateProduct from "./UpdateProduct";
import CreateVariant from "../Variants/CreateVariant";
import DeleteVariant from "../Variants/DeleteVariant";
import UpdateVariant from "../Variants/UpdateVariant";

import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import StockCards from "../Dashboard/StockCards";

const Product = () => {
  const { products, pages, loading, error, fetchProducts } = useProductStore();

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useCategoriesStore();

  const { user } = useAuthContext();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch categories only once
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Fetch products
  useEffect(() => {
    if (!user?.token) return;
    fetchProducts(user.token, {
      page: currentPage,
      search: searchQuery,
      category: selectedCategory,
    });
  }, [
    user?.token,
    currentPage,
    searchQuery,
    selectedCategory,
    fetchProducts,
  ]);

  const handleSearchChange = (e) => setSearchInput(e.target.value);
  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen p-4 lg:p-2">
      <div className="container mx-auto p-6">
        {/* 🧭 Header */}
        <div className="bg-[#222831] rounded-2xl p-6 mb-8 text-primary-content shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Product Management
              </h1>
              <p className="opacity-90">Manage your inventory with ease</p>
              <p className="mt-2 text-sm text-white">
                Products can have multiple <strong>variants</strong> (e.g.,
                sizes or sets). Variants track stock, prices, and details
                separately.
              </p>
            </div>

            <SearchBar
              search={searchInput}
              onSearchChange={handleSearchChange}
              onClear={clearSearch}
              onSearchSubmit={handleSearchSubmit}
              isSearching={loading}
              placeholder="Search products..."
            />
          </div>

          <div className="mt-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              loading={categoriesLoading}
            />
          </div>
        </div>

        {/* 🧩 Filters Active */}
        {(searchQuery || selectedCategory) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-base">Active filters:</span>
            {searchQuery && (
              <div className="badge badge-primary badge-lg gap-2">
                Search: "{searchQuery}"
                <button onClick={clearSearch} className="btn btn-ghost btn-xs">
                  ✕
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="badge badge-secondary badge-lg gap-2">
                Category:{" "}
                {categories.find((c) => c._id === selectedCategory)?.name ||
                  "Selected"}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <button
              onClick={clearAllFilters}
              className="btn btn-ghost btn-sm ml-2"
            >
              Clear All Filters
            </button>
          </div>
        )}

        <div className="mb-4">
          <StockCards />
        </div>
        {/* ➕ Create Product */}
        <div className="mb-8">
          <CreateProduct onSuccess={() => fetchProducts(user.token)} />
        </div>

        {/* ⏳ Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3">
              <span className="loading loading-dots loading-md text-primary"></span>
              <span className="text-base text-base-content/70">
                Updating results...
              </span>
            </div>
          </div>
        )}

        {/* ⚠️ Error */}
        {!loading && error && (
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        )}

        {/* 📦 Product List */}
        {!loading && !error && (
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6 space-y-6">
                    {/* Product Header */}
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                          <img
                            src={product?.image || "/placeholder.png"}
                            alt={product?.name || "No image"}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                          />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {product.name}
                          </h2>
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wide">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Created {formatDatePHT(product.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <CreateVariant product={product} />
                        <UpdateProduct product={product} />
                        <DeleteProduct product={product} />
                      </div>
                    </div>

                    {/* Variants */}
                    {product.variants?.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {product.variants.map((variant) => {
                          const availableQty =
                            variant.availableQuantity ?? variant.quantity ?? 0;
                          const qtyClass =
                            availableQty === 0
                              ? "bg-red-100 text-red-700 border-red-200"
                              : availableQty <= 15
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-green-100 text-green-700 border-green-200";
                          const sourceVariant = variant.conversionSource
                            ? product.variants.find(
                                (v) => v._id === variant.conversionSource
                              )
                            : null;

                          return (
                          <div
                            key={variant._id}
                              className="rounded-2xl border-2 border-gray-100 bg-gray-50/70 hover:border-blue-200 transition-all duration-200 p-4 flex flex-col gap-3"
                          >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {formatVariantLabel(variant) || `${variant.size || ""} ${variant.unit || ""}`.trim()}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                                    <span
                                      className={`px-2.5 py-1 rounded-full border font-semibold ${qtyClass}`}
                                    >
                                      Qty: {availableQty}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">
                                      ₱{variant.price}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {(variant.autoConvert && sourceVariant) ||
                              variant.conversionNotes ? (
                                <div className="text-xs text-blue-500 font-medium">
                                  {variant.autoConvert && sourceVariant
                                    ? `Auto converts from ${
                                        sourceVariant.size
                                          ? `${sourceVariant.size} ${sourceVariant.unit || ""}`
                                          : sourceVariant.unit || "source"
                                      } · ${variant.conversionQuantity || 1} ${
                                        variant.unit
                                      } each`
                                    : variant.conversionNotes}
                                </div>
                              ) : null}

                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 mt-auto">
                                <UpdateVariant variant={variant} product={product} />
                                <DeleteVariant variant={variant} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-200 rounded-2xl">
                        No variants available — add one to manage stock.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-base-content/70">
                    {searchQuery || selectedCategory
                      ? "No products match your filters"
                      : "Start by creating your first product"}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-primary btn-wide mt-4"
                    >
                      Clear All Filters & Show All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📄 Pagination */}
        <Pagination
          page={currentPage}
          pages={pages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Product;
