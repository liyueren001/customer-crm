"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createCustomer, updateCustomer } from "@/lib/customers/actions";
import {
  initialCustomerFormState,
  type CustomerFormValues,
} from "@/lib/customers/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  customerId?: string;
  initialValues?: CustomerFormValues;
  submitLabel?: string;
  pendingLabel?: string;
}

export function CustomerForm({
  customerId,
  initialValues,
  submitLabel = "Save Customer",
  pendingLabel = "Saving...",
}: CustomerFormProps) {
  const action = customerId
    ? updateCustomer.bind(null, customerId)
    : createCustomer;
  const initialState = initialValues
    ? { error: null, fieldErrors: {}, values: initialValues }
    : initialCustomerFormState;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={200}
          defaultValue={state.values.name}
          required
          aria-invalid={!!state.fieldErrors.name}
        />
        {state.fieldErrors.name && (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={state.values.email}
          aria-invalid={!!state.fieldErrors.email}
        />
        {state.fieldErrors.email && (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          defaultValue={state.values.phone}
          aria-invalid={!!state.fieldErrors.phone}
        />
        {state.fieldErrors.phone && (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.phone}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          defaultValue={state.values.notes}
          aria-invalid={!!state.fieldErrors.notes}
        />
        {state.fieldErrors.notes && (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.notes}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        <Link
          href="/dashboard/customers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
