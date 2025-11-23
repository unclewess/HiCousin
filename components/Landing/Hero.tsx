"use client";

import { SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-navy-50">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-coral-200 opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-navy-200 opacity-20 blur-3xl animate-pulse delay-1000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-coral-100 border border-coral-200">
                        <span className="text-coral-800 font-semibold text-sm tracking-wide uppercase">
                            🇰🇪 The ancestors are watching 👀
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-navy-900 mb-8 leading-tight">
                        No more awkward <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-coral-600">
                            money conversations.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-navy-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Track family contributions, manage welfare groups, and keep the peace without the drama.
                        Simple, transparent, and built for us.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <SignInButton mode="modal">
                            <button className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-coral-500/30 flex items-center justify-center gap-2 group">
                                Start Your Family Group
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignInButton>

                        <a href="#features" className="w-full sm:w-auto bg-white hover:bg-navy-50 text-navy-900 text-lg font-bold py-4 px-8 rounded-2xl border-2 border-navy-100 transition-all">
                            See How It Works
                        </a>
                    </div>

                    {/* Social Proof / Trust Indicators */}
                    <div className="mt-16 pt-8 border-t border-navy-100/50">
                        <p className="text-sm text-navy-400 font-medium mb-4">TRUSTED BY COUSINS EVERYWHERE</p>
                        <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholders for "Logos" or just fun text */}
                            <span className="font-display font-bold text-xl">The Omondis</span>
                            <span className="font-display font-bold text-xl">The Kamau Clan</span>
                            <span className="font-display font-bold text-xl">Wanjiku & Co.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
