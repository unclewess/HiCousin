import { getUserFamily } from "../actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const data = await getUserFamily();

    if (!data) {
        redirect("/onboarding");
    }

    const { family, role, memberCount, contributionStatus, contributionAmount } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {family.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Invite Code: <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{family.code}</span>
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Pay Contribution
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Card 1: Member Count */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Members</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{memberCount}</dd>
                    </div>
                </div>

                {/* Card 2: My Status */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">My Status (This Month)</dt>
                        <dd className={`mt-1 text-3xl font-semibold tracking-tight ${contributionStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                            {contributionStatus}
                        </dd>
                    </div>
                </div>

                {/* Card 3: Role */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">My Role</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{role}</dd>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Members List (Placeholder) */}
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Family Members</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Active members in this group.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <div className="p-4 text-center text-gray-500 italic">
                        Member list coming soon...
                    </div>
                </div>
            </div>
        </div>
    );
}
