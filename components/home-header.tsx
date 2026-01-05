"use client";
import Link from "next/link";
import { Button } from "@/components/ui";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

export function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { i18n } = useLingui();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu when clicking outside or on link
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest(".mobile-menu") &&
        !target.closest(".menu-toggle")
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: i18n._(msg`Home`) },
    { href: "/pricing", label: i18n._(msg`Pricing`) },
    { href: "/features", label: i18n._(msg`Features`) },
    { href: "/careers", label: i18n._(msg`Careers`) },
  ];
  const showNavLinks = false; // Toggle to true to show navigation links again

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 px-4">
        <nav className="glass-nav mx-auto w-full max-w-6xl rounded-full p-2 flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold flex items-center gap-2">
              <Image
                src="/logo/symbol-blue-1000x1155.svg"
                alt="Logo"
                width={35}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Center Navigation */}
          {showNavLinks && (
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="primaryGradient" className="text-md font-semibold px-6 py-3" asChild>
              <Link href="/signup"><Trans>Sign Up</Trans></Link>
            </Button>
            <Button variant="outline" className="text-md font-semibold px-6 py-3 bg-background/70 text-foreground hover:bg-accent" asChild>
              <Link href="/login"><Trans>Sign In</Trans></Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden menu-toggle p-2 rounded-full glass-button transition-all duration-200 hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Mobile Menu */}
          <div className="mobile-menu absolute top-20 left-4 right-4 glass-mobile-menu rounded-2xl p-6 animate-slide-down">
            <div className="flex flex-col space-y-6">
              {/* Navigation Links */}
              {showNavLinks && (
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className="text-white/90 hover:text-white text-lg font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile CTA */}
              <div
                className="pt-4 border-t border-white/20 animate-fade-in-up"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center rounded-full text-blue-300 hover:text-blue-200"
                    asChild
                  >
                    <Link href="/login" onClick={handleLinkClick}>
                      <Trans>Sign In</Trans>
                    </Link>
                  </Button>
                  <Button
                    variant="primaryGradient"
                    className="w-full justify-center rounded-full"
                    asChild
                  >
                    <Link href="/signup" onClick={handleLinkClick}>
                      <Trans>Sign Up</Trans>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomeHeader;
