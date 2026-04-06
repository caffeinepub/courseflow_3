import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
