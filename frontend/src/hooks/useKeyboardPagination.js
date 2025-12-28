import { useEffect } from 'react';

const useKeyboardPagination = (currentPage, totalPages, onPageChange) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if there are multiple pages
      if (totalPages <= 1) return;

      switch (e.key) {
        case 'ArrowLeft':
          // Go to previous page if not on first page
          if (currentPage > 1) {
            e.preventDefault();
            onPageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          // Go to next page if not on last page
          if (currentPage < totalPages) {
            e.preventDefault();
            onPageChange(currentPage + 1);
          }
          break;
        default:
          break;
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages, onPageChange]);
};

export default useKeyboardPagination;
