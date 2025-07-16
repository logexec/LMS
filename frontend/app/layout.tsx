import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import AppContent from "@/contexts/AppContent";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS | Logex Administración",
  description: "LogeX | Supply Chain Management",
};

// Este es un componente de servidor
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-Ec">
      <body className="antialiased">
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
