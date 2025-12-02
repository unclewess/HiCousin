"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { ProofSubmissionForm } from "./ProofSubmissionForm";
import { MyProofsList } from "./MyProofsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubmitProofDialogProps {
    familyId: string;
}

export function SubmitProofDialog({ familyId }: SubmitProofDialogProps) {
    const [open, setOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-cousin-purple hover:bg-purple-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                    <PlusCircle size={20} />
                    Submit Proof
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-fun text-2xl text-gray-dark">Manage Proofs</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="submit" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="submit">New Submission</TabsTrigger>
                        <TabsTrigger value="history">My History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="submit" className="flex-1 overflow-y-auto pr-2">
                        <ProofSubmissionForm
                            familyId={familyId}
                            onSuccess={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setOpen(false); // Close dialog after successful submission
                            }}
                        />
                    </TabsContent>
                    <TabsContent value="history" className="flex-1 overflow-y-auto pr-2">
                        <MyProofsList familyId={familyId} refreshTrigger={refreshTrigger} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
