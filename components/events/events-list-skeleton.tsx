import { Skeleton } from "@/components/ui/skeleton";

export function EventsListSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-[88px] w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
