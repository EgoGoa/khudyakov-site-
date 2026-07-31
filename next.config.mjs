/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/portfolio", destination: "/#works", permanent: false },
      { source: "/brief", destination: "/#contact", permanent: false },
    ];
  },
};

export default nextConfig;
