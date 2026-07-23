import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const VALID_EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (VALID_EMAIL_OTP_TYPES as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Redirect targets below are always fixed, known paths built from the
  // server-known request origin — never from a client-supplied destination —
  // so this route cannot be used as an open redirect.
  if (!tokenHash || !isEmailOtpType(type)) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_confirmation_link", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=confirmation_failed", origin));
  }

  return NextResponse.redirect(new URL("/dashboard", origin));
}
