"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface YearSelectProps {
    years: number[];
    currentYear: number;
}

export function YearSelect({ years, currentYear }: YearSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("year", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
