"use client";

import { useState } from "react";
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
import { createEventSchema, type CreateEventFormData } from "@/lib/schema";
import { format } from "date-fns";
import { createEvent } from "@/lib/actions";
import { Dropzone } from "@/components/ui/dropzone";
import { nsfwCheckFile } from "@/lib/nsfw-check";

// Overlay form to create an Event using shadcn ui + Zod
export function CreateEventDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [scanDecision, setScanDecision] = useState<"allow" | "review" | "block" | null>(null);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      thumbnail: "",
      eventDate: undefined as unknown as Date,
    },
  });

  const onSubmit = async (values: CreateEventFormData) => {
    try {
      // If a file is provided, build FormData so backend can receive multipart upload
      const hasFile = (values as any).thumbnailFile instanceof File;
      let res;
      if (hasFile) {
        const fd = new FormData();
        fd.append("name", values.name);
        fd.append("description", values.description);
        fd.append("category", values.category);
        fd.append("eventDate", values.eventDate.toISOString());
        fd.append("thumbnail", (values as any).thumbnail || "");
        fd.append("thumbnailFile", (values as any).thumbnailFile);
        res = await createEvent(fd as any);
      } else {
        const payload = {
          name: values.name,
          description: values.description,
          category: values.category,
          thumbnail: values.thumbnail || "",
          eventDate: values.eventDate.toISOString(),
        } as const;
        res = await createEvent(payload);
      }
      if (res?.status === "success") {
        toast.success(res.message ?? "Event created");
        form.reset();
        setOpen(false);
      } else {
        toast.error(res?.message ?? "Failed to create event");
      }
    } catch (e) {
      toast.error("Something went wrong creating the event");
    }
  };

  // Validate selected image using NSFW.js and update RHF field accordingly
  async function onFileChange(f: File | null, onChange: (v: File | null) => void) {
    if (!f) {
      setMsg("");
      setScanDecision(null);
      setFile(null);
      onChange(null);
      return;
    }
    setMsg("Checking image…");
    setScanDecision(null);
    try {
      const { decision } = await nsfwCheckFile(f);
      setScanDecision(decision as any);
      if (decision === "block") {
        setMsg("❌ Image blocked (adult content). Choose another image.");
        setFile(null);
        onChange(null);
        return;
      }
      if (decision === "review") {
        setMsg("⚠️ Possibly sensitive. We’ll mark it for review.");
      } else {
        setMsg("✅ Looks okay.");
      }
      setFile(f);
      onChange(f);
    } catch (e) {
      setMsg("Could not scan image. Please try another file.");
      setScanDecision(null);
      setFile(null);
      onChange(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Create event</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create new event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Describe your event" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tech, Music" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <div className="grid gap-2">
                    <FormControl>
                      <Input placeholder="https://... (optional if you upload)" {...field} />
                    </FormControl>
                    <Controller
                      control={form.control}
                      name="thumbnailFile"
                      render={({ field: fileField }) => (
                        <div className="space-y-1">
                          <Dropzone
                            value={(fileField.value as unknown as File | null) ?? file}
                            onFileSelected={(f) => onFileChange(f as File | null, (v) => fileField.onChange(v as any))}
                          />
                          {msg ? (
                            <p
                              className={
                                scanDecision === "block"
                                  ? "text-xs text-red-600"
                                  : scanDecision === "review"
                                  ? "text-xs text-amber-600"
                                  : "text-xs text-muted-foreground"
                              }
                            >
                              {msg}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>Event date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal w-full justify-start",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
