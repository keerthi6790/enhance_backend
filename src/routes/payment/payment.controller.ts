import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function createOrder(
    req: FastifyRequest<{ Body: { amount: number; currency: string } }>,
    reply: FastifyReply
) {
    const { amount, currency } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
        return reply.code(401).send({ message: "Unauthorized" });
    }

    if (currency === 'INR' && amount < 100) {
        return reply.code(400).send({ message: "Minimum recharge amount for INR is ₹100" });
    }

    try {
        // 1. Calculate credits
        const tier = await prisma.pricingTier.findFirst({
            where: {
                minAmount: { lte: amount },
                currency,
            },
            orderBy: { minAmount: "desc" },
        });

        const multiplier = tier ? tier.multiplier : (currency === 'INR' ? 15 : 10); // Fallback
        const credits = Math.floor(amount * multiplier);

        // 2. Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise/cents
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId,
                credits: credits.toString(),
            }
        };

        const order = await razorpay.orders.create(options);

        // 3. Create Recharge Record
        await prisma.recharge.create({
            data: {
                userId,
                amount,
                currency,
                credits,
                razorpayOrderId: order.id,
                status: "PENDING",
            },
        });

        return reply.code(200).send({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: "Failed to create order" });
    }
}

export async function verifyPayment(
    req: FastifyRequest<{ Body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string } }>,
    reply: FastifyReply
) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
        return reply.code(401).send({ message: "Unauthorized" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

    if (generated_signature !== razorpaySignature) {
        return reply.code(400).send({ message: "Invalid signature" });
    }

    try {
        // Update Recharge status
        const recharge = await prisma.recharge.update({
            where: { razorpayOrderId },
            data: {
                status: "COMPLETED",
                razorpayPaymentId,
                razorpaySignature
            },
        });

        // Add credits to user
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                credits: { increment: recharge.credits },
            },
        });

        return reply.code(200).send({
            message: "Payment verified successfully",
            totalCredits: user.credits
        });
    } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: "Failed to verify payment" });
    }
}
