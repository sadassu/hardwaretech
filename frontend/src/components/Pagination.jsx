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
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1  p-2 text-white">
        {/* Previous button */}
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-[#222831] rounded-md font-medium transition-all duration-200 ${
            page === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-[#F05454] hover:text-white"
          }`}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-2 ">
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={`min-w-[40px] h-10 rounded-md bg-[#222831] font-medium transition-all duration-200 ${
                page === num
                  ? "bg-[#F05454] text-white shadow-md"
                  : "text-white hover:bg-[#F05454]"
              }`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-[#222831] rounded-md font-medium transition-all duration-200 ${
            page === pages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
