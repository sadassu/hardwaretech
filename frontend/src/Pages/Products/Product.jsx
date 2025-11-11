import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";

import { formatDatePHT } from "../../utils/formatDate";

import CreateProduct from "./CreateProduct";
import DeleteProduct from "./DeleteProduct";
import UpdateProduct from "./UpdateProduct";
import CreateVariant from "../Variants/CreateVariant";
import DeleteVariant from "../Variants/DeleteVariant";
import UpdateVariant from "../Variants/UpdateVariant";
import RestockVariant from "../Variants/RestockVariant";

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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch categories only once
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Debounce search input
  useEffect(() => {
    if (search !== debouncedSearch) setIsSearching(true);

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // ✅ Fetch products
  useEffect(() => {
    if (!user?.token) return;
    fetchProducts(user.token, {
      page: currentPage,
      search: debouncedSearch,
      category: selectedCategory,
    });
  }, [
    user?.token,
    currentPage,
    debouncedSearch,
    selectedCategory,
    fetchProducts,
  ]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
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
              search={search}
              onSearchChange={handleSearchChange}
              onClear={clearSearch}
              isSearching={isSearching}
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
        {(search || selectedCategory) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-base">Active filters:</span>
            {search && (
              <div className="badge badge-primary badge-lg gap-2">
                Search: "{search}"
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
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300"
                >
                  <div className="card-body p-6">
                    {/* Product Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      {/* Image */}
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={product?.image || "/placeholder.png"}
                            alt={product?.name || "No image"}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="card-title text-xl lg:text-2xl">
                            {product.name}
                          </h2>
                          <div className="badge badge-secondary badge-lg font-semibold">
                            {product.category?.name || "Uncategorized"}
                          </div>
                        </div>
                        <div className="text-sm text-base-content/70">
                          Created {formatDatePHT(product.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                        <CreateVariant product={product} />
                        <UpdateProduct product={product} />
                        <DeleteProduct product={product} />
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="divider my-4"></div>
                    {product.variants?.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {product.variants.map((variant) => (
                          <div
                            key={variant._id}
                            className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200 border border-base-300"
                          >
                            <div className="card-body p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">
                                    {variant.size} {variant.unit}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div
                                      className={`badge badge-sm ${
                                        variant.quantity === 0
                                          ? "bg-[#F05454] text-white"
                                          : variant.quantity <= 50
                                          ? "bg-yellow-400 text-black"
                                          : "badge-outline"
                                      }`}
                                    >
                                      Qty: {variant.quantity}
                                    </div>
                                    <div className="badge badge-success badge-sm text-success-content font-semibold">
                                      ₱{variant.price}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="card-actions justify-end mt-3">
                                <UpdateVariant variant={variant} />
                                <DeleteVariant variant={variant} />
                                <RestockVariant variantId={variant._id} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-base-content/70 italic">
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
                    {search || selectedCategory
                      ? "No products match your filters"
                      : "Start by creating your first product"}
                  </p>
                  {(search || selectedCategory) && (
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
