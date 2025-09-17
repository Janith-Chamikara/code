"use client";
import React, { useEffect, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DetailedEventCard, { type EventType } from "@/components/detailed-event-card";
import Link from "next/link";

// Stable keys for skeleton items to satisfy lint rule against index keys
const SKELETON_KEYS: readonly string[] = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
];

const EventCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="h-48 bg-gray-300 animate-pulse" />
    <CardHeader>
      <div className="h-6 bg-gray-300 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-300 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded animate-pulse" />
        <div className="h-4 bg-gray-300 rounded animate-pulse" />
        <div className="h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockEvents: EventType[] = [
      { id: 1, name: "Tech Hackathon 2025", description: "48-hour buildathon.", date: "2025-09-28", time: "09:00", category: "Technology", organizer: "Tech Club", location: "Main Hall" },
      { id: 2, name: "Campus Food Festival", description: "Cuisines from around the world.", date: "2025-10-10", time: "11:00", category: "Food & Culture", organizer: "SAB", location: "Campus Plaza" },
      { id: 3, name: "Career Fair", description: "Meet top employers.", date: "2025-10-20", time: "10:00", category: "Career", organizer: "Career Center", location: "Student Center" },
    ];
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">Discover and join exciting events</p>
          </div>
          <Link href="/events/create">
            <Button className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 border border-gray-700">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKELETON_KEYS.map((key) => (
              <EventCardSkeleton key={`skeleton-${key}`} />
            ))}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={String(event.id)} href={`/events/${encodeURIComponent(String(event.id))}`}>
                <DetailedEventCard event={event} />
              </Link>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4"><Calendar className="w-16 h-16 mx-auto" /></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
            <p className="text-gray-500 mb-4">Be the first to create an event for your community!</p>
            <Link href="/events/create">
              <Button className="bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
                <Plus className="w-4 h-4 mr-2" /> Create First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
