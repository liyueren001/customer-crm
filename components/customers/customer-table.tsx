import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CustomerEmptyState } from "@/components/customers/customer-empty-state";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";
import type { Customer } from "@/lib/customers/types";

function formatCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CustomerTableProps {
  customers: Customer[];
  isSearching?: boolean;
}

export function CustomerTable({ customers, isSearching = false }: CustomerTableProps) {
  if (customers.length === 0) {
    if (isSearching) {
      return (
        <Card className="items-center text-center">
          <CardHeader className="items-center">
            <CardTitle>No customers match your search.</CardTitle>
            <CardDescription>
              Try a different name, or use the Clear link to see all customers.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return <CustomerEmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium text-foreground">
              {customer.name}
            </TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell>
              <time dateTime={customer.createdAt}>
                {formatCreatedAt(customer.createdAt)}
              </time>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/dashboard/customers/${customer.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Edit
                </Link>
                <DeleteCustomerButton customerId={customer.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
