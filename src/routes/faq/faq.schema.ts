import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const getFaqsSchema = z.object({
    pagename: z.string(),
});

const faqResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    pagename: z.string(),
});

const faqsResponseSchema = z.array(faqResponseSchema);

export const { schemas: faqSchema, $ref } = buildJsonSchemas(
    {
        GetFaqsSchema: getFaqsSchema,
        FaqsResponseSchema: faqsResponseSchema,
    },
    { $id: "FaqSchema" }
);
