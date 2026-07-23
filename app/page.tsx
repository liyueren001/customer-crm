import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-foreground">Customer CRM</h1>
      <p className="max-w-md text-base text-muted-foreground">
        A simple place for individual professionals and small businesses to
        track their own customers.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Go to Dashboard
      </Link>
    </div>
  );
}
