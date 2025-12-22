import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

export const processImagesSchema = z.object({
  images: z.array(z.any()).min(1).max(10), // Up to 10 images
  option: z.object({}), // Accepts any object for options
});

export type processImageSchema = z.infer<typeof processImagesSchema>;

export const { schemas: toolsSchema, $ref } = buildJsonSchemas(
  {
    processImagesSchema,
  },
  { $id: "toolsSchema" }
);
