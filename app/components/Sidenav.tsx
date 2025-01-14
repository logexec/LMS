"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sidenavLinks } from "@/utils/constants";
import logo from "@/public/images/logex_logo.png";
import Link from "next/link";
import Image from "next/image";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    // Set initial value
    updateMatch();

    // Setup listener
    media.addEventListener("change", updateMatch);

    // Cleanup
    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
};

const Sidenav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const path = window.location.pathname;
  const notification = 8;
  const { hasPermission } = useAuth();

  const filteredNavLinks = sidenavLinks.filter((category) => {
    if (!category.requiredPermissions) return true;
    if (!hasPermission(category.requiredPermissions)) return false;
    const filteredLinks = category.links.filter((link) => {
      if (!link.requiredPermissions) return true;
      return hasPermission(link.requiredPermissions);
    });
    return filteredLinks.length > 0;
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const sidenavAnimationProps = isDesktop
    ? {
        initial: { x: 0 },
        animate: { x: 0 },
      }
    : {
        initial: { x: -320 },
        animate: { x: isMobileMenuOpen ? 0 : -320 },
        transition: { type: "spring", bounce: 0, duration: 0.4 },
      };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isDesktop && (
        <motion.button
          initial={false}
          animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
          className={`relative z-50 rounded-lg p-3 text-white lg:hidden ${
            isMobileMenuOpen ? "-top-[12.5rem] left-28" : "top-12 left-4"
          }`}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu
              size={20}
              className="absolute top-[15.5rem] left-[11.965rem]"
            />
          )}
        </motion.button>
      )}

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {!isDesktop && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidenav */}
      <motion.aside
        {...sidenavAnimationProps}
        className="fixed top-0 bottom-0 left-0 z-40 flex w-80 flex-col overflow-y-auto bg-slate-950 bg-opacity-95 p-6 backdrop-blur-sm lg:w-[17rem]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex justify-center h-11 w-56 relative"
        >
          <Image
            fill
            priority
            src={logo.src}
            alt="LogeX logo"
            className="object-contain"
            sizes="(max-width: 760px) 100cw, 150px"
          />
        </motion.div>

        <div className="flex flex-col space-y-6">
          {filteredNavLinks.map((item, categoryIndex) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + categoryIndex * 0.1 }}
              key={item.category}
              className="flex flex-col"
            >
              <h3 className="mb-2 text-sm font-semibold text-slate-400">
                {item.category}
              </h3>
              <div className="mb-2 h-0.5 bg-gradient-to-r from-red-600 to-transparent" />
              <ul className="space-y-1">
                {item.links.map((itemLink, linkIndex) => (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.3 + categoryIndex * 0.1 + linkIndex * 0.05,
                    }}
                    key={itemLink.label}
                  >
                    <Link
                      href={itemLink.url}
                      className={`group flex items-center justify-between rounded-lg p-2 text-sm transition-all duration-200
                        ${
                          path === itemLink.url
                            ? "bg-red-600 text-white"
                            : "text-slate-300 hover:bg-red-600/10 hover:text-white"
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <itemLink.icon className="h-5 w-5" />
                        <span>{itemLink.label}</span>
                      </div>

                      {itemLink.url === "/gestion/solicitudes" &&
                        notification > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium
                            ${
                              path === itemLink.url
                                ? "bg-white text-red-600"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {notification}
                          </motion.span>
                        )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidenav;
