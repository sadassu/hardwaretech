import React, { useState, useEffect } from "react";
import { Calendar, Package, Search, X } from "lucide-react";
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
import CategoryFilter from "../../components/CategoryFilter";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full px-2 sm:px-3 lg:px-3 xl:px-4 py-2 sm:py-3 ml-4 sm:ml-6 lg:ml-8 transform scale-98 origin-top-left">
        {/* Header + Search */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-md flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                  Inventory
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Manage your inventory with ease
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Category Filter with Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Filter by Category</h3>
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange("")}
                  className="flex items-center gap-1.5 px-3 py-1.5 
                             bg-red-50 hover:bg-red-100 border-2 border-red-200 
                             rounded-lg text-sm font-semibold text-red-600 
                             transition-all duration-200 hover:scale-105 active:scale-95
                             shadow-sm hover:shadow ml-2"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                  Clear
                </button>
              )}
            </div>
            
            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="flex w-full sm:w-auto gap-2 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 flex-shrink-0 text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            loading={categoriesLoading}
            hideHeader={true}
          />
        </div>

        {/* 🧩 Filters Active */}
        {(searchQuery || selectedCategory) && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs">Active filters:</span>
            {searchQuery && (
              <div className="badge badge-primary badge-xs gap-1">
                Search: "{searchQuery}"
                <button onClick={clearSearch} className="btn btn-ghost btn-xs">
                  ✕
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="badge badge-secondary badge-xs gap-1">
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
              className="btn btn-ghost btn-xs ml-1.5"
            >
              Clear All
            </button>
          </div>
        )}
        {/* ➕ Create Product */}
        <div className="mb-3">
          <CreateProduct onSuccess={() => fetchProducts(user.token)} />
        </div>

        {/* ⏳ Loading */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <span className="loading loading-dots loading-sm text-primary"></span>
              <span className="text-sm text-base-content/70">
                Updating results...
              </span>
            </div>
          </div>
        )}

        {/* ⚠️ Error */}
        {!loading && error && (
          <div className="alert alert-error shadow-sm text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        {/* 📦 Product List */}
        {!loading && !error && (
          <div className="space-y-2 sm:space-y-3">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Product Header */}
                    <div className="flex flex-col lg:flex-row gap-3">
                      {/* Image */}
                      <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                          <img
                            src={product?.image || "/placeholder.png"}
                            alt={product?.name || "No image"}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                          />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900">
                            {product.name}
                          </h2>
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wide">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDatePHT(product.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1.5">
                        <CreateVariant product={product} />
                        <UpdateProduct product={product} />
                        <DeleteProduct product={product} />
                      </div>
                    </div>

                    {/* Variants */}
                    {product.variants?.length > 0 ? (
                      <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {product.variants.map((variant) => {
                          const availableQty =
                            variant.availableQuantity ?? variant.quantity ?? 0;
                          // Use per-variant low stock threshold when available; default to 15
                          const lowStockThreshold =
                            typeof variant.lowStockThreshold === "number"
                              ? variant.lowStockThreshold
                              : 15;
                          const qtyClass =
                            availableQty === 0
                              ? "bg-red-100 text-red-700 border-red-200"
                              : availableQty <= lowStockThreshold
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-green-100 text-green-700 border-green-200";
                          const sourceVariant = variant.conversionSource
                            ? product.variants.find(
                                (v) => v._id === variant.conversionSource
                              )
                            : null;
                          const colorBubble =
                            variant.color && variant.color !== ""
                              ? variant.color
                              : null;

                          return (
                          <div
                            key={variant._id}
                              className="rounded-lg border border-gray-100 bg-gray-50/70 hover:border-blue-200 transition-all duration-200 p-2.5 sm:p-3 flex flex-col gap-2"
                          >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                                    {formatVariantLabel(variant) || `${variant.size || ""} ${variant.unit || ""}`.trim()}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
                                    <span
                                      className={`px-2 py-0.5 rounded-full border font-semibold ${qtyClass}`}
                                    >
                                      Qty: {availableQty}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">
                                      ₱{variant.price}
                                    </span>
                                  </div>
                                  {colorBubble && (
                                    <span
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1"
                                      style={{ color: colorBubble }}
                                    >
                                      <span
                                        className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: colorBubble }}
                                      ></span>
                                      {colorBubble}
                                    </span>
                                  )}
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

                              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-200 mt-auto">
                                <UpdateVariant variant={variant} product={product} />
                                <DeleteVariant variant={variant} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 italic border border-dashed border-gray-200 rounded-lg text-sm">
                        No variants available — add one to manage stock.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body text-center py-8">
                  <h3 className="text-lg font-semibold mb-1.5">
                    No products found
                  </h3>
                  <p className="text-sm text-base-content/70">
                    {searchQuery || selectedCategory
                      ? "No products match your filters"
                      : "Start by creating your first product"}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-primary btn-sm btn-wide mt-3"
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
