"use client";

import { Users, TrendingUp, ShieldCheck, Smile } from "lucide-react";

const features = [
    {
        icon: <Users className="w-8 h-8 text-cousin-pink" />,
        bgColor: "bg-cousin-pink/10",
        borderColor: "border-cousin-pink/20",
        shadowColor: "shadow-cousin-pink/10",
        hoverShadow: "hover:shadow-cousin-pink/40",
        title: "Family First",
        description: "Create groups for your nuclear family, extended cousins, or that one WhatsApp group that's actually active."
    },
    {
        icon: <TrendingUp className="w-8 h-8 text-cousin-blue" />,
        bgColor: "bg-cousin-blue/10",
        borderColor: "border-cousin-blue/20",
        shadowColor: "shadow-cousin-blue/10",
        hoverShadow: "hover:shadow-cousin-blue/40",
        title: "Track Everything",
        description: "See who's paid, who's pending, and who's 'waiting for end month' (we see you 👀)."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-cousin-green" />,
        bgColor: "bg-cousin-green/10",
        borderColor: "border-cousin-green/20",
        shadowColor: "shadow-cousin-green/10",
        hoverShadow: "hover:shadow-cousin-green/40",
        title: "Total Transparency",
        description: "No more 'where did the money go?' arguments. Every shilling is accounted for."
    },
    {
        icon: <Smile className="w-8 h-8 text-cousin-yellow-dark" />,
        bgColor: "bg-cousin-yellow/20",
        borderColor: "border-cousin-yellow/30",
        shadowColor: "shadow-cousin-yellow/10",
        hoverShadow: "hover:shadow-cousin-yellow/40",
        title: "Drama Free",
        description: "Automated reminders mean you don't have to be the bad guy asking for money."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-gray-50/50 relative overflow-hidden">
            {/* Decorative Blobs - High Opacity for Visibility */}
            <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full bg-cousin-purple opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-96 h-96 rounded-full bg-cousin-green opacity-20 blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cousin-blue opacity-10 blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-fun font-bold text-cousin-purple mb-6">
                        Why hiCousins?
                    </h2>
                    <p className="text-xl text-gray-mid max-w-2xl mx-auto leading-relaxed font-secondary">
                        Because managing family money shouldn't feel like a second job.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`
                                bg-white/90 backdrop-blur-xl 
                                p-8 rounded-[2.5rem] 
                                border-2 ${feature.borderColor}
                                shadow-xl ${feature.shadowColor} ${feature.hoverShadow}
                                transition-all duration-300 
                                hover:-translate-y-2 hover:scale-105
                                group
                            `}
                        >
                            <div className={`${feature.bgColor} w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-fun font-bold text-gray-dark mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-mid leading-relaxed font-medium font-secondary">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
