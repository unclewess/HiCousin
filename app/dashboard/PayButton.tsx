'use client';

import { useState } from 'react';
import { payContribution } from '../actions';
import { useRouter } from 'next/navigation';

export default function PayButton({ familyId, amount, disabled }: { familyId: string, amount: number, disabled: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePay = async () => {
        if (!confirm(`Confirm payment of $${amount}?`)) return;

        setLoading(true);
        const res = await payContribution(familyId, amount);

        if (res?.error) {
            alert(res.error);
            setLoading(false);
        } else {
            // Success
            alert("Payment Successful!");
            router.refresh();
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handlePay}
            disabled={disabled || loading}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${disabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
        >
            {loading ? 'Processing...' : disabled ? 'Paid' : 'Pay Contribution'}
        </button>
    );
}
