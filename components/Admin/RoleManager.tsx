'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignRole } from "@/app/actions";

interface Member {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
}

interface RoleManagerProps {
    familyId: string;
    members: Member[];
    currentUserId: string;
}

export function RoleManager({ familyId, members, currentUserId }: RoleManagerProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoading(userId);
        try {
            const result = await assignRole(familyId, userId, newRole);
            if (!result.success) {
                alert(result.error || "Failed to update role");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update role");
        } finally {
            setLoading(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={member.avatarUrl || ""} />
                                    <AvatarFallback>{member.fullName?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                            </div>

                            {member.id !== currentUserId && (
                                <div className="flex gap-2">
                                    {member.role !== 'PRESIDENT' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loading === member.id}
                                            onClick={() => handleRoleChange(member.id, 'PRESIDENT')}
                                        >
                                            Make President
                                        </Button>
                                    )}
                                    {member.role !== 'TREASURER' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loading === member.id}
                                            onClick={() => handleRoleChange(member.id, 'TREASURER')}
                                        >
                                            Make Treasurer
                                        </Button>
                                    )}
                                    {member.role !== 'MEMBER' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={loading === member.id}
                                            onClick={() => handleRoleChange(member.id, 'MEMBER')}
                                        >
                                            Demote
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
