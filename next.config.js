/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer, dev }) => {
    // Suppress MetaMask SDK warning for @react-native-async-storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    // Force production devtool to avoid 35MB eval-source-map chunks
    if (!dev && !isServer) {
      config.devtool = false;
    }
    // Suppress missing export errors from @varity-labs/sdk beta orchestration module
    config.module.strictExportPresence = false;
    return config;
  },
};

module.exports = nextConfig;
