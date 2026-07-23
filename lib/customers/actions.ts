"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import {
  isValidCustomerId,
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

export async function deleteCustomer(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by useActionState's (state, formData) action signature
  _prevState: { error: string | null },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by the same signature; no field is read from the submission
  _formData: FormData,
): Promise<{ error: string | null }> {
  // Server Actions are independently callable, so the session must be
  // re-verified here even though the customer list is also behind the
  // dashboard layout's session check.
  await requireSession();

  // The id is bound server-side from an already-rendered row, but it is
  // still treated as untrusted input: format-validated here regardless of
  // where it came from, with RLS as the actual authorization backstop below.
  if (!isValidCustomerId(id)) {
    return { error: "This customer could not be found." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    // Never log error.message, the customer id, or row data: only a fixed
    // operation name and, if present, a non-sensitive Postgres/PostgREST code.
    console.error("delete_customer_failed", error.code ? { code: error.code } : undefined);
    return { error: "We couldn't delete this customer. Please try again." };
  }

  if (!data) {
    // Zero rows deleted: the id doesn't exist, or the customers_delete_own
    // RLS policy filtered it out because it belongs to another user. Both
    // cases collapse into the same generic message so the response never
    // reveals which one occurred.
    return { error: "This customer could not be found." };
  }

  revalidatePath("/dashboard/customers");
  return { error: null };
}

export async function updateCustomer(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  // Server Actions are independently callable, so the session must be
  // re-verified here even though the edit page is also behind the dashboard
  // layout's session check.
  await requireSession();

  const values = readCustomerFormValues(formData);

  // The id may come from a tampered form submission, not just the route the
  // page was rendered from, so it is validated again here regardless of
  // whatever the edit page already checked.
  if (!isValidCustomerId(id)) {
    return {
      error: "This customer could not be found.",
      fieldErrors: {},
      values,
    };
  }

  const result = validateCustomerFormValues(values);

  if (!result.success) {
    return { error: null, fieldErrors: result.fieldErrors, values };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .update({
      name: result.values.name,
      email: result.values.email,
      phone: result.values.phone,
      notes: result.values.notes,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    // Never log error.message or submitted values: only a fixed operation
    // name and, if present, a non-sensitive Postgres/PostgREST error code.
    console.error("update_customer_failed", error.code ? { code: error.code } : undefined);
    return {
      error: "We couldn't save this customer. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  if (!data) {
    // The update matched zero rows: the id doesn't exist, or the
    // customers_update_own RLS policy filtered it out because it belongs to
    // another user. Both cases collapse into the same generic message so a
    // response never reveals which one occurred.
    return {
      error: "This customer could not be found.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}
