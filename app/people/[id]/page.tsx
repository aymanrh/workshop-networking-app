"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePerson } from "@/hooks/use-people";
import { PersonDetail } from "@/components/people/person-detail";
import { Skeleton } from "@/components/ui/skeleton";

function PersonDetailSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function NotFound() {
  return (
    <section className="space-y-4 pt-6 text-center">
      <p className="text-sm text-muted-foreground">
        This person doesn&apos;t exist or was removed.
      </p>
      <Link
        href="/people"
        className="inline-flex items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to people
      </Link>
    </section>
  );
}

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const person = usePerson(id);

  if (person === undefined) return <PersonDetailSkeleton />;
  if (person === null || id === "_" || !id) return <NotFound />;
  return <PersonDetail person={person} />;
}
