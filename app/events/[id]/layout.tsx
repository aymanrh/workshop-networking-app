// Server component. Mirrors /people/[id] — placeholder static param + client useParams.

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
