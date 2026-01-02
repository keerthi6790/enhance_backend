import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createOrderSchema = z.object({
    amount: z.number().min(1),
    currency: z.string().default("INR"),
});

const createOrderResponseSchema = z.object({
    orderId: z.string(),
    amount: z.number(),
    currency: z.string(),
});

const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
});

const verifyPaymentResponseSchema = z.object({
    message: z.string(),
    totalCredits: z.number(),
});

export const { schemas: paymentSchema, $ref } = buildJsonSchemas(
    {
        CreateOrderSchema: createOrderSchema,
        CreateOrderResponseSchema: createOrderResponseSchema,
        VerifyPaymentSchema: verifyPaymentSchema,
        VerifyPaymentResponseSchema: verifyPaymentResponseSchema,
    },
    { $id: "PaymentSchema" }
);
