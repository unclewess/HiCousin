"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeIn, SlideIn } from "@/components/ui/AnimatedComponents";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-light">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cousin-pink opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cousin-blue opacity-20 blur-3xl animate-pulse delay-1000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <FadeIn delay={0.1}>
                        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white border border-cousin-yellow shadow-sm">
                            <span className="text-gray-dark font-semibold text-sm tracking-wide uppercase">
                                🇰🇪 The ancestors are watching 👀
                            </span>
                        </div>
                    </FadeIn>

                    <SlideIn direction="up" delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-fun font-bold text-gray-dark mb-8 leading-tight">
                            No more awkward <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cousin-pink to-cousin-purple">
                                money conversations.
                            </span>
                        </h1>
                    </SlideIn>

                    <SlideIn direction="up" delay={0.4}>
                        <p className="text-xl md:text-2xl text-gray-mid mb-10 max-w-2xl mx-auto leading-relaxed">
                            Track family contributions, manage welfare groups, and keep the peace without the drama.
                            Simple, transparent, and built for us.
                        </p>
                    </SlideIn>

                    <SlideIn direction="up" delay={0.6}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="primary" className="w-full sm:w-auto text-lg py-6 px-8 rounded-rounded shadow-medium">
                                        Start Your Family Group
                                        <ArrowRight className="ml-2" />
                                    </Button>
                                </SignInButton>
                            </SignedOut>

                            <SignedIn>
                                <Link href="/families">
                                    <Button variant="primary" className="w-full sm:w-auto text-lg py-6 px-8 rounded-rounded shadow-medium">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </SignedIn>

                            <a href="#features" className="w-full sm:w-auto bg-white hover:bg-gray-light text-gray-dark text-lg font-bold py-4 px-8 rounded-rounded border-2 border-gray-light transition-all">
                                See How It Works
                            </a>
                        </div>
                    </SlideIn>

                    {/* Social Proof / Trust Indicators */}
                    <FadeIn delay={0.8}>
                        <div className="mt-16 pt-8 border-t border-gray-mid/20">
                            <p className="text-sm text-gray-mid font-medium mb-4">TRUSTED BY COUSINS EVERYWHERE</p>
                            <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Placeholders for "Logos" or just fun text */}
                                <span className="font-fun font-bold text-xl text-gray-dark">The Omondis</span>
                                <span className="font-fun font-bold text-xl text-gray-dark">The Kamau Clan</span>
                                <span className="font-fun font-bold text-xl text-gray-dark">Wanjiku & Co.</span>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
