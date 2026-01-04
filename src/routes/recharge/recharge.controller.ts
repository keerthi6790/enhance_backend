import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../../utils/Prisma";
import { RechargeRequest } from "./recharge.schema";

export const rechargeCredits = async (
    req: FastifyRequest<{ Body: RechargeRequest }>,
    reply: FastifyReply
) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;

        const { amount } = req.body;
        const creditsToAdd = Math.floor(amount * 15); // Ensure it's an integer

        // Update user credits
        const user = await prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: creditsToAdd } },
        });

        // Log recharge
        await prisma.recharge.create({
            data: {
                userId,
                amount: amount, // The actual currency amount
                credits: creditsToAdd, // The credits added
                status: "COMPLETED", // Assuming it's completed for this simplified flow
            },
        });

        return reply.send({
            creditsAdded: creditsToAdd,
            totalCredits: user.credits,
            message: `Successfully added ${creditsToAdd} credits.`,
        });
    } catch (error) {
        reply.status(500).send({
            message: "Recharge failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Get available credits
export const getAvailableCredits = async (
    req: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        await req.jwtVerify();
        const userId = (req.user as any).id;

        if (!userId) {
            return reply.code(401).send({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                credits: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }

        return reply.code(200).send({
            availableCredits: user.credits,
            lastUpdated: user.updatedAt,
        });
    } catch (error) {
        reply.code(500).send({
            message: "Error fetching available credits",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Get recharge history with pagination
export const getRechargeHistory = async (
    req: FastifyRequest<{ Querystring: { limit?: string; offset?: string } }>,
    reply: FastifyReply
) => {
    try {
        await req.jwtVerify();
        const userId = (req.user as any).id;

        if (!userId) {
            return reply.code(401).send({ message: "Unauthorized" });
        }

        const limit = parseInt(req.query.limit || "10");
        const offset = parseInt(req.query.offset || "0");

        // Get recharge history
        const recharges = await prisma.recharge.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        // Get total count
        const total = await prisma.recharge.count({
            where: { userId },
        });

        // Get user's available credits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });

        return reply.code(200).send({
            recharges: recharges.map((r) => ({
                id: r.id,
                amount: r.amount,
                date: r.createdAt,
                credits: r.credits,
                status: r.status,
            })),
            availableCredits: user?.credits || 0,
            total,
            limit,
            offset,
        });
    } catch (error) {
        reply.code(500).send({
            message: "Error fetching recharge history",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
