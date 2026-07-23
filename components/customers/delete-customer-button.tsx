"use client";

import { useActionState, useState } from "react";

import { deleteCustomer } from "@/lib/customers/actions";
import { Button } from "@/components/ui/button";

const initialDeleteState: { error: string | null } = { error: null };

// Mounted only while confirming, so cancelling and reopening creates a fresh
// instance instead of reusing useActionState's state from a prior attempt —
// this is what prevents a stale error from a previous failed deletion.
function DeleteConfirmation({
  customerId,
  onCancel,
}: {
  customerId: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCustomer.bind(null, customerId),
    initialDeleteState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <p className="text-sm text-foreground">
        Delete this customer? This action cannot be undone.
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" variant="destructive" size="sm" disabled={pending}>
          {pending ? "Deleting..." : "Delete permanently"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        Delete
      </Button>
    );
  }

  return (
    <DeleteConfirmation
      customerId={customerId}
      onCancel={() => setConfirming(false)}
    />
  );
}
