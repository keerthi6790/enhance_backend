import { FastifyInstance } from "fastify";
import { createOrder, verifyPayment } from "./payment.controller";
import { $ref } from "./payment.schema";

export async function PaymentRoutes(app: FastifyInstance) {
    app.post(
        "/create-order",
        {
            schema: {
                body: $ref("CreateOrderSchema"),
                response: {
                    200: $ref("CreateOrderResponseSchema"),
                },
            },
            preHandler: [app.authenticate],
        },
        createOrder
    );

    app.post(
        "/verify-payment",
        {
            schema: {
                body: $ref("VerifyPaymentSchema"),
                response: {
                    200: $ref("VerifyPaymentResponseSchema"),
                },
            },
            preHandler: [app.authenticate],
        },
        verifyPayment
    );
}
