import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerEmptyState } from "@/components/customers/customer-empty-state";
import type { Customer } from "@/lib/customers/types";

function formatCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
