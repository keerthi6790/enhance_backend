import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import { getCurrencyFromIp } from "../../utils/currency";

export async function getPricingTiers(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip;
    const currency = getCurrencyFromIp(ip);

    const tiers = await prisma.pricingTier.findMany({
      where: { currency },
      orderBy: { minAmount: "asc" },
      select: {
        id: true,
        title: true,
        desc: true,
        currency: true,
        minAmount: true,
        multiplier: true,
      },
    });
    return reply.code(200).send(tiers);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

export async function calculateCredits(
  req: FastifyRequest<{ Body: { amount: number } }>,
  reply: FastifyReply
) {
  const { amount } = req.body;

  try {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip;
    const currency = getCurrencyFromIp(ip);

    if (currency === 'INR' && amount < 100) {
      return reply.code(400).send({ message: "Minimum amount for INR is ₹100" });
    }

    const tier = await prisma.pricingTier.findFirst({
      where: {
        minAmount: { lte: amount },
        currency,
      },
      orderBy: { minAmount: "desc" },
    });

    if (!tier) {
      return reply
        .code(400)
        .send({ message: "No applicable pricing tier found" });
    }

    const credits = Math.floor(amount * tier.multiplier);

    return reply.code(200).send({
      amount,
      credits,
      rate: tier.multiplier,
      tierId: tier.id,
      currency,
    });
  } catch (e) {
    return reply.code(500).send(e);
  }
}
