import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerTable } from "@/components/customers/customer-table";
import { getCustomers } from "@/lib/customers/queries";
import {
  CUSTOMER_SEARCH_MAX_LENGTH,
  readCustomerSearchQuery,
} from "@/lib/customers/validation";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = readCustomerSearchQuery(q);
  const isSearching = query.length > 0;

  const { customers, error } = await getCustomers(query);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form method="get" className="flex flex-wrap items-center gap-2">
            <label htmlFor="customer-search" className="sr-only">
              Search customers by name
            </label>
            <Input
              id="customer-search"
              name="q"
              type="search"
              placeholder="Search customers by name"
              defaultValue={query}
              maxLength={CUSTOMER_SEARCH_MAX_LENGTH}
              className="sm:w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
            {isSearching && (
              <Link
                href="/dashboard/customers"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Clear
              </Link>
            )}
          </form>
          <Link href="/dashboard/customers/new" className={buttonVariants()}>
            Add Customer
          </Link>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          We couldn&apos;t load your customers right now. Please try again later.
        </p>
      ) : (
        <CustomerTable customers={customers} isSearching={isSearching} />
      )}
    </div>
  );
}
