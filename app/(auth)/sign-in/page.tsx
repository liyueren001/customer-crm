import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Customer CRM",
};

// Keyed by the safe, non-sensitive error codes set by app/auth/confirm/route.ts.
const CONFIRMATION_ERROR_MESSAGES: Record<string, string> = {
  invalid_confirmation_link: "This confirmation link is invalid or incomplete.",
  confirmation_failed:
    "This confirmation link has expired or has already been used. Please sign up again or try signing in.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const confirmationError = error ? CONFIRMATION_ERROR_MESSAGES[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in to manage your customers.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {confirmationError && (
          <p role="alert" className="text-sm text-destructive">
            {confirmationError}
          </p>
        )}
        <SignInForm />
      </CardContent>
    </Card>
  );
}
