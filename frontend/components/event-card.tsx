import React from 'react';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

interface EventType {
  id?: string | number;
  name: string;
  // image?: string;
  category: string;
  description?: string;
  organizer?: string;
  date: string;
  time?: string;
  location?: string;
  participants?: number;
}

interface EventCardProps {
  event: EventType;
  onClick?: (event: EventType) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, className = "" }) => {
  return (
    <Card 
      className={`overflow-hidden border border-gray-300 bg-white text-black shadow-none cursor-pointer group ${className}`} 
      onClick={() => onClick && onClick(event)}
    >
      {/* Event Header */}
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-1 text-black" title={event.name}>
          {event.name}
        </h3>
        <p className="text-sm text-gray-700 line-clamp-2" title={event.description}>
          {event.description}
        </p>
        <div className="mt-2">
          <Badge className="bg-gray-200 text-gray-800 border border-gray-400"><Tag className="w-3 h-3 mr-1" />{event.category}</Badge>
        </div>
      </CardHeader>
      
      {/* Event Details */}
      <CardContent className="pt-0 space-y-2">
        {/* Date */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{event.date ? formatDate(event.date) : ''}</span>
        </div>
        {/* Time */}
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        {/* Location */}
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardContent>
      
      {/* Event Footer */}
      <CardFooter className="pt-2 border-t">
        <div className="flex items-center text-sm text-gray-600 w-full">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">Organized by {event.organizer}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;