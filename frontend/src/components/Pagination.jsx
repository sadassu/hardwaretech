import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  // Generate page numbers (up to 7 visible)
  const pageNumbers = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= pages - 3) return pages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex justify-center">
      <nav className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-2 flex items-center gap-1">
        {/* Previous button */}
        <button
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            page === 1
              ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          }`}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1 sm:px-2">
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 rounded-lg font-semibold text-sm transition-all duration-200 ${
                page === num
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md scale-105"
                  : "text-gray-700 hover:bg-gray-100 active:scale-95"
              }`}
              onClick={() => onPageChange(num)}
              title={`Page ${num}`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            page === pages
              ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          }`}
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
