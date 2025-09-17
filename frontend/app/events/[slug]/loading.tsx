export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
        <div className="h-4 w-1/4 bg-muted rounded" />
      </div>
    </div>
  );
}
