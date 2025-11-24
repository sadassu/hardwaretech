// src/components/SearchBar.jsx
import React from "react";
import { Search, X, Loader2 } from "lucide-react"; // ✅ Lucide icons

const SearchBar = ({
  search,
  onSearchChange,
  onClear,
  isSearching = false,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        {/* Enhanced Search Input */}
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-14 pr-14 py-4 bg-white border-2 border-gray-200 rounded-2xl 
                     text-base text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                     transition-all duration-200 shadow-sm hover:shadow-md
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
          value={search}
          onChange={onSearchChange}
          disabled={isSearching}
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

        {/* Loading Spinner */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" strokeWidth={2.5} />
          </div>
        )}

        {/* Enhanced Clear Button */}
        {search && !isSearching && (
          <button
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 
                     w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 
                     flex items-center justify-center transition-all duration-200
                     hover:scale-110 active:scale-95 group/clear"
            aria-label="Clear search"
          >
            <X 
              className="h-4 w-4 text-gray-600 group-hover/clear:text-gray-800 transition-colors" 
              strokeWidth={2.5} 
            />
          </button>
        )}
      </div>

      {/* Search Results Indicator */}
      {search && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 mt-1 animate-fade-in">
          Searching for "{search}"...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
