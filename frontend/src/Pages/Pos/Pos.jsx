import React, { useState, useEffect } from "react";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";

import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ProductGrid from "../../components/ProductGrid";
import CategoryFilter from "../../components/CategoryFilter";

import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";

function Pos() {
  const { user } = useAuthContext();
  const { isMobile } = useIsMobile();

  // ✅ Zustand stores
  const {
    products,
    pages,
    loading: productLoading,
    error: productError,
    fetchProducts,
  } = useProductStore();

  const {
    categories,
    loading: categoryLoading,
    error: categoryError,
    fetchCategories,
  } = useCategoriesStore();

  // ✅ Local state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  // ✅ Debounce search input
  useEffect(() => {
    if (search !== debouncedSearch) setIsSearching(true);

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // ✅ Fetch categories once
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Fetch products when filters/search/page change
  useEffect(() => {
    if (user?.token) {
      fetchProducts(user.token, {
        page: currentPage,
        limit,
        search: debouncedSearch,
        category: selectedCategory,
      });
    }
  }, [user, currentPage, debouncedSearch, selectedCategory, fetchProducts]);

  // ✅ Handlers
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

  const loading = productLoading || categoryLoading;
  const error = productError || categoryError;

  // ✅ Error State
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error!</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main Render
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Point of Sale
              </h1>
              <p className="text-base-content/70">
                Select products to add to cart
              </p>
            </div>
            <div className="stats shadow bg-base-100">
              <div className="stat place-items-center">
                <div className="stat-title">Total Products</div>
                <div className="stat-value text-primary">
                  {products?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search Section */}
        <div className="mb-6 relative">
          <SearchBar
            search={search}
            onSearchChange={handleSearchChange}
            onClear={clearSearch}
            isSearching={isSearching || loading}
            placeholder="Search products for POS..."
          />
          {(isSearching || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="loading loading-spinner loading-sm text-primary"></span>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(search || selectedCategory) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
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

        {/* Category Filter */}
        <CategoryFilter
          className={"mb-4"}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          loading={loading}
        />

        {/* Product Grid */}
        {loading ? (
          <Loading />
        ) : products?.length > 0 ? (
          <ProductGrid products={products} user={user} isMobile={isMobile} />
        ) : (
          <div className="hero min-h-[400px]">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">📦</div>
                <h1 className="text-2xl font-bold text-base-content/70">
                  No Products Found
                </h1>
                <p className="py-4 text-base-content/50">
                  {search
                    ? "Try adjusting your search terms"
                    : "No products available at the moment"}
                </p>
                {search && (
                  <button className="btn btn-primary" onClick={clearSearch}>
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              page={currentPage}
              pages={pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Pos;
