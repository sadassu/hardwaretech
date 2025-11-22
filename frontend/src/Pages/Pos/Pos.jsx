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
import SaleCards from "./SaleCards";
import StockCards from "../Dashboard/StockCards";

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
        limit: 15, // 3 rows × 5 columns = 15 products per page
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-4 border-blue-800 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Point of Sale
                </h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1">
                  Select products to add to cart
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
              <div className="text-center">
                <div className="text-blue-100 text-xs sm:text-sm font-medium">Total Products</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">
                  {products?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <SaleCards />
        </div>
        <div className="mb-6">
          <StockCards />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 pb-6">
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
          <div className="bg-white rounded-xl shadow-sm border-2 border-blue-100 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Active filters:</span>
              {search && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                  <span>Search: "{search}"</span>
                  <button 
                    onClick={clearSearch} 
                    className="w-5 h-5 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border-2 border-purple-200 rounded-lg text-sm font-medium text-purple-700">
                  <span>
                    Category: {categories.find((c) => c._id === selectedCategory)?.name || "Selected"}
                  </span>
                  <button
                    onClick={() => handleCategoryChange("")}
                    className="w-5 h-5 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors ml-auto"
              >
                Clear All
              </button>
            </div>
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
          <div className="mt-8">
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
