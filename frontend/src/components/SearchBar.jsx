// src/components/SearchBar.jsx
import React from "react";

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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Loading Spinner */}
      {isSearching && (
        <span className="absolute right-12 top-1/2 transform -translate-y-1/2 loading loading-spinner loading-sm text-primary"></span>
      )}

      {/* Clear Button */}
      {search && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
