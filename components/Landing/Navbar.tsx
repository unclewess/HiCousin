"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
                        <span className="text-2xl group-hover:animate-wave inline-block origin-bottom-right">👋</span>
                        <span className="font-fun text-2xl font-bold text-cousin-purple tracking-tight">
                            hiCousins
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-gray-mid hover:text-cousin-pink font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="#about" className="text-gray-mid hover:text-cousin-pink font-medium transition-colors">
                            About
                        </Link>
                        <Link href="#contact" className="text-gray-mid hover:text-cousin-pink font-medium transition-colors">
                            Contact
                        </Link>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="primary" className="rounded-full">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <Link href="/families">
                                <Button variant="primary" className="rounded-full">
                                    Dashboard
                                </Button>
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-dark hover:text-cousin-pink transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-light absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
                        <Link
                            href="#features"
                            className="block px-3 py-2 text-gray-mid hover:text-cousin-pink font-medium rounded-md hover:bg-gray-light"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#about"
                            className="block px-3 py-2 text-gray-mid hover:text-cousin-pink font-medium rounded-md hover:bg-gray-light"
                            onClick={() => setIsOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="#contact"
                            className="block px-3 py-2 text-gray-mid hover:text-cousin-pink font-medium rounded-md hover:bg-gray-light"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                        <div className="pt-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="primary" className="w-full rounded-xl">
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/families" onClick={() => setIsOpen(false)}>
                                    <Button variant="primary" className="w-full rounded-xl">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
