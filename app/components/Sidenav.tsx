"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { sidenavLinks } from "@/utils/constants";
import logo from "@/src/assets/images/logex_logo.png";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RepositionRequests } from "./Requests";
import { ScrollArea } from "@/components/ui/scroll-area";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    updateMatch();
    media.addEventListener("change", updateMatch);
    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
};

const Sidenav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const path = usePathname();
  const { hasPermission } = useAuth();
  const notification = RepositionRequests();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const filteredNavLinks = sidenavLinks
    .filter((category) => {
      if (!category.requiredPermissions) return true;

      const hasCategoryPermission = hasPermission(category.requiredPermissions);
      if (!hasCategoryPermission) return false;

      const filteredLinks = category.links.filter((link) => {
        if (!link.requiredPermissions) return true;
        return hasPermission(link.requiredPermissions);
      });

      return filteredLinks.length > 0;
    })
    .map((category) => ({
      ...category,
      links: category.links.filter(
        (link) =>
          !link.hidden &&
          (!link.requiredPermissions || hasPermission(link.requiredPermissions))
      ),
    }));

  const springTransition: Transition = {
    type: "spring", // aquí TS sabe que es el literal correcto
    bounce: 0,
    duration: 0.3,
  };

  const sidenavAnimationProps = isDesktop
    ? {
        initial: { x: 0 },
        animate: { x: 0 },
      }
    : {
        initial: { x: -320 },
        animate: { x: isMobileMenuOpen ? 0 : -320 },
        transition: springTransition,
      };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isDesktop && (
        <motion.button
          initial={false}
          animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
          className={`relative z-50 rounded-lg p-3 text-white lg:hidden ${
            isMobileMenuOpen ? "-top-[12.5rem] left-28" : "top-10 left-5"
          }`}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} className="absolute top-0 left-0" />
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

      {/* Sidebar */}
      <ScrollArea>
        <motion.aside
          {...sidenavAnimationProps}
          className="fixed top-0 bottom-0 left-0 z-40 flex w-80 flex-col bg-slate-950 bg-opacity-95 p-6 backdrop-blur-xs lg:w-[17rem]"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex justify-center h-9 w-full mx-auto relative"
          >
            <Link
              href="/"
              className="block fixed top-7 left-0 h-[inherit] w-[inherit]"
            >
              <Image
                className="object-contain"
                fill
                sizes="(max-width: 760px) 100vw, 150px"
                priority
                src={logo.src}
                alt="LogeX logo"
              />
            </Link>
          </motion.div>

          <div className="flex flex-col space-y-6 overflow-y-auto">
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
                <div className="mb-2 h-0.5 bg-linear-to-r from-red-600 to-transparent" />
                <ul className="space-y-1">
                  {item.links.map((link, linkIndex) => (
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + categoryIndex * 0.1 + linkIndex * 0.05,
                      }}
                      key={link.label}
                    >
                      <Link
                        href={link.url}
                        className={`group flex items-center justify-between rounded-lg p-2 text-sm transition-all duration-200
                        ${
                          path === link.url
                            ? "bg-red-600 text-white"
                            : "text-slate-300 hover:bg-red-600/30 hover:text-white"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <link.icon className="h-5 w-5" />
                          <span>{link.label}</span>
                        </div>

                        {link.url === "/registros/reposiciones" && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium
                            ${
                              path === link.url
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
      </ScrollArea>
    </>
  );
};

export default Sidenav;
