import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Event not found</h1>
      <p className="mt-2 text-muted-foreground">We couldn't find an event with that URL.</p>
      <div className="mt-6">
        <Link href="/events">
          <Button>Back to events</Button>
        </Link>
      </div>
    </div>
  );
}
