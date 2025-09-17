"use client";
import { useEffect, useState, useTransition } from "react";
import { getComments, addComment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentDTO {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getComments(postId);
      if (mounted) setComments(data);
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const onSubmit = () => {
    if (!input.trim()) return;
    const optimistic: CommentDTO = {
      id: "temp-" + Date.now(),
      content: input,
      userId: "me",
      postId,
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [...c, optimistic]);
    const value = input;
    setInput("");
    startTransition(async () => {
      const res = await addComment(postId, value);
      if (res?.error) {
        // rollback
        setComments((c) => c.filter((cm) => cm.id !== optimistic.id));
      } else {
        // replace optimistic with real if returned
        if (res?.id) {
          setComments((c) =>
            c.map((cm) => (cm.id === optimistic.id ? res : cm))
          );
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded border px-2 py-1 bg-muted/30">
            <div className="text-[10px] text-muted-foreground">
              {new Date(c.createdAt).toLocaleString()}
            </div>
            <p className="text-xs whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[60px]"
        />
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isPending || !input.trim()}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
