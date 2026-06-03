import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jadwal Kunjungan PM",
  description: "Aplikasi jadwal kunjungan preventive maintenance",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f2f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
