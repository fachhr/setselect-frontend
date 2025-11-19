"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- STYLES ---
const navLinkBaseStyles = "uppercase font-[family-name:var(--font-heading)] font-normal tracking-[1px] relative transition-colors duration-300";
const navLinkDesktopBase = `${navLinkBaseStyles} px-3 py-1.5 rounded-md`;
const navLinkMobileBase = `py-3 px-8 text-xl w-full text-center rounded-md ${navLinkBaseStyles}`;

// --- Animation Variants ---
const mobileMenuVariants = {
    hidden: {
        x: "100%",
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3
        }
    },
    exit: {
        x: "100%",
        opacity: 0,
        transition: {
            duration: 0.2
        }
    }
};

const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const mobileLinkVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            damping: 20,
            stiffness: 100
        }
    }
};

// --- NavLink Component ---
const NavLink = ({ href, children, isMobile, onClick }: {
    href: string;
    children: React.ReactNode;
    isMobile?: boolean;
    onClick?: () => void;
}) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <motion.div variants={isMobile ? mobileLinkVariants : undefined}>
            <Link
                href={href}
                className={`
          ${isMobile ? navLinkMobileBase : navLinkDesktopBase}
          ${isActive
                        ? 'text-[var(--accent-gold)] bg-[var(--accent-gold-alpha)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:bg-[var(--surface-2)]'
                    }
        `}
                onClick={onClick}
            >
                {children}
            </Link>
        </motion.div>
    );
};

// --- Hamburger Button Component ---
const HamburgerButton = ({ isOpen, onClick }: {
    isOpen: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="relative z-50 p-2 -mr-2 lg:hidden"
    >
        <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "transform translate-y-2 rotate-45" : ""
                }`} />
            <span className={`block w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : ""
                }`} />
            <span className={`block w-6 h-0.5 bg-[var(--text-primary)] rounded-full transition-all duration-300 ${isOpen ? "transform -translate-y-2 -rotate-45" : ""
                }`} />
        </div>
    </button>
);

// --- Main Header Component ---
export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${hasScrolled ? 'shadow-lg backdrop-blur-md' : 'backdrop-blur-sm'
                    }`}
                style={{
                    backgroundColor: isHomepage && !hasScrolled
                        ? 'rgba(13, 27, 46, 0.6)'
                        : hasScrolled
                            ? 'rgba(13, 27, 46, 0.95)'
                            : 'var(--surface-1)',
                    borderBottom: hasScrolled
                        ? '1px solid rgba(212, 175, 55, 0.2)'
                        : '1px solid transparent',
                }}
            >
                <div className="h-16 sm:h-24 flex items-center">
                    <div className="container mx-auto flex items-center justify-between px-6 sm:px-8 lg:px-12">

                        <Link
                            href="/"
                            className="flex-shrink-0 transition-transform duration-fast hover:scale-105"
                            onClick={closeMobileMenu}
                        >
                            <span
                                className="text-2xl sm:text-3xl font-heading font-bold tracking-tight"
                                style={{ color: 'var(--accent-gold)' }}
                            >
                                Silvia&apos;s List
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-4">
                            <nav className="flex items-center gap-2">
                                <NavLink href="/">Browse Talent</NavLink>
                            </nav>
                            <Link
                                href="/join"
                                className="px-6 py-2.5 text-sm font-semibold uppercase tracking-wide rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border"
                                style={{
                                    backgroundColor: 'var(--accent-gold)',
                                    color: 'var(--button-text-on-gold)',
                                    borderColor: 'var(--accent-gold)',
                                    boxShadow: 'var(--glow-gold-subtle)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-gold-hover)';
                                    e.currentTarget.style.borderColor = 'var(--accent-gold-hover)';
                                    e.currentTarget.style.boxShadow = 'var(--glow-gold)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                    e.currentTarget.style.boxShadow = 'var(--glow-gold-subtle)';
                                }}
                            >
                                Join Silvia&apos;s List
                            </Link>
                        </div>

                        <HamburgerButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 bg-black/30 z-[999]"
                            onClick={closeMobileMenu}
                        />

                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="lg:hidden fixed top-0 right-0 h-full w-full bg-[var(--surface-1)] z-[1000]"
                            style={{
                                borderLeft: '1px solid var(--light-400)',
                            }}
                        >
                            <div className="h-full flex flex-col">
                                <div className="h-16 sm:h-24 flex items-center justify-end px-4">
                                    <HamburgerButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
                                </div>

                                <motion.nav
                                    variants={navContainerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex-1 flex flex-col items-center justify-center gap-6 px-4 w-full max-w-xs mx-auto"
                                >
                                    <NavLink href="/" isMobile onClick={closeMobileMenu}>
                                        Browse Talent
                                    </NavLink>
                                    <motion.hr
                                        variants={mobileLinkVariants}
                                        className="border-[var(--light-400)] my-2 w-16"
                                        style={{ borderColor: 'var(--light-400)' }}
                                    />
                                    <motion.div variants={mobileLinkVariants} className="w-full">
                                        <Link
                                            href="/join"
                                            className="block w-full px-8 py-3 text-lg font-semibold uppercase tracking-wide rounded-lg transition-all duration-200 text-center"
                                            style={{
                                                backgroundColor: 'var(--accent-gold)',
                                                color: 'var(--button-text-on-gold)',
                                                border: '1px solid var(--accent-gold)',
                                                boxShadow: 'var(--glow-gold-subtle)',
                                            }}
                                            onClick={closeMobileMenu}
                                        >
                                            Join Silvia&apos;s List
                                        </Link>
                                    </motion.div>
                                </motion.nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
