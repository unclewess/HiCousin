"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ProofUploadButton } from "@/components/ProofOfPayment/ProofUploadButton";
import { submitProof } from "@/app/actions/proofs";
import { getFamilyMembers, MemberOption } from "@/app/actions/members";
import { getActiveCampaigns, CampaignOption } from "@/app/actions/campaigns";
import { parseMessage, ParsedMessage } from "@/lib/parser";
import { MemberSearch } from "@/components/ProofOfPayment/MemberSearch";
import { toast } from "sonner";
import { Loader2, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProofSubmissionFormProps {
    familyId: string;
    onSuccess?: () => void;
}

interface BeneficiaryAllocation {
    userId: string;
    amount: number;
}

export function ProofSubmissionForm({ familyId, onSuccess }: ProofSubmissionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("message");

    // Form State
    const [amount, setAmount] = useState<string>("");
    const [currency, setCurrency] = useState("KES");
    const [paymentChannel, setPaymentChannel] = useState("MPESA");
    const [transactionRef, setTransactionRef] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [rawMessage, setRawMessage] = useState("");
    const [imageUrl, setImageUrl] = useState<string>("");

    // Parser State
    const [parserConfidence, setParserConfidence] = useState<number | null>(null);

    // Multi-Beneficiary State
    const [isMultiBeneficiary, setIsMultiBeneficiary] = useState(false);
    const [members, setMembers] = useState<MemberOption[]>([]);
    const [allocations, setAllocations] = useState<BeneficiaryAllocation[]>([]);
    const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

    // Campaign State
    const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("GENERAL_FUND");

    // Fetch members and campaigns on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [fetchedMembers, fetchedCampaigns] = await Promise.all([
                    getFamilyMembers(familyId),
                    getActiveCampaigns(familyId)
                ]);

                console.log('Fetched members:', fetchedMembers);
                setMembers(fetchedMembers);
                setCampaigns(fetchedCampaigns);

                if (fetchedMembers.length === 0) {
                    toast.info("No other family members found");
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error("Failed to load form data");
            }
        }
        loadData();
    }, [familyId]);

    // Handle Message Parsing
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setRawMessage(text);

        if (text.length > 10) {
            const parsed = parseMessage(text);
            if (parsed.confidence > 0.5) {
                if (parsed.amount) setAmount(parsed.amount.toString());
                if (parsed.reference) setTransactionRef(parsed.reference);
                if (parsed.date) setPaymentDate(parsed.date.toISOString().split('T')[0]);
                if (parsed.channel === 'MPESA') setPaymentChannel('MPESA');
                if (parsed.channel === 'BANK') setPaymentChannel('BANK');

                setParserConfidence(parsed.confidence);
                toast.success("Payment details extracted!");
            }
        }
    };

    // Handle Beneficiary Selection
    const handleAddBeneficiary = (userId: string) => {
        if (!selectedBeneficiaries.includes(userId)) {
            setSelectedBeneficiaries([...selectedBeneficiaries, userId]);
            // Initialize with 0 or remaining amount logic could go here
            setAllocations([...allocations, { userId, amount: 0 }]);
        }
    };

    const handleRemoveBeneficiary = (userId: string) => {
        setSelectedBeneficiaries(selectedBeneficiaries.filter(id => id !== userId));
        setAllocations(allocations.filter(a => a.userId !== userId));
    };

    const handleAllocationChange = (userId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAllocations(allocations.map(a =>
            a.userId === userId ? { ...a, amount: numValue } : a
        ));
    };

    // Calculate totals
    const totalAmount = parseFloat(amount) || 0;
    const allocatedTotal = allocations.reduce((sum, a) => sum + a.amount, 0);
    const remaining = totalAmount - allocatedTotal;
    const isAllocationValid = Math.abs(remaining) < 0.01;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validation
        if (activeTab === "image" && !imageUrl) {
            toast.error("Please upload a proof image");
            return;
        }

        if (activeTab === "message" && !rawMessage) {
            toast.error("Please paste the transaction message");
            return;
        }

        if (isMultiBeneficiary && !isAllocationValid) {
            toast.error(`Allocations must equal total amount. Remaining: ${remaining}`);
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        formData.append("familyId", familyId);
        formData.append("amount", amount);
        formData.append("currency", currency);
        formData.append("paymentChannel", paymentChannel);
        formData.append("paymentDate", paymentDate);
        formData.append("submissionType", activeTab); // message, image, manual

        if (transactionRef) formData.append("transactionRef", transactionRef);
        if (rawMessage) formData.append("rawMessage", rawMessage);
        if (imageUrl) formData.append("imageUrl", imageUrl);
        if (parserConfidence) formData.append("parserConfidence", parserConfidence.toString());
        if (selectedCampaignId && selectedCampaignId !== "GENERAL_FUND") {
            formData.append("campaignId", selectedCampaignId);
        }

        if (isMultiBeneficiary) {
            formData.append("beneficiaries", JSON.stringify(allocations));
        }

        const result = await submitProof(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Proof submitted successfully!");
            if (onSuccess) onSuccess();
        }
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="message">Message Paste</TabsTrigger>
                    <TabsTrigger value="image">Image Upload</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                {/* Message Tab Content */}
                <TabsContent value="message" className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Paste Transaction Message</Label>
                        <Textarea
                            placeholder="Paste M-Pesa or Bank SMS here..."
                            className="h-32 resize-none"
                            value={rawMessage}
                            onChange={handleMessageChange}
                        />
                        {parserConfidence !== null && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className={cn(
                                    "font-medium px-2 py-0.5 rounded-full text-xs",
                                    parserConfidence > 0.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                )}>
                                    {(parserConfidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Image Tab Content */}
                <TabsContent value="image" className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Proof Image</Label>
                        {imageUrl ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                                <Image
                                    src={imageUrl}
                                    alt="Proof"
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => setImageUrl("")}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
                                <Upload className="text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">Upload screenshot or photo</p>
                                <ProofUploadButton
                                    onUploadComplete={(url) => setImageUrl(url)}
                                    onUploadError={(err) => console.error(err)}
                                />
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Manual Tab Content */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                            <p className="font-medium">High Risk Submission</p>
                            <p>Manual entries without proof require additional verification and may be flagged for audit.</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Contribution Type */}
            <div className="space-y-2">
                <Label>Contribution Type</Label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GENERAL_FUND">General Fund (Monthly)</SelectItem>
                        {campaigns.length > 0 && <div className="h-px bg-gray-200 my-1" />}
                        {campaigns.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="flex">
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-[80px] rounded-r-none focus:ring-0">
                                <SelectValue placeholder="Cur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="KES">KES</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="rounded-l-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Select value={paymentChannel} onValueChange={setPaymentChannel}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MPESA">M-Pesa</SelectItem>
                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="REMITTANCE">Remittance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ref">Reference</Label>
                    <Input
                        id="ref"
                        placeholder={activeTab === 'manual' ? "Optional" : "Required"}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        required={activeTab !== 'manual'}
                    />
                </div>
            </div>

            {/* Multi-Beneficiary Section */}
            <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="multi-beneficiary"
                        checked={isMultiBeneficiary}
                        onCheckedChange={(checked) => {
                            setIsMultiBeneficiary(checked as boolean);
                            if (!checked) {
                                setAllocations([]);
                                setSelectedBeneficiaries([]);
                            }
                        }}
                    />
                    <Label htmlFor="multi-beneficiary" className="font-medium">
                        Paying for multiple people?
                    </Label>
                </div>

                {isMultiBeneficiary && (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                        <MemberSearch
                            members={members}
                            selectedUserIds={selectedBeneficiaries}
                            onSelect={handleAddBeneficiary}
                            onRemove={handleRemoveBeneficiary}
                        />

                        {allocations.length > 0 && (
                            <div className="space-y-3">
                                {allocations.map((allocation) => {
                                    const member = members.find(m => m.userId === allocation.userId);
                                    return (
                                        <div key={allocation.userId} className="flex items-center gap-3">
                                            <div className="flex-1 text-sm font-medium">
                                                {member?.fullName || "Unknown"}
                                            </div>
                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={allocation.amount || ""}
                                                    onChange={(e) => handleAllocationChange(allocation.userId, e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveBeneficiary(allocation.userId)}
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    );
                                })}

                                <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
                                    <span className="text-muted-foreground">Remaining to allocate:</span>
                                    <span className={cn(
                                        "font-bold",
                                        remaining === 0 ? "text-green-600" : "text-destructive"
                                    )}>
                                        {currency} {remaining.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full bg-cousin-purple hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Proof"
                )}
            </Button>
        </form>
    );
}
