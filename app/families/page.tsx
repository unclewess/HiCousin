import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlusCircle, Users } from "lucide-react";

async function getUserFamilies() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
            memberships: {
                include: {
                    family: true
                }
            }
        }
    });

    if (!user) return [];
    return user.memberships.map(m => m.family);
}

export default async function FamiliesPage() {
    const families = await getUserFamilies();

    return (
        <div className="min-h-screen bg-gray-light flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-dark font-fun sm:text-6xl">
                        Welcome to HiCousins
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-mid">
                        Select a family to view its dashboard or create a new one.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Create/Join Card */}
                    <Card className="border-dashed border-2 border-cousin-purple/30 flex flex-col justify-center items-center text-center hover:bg-white/50 transition-colors cursor-pointer min-h-[200px] shadow-none hover:shadow-soft-drop">
                        <CardHeader>
                            <CardTitle className="flex flex-col items-center gap-2 text-cousin-purple font-fun">
                                <PlusCircle className="h-10 w-10" />
                                <span>New Family</span>
                            </CardTitle>
                            <CardDescription className="text-gray-mid">Create or join a new family group</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/onboarding">
                                <Button variant="primary">Get Started</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Existing Families */}
                    {families.map((family) => (
                        <Link key={family.id} href={`/dashboard/${family.id}`} className="block h-full">
                            <Card variant="interactive" className="h-full flex flex-col justify-between">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-gray-dark font-fun">
                                        <Users className="h-5 w-5 text-cousin-green" />
                                        {family.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-mid">Code: {family.code}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="secondary" className="w-full">Enter Dashboard</Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
