"use client";

import Link from "next/link";
import { CreateEventDialog } from "@/components/auth/create-event-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventCard as SharedEventCard } from "@/components/event-card";
import {
  ArrowRight,
  Bolt,
  Camera,
  Heart,
  MessageCircle,
  Radio,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { CreatePostDialog } from "@/components/auth/create-post-form";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                New • Social Event Wall
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Bring your event to life with a realtime social wall
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Posts, photos, comments, reactions, and polls — all updating
                live for your audience. Perfect for hackathons, campus events,
                and meetups.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <CreateEventDialog
                  trigger={
                    <Button size="lg" className="gap-2">
                      Start an event <Sparkles className="size-5" />
                    </Button>
                  }
                />

                <Link href="#events">
                  <Button size="lg" variant="outline" className="gap-2">
                    View public wall <ArrowRight className="size-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bolt className="size-4 text-yellow-600" /> Realtime updates
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Camera className="size-4" /> Cloudinary images
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <BarChart3 className="size-4" /> Polls
                </div>
              </div>
            </div>
            <div>
              {/* Mock feed preview */}
              <Card className="overflow-hidden border-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Live Public Wall</CardTitle>
                  <CardDescription>
                    What people are posting right now
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FeedItem
                    name="Asha"
                    initials="AS"
                    body="Ship it! Our API is live 🚀"
                    likes={24}
                    comments={7}
                    tag="Hackathon 2025"
                  />
                  <FeedItem
                    name="Zaid"
                    initials="Z"
                    body="Voting on best demo. Poll closes in 10m."
                    likes={11}
                    comments={19}
                    tag="Main Stage"
                  />
                  <FeedItem
                    name="Maya"
                    initials="M"
                    body="UI squad dropping the new theme ✨"
                    likes={42}
                    comments={12}
                    tag="Design Corner"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Everything you need for an interactive event
            </h2>
            <p className="mt-2 text-muted-foreground">
              Fast to set up. Easy to moderate. Fun to use.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Radio className="size-5" />}
              title="Realtime Feed"
              desc="Live updates via WebSockets/Firebase."
            />
            <FeatureCard
              icon={<Camera className="size-5" />}
              title="Photo Posts"
              desc="Cloudinary-powered image uploads."
            />
            <FeatureCard
              icon={<MessageCircle className="size-5" />}
              title="Comments"
              desc="Threaded discussion per post."
            />
            <FeatureCard
              icon={<Heart className="size-5" />}
              title="Reactions"
              desc="Tap to like and celebrate moments."
            />
          </div>
        </div>
      </section>

      {/* Events showcase */}
      <section id="events" className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Event-wise walls
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create a private wall per event and optionally mirror posts to a
              public wall.
            </p>
          </div>
          <Tabs defaultValue="hackathons" className="w-full">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
              <TabsTrigger value="campus">Campus</TabsTrigger>
              <TabsTrigger value="meetups">Meetups</TabsTrigger>
            </TabsList>
            <TabsContent value="hackathons" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SharedEventCard
                  name="CodeFest 2025"
                  description="University-wide 24h hackathon bringing builders together."
                  category="Hackathon"
                  postCount={342}
                  eventDate="2025-09-17"
                  live
                />
                <SharedEventCard
                  name="ByteJam Finals"
                  description="Final demo day with judges and sponsors."
                  category="Hackathon"
                  postCount={128}
                  eventDate="2025-10-01"
                />
                <SharedEventCard
                  name="AI Sprint"
                  description="Rapid prototyping with AI tools and models."
                  category="Hackathon"
                  postCount={521}
                  eventDate="2025-11-05"
                />
              </div>
            </TabsContent>
            <TabsContent value="campus" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SharedEventCard
                  name="Freshers Night"
                  description="Welcome to the new batch — music and games."
                  category="Campus"
                  postCount={96}
                  eventDate="2025-09-20"
                />
                <SharedEventCard
                  name="Open Day"
                  description="Explore labs, clubs and projects."
                  category="Campus"
                  postCount={73}
                  eventDate="2025-10-08"
                />
                <SharedEventCard
                  name="Cultural Week"
                  description="A celebration of diversity with food and art."
                  category="Campus"
                  postCount={210}
                  eventDate="2025-12-02"
                  live
                />
              </div>
            </TabsContent>
            <TabsContent value="meetups" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SharedEventCard
                  name="JS Colombo"
                  description="Monthly meetup for JavaScript enthusiasts."
                  category="Meetup"
                  postCount={41}
                  eventDate="2025-09-28"
                />
                <SharedEventCard
                  name="DevOps LK"
                  description="Sharing SRE, Platform and CI/CD learnings."
                  category="Meetup"
                  postCount={58}
                  eventDate="2025-10-15"
                />
                <SharedEventCard
                  name="Design Talks"
                  description="UI/UX demos and critiques."
                  category="Meetup"
                  postCount={29}
                  eventDate="2025-11-12"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">How it works</h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps to launch your event wall.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="01"
              title="Create your event"
              desc="Name, date, and visibility (private/public wall)."
            />
            <StepCard
              step="02"
              title="Share the link"
              desc="Attendees post updates, photos, and vote in polls."
            />
            <StepCard
              step="03"
              title="Moderate & display"
              desc="Approve posts and project the wall on the big screen."
            />
          </div>
        </div>
      </section>

      {/* Realtime highlight */}
      <section id="realtime" className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold">
                Realtime, reliable, ready
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built with WebSockets from the backend and compatible with
                Firebase if you prefer. Posts, comments, reactions, and polls
                sync instantly across devices.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-green-500 animate-pulse" />{" "}
                  Low-latency updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500 animate-pulse" />{" "}
                  Presence and typing indicators
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />{" "}
                  Backoff and reconnect strategy
                </li>
              </ul>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="size-4" /> WebSocket Status
                </CardTitle>
                <CardDescription>Demo preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Connection</span>
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />{" "}
                    Connected
                  </span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Last event</span>
                    <span className="text-muted-foreground">post:new</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Latency</span>
                    <span className="text-muted-foreground">~42ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subscribers</span>
                    <span className="text-muted-foreground">1,284</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Ready to launch your social event wall?
          </h2>
          <p className="mt-2 text-white/70">
            Spin up an event, invite attendees, and watch the wall come alive.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-white text-black hover:bg-white/90"
              >
                Get started <Sparkles className="size-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="default"
                className="border-white/30 text-white hover:bg-white/10"
              >
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Inline footer (kept minimal to avoid site-level component) */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-black text-white grid place-items-center text-[10px]">
              EB
            </div>
            <span>EventBuzz</span>
          </div>
          <p>© {new Date().getFullYear()} EventBuzz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#features">
              Features
            </a>
            <a className="hover:text-foreground" href="#events">
              Events
            </a>
            <a className="hover:text-foreground" href="#how">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: Readonly<{ icon: React.ReactNode; title: string; desc: string }>) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="size-9 rounded-md bg-muted grid place-items-center text-muted-foreground">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

// removed legacy inline EventCard in favor of shared component

function StepCard({
  step,
  title,
  desc,
}: Readonly<{ step: string; title: string; desc: string }>) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Badge variant="outline" className="w-fit">
          {step}
        </Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function FeedItem({
  name,
  initials,
  body,
  likes,
  comments,
  tag,
}: Readonly<{
  name: string;
  initials: string;
  body: string;
  likes: number;
  comments: number;
  tag?: string;
}>) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{name}</span>
          {tag && (
            <Badge variant="secondary" className="h-5 text-[10px]">
              {tag}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm">{body}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="size-3" /> {likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3" /> {comments}
          </span>
        </div>
      </div>
    </div>
  );
}
