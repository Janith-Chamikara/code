"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosPublic } from "@/lib/axios";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { CreateEventDialog } from "@/components/auth/create-event-form";

export default function EventsPage() {
  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["events", "list", "all"],
    queryFn: async () => {
      const res = await axiosPublic.get("/event/get-all");
      if (Array.isArray(res.data)) return res.data;
      return [] as any[];
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Events
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Browse recent and upcoming events. Click an event to view details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
            <CreateEventDialog
              trigger={
                <Button size="lg" className="gap-2">
                  Start an event <Sparkles className="size-5" />
                </Button>
              }
            />
            <Link href="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading events...</div>
        )}
        {isError && (
          <div className="text-sm text-red-600">Failed to load events.</div>
        )}
        {!isLoading && !isError && events.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No events yet. Create the first one!
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((ev: any) => (
            <EventCard
              key={ev.id}
              id={ev.id}
              name={ev.title}
              description={ev.description}
              category={ev.category}
              postCount={ev.postCount ?? 0}
              thumbnail={ev.thumbnail}
              eventDate={ev.eventDate}
              live={new Date(ev.eventDate) >= new Date()}
              href={`/events/${ev.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
