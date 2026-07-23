import Link from "next/link";

import { CustomerForm } from "@/components/customers/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Add Customer</h1>
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to customers
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
