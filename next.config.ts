import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // サービスワーカーは更新がすぐ反映されるよう、キャッシュさせない
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  experimental: {
    // 一度開いたページは30秒間キャッシュから即表示する（更新系の操作では revalidatePath で破棄される）
    staleTimes: {
      dynamic: 30,
    },
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
