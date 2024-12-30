import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Sidenav from "./components/Sidenav";

export const metadata: Metadata = {
  title: "LMS | Logex Administración",
  description: "LogeX | Supply Chain Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="grid grid-cols-[auto_1fr]">
          <Sidenav />
          <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen">
            <Navigation />
            <main className="flex gap-8 row-start-2 items-center sm:items-start h-full w-full p-2">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
