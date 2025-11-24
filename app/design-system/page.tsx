import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-gray-light p-8 space-y-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-fun text-cousin-purple mb-2">Design System Showcase</h1>
                <p className="text-gray-dark mb-8">Verifying colors, typography, and core components.</p>

                {/* Colors */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-dark">Colors</h2>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="h-20 rounded-soft bg-cousin-green flex items-center justify-center text-white font-semibold">Green</div>
                        <div className="h-20 rounded-soft bg-cousin-yellow flex items-center justify-center text-gray-dark font-semibold">Yellow</div>
                        <div className="h-20 rounded-soft bg-cousin-blue flex items-center justify-center text-white font-semibold">Blue</div>
                        <div className="h-20 rounded-soft bg-cousin-pink flex items-center justify-center text-white font-semibold">Pink</div>
                        <div className="h-20 rounded-soft bg-cousin-purple flex items-center justify-center text-white font-semibold">Purple</div>
                    </div>
                </section>

                {/* Typography */}
                <section className="space-y-4 mt-12">
                    <h2 className="text-2xl font-bold text-gray-dark">Typography</h2>
                    <div className="space-y-2">
                        <p className="font-sans text-4xl font-bold">Inter (Headings/Body) - The quick brown fox</p>
                        <p className="font-secondary text-4xl">Nunito (Secondary) - The quick brown fox</p>
                        <p className="font-fun text-4xl text-cousin-purple">Baloo 2 (Fun Accent) - The quick brown fox</p>
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-4 mt-12">
                    <h2 className="text-2xl font-bold text-gray-dark">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="danger">Danger Button</Button>
                        <Button variant="primary" isLoading>Loading</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                    </div>
                </section>

                {/* Inputs */}
                <section className="space-y-4 mt-12">
                    <h2 className="text-2xl font-bold text-gray-dark">Inputs</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <Input label="Username" placeholder="Enter your username" />
                        <Input label="Email" placeholder="Enter your email" error="Invalid email address" />
                    </div>
                </section>

                {/* Cards */}
                <section className="space-y-4 mt-12">
                    <h2 className="text-2xl font-bold text-gray-dark">Cards</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <Card>
                            <h3 className="text-xl font-bold mb-2">Default Card</h3>
                            <p className="text-gray-mid">This is a standard card component with rounded corners and soft shadow.</p>
                        </Card>
                        <Card variant="hoverable">
                            <h3 className="text-xl font-bold mb-2 text-cousin-blue">Hoverable Card</h3>
                            <p className="text-gray-mid">Hover over me to see the lift effect!</p>
                        </Card>
                    </div>
                </section>

                {/* Progress Bars */}
                <section className="space-y-16 mt-12 pb-20">
                    <h2 className="text-2xl font-bold text-gray-dark">Hybrid Gamey-Financial Progress</h2>
                    <div className="space-y-12">
                        <ProgressBar
                            progress={25}
                            targetAmount={1000}
                            currentAmount={250}
                        />
                        <ProgressBar
                            progress={50}
                            targetAmount={1000}
                            currentAmount={500}
                        />
                        <ProgressBar
                            progress={85}
                            targetAmount={1000}
                            currentAmount={850}
                        />
                        <ProgressBar
                            progress={100}
                            targetAmount={1000}
                            currentAmount={1000}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
