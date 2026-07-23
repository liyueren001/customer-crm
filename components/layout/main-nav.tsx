import Link from "next/link";

export function MainNav() {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-wrap gap-4 text-sm font-medium">
        <li>
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/customers"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Customers
          </Link>
        </li>
      </ul>
    </nav>
  );
}
