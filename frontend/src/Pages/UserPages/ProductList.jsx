import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";
import { AlertCircle, Search, X, Package } from "lucide-react";

import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import ProductGrid from "../../components/ProductGrid";
import CategoryFilter from "../../components/CategoryFilter";
import { useIsMobile } from "../../hooks/useIsMobile";

function ProductList() {
  const { products, pages, loading, error, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { user } = useAuthContext();

  const { isMobile } = useIsMobile();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch products when dependencies change
  useEffect(() => {
    if (user?.token) {
      fetchProducts(user.token, {
        page,
        search: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
      });
    }
  }, [page, searchQuery, selectedCategory, selectedBrand, user?.token, fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset to first page when category changes
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPage(1);
  };

  // Build a unique list of brands from currently loaded products
  const brandOptions = Array.from(
    new Set(
      (products || [])
        .map((p) => (p.brand || "").trim())
        .filter((b) => b.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  if (loading && !products?.length && !searchQuery && !selectedCategory && !selectedBrand) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <span className="text-base">Error loading products: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
        {/* Category Filter with Search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Filter by Category</h3>
          </div>
          
          {/* Brand + Search */}
          <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto max-w-3xl">
            {/* Brand selector */}
            <div className="flex md:flex-1">
              <select
                value={selectedBrand}
                onChange={handleBrandChange}
                className="w-full md:w-56 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 text-sm"
              >
                <option value="">All brands</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="flex w-full md:flex-[2] gap-2"
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
                className="px-3 sm:px-4 py-2 bg-red-400 text-white font-medium rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 flex-shrink-0 text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>
        </div>
        
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          loading={loading}
          hideHeader={true}
        />
      </div>

      {/* Active Filters Indicator */}
      {(searchQuery || selectedCategory || selectedBrand) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
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
          {selectedBrand && (
            <div className="badge badge-accent badge-lg gap-2">
              Brand: {selectedBrand}
              <button
                onClick={() => setSelectedBrand("")}
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

      {/* Loading State for Products */}
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

      {/* Products Grid */}
      <ProductGrid products={products} user={user} isMobile={isMobile} />

      {/* Pagination */}
      <Pagination page={page} pages={pages} onPageChange={setPage} variant="yellow" />

      {/* No Products Found */}
      {products?.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Search
                className="mx-auto h-16 w-16 text-base-content/30"
                strokeWidth={1}
              />
            </div>
            <h3 className="text-2xl font-bold text-base-content/80 mb-3">
              No products found
            </h3>
            <p className="text-base text-base-content/60 mb-6 leading-relaxed">
              We couldn't find any products matching your search criteria. Try
              using different keywords or browse all products.
            </p>
            {(searchQuery || selectedCategory || selectedBrand) && (
              <button
                onClick={clearAllFilters}
                className="btn btn-primary btn-wide"
              >
                Clear All Filters & Show All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
