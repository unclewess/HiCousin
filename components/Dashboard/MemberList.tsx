import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    totalContribution: number;
    streak: number;
}

interface MemberListProps {
    contributors: Member[];
}

export function MemberList({ contributors }: MemberListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Contributors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {contributors.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={member.avatarUrl || ""} />
                                    <AvatarFallback>{member.fullName?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.fullName}</p>
                                    <p className="text-xs text-muted-foreground">Streak: {member.streak} 🔥</p>
                                </div>
                            </div>
                            <div className="text-sm font-bold">
                                +${member.totalContribution}
                            </div>
                        </div>
                    ))}
                    {contributors.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No contributions yet this month.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
