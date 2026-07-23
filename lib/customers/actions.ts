"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import {
  readCustomerFormValues,
  validateCustomerFormValues,
  type CustomerFormState,
} from "@/lib/customers/validation";

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  // Server Actions are independently callable and are not gated by
  // app/dashboard/layout.tsx, so the session must be re-verified here rather
  // than assumed from whichever page happened to render the form.
  await requireSession();

  const values = readCustomerFormValues(formData);
  const result = validateCustomerFormValues(values);

  if (!result.success) {
    return { error: null, fieldErrors: result.fieldErrors, values };
  }

  const supabase = await createClient();

  // owner_id is never sent from the client: the column defaults to auth.uid(),
  // and the customers_insert_own RLS policy's with-check would reject any
  // other value even if application code tried to supply one.
  const { error } = await supabase.from("customers").insert({
    name: result.values.name,
    email: result.values.email,
    phone: result.values.phone,
    notes: result.values.notes,
  });

  if (error) {
    // Never log error.message or submitted values: only a fixed operation
    // name and, if present, a non-sensitive Postgres/PostgREST error code.
    console.error("create_customer_failed", error.code ? { code: error.code } : undefined);
    return {
      error: "We couldn't save this customer. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}
