import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerEmptyState() {
  return (
    <Card className="items-center text-center">
      <CardHeader className="items-center">
        <CardTitle>No customers yet</CardTitle>
        <CardDescription>
          Customers you add will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the Add Customer button above to create your first record.
        </p>
      </CardContent>
    </Card>
  );
}
