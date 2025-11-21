'use client';

import { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function InviteLink({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const link = `${window.location.origin}/onboarding?code=${code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Invite Code:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium text-gray-900">
                {code}
            </code>
            <button
                onClick={handleCopy}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Copy Invite Link"
            >
                {copied ? (
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
                )}
            </button>
            {copied && <span className="text-xs text-green-600">Copied!</span>}
        </div>
    );
}
