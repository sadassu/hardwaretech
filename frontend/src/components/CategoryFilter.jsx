import React from "react";

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
}) {
  return (
    <div className={`w-full  ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Filter by Category</span>
        {selectedCategory && (
          <button
            onClick={() => onCategoryChange("")}
            className="btn btn-error text-sm link link-hover"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange("")}
          disabled={loading}
          className={`btn btn-sm ${
            selectedCategory === "" ? "btn-primary" : "btn-outline"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            disabled={loading}
            className={`btn btn-sm capitalize ${
              selectedCategory === category._id ? "btn-primary" : "btn-outline"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
