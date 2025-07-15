"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import Sidenav from "@/app/components/Sidenav";
import Navigation from "@/app/components/Navigation";
import Loader from "@/app/Loader";
import LoginPage from "@/app/login/page";
import { DataProvider } from "./DataContext";
const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <span className="block p-0 m-0 fixed left-56 bottom-5 z-50">
        <ModeToggle />
      </span>
      <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 antialiased">
        <Toaster position="top-right" richColors closeButton expand />
        <Sidenav />
        <div className="information-container">
          <Navigation />
          <AnimatePresence mode="wait">
            <motion.main
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
              className="mx-auto min-h-[calc(100vh-theme(space.32))] p-4 lg:p-6"
            >
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-white dark:bg-black p-6 shadow-lg lg:min-h-[calc(100vh-9rem)]"
              >
                {children}
              </motion.div>
            </motion.main>
          </AnimatePresence>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-0 right-8 w-fit text-center text-sm text-white bg-red-600 rounded-t-lg p-1 opacity-60 cursor-default">
            LMS | Versión 3.3.4 | Beta
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AnimatePresence mode="wait">
          <LoginPage />
        </AnimatePresence>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DataProvider>
        <AnimatePresence mode="wait">
          <DashboardLayout>{children}</DashboardLayout>
        </AnimatePresence>
      </DataProvider>
    </ThemeProvider>
  );
}
