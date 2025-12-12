'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { addExpense } from "@/app/actions";
import { Plus, Trash2, DollarSign, Calendar, Tag } from "lucide-react";
import { format } from 'date-fns';

interface Expense {
    id: string;
    description: string;
    amount: string | number; // Decimal comes as string from Prisma usually, or number
    date: Date | string;
    category?: string | null;
}

interface ExpenseManagerProps {
    familyId: string;
    campaignId?: string;
    expenses: Expense[];
    canManage: boolean;
}

export function ExpenseManager({ familyId, campaignId, expenses, canManage }: ExpenseManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await addExpense({
                description: formData.description,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date),
                category: formData.category || undefined,
                campaignId,
                familyId
            });

            if (result.success) {
                setIsAdding(false);
                setFormData({
                    description: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0]
                });
            } else {
                alert("Failed to add expense");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-dark">Expenses</h3>
                    <p className="text-sm text-gray-mid">Total Spent: <span className="font-mono font-bold text-red-500">-${totalExpenses.toLocaleString()}</span></p>
                </div>
                {canManage && !isAdding && (
                    <Button onClick={() => setIsAdding(true)} size="sm" leftIcon={<Plus size={16} />}>
                        Add Expense
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
                                    <Input
                                        placeholder="e.g. Transaction Fee"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-9"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category (Optional)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="e.g. Fees, Purchase"
                                            className="pl-9"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button type="submit" isLoading={loading}>Save Expense</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {expenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed">
                        No expenses recorded.
                    </div>
                ) : (
                    expenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-dark">{expense.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-mid">
                                        <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                                        {expense.category && (
                                            <>
                                                <span>•</span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{expense.category}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-red-600">
                                -${Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
