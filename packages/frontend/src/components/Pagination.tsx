import React from "react";
import { Pagination as BsPagination } from "react-bootstrap";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisiblePages);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <BsPagination.Prev
        key="prev"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      />
    );

    // First page
    if (startPage > 1) {
      items.push(
        <BsPagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => onPageChange(1)}
        >
          1
        </BsPagination.Item>
      );
      if (startPage > 2) {
        items.push(<BsPagination.Ellipsis key="ellipsis-1" />);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <BsPagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </BsPagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<BsPagination.Ellipsis key="ellipsis-2" />);
      }
      items.push(
        <BsPagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </BsPagination.Item>
      );
    }

    // Next button
    items.push(
      <BsPagination.Next
        key="next"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <BsPagination className="justify-content-center mt-4">
      {getPageItems()}
    </BsPagination>
  );
};

export default Pagination;