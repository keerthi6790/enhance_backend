import { PrismaClient } from './src/generated/prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const tiers = [
        // USD Tiers
        { minAmount: 0, multiplier: 10, currency: "USD", title: "", desc: "" },
        { minAmount: 5, multiplier: 15, currency: "USD", title: "", desc: "" },
        { minAmount: 20, multiplier: 20, currency: "USD", title: "", desc: "" },

        // INR Tiers (Approx. 1 USD = 85 INR)
        // < 425 INR (~$5): 0.12 credits/INR (~10.2 credits/$)
        { minAmount: 0, multiplier: 0.12, currency: "INR", title: "", desc: "" },
        // 425 - 1700 INR (~$5 - $20): 0.18 credits/INR (~15.3 credits/$)
        { minAmount: 425, multiplier: 0.18, currency: "INR", title: "", desc: "" },
        // > 1700 INR (~$20): 0.24 credits/INR (~20.4 credits/$)
        { minAmount: 1700, multiplier: 0.24, currency: "INR", title: "", desc: "" },
    ];

    for (const tier of tiers) {
        await prisma.pricingTier.upsert({
            where: {
                minAmount_currency: {
                    minAmount: tier.minAmount,
                    currency: tier.currency
                }
            },
            update: { multiplier: tier.multiplier },
            create: tier,
        });
    }

    console.log('Pricing tiers seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
