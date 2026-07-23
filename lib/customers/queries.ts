import { createClient } from "@/lib/supabase/server";
import type { Customer, CustomerDetail } from "@/lib/customers/types";
import { isValidCustomerId } from "@/lib/customers/validation";
import "server-only";

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface CustomerDetailRow extends CustomerRow {
  notes: string | null;
}

export interface GetCustomersResult {
  customers: Customer[];
  error: boolean;
}

export type GetCustomerByIdResult =
  | { status: "found"; customer: CustomerDetail }
  | { status: "not_found" }
  | { status: "error" };

// Escapes ILIKE metacharacters (the escape character itself, %, and _) so a
// search term is matched literally rather than as a wildcard pattern.
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

// RLS (customers_select_own) scopes this query to the caller's own rows via
// auth.uid(); no owner_id filter is added here on purpose. See docs/database.md.
// The optional name filter is layered on top of that RLS scope, so it can
// only ever narrow the caller's own rows further, never widen them.
export async function getCustomers(query = ""): Promise<GetCustomersResult> {
  const supabase = await createClient();

  const baseQuery = supabase
    .from("customers")
    .select("id, name, email, phone, created_at");

  const filteredQuery = query
    ? baseQuery.ilike("name", `%${escapeLikePattern(query)}%`)
    : baseQuery;

  const { data, error } = await filteredQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    // Never log error.message/details/hint or the search query: only a fixed
    // operation name and, if present, a non-sensitive Postgres/PostgREST code.
    console.error("get_customers_failed", error.code ? { code: error.code } : undefined);
    return { customers: [], error: true };
  }

  const rows = (data ?? []) as CustomerRow[];

  return {
    customers: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: row.created_at,
    })),
    error: false,
  };
}

// A malformed id and an id that RLS filters out (nonexistent or owned by
// another user) both resolve to "not_found", so the caller never learns
// which case occurred. A genuine query failure is reported separately so it
// is not mistaken for a 404.
export async function getCustomerById(id: string): Promise<GetCustomerByIdResult> {
  if (!isValidCustomerId(id)) {
    return { status: "not_found" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, notes, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("get_customer_failed", error.code ? { code: error.code } : undefined);
    return { status: "error" };
  }

  if (!data) {
    return { status: "not_found" };
  }

  const row = data as CustomerDetailRow;

  return {
    status: "found",
    customer: {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
      createdAt: row.created_at,
    },
  };
}
