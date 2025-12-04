import prisma from "@/lib/db";

interface FraudCheckParams {
    userId: string;
    familyId: string;
    amount: number;
    paymentDate: Date;
    submissionType: string; // 'message' | 'image' | 'manual'
    parserConfidence: number | null;
    isProofless: boolean;
}

interface FraudResult {
    score: number;
    reasons: string[];
}

/**
 * Calculate fraud score (0-100) based on multiple risk factors
 */
export async function calculateFraudScore(params: FraudCheckParams): Promise<FraudResult> {
    const { userId, familyId, paymentDate, submissionType, parserConfidence, isProofless } = params;

    let score = 0;
    const reasons: string[] = [];

    // 1. Proofless Claim (High Risk)
    if (isProofless) {
        score += 50;
        reasons.push("Proofless claim (manual entry)");
    }

    // 2. Parser Confidence (Message based)
    if (submissionType === 'message') {
        if (parserConfidence === null) {
            score += 30;
            reasons.push("Message could not be parsed automatically");
        } else if (parserConfidence < 0.8) {
            score += 20;
            reasons.push(`Low parser confidence (${(parserConfidence * 100).toFixed(0)}%)`);
        }
    }

    // 3. Late Submission
    const daysSincePayment = (new Date().getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePayment > 90) {
        score += 30;
        reasons.push("Payment is over 90 days old");
    } else if (daysSincePayment > 30) {
        score += 10;
        reasons.push("Payment is over 30 days old");
    }

    // 4. Rapid Submission (Rate Limiting check)
    // Check last submission by this user in this family
    const lastProof = await prisma.proofOfPayment.findFirst({
        where: {
            userId,
            familyId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (lastProof) {
        const minutesSinceLast = (new Date().getTime() - lastProof.createdAt.getTime()) / (1000 * 60);
        if (minutesSinceLast < 5) {
            score += 30;
            reasons.push("Rapid submission (less than 5 mins since last)");
        } else if (minutesSinceLast < 15) {
            score += 10;
            reasons.push("Frequent submission (less than 15 mins since last)");
        }
    }

    // Cap score at 100
    return {
        score: Math.min(score, 100),
        reasons
    };
}
