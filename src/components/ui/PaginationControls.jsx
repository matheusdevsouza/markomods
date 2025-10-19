import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPageNumbers = true,
  className = "",
  theme = "default"
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getButtonClasses = (isActive = false) => {
    if (theme === "red") {
      return isActive 
        ? "bg-red-500 hover:bg-red-600 text-white" 
        : "hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 group";
    }
    if (theme === "blue") {
      return isActive 
        ? "bg-blue-500 hover:bg-blue-600 text-white" 
        : "hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 group";
    }
    if (theme === "green") {
      return isActive 
        ? "bg-green-500 hover:bg-green-600 text-white" 
        : "hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 group";
    }
    return isActive 
      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
      : "hover:bg-primary/10 hover:border-primary/50 hover:text-primary group";
  };

  const getIconClasses = () => {
    if (theme === "red") return "group-hover:text-red-500";
    if (theme === "blue") return "group-hover:text-blue-500";
    if (theme === "green") return "group-hover:text-green-500";
    return "group-hover:text-primary";
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${getButtonClasses()} disabled:hover:text-muted-foreground`}
      >
        <ChevronLeft size={16} className={`mr-1 ${getIconClasses()}`} />
        Anterior
      </Button>

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={getButtonClasses(page === currentPage)}
              >
                {page}
              </Button>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${getButtonClasses()} disabled:hover:text-muted-foreground`}
      >
        Próxima
        <ChevronRight size={16} className={`ml-1 ${getIconClasses()}`} />
      </Button>
    </div>
  );
};

export default PaginationControls;
