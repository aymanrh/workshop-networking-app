import { Skeleton } from "@/components/ui/skeleton";

export function PeopleListSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-[72px] w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
