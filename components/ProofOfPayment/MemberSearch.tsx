"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberOption } from "@/app/actions/members";

interface MemberSearchProps {
    members: MemberOption[];
    selectedUserIds: string[];
    onSelect: (userId: string) => void;
    onRemove: (userId: string) => void;
}

export function MemberSearch({
    members,
    selectedUserIds,
    onSelect,
    onRemove,
}: MemberSearchProps) {
    const [open, setOpen] = React.useState(false);

    // Filter out already selected members from the dropdown list
    // (Optional: keep them visible but disabled, or just hide them. Hiding is cleaner for "add more")
    const availableMembers = members.filter((m) => !selectedUserIds.includes(m.userId));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="text-muted-foreground">
                        {availableMembers.length === 0 && members.length > 0
                            ? "All members selected"
                            : "Select member to add..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandList>
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                            {availableMembers.map((member) => (
                                <CommandItem
                                    key={member.userId}
                                    value={member.fullName}
                                    onSelect={() => {
                                        onSelect(member.userId);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={member.avatarUrl || undefined} />
                                            <AvatarFallback>
                                                <UserIcon className="h-3 w-3" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{member.fullName}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedUserIds.includes(member.userId)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
