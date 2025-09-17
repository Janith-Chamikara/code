import { Metadata } from "next";
import { redirect } from "next/navigation";
import { axiosPublic } from "@/lib/axios";

// Contract with backend
export type EventDTO = Readonly<{
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  postCount?: number;
  thumbnail?: string;
  eventDate?: string;
}>;

async function getEvent(slug: string): Promise<EventDTO | null> {
  try {
    const res = await axiosPublic.get(`/events/${encodeURIComponent(slug)}`);
    return res.data as EventDTO;
  } catch (e) {
    // Optionally log error in development; keep silent in production
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch event", e);
    }
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEvent(params.slug);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.name} · EventBuzz`,
    description: event.description,
    openGraph: {
      title: event.name,
      description: event.description,
      images: event.thumbnail ? [event.thumbnail] : [],
    },
  };
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  // For now, redirect to events list where cards are shown instead of detailed view
  redirect("/events");
}

export const revalidate = 60; // ISR: refresh event data every 60s
