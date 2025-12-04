"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";
import { generateMessageHash, generateProofHash } from "@/lib/hash";
import { calculateFraudScore } from "@/lib/fraud";
import { requirePermission } from "@/lib/permissions/check";
import { PERMISSIONS } from "@/lib/permissions";
import { auditProofAction } from "@/lib/audit/logger";
import { sendNotification, NotificationTemplates } from "@/lib/notifications";

interface BeneficiaryAllocation {
    userId: string;
    amount: number;
}

export async function submitProof(formData: FormData) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    // Ensure user exists in database (sync from Clerk)
    const clerkUser = await currentUser();
    if (!clerkUser) return { error: "User not found" };

    const dbUser = await prisma.user.upsert({
        where: { clerkId: clerkUserId },
        update: {
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
            avatarUrl: clerkUser.imageUrl || null,
        },
        create: {
            clerkId: clerkUserId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
            avatarUrl: clerkUser.imageUrl || null,
        },
    });

    const userId = dbUser.id;

    const familyId = formData.get("familyId") as string;
    const amount = Number(formData.get("amount"));
    const currency = formData.get("currency") as string || "KES";
    const paymentChannel = formData.get("paymentChannel") as string;
    const paymentDate = new Date(formData.get("paymentDate") as string);
    const submissionType = formData.get("submissionType") as string; // message, image, manual

    // Optional fields
    const transactionRef = formData.get("transactionRef") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const rawMessage = formData.get("rawMessage") as string;
    const parserConfidence = formData.get("parserConfidence") ? Number(formData.get("parserConfidence")) : null;
    const beneficiariesJson = formData.get("beneficiaries") as string;

    // Validation
    if (!amount || amount <= 0) return { error: "Invalid amount" };
    if (paymentDate > new Date()) return { error: "Payment date cannot be in the future" };

    // Proofless check
    const isProofless = submissionType === 'manual';
    if (!isProofless && !transactionRef) return { error: "Transaction reference required" };
    if (submissionType === 'image' && !imageUrl) return { error: "Proof image required" };
    if (submissionType === 'message' && !rawMessage) return { error: "Message required" };

    try {
        // 1. Duplicate Detection
        if (transactionRef) {
            const existingProof = await prisma.proofOfPayment.findFirst({
                where: { transactionRef }
            });
            if (existingProof) return { error: "Transaction reference already used" };
        }

        let messageHash = null;
        if (rawMessage) {
            messageHash = generateMessageHash(rawMessage);
            const existingMsg = await prisma.proofOfPayment.findFirst({
                where: { messageHash }
            });
            if (existingMsg) return { error: "This message has already been submitted" };
        }

        // 2. Fraud Scoring
        const { score: fraudScore, reasons: fraudReasons } = await calculateFraudScore({
            userId,
            familyId,
            amount,
            paymentDate,
            submissionType,
            parserConfidence,
            isProofless
        });

        // 3. Prepare Data
        const encryptedMessage = rawMessage ? encrypt(rawMessage) : null;

        let beneficiaries: BeneficiaryAllocation[] = [];
        if (beneficiariesJson) {
            try {
                beneficiaries = JSON.parse(beneficiariesJson);
                // Validate sum
                const allocatedSum = beneficiaries.reduce((sum, b) => sum + b.amount, 0);
                if (Math.abs(allocatedSum - amount) > 0.01) {
                    return { error: "Allocated amounts do not match total" };
                }
            } catch (e) {
                return { error: "Invalid beneficiary data" };
            }
        }

        // 4. Create Proof Record
        const proof = await prisma.proofOfPayment.create({
            data: {
                familyId,
                userId,
                amount,
                currency,
                paymentChannel,
                transactionRef: transactionRef || undefined,
                paymentDate,
                imageUrl,
                rawMessage: encryptedMessage,
                messageHash,
                parserConfidence,
                isProofless,
                status: isProofless ? "UNVERIFIED_CLAIM" : "PENDING",
                fraudScore,
                amountAllocated: beneficiaries.length > 0 ? amount : null,

                beneficiaries: beneficiaries.length > 0 ? {
                    create: beneficiaries.map(b => ({
                        userId: b.userId,
                        allocatedAmount: b.amount
                    }))
                } : undefined,
            }
        });

        // Create audit log separately (ProofOfPayment doesn't have auditLogs relation)
        await auditProofAction(
            proof.id,
            familyId,
            "CREATED",
            userId,
            "MEMBER", // role of the submitter
            null, // no beforeState for creation
            {
                amount,
                ref: transactionRef,
                type: submissionType,
                fraudScore,
                fraudReasons
            },
            fraudReasons.length > 0 ? `Flagged: ${fraudReasons.join(", ")}` : "Initial submission"
        );

        // 5. Notify Treasurers
        const admins = await prisma.familyMember.findMany({
            where: {
                familyId,
                role: { in: ["ADMIN", "TREASURER", "PRESIDENT"] }
            }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.userId,
                    type: "PROOF_SUBMITTED",
                    message: `New ${isProofless ? 'unverified claim' : 'proof'} submitted by ${userId} for ${currency} ${amount}`
                }))
            });
        }

        revalidatePath(`/dashboard/${familyId}`);
        return { success: true, proofId: proof.id };

    } catch (error) {
        console.error("Error submitting proof:", error);
        console.error("Error details:", {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return { error: error instanceof Error ? error.message : "Failed to submit proof" };
    }
}

export async function getMyProofs(familyId: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];

    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return [];
    const userId = dbUser.id;

    try {
        return await prisma.proofOfPayment.findMany({
            where: {
                familyId,
                userId
            },
            orderBy: { createdAt: 'desc' },
            include: {
                beneficiaries: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching proofs:", error);
        return [];
    }
}

export async function verifyProof(
    proofId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string
) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return { error: "User not found" };
    const userId = dbUser.id;

    try {
        const proof = await prisma.proofOfPayment.findUnique({
            where: { id: proofId },
            include: {
                family: true,
                beneficiaries: true
            }
        });

        if (!proof) return { error: "Proof not found" };

        // Permission check using new RBAC system
        const { userId: verifierId, role: verifierRole } = await requirePermission(
            proof.familyId,
            PERMISSIONS.VERIFY_PROOFS
        );

        if (status === "REJECTED") {
            const beforeState = { status: proof.status };

            await prisma.$transaction([
                prisma.proofOfPayment.update({
                    where: { id: proofId },
                    data: {
                        status: "REJECTED",
                        rejectionReason,
                        verifiedBy: verifierId,
                        verifiedAt: new Date()
                    }
                })
            ]);

            // Create audit log using new system
            await auditProofAction(
                proofId,
                proof.familyId,
                'REJECTED',
                verifierId,
                verifierRole,
                beforeState,
                { status: 'REJECTED', rejectionReason },
                rejectionReason
            );

            // Send notification using new service
            await sendNotification({
                userId: proof.userId,
                familyId: proof.familyId,
                ...NotificationTemplates.PROOF_REJECTED(proof.amount.toNumber(), rejectionReason || 'No reason provided'),
                actionUrl: `/dashboard/${proof.familyId}/proofs`,
            });

            revalidatePath(`/dashboard/${proof.familyId}`);
            return { success: true };
        }

        if (status === "APPROVED") {
            await prisma.$transaction(async (tx) => {
                const baseShareValue = Number(proof.family.baseShareValue);
                const month = new Date(proof.paymentDate.getFullYear(), proof.paymentDate.getMonth(), 1);

                // Helper to create contribution
                const createContribution = async (targetUserId: string, amount: number) => {
                    const shares = amount / baseShareValue;
                    return tx.contribution.create({
                        data: {
                            familyId: proof.familyId,
                            userId: targetUserId,
                            amount,
                            shares,
                            baseShares: shares,
                            contributionMonth: month,
                            paidAt: proof.paymentDate,
                            status: "PAID",
                            notes: `Verified Proof: ${proof.transactionRef || 'Manual'}`,
                            verifiedBy: userId
                        }
                    });
                };

                // Create contributions
                if (proof.beneficiaries.length > 0) {
                    // Multi-beneficiary
                    for (const beneficiary of proof.beneficiaries) {
                        const contrib = await createContribution(beneficiary.userId, Number(beneficiary.allocatedAmount));
                        // Link contribution to beneficiary record
                        await tx.proofBeneficiary.update({
                            where: { id: beneficiary.id },
                            data: { contributionId: contrib.id }
                        });
                    }
                } else {
                    // Single beneficiary (submitter)
                    const contrib = await createContribution(proof.userId, Number(proof.amount));
                    // Link to proof (legacy field, but good to keep populated)
                    await tx.proofOfPayment.update({
                        where: { id: proofId },
                        data: { contributionId: contrib.id }
                    });
                }

                // Update Proof Status
                await tx.proofOfPayment.update({
                    where: { id: proofId },
                    data: {
                        status: "APPROVED",
                        verifiedBy: verifierId,
                        verifiedAt: new Date()
                    }
                });
            });

            // Create audit log using new system (outside transaction)
            await auditProofAction(
                proofId,
                proof.familyId,
                'APPROVED',
                verifierId,
                verifierRole,
                { status: proof.status },
                { status: 'APPROVED' }
            );

            // Send notification using new service
            await sendNotification({
                userId: proof.userId,
                familyId: proof.familyId,
                ...NotificationTemplates.PROOF_APPROVED(proof.amount.toNumber()),
                actionUrl: `/dashboard/${proof.familyId}/proofs`,
            });


            // Notify beneficiaries if multi-beneficiary
            if (proof.beneficiaries.length > 0) {
                for (const beneficiary of proof.beneficiaries) {
                    if (beneficiary.userId !== proof.userId) {
                        await sendNotification({
                            userId: beneficiary.userId,
                            familyId: proof.familyId,
                            type: 'PROOF_APPROVED',
                            title: 'Contribution Approved',
                            message: `A contribution of KES ${beneficiary.allocatedAmount} was approved on your behalf`,
                            priority: 'NORMAL',
                            channels: ['in_app'],
                            actionUrl: `/dashboard/${proof.familyId}/proofs`,
                        });
                    }
                }
            }

            revalidatePath(`/dashboard/${proof.familyId}`);
            return { success: true };
        }


    } catch (error) {
        console.error("Error verifying proof:", error);
        return { error: "Verification failed" };
    }
}

export async function getPendingProofs(familyId: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];

    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return [];
    const userId = dbUser.id;

    try {
        const member = await prisma.familyMember.findUnique({
            where: { familyId_userId: { familyId, userId } }
        });

        if (!member || !["ADMIN", "TREASURER", "PRESIDENT"].includes(member.role)) {
            return [];
        }

        const proofs = await prisma.proofOfPayment.findMany({
            where: {
                familyId,
                status: { in: ["PENDING", "UNVERIFIED_CLAIM"] }
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        avatarUrl: true
                    }
                },
                beneficiaries: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Decrypt messages
        return proofs.map(proof => ({
            ...proof,
            rawMessage: proof.rawMessage ? decrypt(proof.rawMessage) : null
        }));
    } catch (error) {
        console.error("Error fetching pending proofs:", error);
        return [];
    }
}

export async function disputeProof(proofId: string, reason: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) return { error: "User not found" };
    const userId = dbUser.id;

    try {
        const proof = await prisma.proofOfPayment.findUnique({
            where: { id: proofId }
        });

        if (!proof) return { error: "Proof not found" };
        if (proof.userId !== userId) return { error: "Not your proof" };
        if (proof.status !== "REJECTED") return { error: "Can only dispute rejected proofs" };

        await prisma.$transaction([
            prisma.proofOfPayment.update({
                where: { id: proofId },
                data: {
                    status: "DISPUTED",
                    updatedAt: new Date()
                }
            }),
            prisma.auditLog.create({
                data: {
                    familyId: proof.familyId,
                    entityType: "proof",
                    entityId: proofId,
                    action: "DISPUTED",
                    actorId: userId,
                    reason
                }
            }),
            // Notify Admins
            // We need to find admins again. Ideally this logic is shared.
            // For now, I'll just create the audit log and update status.
            // Notification logic below.
        ]);

        // Notify Admins (outside transaction to keep it fast, or inside if critical)
        const admins = await prisma.familyMember.findMany({
            where: {
                familyId: proof.familyId,
                role: { in: ["ADMIN", "TREASURER", "PRESIDENT"] }
            }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.userId,
                    type: "PROOF_DISPUTED", // Need to ensure this type is handled in UI or just use generic text
                    message: `Proof disputed by ${userId}. Reason: ${reason}`
                }))
            });
        }

        revalidatePath(`/dashboard/${proof.familyId}`);
        return { success: true };

    } catch (error) {
        console.error("Error disputing proof:", error);
        return { error: "Failed to submit dispute" };
    }
}
