import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl) : null;
const supabaseProtocol: "http" | "https" | undefined = supabaseOrigin
  ? supabaseOrigin.protocol === "http:"
    ? "http"
    : "https"
  : undefined;
const supabaseImagePatterns: RemotePattern[] = supabaseOrigin
  ? [
      {
        protocol: supabaseProtocol,
        hostname: supabaseOrigin.hostname,
        ...(supabaseOrigin.port ? { port: supabaseOrigin.port } : {}),
        pathname: "/storage/v1/object/public/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 5 * 1024 * 1024,
    },
  },
  images: {
    remotePatterns: supabaseImagePatterns,
  },
};

export default nextConfig;