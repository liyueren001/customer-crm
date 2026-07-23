import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerTable } from "@/components/customers/customer-table";
import { mockCustomers } from "@/lib/customers/mock-customers";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="customer-search" className="sr-only">
            Search customers by name
          </label>
          <Input
            id="customer-search"
            type="search"
            placeholder="Search customers by name"
            className="sm:w-64"
          />
          <Button type="button">Add Customer</Button>
        </div>
      </div>
      <CustomerTable customers={mockCustomers} />
    </div>
  );
}
