"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEventSchema, type CreateEventFormData } from "@/lib/schema";
import { format } from "date-fns";
import { createEvent } from "@/lib/actions";
import { Dropzone } from "@/components/ui/dropzone";
import { useSession } from "next-auth/react";
import { nsfwCheckFile } from "@/lib/nsfw-check";

export function CreateEventDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [scanDecision, setScanDecision] = useState<"allow" | "review" | "block" | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      eventDate: undefined as unknown as Date,
      thumbnail: undefined as any,
    } as Partial<CreateEventFormData>,
  });

  const onSubmit = async (values: CreateEventFormData) => {
    try {
      if (!session) {
        toast.error("Cannot find user id");
        return;
      }
      if (!thumbnailFile) {
        toast.error("Thumbnail is required");
        return;
      }
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("adminId", session?.user.id);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("eventDate", values.eventDate.toISOString());
      formData.append("thumbnail", thumbnailFile);

      const res = await createEvent(formData as any);

      if (res?.status === "success") {
        toast.success(res.message ?? "Event created");
        reset();
        setThumbnailFile(null);
        setOpen(false);
      } else {
        toast.error(res?.message ?? "Failed to create event");
      }
    } catch (e) {
      console.error("Error creating event", e);
      toast.error("Something went wrong creating the event");
    }
  };

  // NSFW check on file select. Block -> clear file + show dialog. Allow/Review -> accept silently.
  async function onThumbnailSelected(file: File | null) {
    if (!file) {
      setScanDecision(null);
      setThumbnailFile(null);
      setValue("thumbnail", null as any, { shouldValidate: true });
      return;
    }
    try {
      setScanning(true);
      const { decision } = await nsfwCheckFile(file);
      if (decision === "block") {
        setScanDecision("block");
        setThumbnailFile(null);
        setValue("thumbnail", null as any, { shouldValidate: true });
        setBlockOpen(true);
        return;
      }
      // allow/review
      setScanDecision(null);
      setThumbnailFile(file);
      setValue("thumbnail", file as any, { shouldValidate: true });
    } catch (e) {
      // On scan failure, do not accept the file
      setScanDecision(null);
      setThumbnailFile(null);
      setValue("thumbnail", null as any, { shouldValidate: true });
      toast.error("Couldn't scan the image. Try another file.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Create event</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="title"
                  placeholder="Enter event name"
                  className="h-12"
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  rows={4}
                  placeholder="Describe your event"
                  className="resize-none"
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="category"
                  placeholder="e.g. Tech, Music, Sports"
                  className="h-12"
                />
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Controller
              name="eventDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date ?? undefined);
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.eventDate && (
              <p className="text-sm text-red-600">{errors.eventDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Upload Thumbnail</Label>
            <Controller
              name="thumbnail"
              control={control}
              render={() => (
                <div className={cn(
                  scanDecision === "block" && "rounded-md border p-2 border-red-300 bg-red-50/60"
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
                      value={thumbnailFile as File | null}
                      onFileSelected={(f) => onThumbnailSelected(f as File | null)}
                    />
                  </div>
                </div>
              )}
            />
            {errors.thumbnail && (
              <p className="text-sm text-red-600">
                {errors.thumbnail.message as string}
              </p>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
