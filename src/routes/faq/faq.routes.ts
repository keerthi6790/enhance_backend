import { FastifyInstance } from "fastify";
import { getFaqs } from "./faq.controller";
import { $ref } from "./faq.schema";

export async function FaqRoutes(server: FastifyInstance) {
    server.get(
        "/",
        {
            schema: {
                querystring: $ref("GetFaqsSchema"),
                response: {
                    200: $ref("FaqsResponseSchema"),
                },
            },
        },
        getFaqs
    );
}
