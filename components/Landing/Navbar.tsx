"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-navy-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
                        <span className="text-2xl group-hover:animate-wave inline-block origin-bottom-right">👋</span>
                        <span className="font-display text-2xl font-bold text-navy-900 tracking-tight">
                            hiCousins
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-navy-600 hover:text-coral-500 font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="#about" className="text-navy-600 hover:text-coral-500 font-medium transition-colors">
                            About
                        </Link>
                        <Link href="#contact" className="text-navy-600 hover:text-coral-500 font-medium transition-colors">
                            Contact
                        </Link>
                        <SignInButton mode="modal">
                            <button className="bg-navy-900 hover:bg-coral-500 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-coral-500/25">
                                Sign In
                            </button>
                        </SignInButton>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-navy-900 hover:text-coral-500 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-navy-100 absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
                        <Link
                            href="#features"
                            className="block px-3 py-2 text-navy-600 hover:text-coral-500 font-medium rounded-md hover:bg-navy-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#about"
                            className="block px-3 py-2 text-navy-600 hover:text-coral-500 font-medium rounded-md hover:bg-navy-50"
                            onClick={() => setIsOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="#contact"
                            className="block px-3 py-2 text-navy-600 hover:text-coral-500 font-medium rounded-md hover:bg-navy-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                        <div className="pt-4">
                            <SignInButton mode="modal">
                                <button className="w-full bg-navy-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
