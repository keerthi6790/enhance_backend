import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

export const RechargeRequestSchema = z.object({
  amount: z.number().min(1, "Amount must be at least $1"),
});

export const RechargeResponseSchema = z.object({
  creditsAdded: z.number(),
  totalCredits: z.number(),
  message: z.string(),
});

export const AvailableCreditsResponseSchema = z.object({
  availableCredits: z.number(),
  lastUpdated: z.string().datetime(),
});

export const RechargeHistoryResponseSchema = z.object({
  recharges: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      date: z.string().datetime(),
    })
  ),
  availableCredits: z.number(),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type RechargeRequest = z.infer<typeof RechargeRequestSchema>;

export const { schemas: rechargeSchema, $ref } = buildJsonSchemas(
  {
    RechargeRequestSchema,
    RechargeResponseSchema,
    AvailableCreditsResponseSchema,
    RechargeHistoryResponseSchema,
  },
  { $id: "rechargeSchema" }
);
