import { axiosPublic } from "@/lib/axios";
import { Metadata } from "next";
import Link from "next/link";
import { CreatePostDialog } from "@/components/auth/create-post-form";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";
import { PostActions } from "@/components/post/post-actions";

interface EventDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  postCount?: number;
  thumbnail: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

interface PostDTO {
  id: string;
  content: string;
  imageUrl?: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

async function getEvent(id: string): Promise<EventDTO | null> {
  console.log("Fetching event with id:", id);
  try {
    const res = await axiosPublic.get(`/event/get-by-id?eventId=${id}`);
    return res.data as EventDTO;
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.error("Failed to fetch event", e);
    return null;
  }
}

async function getPosts(eventId: string): Promise<PostDTO[]> {
  try {
    const res = await axiosPublic.get(
      `/post/get-by-event-id?eventId=${encodeURIComponent(eventId)}`
    );
    return Array.isArray(res.data) ? (res.data as PostDTO[]) : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.error("Failed to fetch posts", e);
    return [];
  }
}

function buildCloudinaryUrl(publicId: string, w = 800) {
  if (!publicId) return "";
  if (/^https?:\/\//.test(publicId)) return publicId;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return publicId;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${w}/${publicId}.jpg`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ev = await getEvent(params.slug);
  if (!ev) return { title: "Event not found" };
  return {
    title: `${ev.title} · EventBuzz`,
    description: ev.description,
    openGraph: {
      title: ev.title,
      description: ev.description,
      images: ev.thumbnail ? [buildCloudinaryUrl(ev.thumbnail, 1200)] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [ev, posts] = await Promise.all([
    getEvent(params.id),
    getPosts(params.id),
  ]);
  if (!ev) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-semibold">Event not found</h1>
        <p className="text-muted-foreground">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link href="/events" className="text-primary underline">
          Back to events
        </Link>
      </div>
    );
  }
  const cover = buildCloudinaryUrl(ev.thumbnail, 1200);
  const date = new Date(ev.eventDate);
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-10">
      <div className="space-y-6">
        <Link
          href="/events"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All events
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">{ev.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              {date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-medium">
              {ev.category}
            </span>
            {typeof ev.postCount === "number" && (
              <span>{ev.postCount} posts</span>
            )}
          </div>
        </div>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={ev.title}
            className="w-full rounded-md border aspect-video object-cover"
          />
        )}
        <article className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          <p>{ev.description}</p>
        </article>
      </div>

      <div className="flex items-center justify-between mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Posts</h2>
        <CreatePostDialog
          eventId={ev.id}
          trigger={
            <Button variant={"default"}>
              Create post
              <Sparkle />
            </Button>
          }
        />
      </div>

      {posts.length === 0 && (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      )}

      {posts.length > 0 && (
        <ul className="space-y-6">
          {posts.map((p) => {
            const created = new Date(p.createdAt).toLocaleString();
            return (
              <li
                key={p.id}
                className="group rounded-lg border bg-card/50 backdrop-blur-sm p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      {created}
                    </div>
                    {/* Placeholder for user info */}
                    <div className="text-xs text-muted-foreground">
                      by Anonymous
                    </div>
                  </div>
                  {/* Future menu / share button placeholder */}
                </div>

                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={buildCloudinaryUrl(p.imageUrl, 1000)}
                    alt="Post image"
                    className="rounded-md border max-h-[420px] w-full object-cover shadow-sm"
                  />
                )}

                <div className="relative">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {p.content}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <PostActions postId={p.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const revalidate = 60;
