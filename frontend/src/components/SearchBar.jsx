// src/components/SearchBar.jsx
import React from "react";
import { Search, X } from "lucide-react"; // ✅ Lucide icons

const SearchBar = ({
  search,
  onSearchChange,
  onClear,
  isSearching = false,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="input input-bordered input-primary w-full pl-12 pr-12 text-base text-black"
        value={search}
        onChange={onSearchChange}
      />

      {/* Search Icon */}
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50"
        strokeWidth={2}
      />

      {/* Loading Spinner */}
      {isSearching && (
        <span className="absolute right-12 top-1/2 -translate-y-1/2 loading loading-spinner loading-sm text-primary"></span>
      )}

      {/* Clear Button */}
      {search && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
