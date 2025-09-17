"use client";

import { useState, useEffect } from "react";
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
  createdAt: string;
}

interface Comment {
  id: number;
  userName: string;
  userAvatar: string;
  userId: number;
  text: string;
  timeAgo: string;
  createdAt: string;
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

// API Configuration
const API_BASE_URL = typeof window !== "undefined" && (window as any).NEXT_PUBLIC_API_URL
  ? (window as any).NEXT_PUBLIC_API_URL
  : 'https://api.yourdomain.com';
const API_ENDPOINTS = {
  posts: `${API_BASE_URL}/api/posts`,
  comments: (postId: number) => `${API_BASE_URL}/api/posts/${postId}/comments`,
  like: (postId: number) => `${API_BASE_URL}/api/posts/${postId}/like`,
  event: `${API_BASE_URL}/api/event`,
  user: `${API_BASE_URL}/api/user/profile`,
  joinEvent: `${API_BASE_URL}/api/event/join`,
  createPost: `${API_BASE_URL}/api/posts`,
  uploadImage: `${API_BASE_URL}/api/upload/image`,
};

export default function EventWall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const fetchPosts = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1 && !reset) setIsLoading(true);
      if (pageNum > 1) setIsLoadingMore(true);

      const response = await fetchWithAuth(`${API_ENDPOINTS.posts}?page=${pageNum}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (pageNum === 1 || reset) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchEventInfo = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.event);
      if (!response.ok) throw new Error('Failed to fetch event info');
      
      const data = await response.json();
      setEventInfo(data);
    } catch (err) {
      console.error('Error fetching event info:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.user);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const data = await response.json();
      setCurrentUser(data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const handleHeart = async (postId: number) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              hearts: p.isHearted ? p.hearts - 1 : p.hearts + 1,
              isHearted: !p.isHearted 
            } 
          : p
      ));

      const response = await fetchWithAuth(API_ENDPOINTS.like(postId), {
        method: 'POST',
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                hearts: p.isHearted ? p.hearts + 1 : p.hearts - 1,
                isHearted: !p.isHearted 
              } 
            : p
        ));
        throw new Error('Failed to update like');
      }

      const updatedPost = await response.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleComment = async (postId: number) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !currentUser) return;

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.comments(postId), {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const newComment = await response.json();
      
      setPosts(prev => prev.map(p =>
        p.id === postId 
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      ));
      
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleJoinEvent = async () => {
    if (!eventInfo) return;

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.joinEvent, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to join event');

      const updatedEvent = await response.json();
      setEventInfo({ ...eventInfo, ...updatedEvent });
    } catch (err) {
      console.error('Error joining event:', err);
    }
  };

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchPosts(page + 1);
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent, postId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComment(postId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchPosts(),
      fetchEventInfo(),
      fetchCurrentUser(),
    ]);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt blur"></div>
                {currentUser && (
                  <img
                    src={currentUser.avatar}
                    alt="Profile"
                    className="relative w-14 h-14 rounded-full"
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {eventInfo?.name || 'Event Wall'}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {eventInfo?.memberCount ? `${eventInfo.memberCount} members` : 'Event Community'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              {eventInfo && (
                <Button 
                  onClick={handleJoinEvent}
                  className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {eventInfo.isJoined ? 'Joined' : 'Join Event'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Create Post Section */}
        {currentUser && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt="Your avatar"
                className="w-12 h-12 rounded-full ring-2 ring-blue-200"
              />
              <div className="flex-1 bg-gray-100 rounded-full px-6 py-4 cursor-pointer hover:bg-gray-200 transition-all duration-200">
                <p className="text-gray-500 font-medium">Share your event experience...</p>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg font-medium">Loading posts...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Posts Feed */}
            <div className="space-y-8">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Be the first to share your experience!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                    {/* Post Header */}
                    <div className="flex items-center justify-between p-6 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={post.userAvatar}
                            alt={post.userName}
                            className="w-12 h-12 rounded-full ring-2 ring-blue-200"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                            {post.userName}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">
                            {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="px-6 pb-4">
                      <p className="text-gray-800 leading-relaxed text-lg">{post.caption}</p>
                    </div>

                    {/* Post Image */}
                    {post.image && (
                      <div className="px-6 pb-6">
                        <div className="rounded-2xl overflow-hidden shadow-lg">
                          <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </div>
                    )}

                    {/* Engagement Section */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                          {/* Heart Button */}
                          <button
                            onClick={() => handleHeart(post.id)}
                            className={`flex items-center gap-3 group/heart transition-all duration-300 ${
                              post.isHearted 
                                ? 'text-red-500' 
                                : 'text-gray-600 hover:text-red-500'
                            }`}
                          >
                            <div className="relative">
                              <Heart 
                                className={`w-7 h-7 transition-all duration-300 transform group-hover/heart:scale-110 ${
                                  post.isHearted 
                                    ? 'fill-red-500 text-red-500 animate-pulse' 
                                    : 'hover:fill-red-100'
                                }`} 
                              />
                              {post.isHearted && (
                                <div className="absolute inset-0 animate-ping">
                                  <Heart className="w-7 h-7 text-red-500 opacity-75" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-lg">{post.hearts}</span>
                          </button>

                          <button className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-all duration-200 group/comment">
                            <MessageCircle className="w-6 h-6 group-hover/comment:scale-110 transition-transform" />
                            <span className="font-semibold">{post.comments.length}</span>
                          </button>

                          <button className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-all duration-200 group/share">
                            <Share2 className="w-6 h-6 group-hover/share:scale-110 transition-transform" />
                            <span className="font-semibold">Share</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 bg-gray-50/80 rounded-2xl p-4 hover:bg-gray-100/80 transition-colors">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-900">{comment.userName}</p>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-800">{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        {currentUser && (
                          <div className="flex gap-3 mt-6">
                            <img
                              src={currentUser.avatar}
                              alt="Your avatar"
                              className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-blue-200"
                            />
                            <div className="flex-1 flex gap-3">
                              <input
                                type="text"
                                placeholder="Add a thoughtful comment..."
                                className="flex-1 bg-gray-100 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 font-medium"
                                value={commentInputs[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                                }
                                onKeyPress={(e) => handleCommentKeyPress(e, post.id)}
                              />
                              <Button 
                                onClick={() => handleComment(post.id)}
                                size="sm" 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

        
            {hasMore && (
              <div className="text-center py-12">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Discover More Stories'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}