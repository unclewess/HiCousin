'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseManager } from "@/components/Admin/ExpenseManager";
import { updateCampaignReconciliation } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CheckCircle } from "lucide-react";

interface ReconciliationDialogProps {
    familyId: string;
    campaign: any; // Using any for simplicity as full type is complex with relations
    canManage: boolean;
}

export function ReconciliationDialog({ familyId, campaign, canManage }: ReconciliationDialogProps) {
    const [notes, setNotes] = useState(campaign.reconciliationNotes || "");
    const [isSaving, setIsSaving] = useState(false);

    const totalCollected = campaign.contributions?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
    const totalExpenses = campaign.expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;
    const balance = totalCollected - totalExpenses;

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await updateCampaignReconciliation(campaign.id, notes, familyId);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mt-2" leftIcon={<FileText size={14} />}>
                    {canManage ? "Reconcile / Details" : "View Details"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-dark">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-fun text-cousin-purple">
                        {campaign.name} - Reconciliation
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 mt-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-sm text-green-600 font-semibold uppercase">Collected</p>
                            <p className="text-2xl font-mono font-bold text-green-700">
                                ${totalCollected.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-sm text-red-600 font-semibold uppercase">Expenses</p>
                            <p className="text-2xl font-mono font-bold text-red-700">
                                ${totalExpenses.toLocaleString()}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                            <p className={`text-sm font-semibold uppercase ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                Remaining
                            </p>
                            <p className={`text-2xl font-mono font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                ${balance.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Expense Manager */}
                    <ExpenseManager
                        familyId={familyId}
                        campaignId={campaign.id}
                        expenses={campaign.expenses || []}
                        canManage={canManage}
                    />

                    {/* Reconciliation Notes */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-dark">Reconciliation Notes</h3>
                        <p className="text-sm text-gray-mid">Explain any remaining balance or discrepancies.</p>
                        {canManage ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Remaining balance kept in general fund for next event."
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveNotes} isLoading={isSaving} size="sm" leftIcon={<CheckCircle size={14} />}>
                                        Save Notes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 italic">
                                {notes || "No notes provided."}
                            </div>
                        )}
                    </div>

                    {/* Contributors List */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-bold text-gray-dark">Contributors</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {campaign.contributions?.map((c: any) => (
                                <div key={c.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{c.user.fullName}</span>
                                    <span className="font-mono text-sm text-green-600 font-bold">
                                        +${Number(c.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
