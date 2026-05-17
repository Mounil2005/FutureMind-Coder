import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "leetcode.com" },
      { protocol: "https", hostname: "userpic.codeforces.org" },
    ],
  },
};

export default config;
