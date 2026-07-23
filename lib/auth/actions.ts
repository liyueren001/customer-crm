"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/lib/auth/types";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readField(formData, "email");
  const password = readField(formData, "password");

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!password) {
    return { error: "Enter your password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // "Email not confirmed" is safe to surface: it tells a legitimate user what
    // to do next without revealing anything an attacker couldn't already infer
    // from having a valid password for that address.
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Please confirm your email before signing in. Check your inbox for the confirmation link.",
      };
    }
    // All other failures collapse to one generic message so a wrong email and a
    // wrong password are indistinguishable to the caller (avoids account enumeration).
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readField(formData, "email");
  const password = readField(formData, "password");

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many attempts. Please wait a moment and try again." };
    }
    // Generic on purpose: Supabase itself avoids revealing whether an email is
    // already registered when email confirmation is enabled, and this app does
    // the same for any other signup failure.
    return { error: "Could not create your account. Please try again." };
  }

  // No session means email confirmation is required. Supabase returns this same
  // shape (no error, no session) both for a brand-new signup and for an already
  // registered address, which is intentional enumeration protection — so this
  // app shows the same "check your email" message in both cases.
  if (!data.session) {
    return { error: null, status: "check-email" };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
