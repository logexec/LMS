"use client";
import React from "react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Sidenav from "./components/Sidenav";
import LoginPage from "./login/page";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-slate-100">
      <Sidenav />
      <div className="lg:ml-64">
        <Navigation />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="container mx-auto min-h-[calc(100vh-theme(space.32))] p-4 lg:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            {children}
          </motion.div>
        </motion.main>
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="rounded-full border-4 border-red-600 border-t-transparent h-16 w-16 animate-spin"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
