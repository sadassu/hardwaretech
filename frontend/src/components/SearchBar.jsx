// src/components/SearchBar.jsx
import React from "react";
import { Search, X, Loader2 } from "lucide-react"; // ✅ Lucide icons

const SearchBar = ({
  search,
  onSearchChange,
  onClear,
  onSearchSubmit,
  isSearching = false,
  placeholder = "Search...",
  className = "",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative group">
        {/* Enhanced Search Input */}
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-14 pr-32 py-4 bg-white border-2 border-gray-200 rounded-2xl 
                     text-base text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                     transition-all duration-200 shadow-sm hover:shadow-md
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
          value={search}
          onChange={onSearchChange}
        />

        {/* Enhanced Search Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
          <Search
            className={`h-5 w-5 transition-colors duration-200 ${
              search || isSearching
                ? "text-blue-500"
                : "text-gray-400 group-hover:text-gray-600"
            }`}
            strokeWidth={2.5}
          />
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Enhanced Clear Button */}
          {search && (
            <button
              type="button"
              onClick={onClear}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 
                       flex items-center justify-center transition-all duration-200
                       hover:scale-110 active:scale-95 group/clear"
              aria-label="Clear search"
              disabled={isSearching}
            >
              <X 
                className="h-4 w-4 text-gray-600 group-hover/clear:text-gray-800 transition-colors" 
                strokeWidth={2.5} 
              />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold
                       hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200
                       disabled:bg-blue-200 disabled:cursor-not-allowed"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : (
              <Search className="h-4 w-4" strokeWidth={2.5} />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
