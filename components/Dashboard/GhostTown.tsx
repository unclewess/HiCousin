import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
}

interface GhostTownProps {
    ghosts: Member[];
}

export function GhostTown({ ghosts }: GhostTownProps) {
    return (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Ghost Town 👻</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {ghosts.map((member) => (
                        <div key={member.id} className="flex flex-col items-center text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                            <Avatar className="h-12 w-12 grayscale">
                                <AvatarImage src={member.avatarUrl || ""} />
                                <AvatarFallback>{member.fullName?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-medium">{member.fullName}</p>
                        </div>
                    ))}
                    {ghosts.length === 0 && (
                        <p className="col-span-full text-sm text-muted-foreground text-center">Everyone has contributed! 🎉</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
