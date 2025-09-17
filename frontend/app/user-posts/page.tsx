"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, MessageCircle, MoreVertical, UserPlus, Camera, Send, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  userName: string;
  userAvatar: string;
  userId: number;
  timeAgo: string;
  caption: string;
  image?: string;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  userVote?: 'up' | 'down' | null;
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
      upvotes: 12,
      downvotes: 2,
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
      userVote: null,
    },
    {
      id: 2,
      userName: "David Brown",
      userAvatar: "/avatars/david.jpg",
      userId: 104,
      timeAgo: "5h",
      caption: "Loving the vibes at this event! 😎",
      upvotes: 7,
      downvotes: 1,
      comments: [],
      userVote: null,
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

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;

        let newUpvotes = p.upvotes;
        let newDownvotes = p.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Handle previous vote removal
        if (p.userVote === 'up') newUpvotes--;
        if (p.userVote === 'down') newDownvotes--;

        // Handle new vote or toggle off
        if (p.userVote === voteType) {
          // Toggle off if clicking same vote
          newUserVote = null;
        } else {
          // Add new vote
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...p,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote,
        };
      })
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

  const getNetScore = (post: Post) => post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote(post.id, 'up')} 
                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                    post.userVote === 'up' ? "text-green-600 bg-green-100" : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.upvotes}</span>
                </button>
                <button 
                  onClick={() => handleVote(post.id, 'down')} 
                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                    post.userVote === 'down' ? "text-red-600 bg-red-100" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.downvotes}</span>
                </button>
                <div className={`text-sm font-bold px-2 py-1 rounded-full ${
                  getNetScore(post) > 0 ? "text-green-700 bg-green-100" : 
                  getNetScore(post) < 0 ? "text-red-700 bg-red-100" : 
                  "text-gray-700 bg-gray-100"
                }`}>
                  {getNetScore(post) > 0 ? '+' : ''}{getNetScore(post)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-6 h-6" />
                {post.comments.length}
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