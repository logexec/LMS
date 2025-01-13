"use client";

import { useAuth } from "@/contexts/AuthContext";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Sidenav from "./components/Sidenav";
import LoginPage from "./login/page";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative lg:flex lg:items-start">
      <Sidenav />
      <div className="flex-1">
        <div className="ml-64 grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen">
          <Navigation />
          <main className="flex gap-8 row-start-2 items-center sm:items-start h-full w-full p-2">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
