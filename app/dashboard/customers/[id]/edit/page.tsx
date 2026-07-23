import { notFound } from "next/navigation";
import Link from "next/link";

import { CustomerForm } from "@/components/customers/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerById } from "@/lib/customers/queries";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCustomerById(id);

  if (result.status === "not_found") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Edit Customer</h1>
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to customers
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit customer</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <p role="alert" className="text-sm text-destructive">
              We couldn&apos;t load this customer right now. Please try again later.
            </p>
          ) : (
            <CustomerForm
              customerId={result.customer.id}
              initialValues={{
                name: result.customer.name,
                email: result.customer.email ?? "",
                phone: result.customer.phone ?? "",
                notes: result.customer.notes ?? "",
              }}
              submitLabel="Save Changes"
              pendingLabel="Saving..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
