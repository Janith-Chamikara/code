"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import EventCard from '../components/event-card'; // Correct import path for EventCard

// API service functions - Replace these with your actual API calls
const eventService = {
  // GET /api/events
  getAllEvents: async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // GET /api/events/stats
  getEventStats: async () => {
    try {
      const response = await fetch('/api/events/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      // Return default stats if API fails
      return {
        totalEvents: 0,
        thisWeek: 0,
        categories: 0,
        participants: 0
      };
    }
  },

  // GET /api/events/search?q=query
  searchEvents: async (query: string) => {
    try {
      const response = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }
};

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

interface EventType {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  category: string;
  organizer: string;
  image: string;
  location: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [stats, setStats] = useState({
    totalEvents: 0,
    thisWeek: 0,
    categories: 0,
    participants: 0
  });

  // Hardcoded mock events
  useEffect(() => {
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
        location: "Main Auditorium"
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
        location: "Campus Plaza"
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
        location: "Student Center"
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
        location: "Outdoor Amphitheater"
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
        location: "Science Building Room 101"
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
        location: "Sports Complex"
      }
    ];
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
    setStats({
      totalEvents: mockEvents.length,
      thisWeek: 2,
      categories: 6,
      participants: 0
    });
    setLoading(false);
  }, []);

  // Handle search
  useEffect(() => {
    let filtered = events;
    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.organizer ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [searchQuery, events, categoryFilter]);

  // Handle create event navigation
  const handleCreateEvent = () => {
    // Replace with your routing logic
    // Example: navigate('/create-event')
    // Or open a modal, etc.
    console.log('Navigate to create event page');
    alert('Create Event functionality - integrate with your routing system');
  };

  // Handle event card click
  const handleEventClick = (event: any) => {
    // Replace with your routing logic
    // Example: navigate(`/events/${event.id}`)
    console.log('Navigate to event details:', event);
    alert(`Navigate to event details for: ${event.name}`);
  };

  // Retry function for error state
  const handleRetry = async () => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [eventsData, statsData] = await Promise.all([
          eventService.getAllEvents(),
          eventService.getEventStats()
        ]);
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setStats(statsData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message ?? null);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    await fetchEvents();
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load events</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={handleRetry} className="bg-gray-800 hover:bg-gray-900 text-white border border-gray-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
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

        {/* Category Filter Tabs and rest of page... */}

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
            <button
              onClick={() => setCategoryFilter('Technology')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Technology'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Technology
            </button>
            <button
              onClick={() => setCategoryFilter('Career')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Career'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Career
            </button>
            <button
              onClick={() => setCategoryFilter('Education')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Education'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Education
            </button>
            <button
              onClick={() => setCategoryFilter('Entertainment')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Entertainment'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Entertainment
            </button>
            <button
              onClick={() => setCategoryFilter('Sports')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Sports'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sports
            </button>
            <button
              onClick={() => setCategoryFilter('Food & Culture')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'Food & Culture'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Food & Culture
            </button>
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
                <EventCard 
                  key={(event as any).id}
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
  );
};

export default EventsPage;