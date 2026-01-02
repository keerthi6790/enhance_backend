import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const calculateCreditsSchema = z.object({
    amount: z.number().min(0).max(10000), // Increased max for INR
});

const calculateCreditsResponseSchema = z.object({
    amount: z.number(),
    credits: z.number(),
    rate: z.number(),
    tierId: z.string(),
});

export const { schemas: pricingSchema, $ref } = buildJsonSchemas(
    {
        CalculateCreditsSchema: calculateCreditsSchema,
        CalculateCreditsResponseSchema: calculateCreditsResponseSchema,
    },
    { $id: "PricingSchema" }
);
