import Link from "next/link";

import { buildCustomersUrl } from "@/lib/customers/validation";

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  query?: string;
}

export function CustomerPagination({
  currentPage,
  totalPages,
  query,
}: CustomerPaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Customer list pagination"
      className="flex items-center justify-between gap-4"
    >
      {hasPrevious ? (
        <Link
          href={buildCustomersUrl({ query, page: currentPage - 1 })}
          aria-label="Go to previous page"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      {hasNext ? (
        <Link
          href={buildCustomersUrl({ query, page: currentPage + 1 })}
          aria-label="Go to next page"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
