"use client";
import { useState, useCallback, useTransition } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upvotePost, downvotePost } from "@/lib/actions";
import { CommentList } from "@/components/post/comment-list";

interface PostActionsProps {
  postId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialComments?: number;
  onCommentClick?: (postId: string) => void;
}

export function PostActions({
  postId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialComments = 0,
  onCommentClick,
}: PostActionsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userReaction, setUserReaction] = useState<
    null | "UPVOTE" | "DOWNVOTE"
  >(null);
  const [isPending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);

  const handleUpvote = useCallback(() => {
    startTransition(async () => {
      const optimisticPrev = userReaction;
      // optimistic UI
      if (userReaction === "UPVOTE") {
        setUserReaction(null);
        setUpvotes((u) => Math.max(0, u - 1));
      } else {
        setUserReaction("UPVOTE");
        setUpvotes((u) => u + 1);
        if (userReaction === "DOWNVOTE")
          setDownvotes((d) => Math.max(0, d - 1));
      }
      const res = await upvotePost(postId);
      if (res?.error) {
        // revert
        setUserReaction(optimisticPrev);
        setUpvotes(initialUpvotes);
        setDownvotes(initialDownvotes);
      } else if (typeof res.userReaction !== "undefined") {
        setUserReaction(res.userReaction);
      }
    });
  }, [postId, userReaction, initialUpvotes, initialDownvotes]);

  const handleDownvote = useCallback(() => {
    startTransition(async () => {
      const optimisticPrev = userReaction;
      if (userReaction === "DOWNVOTE") {
        setUserReaction(null);
        setDownvotes((d) => Math.max(0, d - 1));
      } else {
        setUserReaction("DOWNVOTE");
        setDownvotes((d) => d + 1);
        if (userReaction === "UPVOTE") setUpvotes((u) => Math.max(0, u - 1));
      }
      const res = await downvotePost(postId);
      if (res?.error) {
        setUserReaction(optimisticPrev);
        setUpvotes(initialUpvotes);
        setDownvotes(initialDownvotes);
      } else if (typeof res.userReaction !== "undefined") {
        setUserReaction(res.userReaction);
      }
    });
  }, [postId, userReaction, initialUpvotes, initialDownvotes]);

  const handleComment = useCallback(() => {
    setShowComments((s) => !s);
    if (onCommentClick) onCommentClick(postId);
  }, [onCommentClick, postId]);

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <Button
          type="button"
          variant={userReaction === "UPVOTE" ? "default" : "ghost"}
          size="sm"
          className="gap-1"
          aria-label="Upvote post"
          onClick={handleUpvote}
          disabled={isPending}
        >
          <ThumbsUp className="h-4 w-4" /> {upvotes}
        </Button>
        <Button
          type="button"
          variant={userReaction === "DOWNVOTE" ? "destructive" : "ghost"}
          size="sm"
          className="gap-1"
          aria-label="Downvote post"
          onClick={handleDownvote}
          disabled={isPending}
        >
          <ThumbsDown className="h-4 w-4" /> {downvotes}
        </Button>
        <Button
          type="button"
          variant={showComments ? "secondary" : "ghost"}
          size="sm"
          className="gap-1"
          aria-label="Toggle comments"
          onClick={handleComment}
        >
          <MessageSquare className="h-4 w-4" /> {initialComments}
        </Button>
      </div>
      {showComments && (
        <div className="border-t pt-3">
          <CommentList postId={postId} />
        </div>
      )}
    </div>
  );
}
