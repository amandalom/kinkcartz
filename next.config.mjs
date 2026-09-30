/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add specific remotePatterns entries here once product images are
  // hosted somewhere real — a wildcard hostname is a known DoS vector
  // in the Image Optimizer.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
