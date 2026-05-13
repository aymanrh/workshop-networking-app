import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const repo = "ws";

// Next 16 enforces generateStaticParams() at runtime when output:"export" is set,
// which makes /people/[id] and /events/[id] crash in `next dev` for any id that
// isn't statically known. Playwright sets E2E=1 so we skip the static-export
// emit for local test runs; production builds (CI, GH Pages) still export.
const nextConfig: NextConfig = {
  output: process.env.E2E === "1" ? undefined : "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : undefined,
  assetPrefix: isPages ? `/${repo}/` : undefined,
};

export default nextConfig;
