/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 🔴 删掉 assetPrefix 那一行！不要它了！
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;