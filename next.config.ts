import type { NextConfig } from "next";

function hostFromUrl(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const envAllowedOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedDevOrigins = Array.from(
  new Set(
    [
      "localhost",
      "127.0.0.1",
      "192.168.178.97",
      hostFromUrl(process.env.AUTH_URL),
      hostFromUrl(process.env.APP_BASE_URL),
      ...envAllowedOrigins
    ].filter((value): value is string => Boolean(value))
  )
);

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
