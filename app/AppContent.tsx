"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Sidenav from "./components/Sidenav";
import LoginPage from "./login/page";
import Loader from "./Loader";
import { Toaster } from "sonner";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-slate-100 antialiased">
      <Toaster position="top-right" richColors closeButton expand />
      <Sidenav />
      <div className="lg:ml-[17rem]">
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
              className="rounded-xl bg-white p-6 shadow-lg lg:min-h-[calc(100vh-9rem)]"
            >
              {children}
            </motion.div>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
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
      <AnimatePresence mode="wait">
        <LoginPage />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <DashboardLayout>{children}</DashboardLayout>
    </AnimatePresence>
  );
}
