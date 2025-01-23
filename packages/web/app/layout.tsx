import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-gray-950 text-gray-100">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
