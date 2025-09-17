"use client";
import React from "react";
import { Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export interface EventType {
  id?: string | number;
  name: string;
  category: string;
  description?: string;
  organizer?: string;
  date?: string;
  time?: string;
  location?: string;
  participants?: number;
}

export interface EventCardProps {
  event: EventType;
  onClick?: (event: EventType) => void;
  className?: string;
}

export default function DetailedEventCard({ event, onClick, className = "" }: Readonly<EventCardProps>) {
  return (
    <Card
      className={`overflow-hidden border border-gray-300 bg-white text-black shadow-none cursor-pointer group ${className}`}
      onClick={() => onClick?.(event)}
    >
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-1 text-black" title={event.name}>
          {event.name}
        </h3>
        {event.description && (
          <p className="text-sm text-gray-700 line-clamp-2" title={event.description}>
            {event.description}
          </p>
        )}
        <div className="mt-2">
          <Badge className="bg-gray-200 text-gray-800 border border-gray-400">
            <Tag className="w-3 h-3 mr-1" />
            {event.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <div className="flex items-center text-sm text-gray-600 w-full">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">Organized by {event.organizer}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
