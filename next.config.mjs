import TerserPlugin from "terser-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    typedRoutes: false,
    esmExternals: "loose",
  },

  swcMinify: false,

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    if (isServer) {
      config.externals = config.externals || [];

      config.externals.push({
        "@imgly/background-removal": "commonjs @imgly/background-removal",
        "@ffmpeg/ffmpeg": "commonjs @ffmpeg/ffmpeg",
        "@ffmpeg/util": "commonjs @ffmpeg/util",
        "onnxruntime-web": "commonjs onnxruntime-web",
      });
    }

    config.optimization.minimizer = [
      new TerserPlugin({
        extractComments: false,
      }),
    ];

    return config;
  },
};

export default nextConfig;