// Server component. Required so `output: "export"` can statically generate
// the /people/[id] route shell — the actual id is read client-side via
// `useParams()` because IDs live in IndexedDB and are unknown at build time.
// Returning a single placeholder id from generateStaticParams emits one HTML
// file that hydrates against any user-supplied id at runtime.

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function PersonDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
