"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, UserPlus, Camera, Send, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  userName: string;
  userAvatar: string;
  userId: number;
  timeAgo: string;
  caption: string;
  image?: string;
  hearts: number;
  comments: Comment[];
  isHearted?: boolean;
}

interface Comment {
  id: number;
  userName: string;
  userAvatar: string;
  userId: number;
  text: string;
  timeAgo: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface EventInfo {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

export default function EventWall() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      userName: "Alice Johnson",
      userAvatar: "/avatars/alice.jpg",
      userId: 101,
      timeAgo: "2h",
      caption: "Had an amazing time at the event! 🎉",
      image: "/posts/post1.jpg",
      hearts: 12,
      comments: [
        {
          id: 1,
          userName: "Bob Smith",
          userAvatar: "/avatars/bob.jpg",
          userId: 102,
          text: "Looks fun! 😄",
          timeAgo: "1h",
        },
        {
          id: 2,
          userName: "Carol Lee",
          userAvatar: "/avatars/carol.jpg",
          userId: 103,
          text: "Can't wait to join next time!",
          timeAgo: "30m",
        },
      ],
      isHearted: false,
    },
    {
      id: 2,
      userName: "David Brown",
      userAvatar: "/avatars/david.jpg",
      userId: 104,
      timeAgo: "5h",
      caption: "Loving the vibes at this event! 😎",
      hearts: 7,
      comments: [],
      isHearted: false,
    },
  ]);

  const [eventInfo, setEventInfo] = useState<EventInfo>({
    id: 1,
    name: "Annual Tech Meetup",
    description: "A gathering for all tech enthusiasts!",
    memberCount: 120,
    isJoined: false,
  });

  const [currentUser, setCurrentUser] = useState<User>({
    id: 999,
    name: "You",
    avatar: "/avatars/you.jpg",
    isOnline: true,
  });

  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const handleHeart = (postId: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              hearts: p.isHearted ? p.hearts - 1 : p.hearts + 1,
              isHearted: !p.isHearted,
            }
          : p
      )
    );
  };

  const handleComment = (postId: number) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      userName: currentUser!.name,
      userAvatar: currentUser!.avatar,
      userId: currentUser!.id,
      text: text.trim(),
      timeAgo: "now",
    };

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const handleJoinEvent = () => {
    setEventInfo(prev => ({ ...prev, isJoined: true, memberCount: prev.memberCount + 1 }));
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent, postId: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment(postId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
  

      {/* Posts */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {posts.map(post => (
          <div key={post.id} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <img src={post.userAvatar} alt={post.userName} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-bold text-gray-900">{post.userName}</h3>
                  <p className="text-sm text-gray-500">{post.timeAgo}</p>
                </div>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </div>

            {/* Post Content */}
            <p className="text-gray-800 mb-4">{post.caption}</p>
            {post.image && <img src={post.image} alt="Post image" className="w-full h-80 object-cover rounded-2xl mb-4" />}

            {/* Engagement */}
            <div className="flex items-center gap-6 mb-4">
              <button onClick={() => handleHeart(post.id)} className={`flex items-center gap-2 ${post.isHearted ? "text-red-500" : "text-gray-600"}`}>
                <Heart className="w-6 h-6" />
                {post.hearts}
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-6 h-6" />
                {post.comments.length}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Share2 className="w-6 h-6" />
                Share
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-3 items-start">
                  <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-gray-900">{comment.userName}</p>
                    <p className="text-gray-800">{comment.text}</p>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-3 mt-4">
                <img src={currentUser.avatar} alt="You" className="w-10 h-10 rounded-full" />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2"
                  value={commentInputs[post.id] || ""}
                  onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyPress={e => handleCommentKeyPress(e, post.id)}
                />
                <Button onClick={() => handleComment(post.id)} className="bg-blue-500 text-white px-4 py-2 rounded-full">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
