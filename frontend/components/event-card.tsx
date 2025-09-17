"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type EventCardProps = Readonly<{
  id?: string; // Event id from backend (optional if not used in UI)
  name: string;
  description?: string;
  category?: string;
  postCount?: number; // align with Prisma field
  thumbnail?: string; // align with Prisma field; fallback to initials
  eventDate?: string; // align with Prisma field (string)
  live?: boolean; // UI indicator
  className?: string;
  onClick?: () => void;
}>;

export function EventCard({ name, description, category, postCount, thumbnail, eventDate, live, className, onClick }: EventCardProps) {
  const initials = getInitials(name);
  return (
    <Card className={cn("h-full cursor-pointer transition hover:shadow-sm", className)} onClick={onClick}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            {thumbnail ? (
              <AvatarImage alt={name} src={thumbnail} />
            ) : (
              <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-base leading-tight">{name}</CardTitle>
            {category && (
              <div className="mt-1 text-xs text-muted-foreground">{category}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {live && (
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
          )}
          <Badge variant="secondary">{live ? "Live" : "Ready"}</Badge>
        </div>
      </CardHeader>
      {(description || postCount !== undefined || eventDate) && (
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {typeof postCount === "number" && <span>{postCount.toLocaleString()} posts</span>}
            {eventDate && <span className="text-muted-foreground/80">{formatEventDate(eventDate)}</span>}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "E";
  const second = parts.length > 1 ? parts[1][0] : "B";
  return (first + second).toUpperCase();
}

function formatEventDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
