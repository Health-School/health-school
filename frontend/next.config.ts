import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 중에 ESLint 검사를 건너뜁니다
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "localhost",
      "heathschool-video-picture.s3.ap-northeast-2.amazonaws.com",
    ], // 👈 이거 추가!
  },
};

export default nextConfig;
