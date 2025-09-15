import React from "react";

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
      <div className="btn-group shadow-lg">
        {/* Previous button */}
        <button
          className="btn btn-outline"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Page numbers */}
        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`btn ${page === num ? "btn-primary" : "btn-outline"}`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}

        {/* Next button */}
        <button
          className="btn btn-outline"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
