"use client";

import { Users, TrendingUp, ShieldCheck, Smile } from "lucide-react";

const features = [
    {
        icon: <Users className="w-8 h-8 text-coral-500" />,
        title: "Family First",
        description: "Create groups for your nuclear family, extended cousins, or that one WhatsApp group that's actually active."
    },
    {
        icon: <TrendingUp className="w-8 h-8 text-navy-500" />,
        title: "Track Everything",
        description: "See who's paid, who's pending, and who's 'waiting for end month' (we see you 👀)."
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-coral-500" />,
        title: "Total Transparency",
        description: "No more 'where did the money go?' arguments. Every shilling is accounted for."
    },
    {
        icon: <Smile className="w-8 h-8 text-navy-500" />,
        title: "Drama Free",
        description: "Automated reminders mean you don't have to be the bad guy asking for money."
    }
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4">
                        Why hiCousins?
                    </h2>
                    <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                        Because managing family money shouldn't feel like a second job.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-navy-50 p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1 border border-navy-100 group">
                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-navy-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-navy-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
