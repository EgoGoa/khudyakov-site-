/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/portfolio", destination: "/#works", permanent: false },
      // /brief used to bounce to the contact form; it is a real page now
    ];
  },
};

export default nextConfig;
