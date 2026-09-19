/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hides the round "N" dev badge; it never ships to production anyway.
  devIndicators: false,
  async redirects() {
    return [
      { source: "/portfolio", destination: "/#works", permanent: false },
      // /brief used to bounce to the contact form; it is a real page now
    ];
  },
};

export default nextConfig;
