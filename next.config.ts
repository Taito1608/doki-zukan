import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
