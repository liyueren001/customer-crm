import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/customers/types";
import "server-only";

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface GetCustomersResult {
  customers: Customer[];
  error: boolean;
}

// RLS (customers_select_own) scopes this query to the caller's own rows via
// auth.uid(); no owner_id filter is added here on purpose. See docs/database.md.
export async function getCustomers(): Promise<GetCustomersResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    // error.message is a Postgres/query diagnostic, never row data.
    console.error("[customers] Failed to load customers:", error.message);
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
