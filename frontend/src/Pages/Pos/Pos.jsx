import React, { useState, useEffect } from "react";
import { ShoppingCart, Search, X, Package } from "lucide-react";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useLiveResourceRefresh } from "../../hooks/useLiveResourceRefresh";
import useKeyboardPagination from "../../hooks/useKeyboardPagination";

import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import ProductGrid from "../../components/ProductGrid";
import CategoryFilter from "../../components/CategoryFilter";

import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";

function Pos() {
  const { user } = useAuthContext();
  const { isMobile } = useIsMobile();
  const inventoryLiveKey = useLiveResourceRefresh(["inventory", "supply", "sales"]);
  const catalogLiveKey = useLiveResourceRefresh(["categories", "inventory"]);

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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch categories once
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, catalogLiveKey]);

  // ✅ Fetch products when filters/search/page change
  useEffect(() => {
    if (user?.token) {
      fetchProducts(user.token, {
        page: currentPage,
        limit: 16, // 4 rows × 4 columns = 16 products per page
        search: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
      });
    }
  }, [user, currentPage, searchQuery, selectedCategory, selectedBrand, fetchProducts, inventoryLiveKey]);

  // ✅ Handlers
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

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setCurrentPage(1);
  };

  const loading = productLoading || categoryLoading;
  const error = productError || categoryError;

  // Add keyboard pagination
  useKeyboardPagination(currentPage, pages, setCurrentPage);

  // Build a unique list of brands from currently loaded products
  const brandOptions = Array.from(
    new Set(
      (products || [])
        .map((p) => (p.brand || "").trim())
        .filter((b) => b.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  // ✅ Error State
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error shadow-sm max-w-md text-sm py-2">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-5 w-5"
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
              <h3 className="font-bold text-sm">Error!</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" tabIndex="0">
      <div className="w-full px-2 sm:px-3 lg:px-3 xl:px-4 py-2 sm:py-3 ml-4 sm:ml-6 lg:ml-8 transform scale-98 origin-top-left">
        {/* Header + Search */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-400 rounded-lg shadow-md flex-shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                  POS
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Select products to add to cart
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-4">
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

          {/* Product Grid */}
          {loading ? (
            <Loading />
          ) : products?.length > 0 ? (
            <ProductGrid products={products} user={user} isMobile={isMobile} showAutoConvertInfo={true} />
          ) : (
            <div className="hero min-h-[300px]">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <div className="text-4xl mb-3">📦</div>
                  <h1 className="text-lg sm:text-xl font-bold text-base-content/70">
                    No Products Found
                  </h1>
                  <p className="py-2 text-sm text-base-content/50">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "No products available at the moment"}
                  </p>
                  {searchQuery && (
                    <button className="btn btn-primary btn-sm" onClick={clearSearch}>
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-6 w-full">
              <Pagination
                page={currentPage}
                pages={pages}
                onPageChange={setCurrentPage}
                variant="yellow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pos;
