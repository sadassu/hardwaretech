import React from "react";
import { Filter, X } from "lucide-react";

/**
 * Reusable Category Filter Component (Button List Version)
 *
 * @param {Array} categories - Array of category objects from API
 * @param {string} selectedCategory - Currently selected category ID
 * @param {Function} onCategoryChange - Callback function when category changes
 * @param {boolean} loading - Optional loading state
 * @param {string} className - Optional additional CSS classes
 */
function CategoryFilter({
  categories = [],
  selectedCategory = "",
  onCategoryChange,
  loading = false,
  className = "",
  hideHeader = false,
}) {
  return (
    <div className={`w-full ${className}`}>
      {/* Enhanced Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center shadow-md">
              <Filter className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Filter by Category</h3>
          </div>
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange("")}
              className="flex items-center gap-1.5 px-3 py-1.5 
                         bg-red-50 hover:bg-red-100 border-2 border-red-200 
                         rounded-lg text-sm font-semibold text-red-600 
                         transition-all duration-200 hover:scale-105 active:scale-95
                         shadow-sm hover:shadow"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Enhanced Category Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* All Button */}
        <button
          onClick={() => onCategoryChange("")}
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm
                     transition-all duration-200 transform hover:scale-105 active:scale-95
                     shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                     ${
                       selectedCategory === ""
                         ? "bg-red-400 text-white shadow-lg scale-105"
                         : "bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50"
                     }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">📦</span>
            All
          </span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category._id;
          return (
            <button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         ${
                           isSelected
                             ? "bg-red-400 text-white shadow-lg scale-105"
                             : "bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50"
                         }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading categories...</span>
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
