"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPostSchema, type CreatePostFormData } from "@/lib/schema";
import { format } from "date-fns";
import { createPost } from "@/lib/actions";
import { Dropzone } from "@/components/ui/dropzone";

// Overlay form to create a Post using shadcn ui + Zod
export function CreatePostDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
      eventId: eventId ?? "",
    },
  });

  const onSubmit = async (values: CreatePostFormData) => {
    try {
      // If a file is provided, build FormData so backend can receive multipart upload
      const hasFile = (values as any).imageFile instanceof File;
      let res;
      if (hasFile) {
        const fd = new FormData();
        fd.append("content", values.content);
        fd.append("eventId", values.eventId);
        if ((values as any).imageUrl) fd.append("imageUrl", (values as any).imageUrl);
        fd.append("imageFile", (values as any).imageFile);
        res = await createPost(fd as any);
      } else {
        const payload = {
          content: values.content,
          eventId: values.eventId,
          imageUrl: values.imageUrl || "",
        } as const;
        res = await createPost(payload);
      }
      if (res?.status === "success") {
        toast.success(res.message ?? "Post created");
        form.reset();
        setOpen(false);
      } else {
        toast.error(res?.message ?? "Failed to create post");
      }
    } catch (e) {
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Write something..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" name="eventId" value={eventId ?? ""} />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <div className="grid gap-2">
                    <FormControl>
                      <Input placeholder="https://... (optional if you upload)" {...field} />
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Posting..." : "Create post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
