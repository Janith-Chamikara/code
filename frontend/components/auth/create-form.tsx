"use client";

import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [blockOpen, setBlockOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema) as unknown as Resolver<CreateEventFormData>,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      // Provide a concrete Date to satisfy types; user can change it
      eventDate: new Date(),
    },
  });

  const onSubmit = async (values: CreateEventFormData) => {
    try {
      // If a file is provided, build FormData so backend can receive multipart upload
      const hasFile = (values as any).thumbnail instanceof File;
      let res;
      if (hasFile) {
        const fd = new FormData();
        fd.append("title", values.title);
        fd.append("description", values.description);
        fd.append("category", values.category);
        fd.append("eventDate", values.eventDate.toISOString());
        fd.append("thumbnail", (values as any).thumbnail);
        res = await createEvent(fd as any);
      } else {
        const payload = {
          title: values.title,
          description: values.description,
          category: values.category,
          // When no file was chosen, let backend handle missing; send nothing for thumbnail
          eventDate: values.eventDate.toISOString(),
        } as const;
        res = await createEvent(payload as any);
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
    // Only show UI if the image is blocked; otherwise keep it quiet
    setMsg("");
    setScanDecision(null);
    try {
      setScanning(true);
      const { decision } = await nsfwCheckFile(f);
      if (decision === "block") {
        setScanDecision("block");
        setMsg("Image blocked (adult content). Choose another image.");
        setFile(null);
        onChange(null);
        setBlockOpen(true);
        return;
      }
      // For allow/review: accept silently without any message or color change
      setMsg("");
      setScanDecision(null);
      setFile(f);
      onChange(f);
    } catch (e) {
      setMsg("Could not scan image. Please try another file.");
      setScanDecision(null);
      setFile(null);
      onChange(null);
    } finally {
      setScanning(false);
    }
  }

  const hasUnsavedChanges = () => {
    return !!file || form.formState.isDirty;
  };

  const discardChanges = () => {
    form.reset();
    setFile(null);
    setMsg("");
    setScanDecision(null);
    setBlockOpen(false);
    setScanning(false);
    setConfirmDiscardOpen(false);
    setOpen(false);
  };

  const attemptClose = () => {
    if (hasUnsavedChanges()) {
      setConfirmDiscardOpen(true);
      return;
    }
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      attemptClose();
      return; // do not close immediately; wait for user confirmation
    }
    setOpen(true);
  };

  return (
  <Dialog open={open} onOpenChange={handleOpenChange}>
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
              name="title"
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
                    <Controller
                      control={form.control}
                      name="thumbnail"
                      render={({ field: fileField }) => (
                        <div className={cn(
                          scanDecision === "block" && "space-y-1 rounded-md border p-2 border-red-300 bg-red-50/60"
                        )}>
                          <div className="relative">
                            {scanning && (
                              <div className="absolute inset-0 z-10 grid place-items-center rounded-md bg-background/70">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "-0.2s" }} />
                                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "-0.1s" }} />
                                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                                </div>
                              </div>
                            )}
                            <Dropzone
                              className={cn(scanning && "opacity-50 pointer-events-none select-none")}
                              value={(fileField.value as unknown as File | null) ?? file}
                              onFileSelected={(f) => onFileChange(f as File | null, (v) => fileField.onChange(v as any))}
                            />
                          </div>
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Blocked image modal */}
            <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Image blocked</AlertDialogTitle>
                  <AlertDialogDescription>
                    This image appears to contain adult content. Please choose another file.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setBlockOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              <Button type="button" variant="outline" onClick={attemptClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {/* Confirm discard modal */}
        <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                If you leave now, your changes will not be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setConfirmDiscardOpen(false)}>Continue editing</Button>
              <AlertDialogAction onClick={discardChanges}>Discard</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
