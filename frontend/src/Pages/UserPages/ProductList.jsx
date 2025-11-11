import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useProductStore } from "../../store/productStore";
import { useCategoriesStore } from "../../store/categoriesStore";
import { AlertCircle, Search } from "lucide-react";

import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import SearchBar from "../../components/SearchBar";
import ProductGrid from "../../components/ProductGrid";
import CategoryFilter from "../../components/CategoryFilter";
import { useIsMobile } from "../../hooks/useIsMobile";

function ProductList() {
  const { products, pages, loading, error, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { user } = useAuthContext();

  const { isMobile } = useIsMobile();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Debounce search
  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch products when dependencies change
  useEffect(() => {
    if (user?.token) {
      fetchProducts(user.token, {
        page,
        search: debouncedSearch,
        category: selectedCategory,
      });
    }
  }, [page, debouncedSearch, selectedCategory, user?.token, fetchProducts]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset to first page when category changes
  };

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setPage(1);
  };

  if (loading && !products?.length && !search && !selectedCategory) {
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
      {/* Enhanced Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <SearchBar
              search={search}
              onSearchChange={handleSearchChange}
              onClear={clearSearch}
              isSearching={isSearching}
              placeholder="Search for products..."
            />
          </div>

          {/* Search Results Info */}
          <div className="text-base text-base-content/70">
            {products?.length > 0 && (
              <span className="badge badge-outline badge-lg">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </span>
            )}
          </div>
        </div>

        {/* Active Filters Indicator */}
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
      </div>

      {/* Category Filter */}
      <CategoryFilter
        className={"mb-4"}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        loading={loading}
      />

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
      <Pagination page={page} pages={pages} onPageChange={setPage} />

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
            {(search || selectedCategory) && (
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
