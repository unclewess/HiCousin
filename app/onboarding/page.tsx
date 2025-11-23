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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome to hiCousins
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Get started by creating or joining a family group.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">

                    {/* Create Family Section */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Create a Family</h3>
                        <form action={handleCreate} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Family Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g. Smith Cousins"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Family'}
                            </button>
                        </form>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    {/* Join Family Section */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Join a Family</h3>
                        <form action={handleJoin} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Invite Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        defaultValue={inviteCode || ''}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g. ABC123"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
