import Link from "next/link";

export function AppHeader() {
  return (
    <Link href="/dashboard" className="text-lg font-semibold text-foreground">
      Customer CRM
    </Link>
  );
}
