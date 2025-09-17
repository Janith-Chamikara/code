"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

// Mock events data
const mockEvents = [
  {
    id: 1,
    name: "Tech Hackathon 2024",
    description: "Join us for an exciting 48-hour hackathon where innovation meets creativity. Build amazing projects with fellow developers!",
    date: "2024-03-15",
    time: "09:00 AM",
    category: "Technology",
    organizer: "Tech Club UCSC",
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500&h=300&fit=crop",
    location: "Main Auditorium",
    postCount: 142
  },
  {
    id: 2,
    name: "Campus Food Festival",
    description: "Discover diverse cuisines from around the world. Local vendors, student organizations, and food trucks gather for this amazing festival.",
    date: "2024-03-20",
    time: "11:00 AM",
    category: "Food & Culture",
    organizer: "Student Activities Board",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop",
    location: "Campus Plaza",
    postCount: 89
  },
  {
    id: 3,
    name: "Career Fair Spring 2024",
    description: "Connect with top employers and explore internship and full-time opportunities. Bring your resume and dress professionally!",
    date: "2024-03-25",
    time: "10:00 AM",
    category: "Career",
    organizer: "Career Services Center",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop",
    location: "Student Center",
    postCount: 67
  },
  {
    id: 4,
    name: "Music Concert Night",
    description: "An evening of live music featuring local bands and student performers. Free entry for all students with valid ID.",
    date: "2024-03-30",
    time: "07:00 PM",
    category: "Entertainment",
    organizer: "Music Society",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
    location: "Outdoor Amphitheater",
    postCount: 203
  },
  {
    id: 5,
    name: "Environmental Awareness Workshop",
    description: "Learn about sustainable practices and how to make a positive impact on our environment. Interactive sessions and practical tips included.",
    date: "2024-04-05",
    time: "02:00 PM",
    category: "Education",
    organizer: "Green Campus Initiative",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop",
    location: "Science Building Room 101",
    postCount: 34
  },
  {
    id: 6,
    name: "Sports Tournament",
    description: "Annual inter-department sports competition featuring basketball, volleyball, and table tennis. Prizes for winning teams!",
    date: "2024-04-10",
    time: "08:00 AM",
    category: "Sports",
    organizer: "Athletics Department",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
    location: "Sports Complex",
    postCount: 156
  }
];

// Event Card Component for the events list
function DetailedEventCard({ event, onClick }: { event: any; onClick: (event: any) => void }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onClick(event)}>
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{event.category}</Badge>
          <span className="text-sm text-muted-foreground">{event.postCount} posts</span>
        </div>
        <CardTitle className="text-lg">{event.name}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span>📍 {event.location}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span>Organized by {event.organizer}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
const EventCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="h-48 bg-gray-300 animate-pulse"></div>
    <CardHeader>
      <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'events'>('home');
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Load events when switching to events view
  useEffect(() => {
    if (currentView === 'events' && events.length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
        setLoading(false);
      }, 500);
    }
  }, [currentView]);

  // Handle search and filter
  useEffect(() => {
    let filtered = events;
    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [searchQuery, events, categoryFilter]);

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
    alert(`Event Details: ${event.name}\n\n${event.description}\n\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.time}\nLocation: ${event.location}`);
  };

  const handleCreateEvent = () => {
    alert('Create Event functionality - integrate with your routing system');
  };

  if (currentView === 'events') {
    return (
      <main className="flex-1">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('home')}
                  className="mb-4 text-sm"
                >
                  ← Back to Home
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
                <p className="text-gray-600 mt-1">Discover and join exciting events happening on campus</p>
              </div>
              
              <Button 
                onClick={handleCreateEvent} 
                className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 border border-gray-700"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoryFilter === ''
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Events
                </button>
                {['Technology', 'Career', 'Education', 'Entertainment', 'Sports', 'Food & Culture'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <EventCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <>
                {searchQuery && (
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} 
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <DetailedEventCard 
                      key={event.id}
                      event={event} 
                      onClick={handleEventClick}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No events found' : 'No events available'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? `No events match your search for "${searchQuery}"`
                    : 'Be the first to create an event for your community!'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateEvent} className="bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Event
                  </Button>
                )}
                {searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery('')} 
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

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
                Posts, photos, comments, reactions, and polls — all updating live
                for your audience. Perfect for hackathons, campus events, and meetups.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Start an event <Sparkles className="size-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setCurrentView('events')}
                >
                  View public wall <ArrowRight className="size-5" />
                </Button>
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
                  <CardDescription>What people are posting right now</CardDescription>
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
            <h2 className="text-3xl md:text-4xl font-semibold">Everything you need for an interactive event</h2>
            <p className="mt-2 text-muted-foreground">Fast to set up. Easy to moderate. Fun to use.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Radio className="size-5" />} title="Realtime Feed" desc="Live updates via WebSockets/Firebase." />
            <FeatureCard icon={<Camera className="size-5" />} title="Photo Posts" desc="Cloudinary-powered image uploads." />
            <FeatureCard icon={<MessageCircle className="size-5" />} title="Comments" desc="Threaded discussion per post." />
            <FeatureCard icon={<Heart className="size-5" />} title="Reactions" desc="Tap to like and celebrate moments." />
          </div>
        </div>
      </section>

      {/* Events showcase */}
      <section id="events" className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">Event-wise walls</h2>
            <p className="mt-2 text-muted-foreground">
              Create a private wall per event and optionally mirror posts to a public wall.
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
                <SharedEventCard name="CodeFest 2025" description="University-wide 24h hackathon bringing builders together." category="Hackathon" postCount={342} eventDate="2025-09-17" live />
                <SharedEventCard name="ByteJam Finals" description="Final demo day with judges and sponsors." category="Hackathon" postCount={128} eventDate="2025-10-01" />
                <SharedEventCard name="AI Sprint" description="Rapid prototyping with AI tools and models." category="Hackathon" postCount={521} eventDate="2025-11-05" />
              </div>
            </TabsContent>
            <TabsContent value="campus" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SharedEventCard name="Freshers Night" description="Welcome to the new batch — music and games." category="Campus" postCount={96} eventDate="2025-09-20" />
                <SharedEventCard name="Open Day" description="Explore labs, clubs and projects." category="Campus" postCount={73} eventDate="2025-10-08" />
                <SharedEventCard name="Cultural Week" description="A celebration of diversity with food and art." category="Campus" postCount={210} eventDate="2025-12-02" live />
              </div>
            </TabsContent>
            <TabsContent value="meetups" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SharedEventCard name="JS Colombo" description="Monthly meetup for JavaScript enthusiasts." category="Meetup" postCount={41} eventDate="2025-09-28" />
                <SharedEventCard name="DevOps LK" description="Sharing SRE, Platform and CI/CD learnings." category="Meetup" postCount={58} eventDate="2025-10-15" />
                <SharedEventCard name="Design Talks" description="UI/UX demos and critiques." category="Meetup" postCount={29} eventDate="2025-11-12" />
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
            <p className="mt-2 text-muted-foreground">Three simple steps to launch your event wall.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard step="01" title="Create your event" desc="Name, date, and visibility (private/public wall)." />
            <StepCard step="02" title="Share the link" desc="Attendees post updates, photos, and vote in polls." />
            <StepCard step="03" title="Moderate & display" desc="Approve posts and project the wall on the big screen." />
          </div>
        </div>
      </section>

      {/* Realtime highlight */}
      <section id="realtime" className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold">Realtime, reliable, ready</h2>
              <p className="mt-3 text-muted-foreground">
                Built with WebSockets from the backend and compatible with Firebase if you prefer. Posts,
                comments, reactions, and polls sync instantly across devices.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-green-500 animate-pulse" /> Low-latency updates</li>
                <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500 animate-pulse" /> Presence and typing indicators</li>
                <li className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-500 animate-pulse" /> Backoff and reconnect strategy</li>
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
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" /> Connected
                  </span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span>Last event</span><span className="text-muted-foreground">post:new</span></div>
                  <div className="flex items-center justify-between"><span>Latency</span><span className="text-muted-foreground">~42ms</span></div>
                  <div className="flex items-center justify-between"><span>Subscribers</span><span className="text-muted-foreground">1,284</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">Ready to launch your social event wall?</h2>
          <p className="mt-2 text-white/70">Spin up an event, invite attendees, and watch the wall come alive.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-white/90">
                Get started <Sparkles className="size-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
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
            <div className="size-6 rounded-md bg-black text-white grid place-items-center text-[10px]">EB</div>
            <span>EventBuzz</span>
          </div>
          <p>© {new Date().getFullYear()} EventBuzz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#features">Features</a>
            <a className="hover:text-foreground" href="#events">Events</a>
            <a className="hover:text-foreground" href="#how">How it works</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: Readonly<{ icon: React.ReactNode; title: string; desc: string }>) {
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

function StepCard({ step, title, desc }: Readonly<{ step: string; title: string; desc: string }>) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Badge variant="outline" className="w-fit">{step}</Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function FeedItem({ name, initials, body, likes, comments, tag }: Readonly<{
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
          {tag && <Badge variant="secondary" className="h-5 text-[10px]">{tag}</Badge>}
        </div>
        <p className="mt-1 text-sm">{body}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="size-3" /> {likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="size-3" /> {comments}</span>
        </div>
      </div>
    </div>
  );
}