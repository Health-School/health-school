import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "localhost",
      "heathschool-video-picture.s3.ap-northeast-2.amazonaws.com",
    ], // 👈 이거 추가!
  },
};

export default nextConfig;
