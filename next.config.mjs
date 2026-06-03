/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Expose a flag to know if credentials are configured
    // (Actual credentials are never exposed to client)
    NEXT_PUBLIC_APP_NAME: "Jadwal Kunjungan PM",
  },
};

export default nextConfig;
