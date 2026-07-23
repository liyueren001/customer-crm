import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Cached per request render pass so requireSession()/redirectIfAuthenticated()
// can be called from multiple places (e.g. a layout and a page) without
// re-verifying the session with the Supabase Auth server more than once.
export const getAuthenticatedClaims = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

export async function requireSession() {
  const claims = await getAuthenticatedClaims();

  if (!claims) {
    redirect("/sign-in");
  }

  return claims;
}

export async function redirectIfAuthenticated() {
  const claims = await getAuthenticatedClaims();

  if (claims) {
    redirect("/dashboard");
  }
}
