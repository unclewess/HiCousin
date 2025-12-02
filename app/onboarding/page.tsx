'use client';

import { useState, Suspense } from 'react';
import { createFamily, joinFamily } from '../actions';
import { useRouter, useSearchParams } from 'next/navigation';

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get('code');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await createFamily(formData);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else if (res?.familyId) {
            router.push(`/dashboard/${res.familyId}`);
        }
    }

    async function handleJoin(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await joinFamily(formData);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else if (res?.familyId) {
            router.push(`/dashboard/${res.familyId}`);
        }
    }

    return (
        <div className="min-h-screen bg-gray-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-dark font-fun">
                        Welcome to hiCousins
                    </h2>
                    <p className="mt-2 text-sm text-gray-mid">
                        Get started by creating or joining a family group.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-medium rounded-rounded sm:px-10 space-y-6">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-soft relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Create Family Section */}
                    <div>
                        <h3 className="text-lg leading-6 font-bold text-gray-dark">Create a Family</h3>
                        <form action={handleCreate} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-dark">
                                    Family Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-mid/30 rounded-soft shadow-sm placeholder-gray-mid focus:outline-none focus:ring-cousin-purple focus:border-cousin-purple sm:text-sm"
                                        placeholder="e.g. Smith Cousins"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-soft shadow-sm text-sm font-bold text-white bg-cousin-purple hover:bg-cousin-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cousin-purple disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Family'}
                            </button>
                        </form>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-mid/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-mid font-medium">Or</span>
                        </div>
                    </div>

                    {/* Join Family Section */}
                    <div>
                        <h3 className="text-lg leading-6 font-bold text-gray-dark">Join a Family</h3>
                        <form action={handleJoin} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-dark">
                                    Invite Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        defaultValue={inviteCode || ''}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-mid/30 rounded-soft shadow-sm placeholder-gray-mid focus:outline-none focus:ring-cousin-green focus:border-cousin-green sm:text-sm"
                                        placeholder="e.g. ABC123"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-soft shadow-sm text-sm font-bold text-white bg-cousin-green hover:bg-cousin-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cousin-green disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Joining...' : 'Join Family'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
