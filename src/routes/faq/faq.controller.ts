import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";

export async function getFaqs(
    req: FastifyRequest<{ Querystring: { pagename: string } }>,
    reply: FastifyReply
) {
    const { pagename } = req.query;

    try {
        const faqs = await prisma.fAQ.findMany({
            where: { pagename },
            orderBy: { createdAt: "asc" },
        });
        return reply.code(200).send(faqs);
    } catch (e) {
        return reply.code(500).send(e);
    }
}
