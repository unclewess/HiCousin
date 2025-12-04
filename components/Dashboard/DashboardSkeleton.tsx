import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/Card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="60%" height={20} />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 space-y-3">
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="rectangular" height={40} />
                        <Skeleton variant="text" width="70%" />
                    </Card>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="p-4 space-y-4">
                        <Skeleton variant="text" width="40%" height={24} />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="text" width="40%" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export function ProofCardSkeleton() {
    return (
        <Card className="p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="50%" />
                    </div>
                </div>
                <Skeleton variant="rectangular" width={80} height={32} />
            </div>
            <Skeleton variant="rectangular" height={120} />
            <div className="flex justify-between items-center">
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="40%" />
            </div>
        </Card>
    );
}

export function MemberListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                    </div>
                    <Skeleton variant="rectangular" width={60} height={24} />
                </div>
            ))}
        </div>
    );
}
