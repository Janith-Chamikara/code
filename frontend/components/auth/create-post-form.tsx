"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createPostSchema, type CreatePostFormData } from "@/lib/schema";
import { createPost } from "@/lib/actions";
import { Dropzone } from "@/components/ui/dropzone";
import { useSession } from "next-auth/react";

export function CreatePostDialog({
  trigger,
  eventId,
}: {
  trigger?: React.ReactNode;
  eventId: string;
}) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  console.log("Event ID:", eventId);
  const { data: session } = useSession();
  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema) as any,
    defaultValues: {
      content: "",
      eventId,
      userId: "",
      imageFile: undefined as any,
    } as Partial<CreatePostFormData>,
  });
  console.log(form.formState.errors);
  console.log("Event ID inside component:", eventId);
  const onSubmit = async (values: CreatePostFormData) => {
    try {
      if (!session?.user?.id) {
        toast.error("Missing user session");
        return;
      }
      const hasFile = (values as any).imageFile instanceof File;
      let res;
      if (hasFile) {
        const fd = new FormData();
        fd.append("content", values.content);
        fd.append("eventId", eventId);
        fd.append("userId", session.user.id);
        if ((values as any).imageUrl)
          fd.append("imageUrl", (values as any).imageUrl);
        fd.append("imageFile", (values as any).imageFile);
        res = await createPost(fd as any);
      } else {
        const payload = {
          content: values.content,
          eventId: eventId,
          userId: session.user.id,
        } as const;
        res = await createPost(payload as any);
      }
      if (res?.status === "success") {
        toast.success(res.message ?? "Post created");
        form.reset({
          content: "",
        });
        setOpen(false);
      } else {
        toast.error(res?.message ?? "Failed to create post");
      }
    } catch (e) {
      console.error("Create post error", e);
      toast.error("Something went wrong creating the post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Create post</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create new post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Write something..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" name="eventId" value={eventId} />
            <input
              type="hidden"
              name="userId"
              value={session?.user?.id ?? ""}
            />
            <div className="space-y-2">
              <Controller
                control={form.control}
                name="imageFile"
                render={({ field: fileField }) => (
                  <Dropzone
                    value={fileField.value as unknown as File | null}
                    onFileSelected={(f) => fileField.onChange(f)}
                  />
                )}
              />
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-black text-white hover:bg-gray-800"
              >
                {form.formState.isSubmitting ? "Posting..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
